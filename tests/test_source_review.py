import importlib.util
import json
from pathlib import Path
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('source_review_builder', ROOT / 'scripts/build_source_review.py')
review = importlib.util.module_from_spec(spec)
spec.loader.exec_module(review)


class SourceReviewTests(unittest.TestCase):
    def test_joined_record_has_all_988_pages_and_current_authored_ledger_hashes(self):
        joined = review.build()
        self.assertEqual(joined['reviewedPages'], 988)
        self.assertEqual([row['page'] for row in joined['pages']], list(range(1, 989)))
        self.assertEqual(joined, review.read(review.KIT / 'source-review.json'))

    def test_rendered_but_unreviewed_page_is_rejected(self):
        original = review.read

        def pending(path):
            data = original(path)
            if path.name == 'visual-review-ledger.json':
                data['pages'][0]['visualReviewed'] = False
            return data

        with patch.object(review, 'read', side_effect=pending):
            with self.assertRaisesRegex(ValueError, 'Unreviewed'):
                review.build()

    def test_source_drift_and_duplicate_authored_pages_are_rejected(self):
        original = review.read
        for change in ('hash', 'duplicate'):
            def altered(path):
                data = original(path)
                if path == review.KIT / 'foundations/final-source-review.json':
                    if change == 'hash':
                        data['sourceSha256'] = '0' * 64
                    else:
                        data['pages'].append(data['pages'][0])
                return data
            with self.subTest(change=change), patch.object(review, 'read', side_effect=altered):
                with self.assertRaises(ValueError):
                    review.build()


if __name__ == '__main__':
    unittest.main()
