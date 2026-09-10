import importlib.util
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'altool/scripts'))
import assets
import standards


class CompanyAssetsTests(unittest.TestCase):
    def test_product_ui_kit_paths_preserve_source_attribution(self):
        base = ROOT / 'designs/assets'
        self.assertTrue((base / 'ui-kit/internal/components/variants-manifest.json').is_file())
        self.assertTrue((base / 'ui-kit/internal/ATTRIBUTION.md').is_file())
        self.assertFalse((base / 'krds-2024').exists())
        registry, lock = assets.load(ROOT)
        for file in lock['files']:
            self.assertNotIn('/krds-2024/', file)
        self.assertTrue(assets.resolve(ROOT, 'icon.settings')['path'].startswith('designs/assets/ui-kit/internal/'))
        self.assertIn('KRDS', (base / 'ui-kit/internal/ATTRIBUTION.md').read_text())
        self.assertIn('도입 전', (base / 'COMMON-ASSETS.md').read_text())

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / 'designs/assets', self.root / 'designs/assets')

    def tearDown(self):
        self.temp.cleanup()

    def write_usage(self):
        registry, _ = assets.load(self.root)
        consumer = self.root / 'src/settings.js'
        consumer.parent.mkdir(exist_ok=True)
        consumer.write_text("assets.icon('icon.settings'); assets.message('message.error.network');")
        data = {'pack': registry['pack'], 'release': registry['release'],
                'lockSha256': assets.digest(self.root / assets.LOCK),
                'uiFiles': ['src/settings.js'],
                'uses': [{'id': 'icon.settings', 'variant': 'default', 'consumer': 'src/settings.js', 'reference': 'icon.settings'},
                         {'id': 'message.error.network', 'consumer': 'src/settings.js', 'reference': 'message.error.network'}],
                'featureOnly': []}
        self.complete_fixture_checks(data)
        path = self.root / '.altool/asset-usage/settings.json'
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data))
        return data, path

    def complete_fixture_checks(self, data):
        """Synthetic evidence only, for gate tests; not app QA completion evidence."""
        observation = self.root / 'fixture-observation.txt'
        observation.write_text('Synthetic unit-test observation fixture, not a real UI verification.')
        result = assets.usage_requirements(self.root, data)
        data['requirementsSha256'] = result['requirementsSha256']
        data['checks'] = [{'id': r['id'], 'status': 'passed', 'observation': 'Unit-test fixture',
                          'evidence': [{'path': 'fixture-observation.txt', 'sha256': assets.digest(observation)}]}
                         for r in result['requirements']]

    def test_pack_valid_and_two_projects_resolve_the_same_meaning(self):
        for identifier in ('icon.settings', 'message.error.network'):
            self.assertEqual(assets.resolve(self.root, identifier), assets.resolve(ROOT, identifier))
        value = assets.resolve(self.root, 'icon.settings')
        self.assertTrue(value['path'].endswith('/ico_setting.svg'))
        self.assertEqual(assets.resolve(self.root, 'message.error.network')['key'], 'error.network')

    def test_missing_id_variant_or_government_identity_cannot_be_used(self):
        for identifier, variant in [('icon.settings', 'triangle'), ('icon.invented', None)]:
            with self.assertRaises(ValueError):
                assets.resolve(self.root, identifier, variant)
        registry, _ = assets.load(self.root)
        for item in registry['items']:
            if item.get('restrictedTo') == ['government']:
                with self.assertRaisesRegex(ValueError, 'restricted'):
                    assets.resolve(self.root, item['id'])

    def test_source_drift_fails_without_changing_lock(self):
        before = (self.root / assets.LOCK).read_bytes()
        path = assets.resolve(self.root, 'icon.settings')['path']
        (self.root / path).write_text('<svg><path d="triangle"/></svg>')
        with self.assertRaisesRegex(ValueError, 'changed/missing'):
            assets.load(self.root)
        self.assertEqual((self.root / assets.LOCK).read_bytes(), before)

    def test_usage_requires_real_reference_and_current_lock(self):
        data, path = self.write_usage()
        relative = str(path.relative_to(self.root))
        evidence = assets.validate_usage(self.root, relative)
        step = {'step': 'run', 'standards': {'tags': ['ui-change']}, 'assets': evidence}
        self.assertEqual(assets.validate_evidence(step, self.root), [])
        (self.root / 'src/settings.js').write_text('unrelated source')
        self.assertTrue(assets.validate_evidence(step, self.root))
        self.write_usage()
        data['lockSha256'] = '0' * 64
        path.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'stale'):
            assets.validate_usage(self.root, relative)

    def test_ui_gate_fails_for_missing_usage_or_missing_required_pack(self):
        step = {'step': 'browser', 'standards': {'tags': ['ui-review']}}
        self.assertTrue(assets.validate_evidence(step, self.root))
        self.assertTrue(assets.validate_evidence({'step': ' RUN ', 'standards': {'tags': ['ui-change']}}, self.root))
        self.assertEqual(assets.validate_evidence({'step': 'run', 'standards': {'tags': ['code-change']}}, self.root), [])
        (self.root / assets.REGISTRY).unlink()
        design = self.root / 'standards/design.md'
        design.parent.mkdir(); design.write_text('<!-- altool-assets: required -->')
        self.assertTrue(assets.validate_evidence(step, self.root))

    def test_comments_cannot_substitute_for_consumer_reference_and_source_hash_is_pinned(self):
        _, path = self.write_usage()
        relative = str(path.relative_to(self.root))
        evidence = assets.validate_usage(self.root, relative)
        step = {'step': 'run', 'standards': {'tags': ['ui-change']}, 'assets': evidence}
        consumer = self.root / 'src/settings.js'
        consumer.write_text("// 'icon.settings'\n/* 'message.error.network' */")
        self.assertTrue(assets.validate_evidence(step, self.root))
        consumer.write_text("assets.icon('icon.settings'); assets.message('message.error.network'); changed();")
        self.assertTrue(assets.validate_evidence(step, self.root))

    def test_deployed_copy_cannot_differ(self):
        data, path = self.write_usage()
        source = assets.resolve(self.root, 'icon.settings')['path']
        target = self.root / 'public/settings.svg'
        target.parent.mkdir(); shutil.copy2(self.root / source, target)
        data['uses'][0]['copies'] = [{'source': source, 'target': 'public/settings.svg'}]
        path.write_text(json.dumps(data))
        assets.validate_usage(self.root, str(path.relative_to(self.root)))
        target.write_text('another icon')
        with self.assertRaisesRegex(ValueError, 'differs'):
            assets.validate_usage(self.root, str(path.relative_to(self.root)))

    def test_install_conflicting_unmanaged_asset_fails_before_any_writes(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory)
            file = target / 'designs/assets/brand/altool-symbol.svg'
            file.parent.mkdir(parents=True); file.write_text('company-owned logo')
            with self.assertRaisesRegex(ValueError, 'conflicts'):
                standards.install(ROOT, target)
            self.assertEqual(file.read_text(), 'company-owned logo')
            self.assertFalse((target / 'constitution.md').exists())

    def test_same_release_cannot_be_reissued_with_changed_content(self):
        spec = importlib.util.spec_from_file_location('company_builder', ROOT / 'scripts/build_company_assets.py')
        builder = importlib.util.module_from_spec(spec); spec.loader.exec_module(builder)
        builder.ROOT, builder.BASE = self.root, self.root / 'designs/assets'
        registry, _ = assets.load(self.root)
        file = builder.BASE / 'messages/ko.json'
        data = json.loads(file.read_text()); data['messages']['error.network']['title'] = 'different'
        file.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'new release'):
            builder.build(registry['release'])

    def test_historical_release_cannot_be_reissued_after_another_version(self):
        spec = importlib.util.spec_from_file_location('history_builder', ROOT / 'scripts/build_company_assets.py')
        builder = importlib.util.module_from_spec(spec); spec.loader.exec_module(builder)
        builder.ROOT, builder.BASE = self.root, self.root / 'designs/assets'
        registry, _ = assets.load(self.root)
        old_release = registry['release']
        file = builder.BASE / 'messages/ko.json'
        data = json.loads(file.read_text()); data['messages']['error.network']['title'] = 'new company title'
        file.write_text(json.dumps(data))
        builder.build('99.0.0-test')
        report = (builder.BASE / 'release-reports/99.0.0-test.txt').read_text(encoding='utf-8')
        self.assertIn('33 explicit pairs', report)
        self.assertIn('161 ambiguous rules', report)
        self.assertIn('PASS CSS custom property', report)
        data['messages']['error.network']['title'] = 'third title'
        file.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'historical version'):
            builder.build(old_release)


if __name__ == '__main__':
    unittest.main()
