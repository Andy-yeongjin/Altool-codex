import argparse
import contextlib
import copy
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'altool/scripts'))
import assets
import check
import standards


class ReviewR3Tests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / 'standards', self.root / 'standards')

    def decisions(self, routing):
        return {name: {'decision': 'not-applicable', 'scope': 'Synthetic test fixture',
                       'reason': 'Fixture has no organizational data or selected web stack'}
                for name in routing['inactive_candidates']}

    def test_candidate_decisions_fail_closed_and_allow_bounded_non_application(self):
        routing = standards.resolve(self.root, ['data-write', 'bulk-import'])
        data = {'step': 'run', 'standards': routing}
        self.assertTrue(standards.validate_evidence(data, self.root))
        data['standardsDecisions'] = self.decisions(routing)
        self.assertEqual(standards.validate_evidence(data, self.root), [])
        for mutation in ('missing', 'extra', 'reason', 'scope', 'applicable', 'unknown', 'inside-routing'):
            broken = copy.deepcopy(data)
            if mutation == 'missing': del broken['standardsDecisions']['audit']
            if mutation == 'extra': broken['standardsDecisions']['invented'] = broken['standardsDecisions']['audit']
            if mutation in {'reason', 'scope'}: broken['standardsDecisions']['audit'][mutation] = ' '
            if mutation in {'applicable', 'unknown'}: broken['standardsDecisions']['audit']['decision'] = mutation
            if mutation == 'inside-routing': broken['standards']['standardsDecisions'] = broken.pop('standardsDecisions')
            with self.subTest(mutation=mutation):
                self.assertTrue(standards.validate_evidence(broken, self.root))

    def test_empty_no_candidate_and_all_mode(self):
        router = self.root / standards.ROUTER
        config = standards.yaml_module().safe_load(router.read_text())
        # A known tag with no chosen source or inactive candidate: direct resolve mock
        # isolates the empty-selection validation from current configured tags.
        empty = standards.resolve(self.root, ['document-only'])
        empty['tags'] = ['code-change']
        with patch.object(standards, 'resolve', return_value=empty):
            self.assertEqual(standards.validate_evidence({'step': 'run', 'standards': empty}, self.root), [])
        (self.root / 'standards/design.md').write_text('# Ready fixture\n')
        routing = standards.resolve(self.root, [], True)
        data = {'step': 'run', 'standards': routing, 'standardsDecisions': self.decisions(routing)}
        self.assertEqual(standards.validate_evidence(data, self.root), [])
        config['active_profiles'].append('internal-common')
        router.write_text(standards.yaml_module().safe_dump(config))
        routing = standards.resolve(self.root, ['data-write', 'bulk-import'])
        self.assertEqual(routing['inactive_candidates'], [])
        self.assertEqual(standards.validate_evidence({'step': 'run', 'standards': routing}, self.root), [])

    def test_rule_kinds_tables_and_existing_ui_not_downgraded(self):
        records = assets.rule_records('- 필수 A-1: must\n- 기본값 A-2: default\n- A-3: legacy\n- 예시 A-4: example\n| row | value |\n')
        self.assertEqual([r['kind'] for r in records], ['required', 'default', 'required', 'example'])
        self.assertEqual(len(records), 4)
        ui = assets.rule_records((self.root / 'standards/ui-guidelines.md').read_text())
        self.assertEqual(len(ui), 16)
        self.assertTrue(all(r['kind'] == 'required' for r in ui))
        schema = assets.rule_records((self.root / 'standards/schema.md').read_text())
        self.assertEqual(next(r['kind'] for r in schema if r['id'] == 'ENG-05'), 'default')
        # New audit contract remains inside the source selected by active audit.
        router = self.root / standards.ROUTER
        config = standards.yaml_module().safe_load(router.read_text())
        config['active_profiles'].append('internal-common')
        router.write_text(standards.yaml_module().safe_dump(config))
        routing = standards.resolve(self.root, ['data-write'])
        content = '\n'.join(c for s in routing['sources'] for _, _, c in standards.excerpts(self.root, s))
        self.assertEqual(next(r['kind'] for r in assets.rule_records(content) if r['id'] == 'DATA-05'), 'required')

    def test_explicit_css_exclusion_preserves_bare_failure_and_inline_scan(self):
        fixtures = self.root / 'tests/fixtures'
        fixtures.mkdir(parents=True)
        (fixtures / 'bad.css').write_text('.x {color:var(--missing)}')
        (fixtures / 'bad.html').write_text('<style>.x {color:var(--inline)}</style>')
        args = argparse.Namespace(root=str(self.root), format='json', exclude=[])
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(check.css_vars_cmd(args), 1)
            args.exclude = ['tests/fixtures']
            self.assertEqual(check.css_vars_cmd(args), 0)
            (self.root / 'app.css').write_text('.x {color:var(--missing)}')
            self.assertEqual(check.css_vars_cmd(args), 1)

    def test_utf8_required_marker_under_simulated_non_utf8_locale(self):
        original = Path.read_text
        def legacy_locale(path, *args, **kwargs):
            if path.name == 'design.md':
                return original(path, encoding=kwargs.get('encoding') or 'ascii')
            return original(path, *args, **kwargs)
        data = {'step': 'run', 'standards': {'tags': ['ui-change']}}
        design = self.root / 'standards/design.md'
        with patch.object(Path, 'read_text', legacy_locale):
            design.write_text('# 한글 계약\n', encoding='utf-8')
            self.assertEqual(assets.validate_evidence(data, self.root), [])
            design.write_text('# 한글\n<!-- altool-assets: required -->', encoding='utf-8')
            self.assertTrue(assets.validate_evidence(data, self.root))
        registry = self.root / assets.REGISTRY
        registry.parent.mkdir(parents=True)
        registry.write_text('{}')
        with patch.object(Path, 'read_text', side_effect=AssertionError('must short circuit')):
            self.assertTrue(assets.validate_evidence(data, self.root))

    def test_product_comparator_ignores_company_tooling(self):
        from distribution import copy_tree
        copy_tree(ROOT / 'altool', self.root / 'altool')
        tool = self.root / 'standards/tooling/ui-contracts.mjs'
        contract = {'id': 'x', 'kind': 'style', 'viewport': {'width': 800, 'height': 600},
                    'expected': {'fontSize': 21}}
        observation = {'id': 'x', 'count': 1, 'visibleCount': 1, 'viewport': contract['viewport'],
                       'styles': {'fontSize': 12}}
        for content in ("export function checkUiMeasurements(){return {valid:true,failures:[]}}", None):
            if content is None: tool.unlink()
            else: tool.write_text(content)
            result = subprocess.run(['node', 'altool/scripts/ui-measurements.mjs'], cwd=self.root,
                input=json.dumps({'contracts': [contract], 'observations': [observation]}), capture_output=True, text=True)
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertFalse(json.loads(result.stdout)['valid'])
            good = copy.deepcopy(observation)
            good['styles']['fontSize'] = 21
            result = subprocess.run(['node', 'altool/scripts/ui-measurements.mjs'], cwd=self.root,
                input=json.dumps({'contracts': [contract], 'observations': [good]}), capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertTrue(json.loads(result.stdout)['valid'])
        self.assertIn("from './ui-contracts.mjs'", (self.root / 'altool/scripts/ui-measurements.mjs').read_text())

    def test_css_scope_document_matches_pins_and_authoring_exclusions(self):
        lock = json.loads((ROOT / assets.LOCK).read_text())
        css = {p for p in lock['files'] if p.endswith('.css')}
        doc = (ROOT / 'standards/tooling/README.md').read_text()
        import re
        documented = set(re.findall(r'^\| `(designs/assets/[^`]+\.css)` \|', doc, re.M))
        self.assertEqual(documented, css)
        for p in css:
            role = '작성 원본·사전검사 제외' if p.startswith('designs/assets/ui-kit/design/') else '사전검사 대상'
            layer = '있음' if '@layer' in (ROOT / p).read_text() else '없음'
            self.assertIn(f'| `{p}` | {role} | {layer} |', doc)

    def test_product_document_index_covers_every_plan_spec_analysis(self):
        index = (ROOT / 'docs/verification-status.md').read_text()
        docs = [p for p in (ROOT / 'docs').rglob('*.md')
                if p.name.endswith(('.plan.md', '.spec.md', '.analysis.md'))
                or 'architecture' in p.relative_to(ROOT / 'docs').parts]
        for doc in docs:
            self.assertIn(f']({doc.relative_to(ROOT / "docs")})', index)
            self.assertIn('verification-status.md', doc.read_text())


if __name__ == '__main__':
    unittest.main()
