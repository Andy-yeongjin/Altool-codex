"""Integrity and installation checks, not a KRDS accessibility certificate."""
import contextlib
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
    def test_catalog_builder_rejects_retired_assets_without_reblessing(self):
        spec = importlib.util.spec_from_file_location('asset_builder', ROOT / 'scripts/build_asset_catalog.py')
        builder = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(builder)
        with tempfile.TemporaryDirectory() as directory:
            builder.ROOT = Path(directory)
            builder.BASE = builder.ROOT / 'designs/assets'
            builder.KIT = builder.BASE / 'ui-kit/internal'
            shutil.copytree(BASE, builder.BASE)
            before = {name: (builder.BASE / name).read_bytes() for name in ('catalog.json', 'pack.lock.json')}
            retired = builder.KIT / 'upstream/obsolete.css'
            retired.parent.mkdir(parents=True)
            retired.write_text('.old {color:red}')
            with self.assertRaisesRegex(ValueError, 'Retired'):
                builder.main()
            for name, content in before.items():
                self.assertEqual((builder.BASE / name).read_bytes(), content)

    def test_catalog_unique_and_internal_files_exist(self):
        records = json.loads((BASE / 'catalog.json').read_text())['assets']
        self.assertEqual(len(records), len({r['id'] for r in records}))
        for record in records:
            for key in ('path', 'preview'):
                if key in record:
                    path = (BASE / record[key].split('#', 1)[0]).resolve()
                    self.assertTrue(path.is_relative_to(BASE), record)
                    self.assertTrue(path.is_file(), record)
        indexed = {record['path'] for record in records}
        for svg in BASE.rglob('*.svg'):
            self.assertIn(str(svg.relative_to(BASE)), indexed, svg)

    def test_retired_execution_and_source_archives_are_not_distributed(self):
        for relative in ['upstream', 'components', 'foundations', 'patterns', 'reference',
                         'coverage.json', 'source-review.json', 'QA8-OBSERVATIONS.json',
                         'QA8-VERIFICATION.md', 'VERIFICATION.md']:
            self.assertFalse((KRDS / relative).exists(), relative)
        self.assertTrue((KRDS / 'company/dist/company.css').is_file())

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
        self.assertEqual({p.name for p in (BASE / 'brand').glob('*.svg')}, {'altool-wordmark-inverse.svg'})
        self.assertEqual(len(list((BASE / 'images').glob('*.svg'))), 8)

    def test_messages_have_stable_ids_and_plain_text(self):
        data = json.loads((BASE / 'messages/ko.json').read_text())
        self.assertEqual(data['locale'], 'ko-KR')
        self.assertEqual(len(data['messages']), 46)
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
            original = BASE / 'brand/altool-wordmark-inverse.svg'
            installed = target / 'designs/assets/brand/altool-wordmark-inverse.svg'
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
