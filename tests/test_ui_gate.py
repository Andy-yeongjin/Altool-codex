from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).parents[1]
spec = importlib.util.spec_from_file_location('check_ui_test', ROOT / 'altool/scripts/check.py')
check = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check)
import ui_gate as ui


class UiGateTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.write('design.md', 'Approved title:21px; color:rgb(0, 0, 0)')
        self.write('src/app.css', 'h2{font-size:21px}')
        self.contract = {'schemaVersion':1, 'feature':'demo',
                         'sources':[self.ref('design.md')], 'implementation':['src'],
                         'contracts':[{'id':'title', 'kind':'style', 'selector':'h2',
                                       'source':'design.md', 'page':'/', 'state':'default',
                                       'viewport':{'width':1440,'height':1000},
                                       'expected':{'fontSize':21, 'color':'rgb(0, 0, 0)'}}]}
        self.contract_path = '.altool/ui/demo.contracts.json'
        self.save(self.contract_path, self.contract)
        self.data = {'schemaVersion':1, 'feature':'demo', 'step':'browser',
                     'runtime':{'url':'http://127.0.0.1:3100/', 'source':'current project process log', 'identity':'demo title and cwd verified'},
                     'ui':{'contracts':self.ref(self.contract_path)},
                     'checks':{key:{'status':'done','evidence':['recorded']} for key in check.BROWSER_REQUIRED}}
        self.data['checks']['visual.ui_contracts'] = {'status':'done','evidence':['measured JSON']}
        self.save('.altool/checks/demo.spec.json', {**deepcopy(self.data), 'step':'spec'})
        self.report = {'schemaVersion':1, 'feature':'demo',
                       'contractsSha256':self.data['ui']['contracts']['sha256'],
                       'implementationSha256':ui.implementation_digest(self.root,['src']),
                       'observations':[{'id':'title','count':1,'visibleCount':1,
                                        'viewport':{'width':1440,'height':1000},
                                        'styles':{'fontSize':21,'color':'rgb(0, 0, 0)'},
                                        'url':'http://127.0.0.1:3100/', 'state':'default'}]}
        self.save_report()

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)

    def save(self, name, data):
        self.write(name, json.dumps(data))

    def ref(self, name):
        return {'path':name,'sha256':ui.digest(self.root/name)}

    def save_report(self):
        self.save('.altool/evidence/ui.json', self.report)
        self.data['ui']['measurements'] = self.ref('.altool/evidence/ui.json')

    def errors(self):
        return ui.validate_ui_evidence(self.data, self.root)

    def test_valid_actual_values_with_nondefault_port(self):
        self.assertEqual(self.errors(), [])

    def test_done_text_does_not_replace_measurements(self):
        del self.data['ui']['measurements']
        self.assertTrue(self.errors())

    def test_wrong_raw_values_are_recomputed_even_with_valid_true(self):
        for change in ({'styles':{'fontSize':25,'color':'rgb(0, 0, 0)'}},
                       {'styles':{'fontSize':21,'color':'rgb(255, 0, 0)'}},
                       {'viewport':{'width':375,'height':1000}}, {'visibleCount':0},
                       {'count':0}, {'url':'http://127.0.0.1:3100/wrong'}, {'state':'error'},
                       {'url':'http://127.0.0.1:3000/'}):
            with self.subTest(change=change):
                old = deepcopy(self.report)
                self.report['valid'] = True
                self.report['observations'][0].update(change)
                self.save_report()
                self.assertTrue(self.errors())
                self.report = old

    def test_missing_duplicate_and_invalid_observations(self):
        for rows in ([], [self.report['observations'][0]] * 2, [None], 'not rows'):
            self.report['observations'] = rows
            self.save_report()
            self.assertTrue(self.errors())

    def test_source_edit_invalidates_contract(self):
        self.write('design.md','changed')
        self.assertTrue(self.errors())

    def test_implementation_edit_add_delete_invalidates_report(self):
        for action in ('edit','add','delete'):
            with self.subTest(action=action):
                self.write('src/app.css','h2{font-size:21px}')
                if action == 'edit': self.write('src/app.css','h2{font-size:25px}')
                if action == 'add': self.write('src/new.css','h2{margin:20px}')
                if action == 'delete': (self.root/'src/app.css').unlink()
                self.assertTrue(self.errors())
                if action == 'add': (self.root/'src/new.css').unlink()

    def test_contract_change_rejects_old_spec_even_if_report_hash_updated(self):
        self.contract['contracts'][0]['expected']['fontSize'] = 25
        self.save(self.contract_path,self.contract)
        self.data['ui']['contracts'] = self.ref(self.contract_path)
        self.report['contractsSha256'] = self.data['ui']['contracts']['sha256']
        self.save_report()
        self.assertIn('Spec owner', str(self.errors()))

    def test_analyze_and_fix_can_record_gap_but_browser_cannot(self):
        del self.data['ui']['measurements']
        self.data['checks']['visual.ui_contracts'] = {'status':'failed','reason':'server unavailable; G-1'}
        for step in ('analyze','fix'):
            self.data['step'] = step
            self.assertEqual(self.errors(), [])
        self.data['step'] = 'browser'
        self.assertTrue(self.errors())

    def test_spec_needs_contract_not_yet_implementation(self):
        self.data['step'] = 'spec'
        del self.data['ui']['measurements']
        (self.root/'src/app.css').unlink()
        self.assertEqual(self.errors(), [])

    def test_ui_tags_without_manifest_fail_non_ui_is_not_forced(self):
        self.data.pop('ui')
        (self.root/self.contract_path).unlink()
        self.assertEqual(self.errors(), [])
        self.data['standards'] = {'tags':['ui-change']}
        self.assertTrue(self.errors())

    def test_existing_contract_cannot_be_hidden_by_removing_tags(self):
        self.data.pop('ui')
        self.assertTrue(self.errors())

    def test_step_case_and_freedom_reason_do_not_bypass_measurements(self):
        del self.data['ui']['measurements']
        self.data['step'] = ' Browser '
        self.assertTrue(self.errors())
        self.data['step'] = 'freedom'
        self.data['checks']['visual.reference_comparison'] = {'status':'done','reason':'no browser action'}
        self.assertTrue(self.errors())
        self.data['checks']['visual.reference_comparison']['status'] = 'skipped'
        self.assertEqual(self.errors(), [])

    def test_empty_or_malformed_contract_rejected(self):
        for contracts in ([], [{'id':'bad'}], [None]):
            self.contract['contracts'] = contracts
            self.save(self.contract_path,self.contract)
            self.data['ui']['contracts'] = self.ref(self.contract_path)
            self.assertTrue(self.errors())

    def test_missing_node_fails_closed(self):
        with patch('ui_gate.shutil.which', return_value=None):
            self.assertIn('Node', str(self.errors()))

    def test_path_escape_rejected(self):
        self.data['ui']['measurements'] = {'path':'../outside.json','sha256':'anything'}
        self.assertTrue(self.errors())

    def test_command_and_oneshot_children_call_ui_validator(self):
        # Spy at the integration boundary; unit cases above test the real comparison.
        from argparse import Namespace
        from contextlib import redirect_stdout
        from io import StringIO
        name = '.altool/checks/demo.browser.json'
        self.save(name,self.data)
        with patch.object(check,'validate_ui_evidence',return_value=['ui: sentinel']) as replay:
            with redirect_stdout(StringIO()):
                result = check.validate_cmd(Namespace(json=str(self.root/name),root=str(self.root),format='json'))
            self.assertEqual(result,1)
            self.assertEqual(replay.call_count,1)
            parent = {'step':'oneshot','feature':'demo','children':[name],'checks':{}}
            errors = check.validate_oneshot_children(parent,self.root)
            self.assertIn('ui: sentinel',str(errors))
            self.assertEqual(replay.call_count,2)

    def test_real_cli_rejects_false_success_with_no_mocks(self):
        import subprocess
        import sys
        name = '.altool/checks/demo.browser.json'
        self.save(name,self.data)
        command = [sys.executable, str(ROOT/'altool/scripts/check.py'), 'validate',
                   '--json', str(self.root/name), '--root', str(self.root), '--format', 'json']
        valid = subprocess.run(command, text=True, capture_output=True)
        self.assertEqual(valid.returncode,0,valid.stdout+valid.stderr)
        self.report['observations'][0]['styles']['fontSize'] = 25
        self.report['valid'] = True
        self.save_report()
        self.save(name,self.data)
        invalid = subprocess.run(command, text=True, capture_output=True)
        self.assertEqual(invalid.returncode,1)
        self.assertIn('expected 21, got 25',invalid.stdout)
