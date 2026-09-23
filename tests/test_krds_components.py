"""Company asset integrity checks; not a browser/compliance certification."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import unittest
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "designs/assets"
BASE = ASSETS / "ui-kit/internal"


class Elements(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class KRDSComponentsTest(unittest.TestCase):
    def test_navigation_image_and_identity_have_company_implementations(self):
        registry = json.loads((ASSETS / 'registry.json').read_text())
        items = {item['id']: item for item in registry['items']}
        for item_id in ['component.in-page-navigation', 'component.image', 'component.masthead', 'component.identifier']:
            item = items[item_id]
            self.assertNotIn('government', item.get('restrictedTo', []))
            variant = item['variants'][item['defaultVariant']]
            self.assertIn('ui-kit/internal/company/', variant['path'])
            self.assertTrue((ROOT / variant['path']).is_file())

    def test_company_tokens_are_scoped_and_keep_density_contracts(self):
        css = (BASE / "company/dist/foundations/tokens-2024.css").read_text()
        self.assertIn(".krds-2024-tokens {", css)
        self.assertNotRegex(css, r"(?m)^\s*:root")
        self.assertNotIn("@import", css)
        self.assertIn("--krds24-body-medium-size: 1.0625rem", css)
        names = re.findall(r"(--[\w-]+):", css)
        # Company density/media overrides intentionally repeat token names.
        self.assertGreaterEqual(len(set(names)), 463)
        self.assertIn('[data-density="compact"]', css)
        self.assertIn('[data-density="comfortable"]', css)

    def test_derivative_generation_is_current(self):
        import sys
        result = subprocess.run([sys.executable, str(ROOT / "scripts/build_company_design.py"), "--check"],
                                cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_image_html_semantics_and_local_resources(self):
        directory = BASE / "company/extensions/fragments"
        documents = [directory / f'image-{variant}.html' for variant in ['informational', 'decorative', 'functional', 'fallback']]
        elements = Elements('\n'.join(document.read_text() for document in documents))
        images = [a for t, a in elements.tags if t == "img"]
        self.assertGreaterEqual(len(images), 2)
        self.assertTrue(images[0]["alt"])
        self.assertTrue(any(image.get('alt') == '' for image in images))
        for tag, attrs in elements.tags:
            self.assertNotEqual(tag, "script")
            self.assertFalse(any(a.startswith("on") for a in attrs))
            if tag == "img":
                self.assertNotIn("tabindex", attrs)
                self.assertIn("width", attrs)
                self.assertIn("height", attrs)
            for key in ["src", "href"]:
                target = attrs.get(key, "")
                if target and not target.startswith("#"):
                    self.assertNotIn("://", target)
                    self.assertTrue((directory / target).is_file(), target)
                elif target:
                    preview = Elements((BASE / 'company/extensions/preview.html').read_text())
                    self.assertTrue(any(a.get("id") == target[1:] for _, a in preview.tags))

    def test_authored_svg_safe_and_dimensioned(self):
        icons = list((BASE / 'company/dist/assets/icons').glob('*.svg'))
        catalog = json.loads((BASE / 'company/dist/assets/icons.json').read_text())
        self.assertEqual(len(icons), len(catalog['icons']))
        self.assertGreaterEqual(len(icons), 120)
        for asset in icons:
            root = ET.parse(asset).getroot()
            self.assertIn("viewBox", root.attrib)
            self.assertIn("width", root.attrib)
            self.assertIn("height", root.attrib)
            for element in root.iter():
                self.assertNotIn(element.tag.split("}")[-1], ["script", "foreignObject", "image"])
                self.assertFalse(any(a.lower().startswith("on") for a in element.attrib))


if __name__ == "__main__":
    unittest.main()
