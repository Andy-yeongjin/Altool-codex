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
            if 'upstream' in page.relative_to(KIT).parts:
                continue
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
        self.assertEqual(builder.build(check=True), 10)
        result = subprocess.run([sys.executable, str(ROOT / 'scripts/build_company_design.py'), '--check'], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_company_theme_and_component_edits_propagate_without_other_changes(self):
        with tempfile.TemporaryDirectory() as directory:
            kit = Path(directory)
            shutil.copytree(KIT / 'design', kit / 'design')
            builder.build(kit)
            unchanged = (kit / 'internal/patterns/basic/basic.css').read_bytes()
            theme = kit / 'design/theme.css'
            theme.write_text(theme.read_text().replace('--krds24-primary-50: #246BEB;', '--krds24-primary-50: #174A68;'))
            components = kit / 'design/components.css'
            components.write_text(components.read_text().replace('border-radius: .375rem;', 'border-radius: .75rem;') + '\n.krds-btn { border-radius: 999px; }\n')
            with self.assertRaisesRegex(ValueError, 'Stale generated style'):
                builder.build(kit, check=True)
            builder.build(kit)
            self.assertEqual(builder.build(kit, check=True), 10)
            self.assertIn('--krds24-primary-50: #174A68;', (kit / 'internal/foundations/tokens-2024.css').read_text())
            self.assertIn('.krds-btn { border-radius: 999px; }', (kit / 'internal/foundations/company-custom.css').read_text())
            self.assertIn('border-radius: .75rem;', (kit / 'internal/components/runtime.css').read_text())
            self.assertEqual(unchanged, (kit / 'internal/patterns/basic/basic.css').read_bytes())
            for name in ('foundations', 'upstream'):
                shutil.copytree(KIT / 'internal' / name, kit / 'internal' / name, dirs_exist_ok=True)
            shutil.copyfile(KIT / 'internal/upstream-manifest.json', kit / 'internal/upstream-manifest.json')
            builder.build(kit)
            result = subprocess.run([sys.executable, str(kit / 'internal/foundations/build_adapter.py')], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            adapter = (kit / 'internal/foundations/company-adapter.css').read_text()
            self.assertIn('--krds24-primary-50: #174A68;', adapter)
            self.assertIn('.krds-btn { border-radius: 999px; }', adapter)

    def test_missing_duplicate_and_unknown_sections_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            kit = Path(directory)
            shutil.copytree(KIT / 'design', kit / 'design')
            source = kit / 'design/components.css'
            text = source.read_text()
            for broken in (
                text.replace('/* @output foundations/layout.css */', '/* @output ../escape.css */', 1),
                text + '\n/* @output foundations/layout.css */\n.x {}\n',
                text[:text.index('/* @output foundations/company-custom.css */')],
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
