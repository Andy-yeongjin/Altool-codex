import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
COMPANY=ROOT/'designs/assets/ui-kit/internal/company'

class ButtonActionMapTest(unittest.TestCase):
    def test_unique_labels_and_existing_sources(self):
        actions=json.loads((COMPANY/'button-actions.json').read_text())
        labels=[]
        for action in actions.values():
            self.assertTrue((COMPANY/'dist/assets/icons'/f"{action['icon']}.svg").is_file())
            labels.extend(action['labels'])
        self.assertEqual(len(labels),len(set(labels)))
        self.assertEqual(actions['clear-selection']['icon'],'square')
        self.assertNotIn('process-selection',actions)
        self.assertNotIn('선택 처리',labels)
        self.assertIn('선택 승인',actions['approve']['labels'])
        self.assertIn('선택 재처리',actions['retry']['labels'])
