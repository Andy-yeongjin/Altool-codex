"""Company-only recipe packaging checks, not browser/rendering evidence."""
import json
from html.parser import HTMLParser
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPANY = ROOT / 'designs/assets/ui-kit/internal/company'
RECIPES = COMPANY / 'recipes'


class RecipeMarkup(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.nodes, self.stack = [], []
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        node = {'tag': tag, 'attrs': dict(attributes), 'parent': self.stack[-1] if self.stack else None}
        self.nodes.append(node)
        if tag not in {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}:
            self.stack.append(node)

    def handle_endtag(self, tag):
        for position in range(len(self.stack) - 1, -1, -1):
            if self.stack[position]['tag'] == tag:
                del self.stack[position:]
                break


class CompanyRecipesTests(unittest.TestCase):
    def test_all_functional_variants_use_company_dependencies(self):
        registry = json.loads((RECIPES / 'registry.json').read_text())
        self.assertEqual(registry['scope'], 'company-v27-only')
        self.assertEqual(registry['messagesDependency'], 'messages/ko.json')
        self.assertEqual(len(registry['items']), 18)
        self.assertEqual(sum(len(item['variants']) for item in registry['items']), 90)
        for item in registry['items']:
            self.assertIn(item['defaultVariant'], item['variants'])
            for variant in item['variants'].values():
                self.assertTrue(variant['states'])
                self.assertIn('dist/company.css', variant['dependencies'])
                self.assertIn('recipes/recipes.css', variant['dependencies'])
                self.assertIn('dist/select.js', variant['dependencies'])
                self.assertIn('recipes/controls.js', variant['dependencies'])
                for relative in [variant['path'], *variant['dependencies']]:
                    shared = relative.startswith(('messages/', 'runtime/'))
                    base = ROOT / 'designs/assets' if shared else COMPANY
                    target = (base / relative).resolve()
                    self.assertTrue(target.is_relative_to(base.resolve()), relative)
                    self.assertTrue(target.is_file(), relative)
                    self.assertNotIn('/upstream/', relative)
                    self.assertNotIn('/foundations/', relative)
                if any(p.endswith('/shared-messages.js') or p.endswith('/company-assets.mjs') for p in variant['dependencies']):
                    self.assertIn('messages/ko.json', variant['dependencies'])
                if any(p.endswith('/company-assets.mjs') for p in variant['dependencies']):
                    self.assertIn('runtime/assets.mjs', variant['dependencies'])

    def test_registry_is_reproduced_from_manifests(self):
        result = subprocess.run(['node', str(RECIPES / 'build-registry.cjs'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

    def test_every_recipe_entry_loads_shared_select_before_controls_and_app_scripts(self):
        pages = [*sorted((RECIPES / 'basic').glob('*.html')), *sorted((RECIPES / 'services').glob('*.html'))]
        self.assertGreater(len(pages), 10)
        for page in pages:
            scripts = [node['attrs'] for node in RecipeMarkup(page.read_text()).nodes
                       if node['tag'] == 'script' and node['attrs'].get('src')]
            paths = [script['src'] for script in scripts]
            self.assertEqual(paths.count('../../dist/select.js'), 1, page.name)
            self.assertEqual(paths.count('../controls.js'), 1, page.name)
            self.assertLess(paths.index('../../dist/select.js'), paths.index('../controls.js'), page.name)
            for script in scripts:
                self.assertTrue((page.parent / script['src']).is_file(), (page.name, script['src']))
                if script['src'] in ['../../dist/select.js', '../controls.js']:
                    self.assertIn('defer', script, page.name)
                else:
                    self.assertGreater(paths.index(script['src']), paths.index('../controls.js'), page.name)

    def test_authored_single_selects_opt_in_to_the_company_control(self):
        selected = 0
        sources = [*RECIPES.glob('basic/*.html'), *RECIPES.glob('services/*.html'),
                   *RECIPES.glob('basic/*.js'), *RECIPES.glob('services/*.js')]
        for source in sources:
            for markup in re.findall(r'<select\b[^>]*>', source.read_text()):
                attributes = RecipeMarkup(markup).nodes[0]['attrs']
                if 'multiple' in attributes or 'hidden' in attributes or attributes.get('size', '1').isdigit() and int(attributes.get('size', '1')) > 1:
                    continue
                selected += 1
                self.assertIn('data-ui-select', attributes, (source.name, markup))
        self.assertGreater(selected, 10)

    def test_policy_fields_have_separate_company_labels_and_controls(self):
        source = (RECIPES / 'services/services.js').read_text()
        match = re.search(r'<form id="policy-search"[\s\S]*?</form>', source)
        self.assertIsNotNone(match)
        nodes = RecipeMarkup(match.group()).nodes
        for identifier in ['policy-query', 'policy-audience']:
            control = next(node for node in nodes if node['attrs'].get('id') == identifier)
            field = control['parent']
            self.assertEqual(field['tag'], 'div')
            self.assertTrue({'field', 'ui-field'} <= set(field['attrs'].get('class', '').split()))
            labels = [node for node in nodes if node['tag'] == 'label' and node['attrs'].get('for') == identifier]
            self.assertEqual(len(labels), 1)
            self.assertIs(labels[0]['parent'], field)

    def test_date_aliases_reuse_actual_parts_and_month_only_controls(self):
        additions = json.loads((RECIPES / 'registry-additions.json').read_text())['items']
        dates = next(item for item in additions if item['id'] == 'component.date-input')['variants']
        self.assertEqual(set(dates), {'parts', 'approximate-month'})
        for variant in dates.values():
            html = (COMPANY / variant['path']).read_text()
            self.assertIn('id="' + variant['selector'][1:] + '"', html)
        fields = (RECIPES / 'basic/field-variants.html').read_text()
        for field in ['parts-year', 'parts-month', 'parts-day']:
            self.assertIn('id="' + field + '"', fields)
        self.assertIn('type="month"', (RECIPES / 'basic/precision-variants.html').read_text())
        self.assertIn('whole-month-inclusive', dates['approximate-month']['states'])

    def test_recipe_styles_do_not_define_an_alternate_button_or_field_skin(self):
        css = (RECIPES / 'recipes.css').read_text()
        self.assertNotRegex(css, r'#[0-9a-fA-F]{3,8}\b')
        self.assertNotRegex(css, r'(?m)^\s*(?:button|input|select|textarea|table)\b')
        self.assertNotIn('@import', css)
        self.assertIn('@media(max-width:700px)', css)
        self.assertIn('@media(prefers-reduced-motion:reduce)', css)
        for group in ['basic', 'services']:
            self.assertEqual(list((RECIPES / group).glob('*.css')), [])
            for page in (RECIPES / group).glob('*.html'):
                links = re.findall(r'<link rel="stylesheet" href="([^"]+)"', page.read_text())
                self.assertEqual(links, ['../../dist/company.css', '../recipes.css'], page.name)

    def test_media_is_company_authored_and_legacy_review_is_not_runtime(self):
        diagram = (RECIPES / 'services/process-illustration.svg').read_text()
        self.assertIn('#1554A0', diagram)
        self.assertNotIn('#246BEB', diagram)
        self.assertIn('v27 회사 색상', diagram)
        self.assertEqual((RECIPES / 'services/process-demo.webm').read_bytes()[:4], bytes.fromhex('1a45dfa3'))
        for name in ['mapping.json', 'checklist.json', 'contracts.json', 'pdf-visual-review.json', 'final-source-review.json']:
            self.assertFalse(list(RECIPES.glob('*/' + name)))


if __name__ == '__main__':
    unittest.main()
