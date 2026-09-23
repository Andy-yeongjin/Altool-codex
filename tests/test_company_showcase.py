"""Static checks for the numbered review page; not browser layout verification."""
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]
COMPANY = ROOT / 'designs/assets/ui-kit/internal/company'


class ShowcaseParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.numbers, self.ids, self.paths, self.frames = [], [], [], []

    def handle_starttag(self, tag, pairs):
        attributes = dict(pairs)
        if 'data-review-number' in attributes:
            self.numbers.append(int(attributes['data-review-number']))
        if 'id' in attributes:
            self.ids.append(attributes['id'])
        if tag in {'script', 'img', 'iframe'} and 'src' in attributes:
            self.paths.append(attributes['src'])
        if tag == 'option' and attributes.get('value', '').startswith('designs/'):
            self.paths.append(attributes['value'])
        if tag == 'iframe':
            self.frames.append(attributes)


class CompanyShowcaseTests(unittest.TestCase):
    def test_numbering_sources_and_local_preview_paths(self):
        html = (ROOT / 'company-additions.html').read_text()
        page = ShowcaseParser()
        page.feed(html)
        self.assertEqual(page.numbers, list(range(1, 69)))
        self.assertEqual(len(page.ids), len(set(page.ids)))
        self.assertEqual(len(page.frames), 18)
        for frame in page.frames:
            self.assertTrue(frame['title'])
            self.assertEqual(frame['loading'], 'lazy')
        for value in page.paths:
            target = (ROOT / value.split('#')[0]).resolve()
            self.assertTrue(target.is_relative_to(ROOT), value)
            self.assertTrue(target.is_file(), value)
        self.assertEqual(re.search(r'<style>(.*?)</style>', html, re.S)[1],
                         (COMPANY / 'dist/company.css').read_text())
        icons = json.loads((COMPANY / 'icons/additions.json').read_text())['icons']
        for icon in icons:
            svg = (COMPANY / f'dist/assets/icons/{icon["id"]}.svg').read_text()
            self.assertIn(svg.replace('<svg ', '<svg class="ui-icon" aria-hidden="true" '), html)
        self.assertNotIn('width:40px;height:40px', html)
        self.assertIn('v27 기본16px / 확대 없음', html)
        self.assertIn('dist/select.js', html)
        self.assertIn('recipes/controls.js', html)
        for index in range(37):
            self.assertIn(f'id="example-{index}"', html)
        original = (COMPANY / 'extensions/preview.html').read_text()
        for script in re.findall(r'<script>(.*?)</script>', original, re.S):
            self.assertIn(script, html)
        self.assertIn('실제 브라우저 검증은 접근 정책 제한으로 미완료', html)

    def test_reproducible_build_and_inline_javascript_syntax(self):
        result = subprocess.run(['node', 'scripts/build-company-additions-showcase.mjs', '--check'],
                                cwd=ROOT, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn('68 consecutive numbers', result.stdout)


if __name__ == '__main__':
    unittest.main()
