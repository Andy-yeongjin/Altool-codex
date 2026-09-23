"""Product contracts; real focus and layout are verified separately in browser."""
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'designs/assets'


class SkipLinkDefaultTests(unittest.TestCase):
    def test_registry_defaults_to_focus_only_and_preserves_visible(self):
        for manifest in ('registry.json', 'ui-kit/internal/company/extensions/registry.json'):
            record = next(item for item in json.loads((BASE / manifest).read_text())['items']
                          if item['id'] == 'component.skip-link')
            self.assertEqual(record['defaultVariant'], 'focus-only')
            self.assertEqual(set(record['variants']), {'focus-only', 'visible'})

    def test_hidden_default_keeps_keyboard_focus_and_uses_overlay(self):
        css = (BASE / 'ui-kit/design/components.css').read_text()
        self.assertIn('.ui-skip-link:not([data-visibility="visible"]) { position:fixed;', css)
        self.assertIn('.ui-skip-link:not([data-visibility="visible"]):not(:focus)', css)
        fragment = (BASE / 'ui-kit/internal/company/extensions/fragments/skip-link-focus-only.html').read_text()
        self.assertIn('data-visibility="focus-only"', fragment)
        self.assertNotIn('tabindex="-1"', fragment)
        self.assertNotIn('aria-hidden', fragment)


if __name__ == '__main__':
    unittest.main()
