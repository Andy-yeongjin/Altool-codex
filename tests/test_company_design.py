import importlib.util
from html.parser import HTMLParser
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('company_design_test', ROOT / 'scripts/build_company_design.py')
builder = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(builder)
KIT = ROOT / 'designs/assets/ui-kit'
sys.path.insert(0, str(ROOT / 'altool/scripts'))
from distribution import is_os_metadata


class CompanyDesignTests(unittest.TestCase):
    def test_moved_html_dependencies_exist(self):
        class Resources(HTMLParser):
            def __init__(self):
                super().__init__()
                self.urls = []

            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                if tag in {'script', 'img', 'source', 'video', 'audio', 'iframe'} and attrs.get('src'):
                    self.urls.append(attrs['src'])
                if tag == 'link' and attrs.get('rel') in {'stylesheet', 'icon', 'preload'} and attrs.get('href'):
                    self.urls.append(attrs['href'])

        missing = []
        for page in (KIT / 'internal').rglob('*.html'):
            parser = Resources()
            parser.feed(page.read_text())
            for url in parser.urls:
                parts = urlsplit(url)
                if parts.scheme or parts.netloc or not parts.path or parts.path.startswith('/'):
                    continue
                if not (page.parent / unquote(parts.path)).is_file():
                    missing.append(f'{page.relative_to(KIT)}: {url}')
        self.assertEqual(missing, [])

    def test_simple_entry_and_reproducible_outputs(self):
        self.assertEqual({p.name for p in KIT.iterdir() if not is_os_metadata(p.name)}, {'README.md', 'design', 'internal'})
        self.assertEqual(builder.build(check=True), len(builder.outputs()))
        self.assertGreater(len(builder.outputs()), 20)
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/build_company_design.py'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_company_theme_and_component_edits_propagate_without_other_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            kit = Path(directory)
            shutil.copytree(KIT / 'design', kit / 'design')
            builder.build(kit)
            unchanged = (kit / 'internal/company/dist/components/icons.css').read_bytes()
            theme = kit / 'design/theme.css'
            theme.write_text(theme.read_text().replace('--company-brand-primary:#1554A0;', '--company-brand-primary:#174A68;'))
            components = kit / 'design/components.css'
            components.write_text(components.read_text().replace('/* @output components/runtime.css */', '/* @output components/runtime.css */\n.altool-ui button { border-radius: .75rem; }'))
            with self.assertRaisesRegex(ValueError, 'Stale generated style'):
                builder.build(kit, check=True)
            builder.build(kit)
            self.assertEqual(builder.build(kit, check=True), len(builder.outputs(kit)))
            distribution = kit / 'internal/company/dist'
            self.assertIn('--company-brand-primary:#174A68;', (distribution / 'foundations/tokens-2024.css').read_text())
            self.assertIn('border-radius: .75rem;', (distribution / 'components/runtime.css').read_text())
            self.assertEqual(unchanged, (distribution / 'components/icons.css').read_bytes())
            self.assertEqual({p.name for p in (kit / 'internal').iterdir()}, {'company'})

    def test_missing_duplicate_and_unknown_sections_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            kit = Path(directory)
            shutil.copytree(KIT / 'design', kit / 'design')
            source = kit / 'design/components.css'
            text = source.read_text()
            for broken in (
                text.replace('/* @output foundations/layout.css */', '/* @output ../escape.css */', 1),
                text + '\n/* @output foundations/layout.css */\n.x {}\n',
                text[:text.index('/* @output components/business.css */')],
            ):
                source.write_text(broken)
                with self.assertRaises(ValueError):
                    builder.build(kit)
            self.assertFalse((kit / 'internal').exists())

    def test_release_rejects_stale_design_before_writing(self):
        spec = importlib.util.spec_from_file_location('design_release_test', ROOT / 'scripts/build_company_assets.py')
        release = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(release)
        with tempfile.TemporaryDirectory() as directory:
            release.ROOT = Path(directory)
            release.BASE = release.ROOT / 'designs/assets'
            kit = release.BASE / 'ui-kit'
            shutil.copytree(KIT / 'design', kit / 'design')
            with self.assertRaisesRegex(ValueError, 'Stale generated style'):
                release.build('99.0.0-test')
            self.assertFalse((release.BASE / 'pack.lock.json').exists())


if __name__ == '__main__':
    unittest.main()
