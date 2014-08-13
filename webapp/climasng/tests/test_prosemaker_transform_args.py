import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerReplacements(ProseMakerTestCase):

    def setUp(self):
        super(TestProseMakerReplacements, self).setUp()
        self.pm.dataJSON = '''{
            "one":            1,
            "two":            2
        }'''

    # ------------------------------------------------------- test --
    def test_pm_transform_args_quotes(self):
        self.assertParses('{{one, plural radii radius}}', 'radius')
        self.assertParses('{{one, plural   radii    radius}}', 'radius')

        self.assertParses('{{two, plural "radii" "radius"}}', 'radii')
        self.assertParses('{{two, plural "two words"}}', 'two words')
        self.assertParses('{{one, plural "two words" last }}', 'last')

        self.assertParses('{{two, plural \'radii\' \'radius\'}}', 'radii')
        self.assertParses('{{two, plural \'two words\'}}', 'two words')
        self.assertParses('{{one, plural \'two words\' last }}', 'last')
        self.assertParses('{{one, plural \'two words\' "last" }}', 'last')

    # ------------------------------------------------------- test --
    def test_pm_transform_args_blanks(self):
        self.assertParses('{{one, plural "" last }}', 'last')
        self.assertParses('{{one, plural \'\' last }}', 'last')

        self.assertParses('{{two, plural "" last }}', '')
        self.assertParses('{{two, plural \'\' last }}', '')

    # ------------------------------------------------------- test --
    def test_pm_transform_args_inner_quotes(self):
        self.assertParses('{{one, plural \'"try" our "best"\' "last" }}', 'last')
        self.assertParses('{{two, plural \'"try" our "best"\' "last" }}', '"try" our "best"')

    # ------------------------------------------------------- test --
    def test_pm_transform_args_inner_commas(self):
        self.assertParses('{{one, plural \'"try", our "best"\' "last" }}', 'last')
        self.assertParses('{{two, plural \'"try", our "best"\' "last" }}', '"try", our "best"')

# ===================================================================






























#