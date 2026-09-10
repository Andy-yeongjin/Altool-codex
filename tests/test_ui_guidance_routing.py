import copy
import contextlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'altool/scripts'))
import assets
import standards
import check
import test_company_assets


class GuidanceRoutingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / 'designs/assets', self.root / 'designs/assets')
        shutil.copytree(ROOT / 'standards', self.root / 'standards')
        design = self.root / 'standards/design.md'
        design.write_text('# Test-only completed design contract\n')

    def usage(self):
        helper = test_company_assets.CompanyAssetsTests()
        helper.root = self.root
        # write_usage expects routing only when a router exists.
        consumer = self.root / 'src/settings.js'
        consumer.parent.mkdir(exist_ok=True)
        consumer.write_text("assets.icon('icon.settings');")
        registry, _ = assets.load(self.root)
        usage = {'pack': registry['pack'], 'release': registry['release'],
                 'lockSha256': assets.digest(self.root / assets.LOCK),
                 'uiFiles': ['src/settings.js'], 'uses': [
                     {'id': 'icon.settings', 'consumer': 'src/settings.js', 'reference': 'icon.settings'}],
                 'featureOnly': [], 'routing': standards.resolve(self.root, ['ui-change'])}
        helper.complete_fixture_checks(usage)
        relative = '.altool/asset-usage/fixture.json'
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(usage))
        return usage, path, relative

    def test_task_routing_is_conditional_and_dependency_complete(self):
        login = standards.resolve(self.root, ['login-ui'])
        self.assertEqual({r['id'] for r in login['sources']}, {'design', 'ui-common', 'ui-form', 'ui-auth'})
        self.assertIn('service.authentication', [i for r in login['asset_routes'] for i in r['ids']])
        text = '\n'.join(part[2] for r in login['sources'] for part in standards.excerpts(self.root, r))
        self.assertIn('AUTH-01', text)
        self.assertNotIn('SEARCH-01', text)
        self.assertNotIn('asset_routes', standards.resolve(self.root, ['code-change']))

    def test_every_asset_has_pinned_company_guidance_and_valid_references(self):
        registry, lock = assets.load(self.root)
        for item in registry['items']:
            with self.subTest(id=item['id']):
                guidance = item['guidance']
                self.assertIn(guidance['source'], lock['files'])
                record = assets.guidance_record(self.root, guidance)
                self.assertEqual(record['authority'], 'company-contract')
                self.assertTrue(record['rules'])
                for ref in guidance['references']:
                    self.assertTrue((self.root / ref).is_file())
        selected = assets.resolve(self.root, 'component.in-page-navigation')
        self.assertTrue(any('모바일' in rule['text'] for rule in selected['guidance']['rules']))
        self.assertTrue(any('포인터 클릭' in rule['text'] for rule in selected['guidance']['rules']))
        self.assertTrue(any('krds-p0204.md' in p for p in selected['guidance']['references']))

    def test_read_prints_company_guidance_not_full_reference(self):
        result = subprocess.run([sys.executable, str(ROOT / 'altool/scripts/assets.py'), '--root', str(self.root),
                                 'read', 'component.in-page-navigation'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('회사 적용 지침', result.stdout)
        self.assertNotIn('**R001**', result.stdout)

    def test_route_bad_kind_id_and_unknown_asset_fail(self):
        path = self.root / standards.ROUTER
        original = path.read_text()
        for field, value in [('asset_kinds', ['typo']), ('asset_ids', ['component.typo']), ('asset_ids', ['../escape'])]:
            data = standards.yaml_module().safe_load(original)
            data['standards']['ui-common'][field] = value
            path.write_text(standards.yaml_module().safe_dump(data))
            with self.assertRaises(ValueError):
                standards.load_router(self.root)

    def test_missing_duplicate_pending_and_unreasoned_na_fail(self):
        data, path, relative = self.usage()
        assets.validate_usage(self.root, relative)
        for mutation in ('missing', 'duplicate', 'pending', 'na', 'empty-observation', 'empty-evidence'):
            broken = copy.deepcopy(data)
            if mutation == 'missing': broken['checks'].pop()
            if mutation == 'duplicate': broken['checks'].append(broken['checks'][0])
            if mutation == 'pending': broken['checks'][0]['status'] = 'pending'
            if mutation == 'na': broken['checks'][0]['status'] = 'not-applicable'
            if mutation == 'empty-observation': broken['checks'][0]['observation'] = ' '
            if mutation == 'empty-evidence': broken['checks'][0]['evidence'] = []
            path.write_text(json.dumps(broken))
            with self.subTest(mutation=mutation), self.assertRaises(ValueError):
                assets.validate_usage(self.root, relative)
        data['checks'][0].update(status='not-applicable', reason='Synthetic bounded N/A fixture')
        path.write_text(json.dumps(data))
        assets.validate_usage(self.root, relative)

    def test_code_observation_and_standard_changes_invalidate_evidence(self):
        for relative in ('src/settings.js', 'fixture-observation.txt', 'standards/ui-guidelines.md'):
            data, path, usage = self.usage()
            evidence = assets.validate_usage(self.root, usage)
            target = self.root / relative
            before = target.read_text()
            target.write_text(before + '\nchanged')
            with self.subTest(file=relative), self.assertRaises(ValueError):
                assets.validate_usage(self.root, usage)
            self.assertTrue(assets.validate_evidence({'step': 'run', 'standards': data['routing'], 'assets': evidence}, self.root))
            target.write_text(before)

    def test_guidance_drift_and_broken_anchor_fail(self):
        selected = assets.resolve(self.root, 'icon.settings')
        file = self.root / selected['guidance']['source']
        file.write_text(file.read_text() + '\nchanged')
        with self.assertRaisesRegex(ValueError, 'changed/missing'):
            assets.load(self.root)
        with self.assertRaisesRegex(ValueError, 'anchor'):
            assets.guidance_record(self.root, {'source': selected['guidance']['source'], 'section': 'missing'})

    def test_usage_and_step_routes_must_match_in_real_cli(self):
        import test_check
        data, _, relative = self.usage()
        evidence = assets.validate_usage(self.root, relative)
        payload = test_check.CheckGateTests().step_check('run', 'fixture')
        payload.update(standards=data['routing'], assets=evidence)
        self.assertEqual(assets.validate_evidence(payload, self.root), [])
        path = self.root / '.altool/checks/fixture.run.json'
        path.parent.mkdir(parents=True)
        path.write_text(json.dumps(payload))
        command = [sys.executable, str(ROOT / 'altool/scripts/check.py'), 'validate', '--root', str(self.root), '--json', str(path)]
        passed = subprocess.run(command, capture_output=True, text=True)
        self.assertEqual(passed.returncode, 0, passed.stdout + passed.stderr)
        # The real check.py CLI also rejects guidance failures, not only a helper.
        payload['standards'] = standards.resolve(self.root, ['login-ui'])
        self.assertTrue(assets.validate_evidence(payload, self.root))
        path.write_text(json.dumps(payload))
        result = subprocess.run(command, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('assets', result.stdout + result.stderr)

    def test_feature_only_still_requires_shared_ui_guideline_checks(self):
        data, path, relative = self.usage()
        data['uses'] = []
        data['featureOnly'] = [{'consumer': 'src/settings.js', 'scope': 'fixture', 'reason': 'fixture content'}]
        requirements = assets.usage_requirements(self.root, data)
        self.assertTrue(any(r['id'].startswith('standard:ui-common:') for r in requirements['requirements']))
        data['requirementsSha256'] = requirements['requirementsSha256']
        data['checks'] = []
        path.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'checks'):
            assets.validate_usage(self.root, relative)

    def test_default_override_keeps_required_contracts_and_examples_distinct(self):
        data, path, relative = self.usage()
        result = assets.usage_requirements(self.root, data)
        kinds = {r['id']: r['kind'] for r in result['requirements']}
        default = next(c for c in data['checks'] if kinds[c['id']] == 'default')
        default.update(status='default-overridden', reason='Fixture explicitly uses an alternative file layout')
        path.write_text(json.dumps(data))
        assets.validate_usage(self.root, relative)
        required = next(c for c in data['checks'] if kinds[c['id']] == 'required')
        required.update(status='default-overridden', reason='Cannot waive this required contract')
        path.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'Only a default'):
            assets.validate_usage(self.root, relative)
        required.update(status='not-applicable', reason='Synthetic condition genuinely absent in fixture')
        path.write_text(json.dumps(data))
        assets.validate_usage(self.root, relative)
        self.assertTrue(any(r['id'] == 'standard:engineering:ENG-02' for r in result['requirements']))
        self.assertTrue(any(r['id'] == 'standard:glossary:TERM-01' for r in result['requirements']))

    def test_usage_internal_candidate_decisions_and_step_match(self):
        data, path, relative = self.usage()
        data['routing'] = standards.resolve(self.root, ['ui-change', 'bulk-import'])
        helper = test_company_assets.CompanyAssetsTests()
        helper.root = self.root
        helper.complete_fixture_checks(data)
        path.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'standardsDecisions'):
            assets.validate_usage(self.root, relative)
        data['standardsDecisions'] = {'import': {'decision': 'not-applicable',
            'scope': 'Synthetic local read-only upload preview', 'reason': 'No organizational data commit'}}
        path.write_text(json.dumps(data))
        evidence = assets.validate_usage(self.root, relative)
        step = {'step': 'run', 'standards': data['routing'], 'assets': evidence,
                'standardsDecisions': data['standardsDecisions']}
        self.assertEqual(assets.validate_evidence(step, self.root), [])
        del step['standardsDecisions']
        self.assertTrue(assets.validate_evidence(step, self.root))
        data['standardsDecisions']['import']['decision'] = 'applicable'
        path.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'activate applicable'):
            assets.validate_usage(self.root, relative)

    def test_general_evidence_cannot_bypass_tbd_or_missing_routing(self):
        data, path, relative = self.usage()
        del data['routing']
        path.write_text(json.dumps(data))
        with self.assertRaises(ValueError):
            assets.validate_usage(self.root, relative)
        (self.root / 'standards/design.md').write_text('(TBD)\n')
        data['routing'] = standards.resolve(self.root, ['ui-change'])
        path.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError, 'TBD'):
            assets.validate_usage(self.root, relative)

    def test_non_ui_tag_cannot_hide_declared_ui_evidence(self):
        _, _, relative = self.usage()
        evidence = assets.validate_usage(self.root, relative)
        self.assertTrue(assets.validate_evidence({'step': 'run', 'assets': evidence,
                        'standards': standards.resolve(self.root, ['code-change'])}, self.root))

    def test_upgrade_keeps_existing_router_and_warns_about_missing_ui_routes(self):
        path = self.root / standards.ROUTER
        data = standards.yaml_module().safe_load(path.read_text())
        data['standards'] = {k: v for k, v in data['standards'].items() if not k.startswith('ui-')}
        path.write_text(standards.yaml_module().safe_dump(data))
        before = path.read_bytes()
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            standards.install(ROOT, self.root)
        self.assertEqual(path.read_bytes(), before)
        self.assertIn('UI 지침·자산 라우팅', output.getvalue())

    def test_oneshot_rechecks_child_guideline_evidence(self):
        import test_check
        data, path, relative = self.usage()
        parent = test_check.CheckGateTests().oneshot_check(self.root)
        for relative_check in parent['children']:
            file = self.root / relative_check
            child = json.loads(file.read_text())
            child['standards'] = standards.resolve(self.root, ['code-change'])
            child['standardsDecisions'] = {'internal-stack': {'decision': 'not-applicable',
                'scope': 'Synthetic Python fixture', 'reason': 'No web stack requested'}}
            if child['step'] == 'run':
                child['standards'] = data['routing']
                child['standardsDecisions'] = {}
                child['assets'] = assets.validate_usage(self.root, relative)
            file.write_text(json.dumps(child))
        self.assertEqual(check.validate_oneshot_children(parent, self.root), [])
        data['checks'][0]['status'] = 'pending'
        path.write_text(json.dumps(data))
        self.assertTrue(any('assets' in e for e in check.validate_oneshot_children(parent, self.root)))


if __name__ == '__main__':
    unittest.main()
