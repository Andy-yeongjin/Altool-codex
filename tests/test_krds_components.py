"""Source-coverage and asset-integrity tests; not a browser/compliance certification."""
import hashlib
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


def read_json(relative):
    return json.loads((BASE / relative).read_text(encoding="utf-8"))


class Elements(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))


class KRDSComponentsTest(unittest.TestCase):
    def test_all_fifty_assigned_sections_have_cards_and_assets(self):
        items = [i for i in read_json("coverage.json")["items"]
                 if 45 <= i["startPage"] and i["endPage"] <= 552]
        mapping = read_json("components/mapping.json")
        self.assertEqual(len(items), 50)
        self.assertEqual(mapping["pathBase"], "designs/assets")
        self.assertEqual(set(mapping["items"]), {i["id"] for i in items})
        for item in items:
            record = mapping["items"][item["id"]]
            self.assertEqual(record["verification"], "source-linked-not-behavior-verified")
            self.assertTrue(record["assets"])
            for relative in record["assets"]:
                self.assertTrue((ASSETS / relative).is_file(), relative)
                self.assertTrue((ASSETS / relative).resolve().is_relative_to(ASSETS.resolve()))
            self.assertIn("대상 앱 미검증", (ASSETS / record["assets"][0]).read_text())

    def test_every_assigned_pdf_page_is_preserved_in_inventory(self):
        inventory = read_json("components/rule-inventory.json")["items"]
        actual_pages = []
        for item in inventory:
            source = (BASE / item["reference"]).read_text()
            self.assertEqual(item["referenceSha256"], hashlib.sha256(source.encode()).hexdigest())
            pages = {int(m[1]): m[2] for m in re.finditer(
                r"## PDF p\.(\d+)\n([\s\S]*?)(?=\n## PDF p\.|$)", source)}
            self.assertEqual(set(pages), {p["page"] for p in item["pages"]})
            for page in item["pages"]:
                self.assertEqual(page["sha256"], hashlib.sha256(pages[page["page"]].strip().encode()).hexdigest())
                actual_pages.append(page["page"])
            for rule in item["rules"]:
                self.assertEqual(rule["status"], "not-tested")
                for page in rule["sourcePages"]:
                    self.assertIn(re.sub(r"\s", "", rule["text"]), re.sub(r"\s", "", pages[page]))
        self.assertEqual(sorted(actual_pages), list(range(45, 553)))

    def test_component_navigation_alias_and_image_gap_filled(self):
        mapping = read_json("components/mapping.json")["items"]
        self.assertIn("ui-kit/internal/upstream/html/code/in_page_navigation.html", mapping["krds-p0204"]["assets"])
        self.assertIn("ui-kit/internal/components/image.html", mapping["krds-p0299"]["assets"])
        for item_id in ["krds-p0114", "krds-p0121"]:
            self.assertEqual(mapping[item_id]["scope"], "official-government-only")

    def test_240_palette_shades_and_distinct_version(self):
        palette = read_json("foundations/palette-2024.json")
        self.assertEqual(len(palette["colors"]), 24)
        self.assertEqual(palette["levels"], [5, 10, 20, 30, 40, 50, 60, 70, 80, 90])
        for colors in palette["colors"].values():
            self.assertEqual(len(colors), 10)
            for value in colors:
                self.assertRegex(value, r"^#[0-9A-F]{6}$")
        values = read_json("foundations/values-2024.json")
        self.assertEqual(values["keyColors"]["primary"]["values"][6], "#246BEB")
        upstream = read_json("upstream/tokens/transformed_tokens.json")
        self.assertNotEqual(values["keyColors"]["primary"]["values"][6].lower(),
                            upstream["primitive"]["color"]["light"]["primary"]["50"]["value"])
        self.assertTrue(palette["sourceAnomalies"])
        self.assertEqual(palette["colors"]["red"][4], "#F23B3B")  # PDF p76 enlarged reread

    def test_foundation_values_and_scoped_css(self):
        values = read_json("foundations/values-2024.json")
        for group in ["keyColors", "systemColors"]:
            count = 12 if group == "keyColors" else 10
            for item in values[group].values():
                self.assertEqual(len(item["values"]), count)
                for value in item["values"]:
                    self.assertRegex(value, r"^#[0-9A-F]{6}$")
        self.assertEqual(len(values["typography"]["rows"]), 25)
        self.assertEqual(len(values["radius"]["rows"]), 14)
        self.assertEqual(values["layout"]["defaultColumns"]["mobile"], 4)
        css = (BASE / "foundations/tokens-2024.css").read_text()
        self.assertIn(".krds-2024-tokens {", css)
        self.assertNotRegex(css, r"(?m)^\s*:root")
        self.assertNotIn("@import", css)
        self.assertIn("--krds24-body-medium-size: 1.0625rem", css)
        names = re.findall(r"(--[\w-]+):", css)
        self.assertEqual(len(names), len(set(names)))

    def test_derivative_generation_is_current(self):
        result = subprocess.run(["node", str(BASE / "components/build.cjs"), "--check"],
                                cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_image_html_semantics_and_local_resources(self):
        document = BASE / "components/image.html"
        elements = Elements(document.read_text())
        images = [a for t, a in elements.tags if t == "img"]
        self.assertEqual(len(images), 3)
        self.assertTrue(images[0]["alt"])
        self.assertEqual(images[1]["alt"], "")
        self.assertEqual(images[2]["alt"], "")
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
                    self.assertTrue((document.parent / target).is_file())
                elif target:
                    self.assertTrue(any(a.get("id") == target[1:] for _, a in elements.tags))
        self.assertIn("connect-src 'none'", document.read_text())

    def test_authored_svg_safe_and_dimensioned(self):
        for asset in (BASE / "components").glob("*.svg"):
            root = ET.parse(asset).getroot()
            self.assertIn("viewBox", root.attrib)
            self.assertIn("width", root.attrib)
            self.assertIn("height", root.attrib)
            for element in root.iter():
                self.assertNotIn(element.tag.split("}")[-1], ["script", "foreignObject", "image"])
                self.assertFalse(any(a.lower().startswith("on") for a in element.attrib))


if __name__ == "__main__":
    unittest.main()
