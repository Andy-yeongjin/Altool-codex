from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'altool/scripts'))
from distribution import copy_tree, is_os_metadata


class DistributionTests(unittest.TestCase):
    def test_metadata_only_filter_and_exact_structure(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source, target = root / 'source', root / 'target'
            source.mkdir()
            for name in ('README.md', '.DS_Store', 'Thumbs.db', '._README.md'):
                (source / name).write_text('fixture', encoding='utf-8')
            (source / 'design').mkdir()
            (source / 'internal').mkdir()
            (source / 'design/.DS_Store').write_text('metadata')
            copy_tree(source, target)
            expected = {'README.md', 'design', 'internal'}
            self.assertEqual({p.name for p in target.iterdir()}, expected)
            self.assertFalse((target / 'design/.DS_Store').exists())
            self.assertEqual({p.name for p in source.iterdir() if not is_os_metadata(p.name)}, expected)
            (source / 'temp.css').write_text('')
            self.assertNotEqual({p.name for p in source.iterdir() if not is_os_metadata(p.name)}, expected)
            copy_tree(source, target)
            self.assertTrue((target / 'temp.css').exists())
