"""Regression contracts for numbered review findings; not browser layout proof."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPANY = ROOT / 'designs/assets/ui-kit/internal/company'


class Elements(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.nodes = []
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        self.nodes.append((tag, dict(attributes)))


class CompanyCompositionTests(unittest.TestCase):
    def setUp(self):
        self.css = (ROOT / 'designs/assets/ui-kit/design/components.css').read_text()

    def test_checkbox_master_and_individual_rows_are_separate(self):
        html = (COMPANY / 'extensions/fragments/checkbox-select-all.html').read_text()
        self.assertIn('<fieldset class="ui-checklist">', html)
        self.assertIn('</label><div class="ui-choice-group" data-layout="stack">', html)
        self.assertEqual(html.count('data-select-item'), 3)
        self.assertIn('.ui-checklist label { display:flex;align-items:center;gap:8px;', self.css)
        self.assertIn('.ui-choice-group[data-layout="stack"] { display:grid;grid-template-columns:minmax(0,1fr);', self.css)

    def test_image_optimizer_declares_common_attachment_host(self):
        html = (COMPANY / 'extensions/fragments/file-upload-image-optimize.html').read_text()
        self.assertIn('class="ui-attachments" data-image-attachment', html)
        self.assertIn('data-file-error', html)
        self.assertEqual(html.count('type="file"'), 1)
        self.assertIn('data-optimize-result', html)

    def test_table_title_precedes_scroll_region_and_names_the_table(self):
        html = (COMPANY / 'extensions/fragments/structured-list-table.html').read_text()
        nodes = Elements(html).nodes
        heading = next(attrs for tag, attrs in nodes if tag == 'h3')
        self.assertEqual(heading['class'], 'ui-section-title')
        table = next(attrs for tag, attrs in nodes if tag == 'table')
        region = next(attrs for tag, attrs in nodes if attrs.get('role') == 'region')
        self.assertEqual(table['aria-labelledby'], heading['id'])
        self.assertEqual(region['aria-labelledby'], heading['id'])
        self.assertLess(html.index('</header>'), html.index('class="ui-table-scroll"'))
        self.assertIn('<caption class="sr-only">업무 목록</caption>', html)
        self.assertIn('.ui-section-header + .ui-table-scroll { margin-block-start:12px;', self.css)

    def test_policy_reference_is_a_separate_row_after_navigation_action(self):
        js = (COMPANY / 'recipes/services/services.js').read_text()
        self.assertIn('<div class="actions ui-form-actions"><a class="button" href="#policy/resources">정책 자료 탐색</a></div><p class="source-note">${source(951)}</p>', js)
        self.assertNotIn('>정책 자료 탐색</a>${source(951)}', js)

    def test_page_jump_uses_inline_label_and_compact_numeric_input(self):
        html = (COMPANY / 'extensions/fragments/pagination-numbered.html').read_text()
        self.assertIn('class="ui-page-jump"', html)
        self.assertIn('type="number" required', html)
        self.assertIn('.ui-page-jump > .ui-field { flex-direction:row;align-items:center;', self.css)
        self.assertIn('.ui-page-jump > .ui-field > label { margin:0;', self.css)
        self.assertIn('.ui-page-jump > .ui-field > input { width:5rem;min-width:0;', self.css)

    def test_labelled_actions_align_with_control_bottom(self):
        html = (COMPANY / 'extensions/fragments/tag-add-filter.html').read_text()
        self.assertIn('<div class="ui-field-actions"><div class="ui-field">', html)
        self.assertIn('data-ui-select', html)
        self.assertIn('.ui-field-actions { display:flex;align-items:flex-end;flex-wrap:wrap;', self.css)
        page = (COMPANY / 'recipes/basic/filter.html').read_text()
        self.assertIn('<div class="ui-field-actions"><div class="field ui-field">', page)
        self.assertNotIn('class="toolbar"', page)

    def test_filter_aside_has_explicit_single_column_variant(self):
        page = (COMPANY / 'recipes/basic/filter.html').read_text()
        form = next(attrs for tag, attrs in Elements(page).nodes if attrs.get('id') == 'filter-form')
        self.assertEqual(form['data-layout'], 'stack')
        self.assertIn('ui-filter-bar', form['class'])
        self.assertIn('.ui-filter-bar[data-layout="stack"] { flex-direction:column;align-items:stretch;', self.css)
        self.assertIn('.ui-filter-bar[data-layout="stack"] .ui-filter-actions { padding-top:0;', self.css)
        self.assertLess(page.index('>필터 적용</button>'), page.index('>모든 조건 초기화</button>'))

    def test_header_uses_canonical_brand_and_navigation(self):
        page = (COMPANY / 'extensions/fragments/header-company-scroll-reveal.html').read_text()
        elements = Elements(page).nodes
        self.assertTrue(any(tag == 'nav' and attrs.get('class') == 'ui-site-nav' for tag, attrs in elements))
        links = [attrs for tag, attrs in elements if tag == 'a']
        self.assertEqual([attrs['class'] for attrs in links], ['ui-site-brand', 'ui-nav-item'])
        self.assertIn('.ui-site-header a.ui-site-brand { color:var(--company-brand-on-header);', self.css)
        self.assertIn('.ui-site-header a.ui-site-brand:focus-visible { outline:2px solid var(--company-brand-on-header);', self.css)
        self.assertIn('.ui-site-header .ui-site-nav :is(button,a).ui-nav-item { color:var(--company-brand-on-header);', self.css)

    def test_links_are_not_filled_actions_in_all_declared_states(self):
        # Unlayered anchor rule overrides layered action colours regardless of .primary.
        enterprise = (COMPANY / 'dist/components/enterprise.css').read_text()
        self.assertIn('.altool-ui a.button { background:transparent;border-color:transparent;color:var(--company-section-accent); }', enterprise)
        for selector in ['a.button:is(:hover,:active):not([aria-disabled="true"])', 'a.button[aria-disabled="true"]']:
            rule = re.search(re.escape('.altool-ui ' + selector) + r'\s*\{([^}]+)\}', enterprise)
            self.assertIsNotNone(rule)
            self.assertIn('background:transparent', rule[1])
        self.assertIn('a.button:focus-visible { outline:2px solid', enterprise)
        recipes = (COMPANY / 'recipes/recipes.css').read_text()
        self.assertNotIn('.company-recipe a {', recipes)
        self.assertIn('a:not(.button):not(.ui-nav-item):not(.ui-site-brand)', recipes)
        self.assertIn('--d-bg:var(--company-brand-primary);--d-border:var(--company-brand-primary);--d-text:var(--company-brand-on-primary);', enterprise)

    def test_upload_variants_do_not_supply_a_second_file_list(self):
        registry = json.loads((COMPANY / 'extensions/registry.json').read_text())
        item = next(item for item in registry['items'] if item['id'] == 'component.file-upload')
        for variant in ['single', 'multiple-drop']:
            html = (COMPANY / item['variants'][variant]['path']).read_text()
            self.assertIn('class="ui-attachments"', html)
            self.assertNotIn('data-file-list', html)
            self.assertIn('data-file-error', html)
            self.assertIn('dist/business.js', item['variants'][variant]['dependencies'])
            self.assertEqual(item['variants'][variant]['meaning'], '검증 가능한 첨부 선택')
        showcase = (ROOT / 'company-additions.html').read_text()
        for variant in ['single', 'multiple-drop']:
            self.assertIn('검증 가능한 첨부 선택 · ' + variant, showcase)


if __name__ == '__main__':
    unittest.main()
