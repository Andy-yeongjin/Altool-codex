"""Integrity and installation checks, not a KRDS accessibility certificate."""
import contextlib
import hashlib
import io
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import shutil
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'designs/assets'
KRDS = BASE / 'ui-kit/internal'
sys.path.insert(0, str(ROOT / 'altool/scripts'))
import standards


class SharedAssetsTests(unittest.TestCase):
    def test_catalog_builder_rejects_upstream_drift_without_reblessing(self):
        spec = importlib.util.spec_from_file_location('asset_builder', ROOT / 'scripts/build_asset_catalog.py')
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        with tempfile.TemporaryDirectory() as directory:
            clone = Path(directory) / 'ui-kit/internal'
            shutil.copytree(KRDS / 'upstream', clone / 'upstream')
            shutil.copy2(KRDS / 'upstream-manifest.json', clone / 'upstream-manifest.json')
            before = (clone / 'upstream-manifest.json').read_bytes()
            (clone / 'upstream/README.md').write_text('changed source')
            builder.KRDS, builder.UPSTREAM = clone, clone / 'upstream'
            with self.assertRaisesRegex(ValueError, 'Pinned upstream changed'):
                builder.main()
            self.assertEqual((clone / 'upstream-manifest.json').read_bytes(), before)

    def test_catalog_unique_and_internal_files_exist(self):
        records = json.loads((BASE / 'catalog.json').read_text())['assets']
        self.assertEqual(len(records), len({r['id'] for r in records}))
        for record in records:
            for key in ('path', 'preview'):
                if key in record:
                    path = (BASE / record[key]).resolve()
                    self.assertTrue(path.is_relative_to(BASE), record)
                    self.assertTrue(path.is_file(), record)
        indexed = {record['path'] for record in records}
        for svg in BASE.rglob('*.svg'):
            self.assertIn(str(svg.relative_to(BASE)), indexed, svg)

    def test_pdf_pages_and_toc_have_no_gap_or_overlap(self):
        coverage = json.loads((KRDS / 'coverage.json').read_text())
        self.assertEqual(coverage['source']['pageCount'], 988)
        self.assertEqual(coverage['source']['tocCount'], 95)
        self.assertEqual(len(coverage['items']), 96)
        self.assertEqual([p['page'] for p in coverage['pages']], list(range(1, 989)))
        claimed = []
        for item in coverage['items']:
            self.assertTrue(item['assets'], item['id'])
            text = (KRDS / item['reference']).read_text()
            for page in range(item['startPage'], item['endPage'] + 1):
                claimed.append(page)
                self.assertIn(f'## PDF p.{page}\n', text)
            for asset in item['assets']:
                self.assertTrue((BASE / asset).is_file(), asset)
        self.assertEqual(claimed, list(range(1, 989)))
        self.assertEqual(sum(i['category'] == 'components' for i in coverage['items']), 37)

    def test_upstream_remains_exact_pinned_source(self):
        manifest = json.loads((KRDS / 'upstream-manifest.json').read_text())
        self.assertEqual(manifest['commit'], 'd6bb184c823e4757f05807ea4646a23e3133b6e6')
        self.assertEqual(len(manifest['sha256']), 245)
        actual = {str(p.relative_to(KRDS / 'upstream')): hashlib.sha256(p.read_bytes()).hexdigest()
                  for p in (KRDS / 'upstream').rglob('*') if p.is_file()}
        self.assertEqual(actual, manifest['sha256'])

    def test_svg_assets_are_static_well_formed(self):
        for path in BASE.rglob('*.svg'):
            root = ET.fromstring(path.read_text())
            self.assertTrue(root.tag.endswith('svg'), path)
            self.assertIn('viewBox', root.attrib, path)
            for node in root.iter():
                self.assertNotIn(node.tag.rsplit('}', 1)[-1], ('script', 'foreignObject'), path)
                for name, value in node.attrib.items():
                    self.assertFalse(name.lower().startswith('on'), path)
                    if name.rsplit('}', 1)[-1] == 'href':
                        self.assertTrue(value.startswith('#'), (path, value))
        self.assertEqual(len(list((BASE / 'brand').glob('*.svg'))), 3)
        self.assertEqual(len(list((BASE / 'images').glob('*.svg'))), 8)

    def test_messages_have_stable_ids_and_plain_text(self):
        data = json.loads((BASE / 'messages/ko.json').read_text())
        self.assertEqual(data['locale'], 'ko-KR')
        self.assertEqual(len(data['messages']), 39)
        self.assertEqual(data['messages']['file.empty']['severity'], 'error')
        for key, message in data['messages'].items():
            self.assertIn('.', key)
            self.assertEqual(set(message), {'title', 'body', 'action', 'severity'})
            for field in ('title', 'body'):
                self.assertTrue(message[field])
                self.assertNotIn('<', message[field])

    def test_install_and_upgrade_preserve_project_assets(self):
        with tempfile.TemporaryDirectory() as directory, contextlib.redirect_stdout(io.StringIO()):
            target = Path(directory)
            standards.install(ROOT, target)
            original = BASE / 'brand/altool-symbol.svg'
            installed = target / 'designs/assets/brand/altool-symbol.svg'
            self.assertEqual(installed.read_bytes(), original.read_bytes())
            installed.write_text('user-owned replacement')
            catalog = target / 'designs/assets/catalog.json'
            catalog.write_text('{"user":true}')
            with self.assertRaisesRegex(ValueError, 'Pinned asset changed'):
                standards.install(ROOT, target)
            self.assertEqual(installed.read_text(), 'user-owned replacement')
            self.assertEqual(catalog.read_text(), '{"user":true}')
            self.assertEqual((target / 'standards/design.md').read_text().splitlines()[0], '(TBD)')
            self.assertEqual(standards.load_router(target)['active_profiles'], ['base'])

    def test_escaping_asset_symlink_is_rejected_before_writes(self):
        with tempfile.TemporaryDirectory() as directory, tempfile.TemporaryDirectory() as outside:
            target = Path(directory)
            (target / 'designs').mkdir()
            (target / 'designs/assets').symlink_to(outside, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, 'escapes'):
                standards.install(ROOT, target)
            self.assertEqual(list(Path(outside).iterdir()), [])
            self.assertFalse((target / 'constitution.md').exists())


if __name__ == '__main__':
    unittest.main()
