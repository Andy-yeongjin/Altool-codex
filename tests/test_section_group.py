"""Section spacing contract regression; actual geometry is browser-tested separately."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]


class SectionGroupTests(unittest.TestCase):
    def test_group_to_section_spacing_and_sunday_states(self):
        css = (ROOT / 'designs/assets/ui-kit/design/components.css').read_text()
        self.assertIn('.ui-section-group + :is(.ui-section,.ui-section-group)', css)
        self.assertIn('.ui-section + .ui-section-group { margin-block-start:var(--company-section-gap); }', css)
        self.assertIn('button:nth-child(7n + 1):not(:disabled):not([aria-pressed="true"])', css)

    def test_field_spacing_has_no_label_margin(self):
        css = (ROOT / 'designs/assets/ui-kit/design/components.css').read_text()
        self.assertIn('.ui-field > label { display:block; margin:0;', css)
        self.assertNotIn('margin-bottom:.375rem', css)
        self.assertIn('.ui-field { display:flex; flex-direction:column; gap:6px;', css)

    def test_header_geometry_and_form_gap(self):
        css = (ROOT / 'designs/assets/ui-kit/design/components.css').read_text()
        theme = (ROOT / 'designs/assets/ui-kit/design/theme.css').read_text()
        self.assertIn('--company-section-header-height:42px;', theme)
        self.assertIn('--company-section-form-gap:16px;', theme)
        self.assertIn('.ui-section-header { box-sizing:border-box;', css)
        self.assertIn('.ui-section-meta { min-width:0;margin:0;', css)
        self.assertIn('+ :not(.ui-section-body,.ui-detail-grid,.ui-table-scroll,table,.ui-summary,.ui-data-state,.ui-metric-group):not(:has(.ui-table-scroll)) { margin-block-start:var(--company-section-form-gap); }', css)
        self.assertIn('border-bottom-color:transparent;', css)

    def test_group_overrides_flow_margin_and_owns_gap(self):
        css = (ROOT / 'designs/assets/ui-kit/design/components.css').read_text()
        flow = '.altool-ui .ui-section + .ui-section { margin-block-start:var(--company-section-gap); }'
        group = '.altool-ui .ui-section-group > .ui-section { margin-block-start:0; min-width:0; }'
        self.assertIn('display:grid; gap:var(--company-section-gap); align-items:start;', css)
        self.assertLess(css.index(flow), css.index(group))

    def test_common_guidance_and_example_expose_group(self):
        guidance = (ROOT / 'designs/assets/guidance/company-ui.md').read_text()
        common = guidance.split('<a id="common"></a>')[1].split('<a id="form"></a>')[0]
        self.assertIn('V27-05:', common)
        self.assertIn('ui-section-group', common)
        example = (ROOT / 'designs/assets/ui-kit/internal/company/docs/PAGE-PATTERNS.md').read_text()
        self.assertIn('class="ui-section-group dashboard-charts"', example)


if __name__ == '__main__':
    unittest.main()
