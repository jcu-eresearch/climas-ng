import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerConditions(ProseMakerTestCase):

    # ------------------------------------------------------- test --
    def test_pm_condition_innervar_comparison(self):
        self.pm.data = { 'longnamevar': 3, 'inner': 'name', 'a3rdvar': 123 }
        samples = {
            # these sources should result in 'showing'
            'showing':  [   '[[longnamevar == 3]]showing',
                            '[[long{{inner}}var == 3]]showing',
                            '[[a{{long{{inner}}var}}rdvar == 123]]showing'
            ]
        }
        for sample_result, sample_docs in samples.items():
            for sample_doc in sample_docs:
                self.assertParses(sample_doc, sample_result)

# ===================================================================
