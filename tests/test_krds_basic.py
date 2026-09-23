"""Static structural checks, not browser/accessibility certification."""
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASIC = ROOT / "designs/assets/ui-kit/internal/company/recipes/basic"


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.nodes = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))


class BasicPatternsTest(unittest.TestCase):
    def test_local_targets_and_aria_ids_resolve(self):
        for path in BASIC.glob("*.html"):
            with self.subTest(page=path.name):
                parsed = Page(path.read_text())
                ids = [attrs["id"] for _, attrs in parsed.nodes if "id" in attrs]
                self.assertEqual(len(ids), len(set(ids)), "duplicate element id")
                for tag, attrs in parsed.nodes:
                    for key in ["aria-describedby", "aria-labelledby", "aria-controls"]:
                        for ref in attrs.get(key, "").split():
                            self.assertIn(ref, ids, (tag, key, ref))
                    for key in ["href", "src"]:
                        raw = attrs.get(key, "")
                        if not raw:
                            continue
                        target = urlsplit(raw)
                        self.assertFalse(target.scheme, "No external resources or remote links in demos")
                        destination = (path.parent / unquote(target.path)).resolve() if target.path else path
                        self.assertTrue(destination.is_file(), raw)
                        if target.fragment and destination.suffix == ".html":
                            target_ids = {attrs.get("id") for _, attrs in Page(destination.read_text()).nodes}
                            self.assertIn(target.fragment, target_ids, raw)

    def test_semantic_form_labels_and_explicit_button_types(self):
        for path in BASIC.glob("*.html"):
            parsed = Page(path.read_text())
            labels = {attrs["for"] for tag, attrs in parsed.nodes if tag == "label" and "for" in attrs}
            for tag, attrs in parsed.nodes:
                if tag in {"input", "textarea", "select"} and attrs.get("type") not in {"checkbox", "radio"}:
                    self.assertIn(attrs.get("id"), labels, (path.name, attrs))
                if tag == "button":
                    self.assertIn(attrs.get("type"), {"button", "submit"}, (path.name, attrs))
            text = path.read_text()
            self.assertIn('<html lang="ko">', text)
            self.assertIn('name="viewport"', text)
            self.assertIn('href="#main"', text)

    def test_no_collection_or_unsafe_text_injection(self):
        js = "\n".join(path.read_text() for path in BASIC.glob("*.js") if path.name != "shared-messages.js")
        for prohibited in ["fetch(", "XMLHttpRequest", "sendBeacon", "localStorage", "sessionStorage", "innerHTML", "eval("]:
            self.assertNotIn(prohibited, js)
        self.assertIn("event.preventDefault()", js)
        self.assertIn(".textContent=", js)
        self.assertIn("showModal()", js)
        self.assertIn("dialogReturn", js)
        helper = (BASIC / "shared-messages.js").read_text()
        self.assertEqual(helper.count("fetch("), 1)
        self.assertIn("fetch('../../../../../messages/ko.json'", helper)
        self.assertNotIn("JSON.stringify", helper)
        self.assertNotIn("innerHTML", helper)

    def test_default_identification_and_consent_values_are_unselected(self):
        for name in ["identity", "consent"]:
            parsed = Page((BASIC / f"{name}.html").read_text())
            for tag, attrs in parsed.nodes:
                if tag == "input":
                    self.assertNotIn("checked", attrs)
            if name == "identity":
                self.assertNotIn('type="date"', (BASIC / "identity.html").read_text())

    def test_shared_design_values_are_opted_in_on_every_page(self):
        for page in BASIC.glob("*.html"):
            source = page.read_text()
            self.assertIn('class="krds-2024-tokens altool-ui company-recipe"', source, page.name)
            self.assertIn('href="../../dist/company.css"', source, page.name)
            self.assertIn('href="../recipes.css"', source, page.name)
            self.assertNotIn('tokens-2024.css', source, page.name)
        self.assertEqual(list(BASIC.glob('*.css')), [])
        css = (BASIC.parent / 'recipes.css').read_text()
        self.assertNotRegex(css, r"#[0-9a-fA-F]{3,8}\b")
        self.assertIn('var(--company-button-font)', css)
        self.assertNotIn('button {', css)


if __name__ == "__main__":
    unittest.main()
