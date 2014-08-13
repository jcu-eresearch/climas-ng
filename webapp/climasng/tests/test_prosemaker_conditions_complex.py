import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerConditions(ProseMakerTestCase):

    # ------------------------------------------------------- test --
    def test_pm_condition_temp(self):
        samples = {
            # these sources should result in 'showing'
            '':         [   '[[always and never and always]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_and(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   'showing',
                            '[[always]]showing',
                            '[[always and always]]showing',
                            '[[always and always and always]]showing'
            ],
            '':         [   '[[always and never]]hiding',
                            '[[never and always]]hiding',
                            '[[never and never]]hiding',
                            '[[always and never and always]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_or(self):
        samples = {
            'showing':  [   'showing',
                            '[[always]]showing',
                            '[[always or always]]showing',
                            '[[always or never]]showing',
                            '[[never or always]]showing',
                            '[[never or always or never]]showing'
            ],
            '':         [   '[[never]]hiding',
                            '[[never or never]]hiding',
                            '[[never or never or never]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_andor(self):
        samples = {
            'showing':  [   'showing',
                            # (always and always) or never
                            '[[always and always or never]]showing'
            ],
            '':         [   '[[never]]hiding',
                            # (always and never) or never
                            '[[always and never or never]]hiding',
                            # (never and always) or never
                            '[[always and never or never]]hiding'
                            # never or (never and always)
                            '[[never or never and always]]hiding'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)

# ===================================================================
