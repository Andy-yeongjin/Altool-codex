"""Company integration tests, not a substitute for real browser QA."""
import contextlib
import io
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT / 'scripts'), str(ROOT / 'altool/scripts')]
import assets
import standards
from build_company_bundle import build_bundle
from build_company_design import build as build_styles
import build_company_assets as release

KIT = ROOT / 'designs/assets/ui-kit'
COMPANY = KIT / 'internal/company'


class CompanyV27Tests(unittest.TestCase):
    def test_selection_and_icon_meanings_are_all_registered(self):
        registry, lock = assets.load(ROOT)
        entries = {item['id']: item for item in registry['items']}
        selection = json.loads((COMPANY / 'selection.json').read_text())
        self.assertEqual(len(entries), 299)
        self.assertNotIn('brand.symbol', entries)  # Approved removal; no other baseline IDs may disappear.
        baseline = json.loads((ROOT / 'docs/architecture/company-ui-migration-baseline.json').read_text())
        self.assertTrue({item['id'] for item in baseline['items']} - {'brand.symbol'} <= entries.keys())
        for item in selection['items']:
            selected = assets.resolve_item(registry, item['id'])
            self.assertEqual(selected['variant'], 'company')
            self.assertIn('/internal/company/', selected['path'])
            self.assertFalse(selected.get('legacyOnly', False))
            self.assertIn('V27-', (ROOT / selected['guidance']['source']).read_text())
        icons = json.loads((COMPANY / 'dist/assets/icons.json').read_text())['icons']
        self.assertEqual(len(icons), 133)
        for icon in icons:
            selected = assets.resolve_item(registry, icon['semanticId'])
            self.assertTrue(selected['path'].endswith('/' + icon['id'] + '.svg'))
            self.assertEqual((ROOT / selected['path']).read_bytes(), (COMPANY / 'dist' / icon['svg_path']).read_bytes())
            self.assertIn(selected['path'], lock['files'])
        for item in registry['items']:
            for variant in item.get('variants', {}).values():
                self.assertFalse(variant.get('legacyOnly', False), item['id'])
        self.assertIn('/internal/company/', assets.resolve_item(registry, 'component.button')['path'])
        self.assertIn('icon.settings', entries)
        self.assertIn('message.error.network', entries)

    def test_work_tags_route_new_assets_without_forcing_internal_stack(self):
        for tag, expected in [('form-ui', 'component.multiselect'), ('upload-ui', 'component.file-upload'),
                              ('search-ui', 'component.table-tools'), ('navigation-ui', 'component.organization-tree'),
                              ('history-ui', 'pattern.history'), ('dashboard-ui', 'component.bar-chart')]:
            result = standards.resolve(ROOT, ['ui-change', tag])
            routed = {value for route in result['asset_routes'] for value in route['ids']}
            self.assertIn(expected, routed)
            self.assertIn('foundation.company-ui', routed)
            self.assertNotIn('internal-stack', {item['id'] for item in result['sources']})

    def test_bundle_source_changes_invalidate_all_generated_outputs(self):
        with tempfile.TemporaryDirectory() as directory:
            kit = Path(directory) / 'ui-kit'
            shutil.copytree(KIT / 'design', kit / 'design')
            shutil.copytree(COMPANY, kit / 'internal/company', ignore=shutil.ignore_patterns('__pycache__'))
            shutil.copytree(ROOT / 'designs/assets/messages', kit.parent / 'messages')
            shutil.copytree(ROOT / 'designs/assets/brand', kit.parent / 'brand')
            theme = kit / 'design/theme.css'
            theme.write_text(theme.read_text().replace('--company-brand-primary:#1554A0;', '--company-brand-primary:#174A68;'))
            with self.assertRaisesRegex(ValueError, 'Stale company bundle'):
                build_bundle(kit, check=True)
            build_styles(kit)
            build_bundle(kit)
            build_bundle(kit, check=True)
            for page in (kit / 'internal/company').glob('*preview.html'):
                self.assertIn('--company-brand-primary:#174A68;', page.read_text())

    def test_pinned_dist_css_is_not_ignored(self):
        with tempfile.TemporaryDirectory() as directory:
            from unittest.mock import patch
            with patch.object(release, 'ROOT', Path(directory)):
                path = 'designs/assets/ui-kit/internal/company/dist/bad.css'
                file = release.ROOT / path
                file.parent.mkdir(parents=True)
                file.write_text('.x {color:#fff;background:#fff;border:var(--missing)}')
                with self.assertRaisesRegex(ValueError, 'Distribution CSS preflight failed'):
                    release.verify_distribution_css([path])

    def test_business_messages_are_generated_from_single_json(self):
        script = "require('./designs/assets/ui-kit/internal/company/tests/dom-harness.cjs');require('./designs/assets/ui-kit/internal/company/dist/business.js');const fs=require('fs');const expected=JSON.parse(fs.readFileSync('designs/assets/messages/ko.json','utf8'));require('assert/strict').deepEqual(CompanyMessages,expected);const box=document.createElement('div');CompanyBusiness.systemState(box,{type:'error'});require('assert/strict').equal(box.children[0].textContent,expected.messages['error.load'].title);"
        result = subprocess.run(['node', '-e', script], cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        with contextlib.redirect_stdout(io.StringIO()):
            build_bundle(KIT, check=True)

    def test_delivery_regressions_run_against_integrated_runtime(self):
        result = subprocess.run([sys.executable, '-B', str(COMPANY / 'scripts/check_release.py')],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('PASS 24 DOM-contract', result.stdout)
        self.assertIn('no browser QA performed', result.stdout)

    def test_release_verifier_rejects_stale_identity_and_runtime(self):
        with tempfile.TemporaryDirectory() as directory:
            kit = Path(directory) / 'ui-kit'
            company = kit / 'internal/company'
            shutil.copytree(COMPANY, company, ignore=shutil.ignore_patterns('__pycache__'))
            shutil.copytree(KIT / 'design', kit / 'design')
            for folder in ('brand', 'messages'):
                shutil.copytree(ROOT / 'designs/assets' / folder, kit.parent / folder)
            runtime = company / 'dist/business.js'
            original = runtime.read_text()
            previews = {page: page.read_text() for page in company.glob('*.html')}
            identity = re.search(r'const companyIdentity = (.*);', original)[1]
            stale = json.loads(identity)
            stale['name'] = 'Stale company'
            for contents, expected in (
                (original.replace(identity, json.dumps(stale, ensure_ascii=False)), 'Stale embedded source'),
                (original + '\n// unbuilt change\n', 'Stale business runtime'),
            ):
                with self.subTest(expected=expected):
                    runtime.write_text(contents)
                    # Keep embedded previews in sync so the source-contract check itself must reject it.
                    for page, html in previews.items():
                        page.write_text(html.replace(original, contents))
                    result = subprocess.run([sys.executable, '-B', str(company / 'scripts/check_release.py')],
                                            capture_output=True, text=True)
                    self.assertNotEqual(result.returncode, 0)
                    self.assertIn(expected, result.stderr)


if __name__ == '__main__':
    unittest.main()
