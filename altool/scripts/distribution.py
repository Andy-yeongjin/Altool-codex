"""Copy installation payloads without OS metadata; never relax upstream integrity."""
import argparse
from pathlib import Path
import shutil


def is_os_metadata(name):
    return name in {'.DS_Store', 'Thumbs.db'} or name.startswith('._')


def copy_tree(source, target):
    shutil.copytree(source, target, dirs_exist_ok=True,
                    ignore=lambda directory, names: [name for name in names if is_os_metadata(name)])


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('target', type=Path)
    args = parser.parse_args()
    copy_tree(args.source, args.target)
