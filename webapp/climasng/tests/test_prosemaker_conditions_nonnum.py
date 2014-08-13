import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerConditions(ProseMakerTestCase):

    # ------------------------------------------------------- test --
    def test_pm_condition_always(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   'showing',
                            '[[always]]showing',
                            '[[ always ]]showing',
                            '[[  always]]showing',
                            '[[AlWaYs]]showing',
            ],
            '':         [   '[[always]]',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_never(self):
        samples = {
                # all these docs should result in ''
            '':         [   '[[never]]',
                            '[[never]] ',
                            '[[never]]hiding',
                            '[[ never]]hiding',
                            '[[ never ]]hiding',
                            '[[  never]]hiding',
                            '[[  NeVeR]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)
    # ------------------------------------------------------- test --
    def test_pm_condition_always_and_never(self):
        samples = {
            # these sources should result in 'showing'
            'showing':  [   'showing[[never]]hiding',
                            '[[never]]hiding[[always]]showing[[never]]hiding',
                            '[[never]][[always]]showing',
            ],
            # all these docs should result in ''
            '':         [   '[[never]]hiding[[always]]',
                            '[[always]][[never]]hiding',
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)

# ===================================================================
