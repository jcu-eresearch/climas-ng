import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerReplacements(ProseMakerTestCase):

    def setUp(self):
        super(TestProseMakerReplacements, self).setUp()
        self.pm.data = {
            'one':            1,
            'oneandabit':     1.00001,
            'onePone':        1.1,
            'onePsix':        1.6,
            'two':            2,
            'ten':           10,
            'twelve':        12,
            'hasinnerword':  'has inner word',
            'strInner':      'inner'
        }

    # ------------------------------------------------------- test --
    def test_pm_literal_addition(self):
        self.assertParses('{{1 + 1}}', '2')
        self.assertParses('{{1 + 2}}', '3')
        self.assertParses('{{ 10 + 2 }}', '12')

    # ------------------------------------------------------- test --
    def test_pm_var_addition(self):
        self.assertParses('{{one + one}}', '2')
        self.assertParses('{{one + 2}}', '3')
        self.assertParses('{{ten + two}}', '12')

    # ------------------------------------------------------- test --
    def test_pm_literal_subtraction(self):
        self.assertParses('{{1 - 1}}', '0')
        self.assertParses('{{2 - 1}}', '1')
        self.assertParses('{{1 - 2}}', '-1')
        self.assertParses('{{ 10 - 2 }}', '8')
        self.assertParses('{{ 100 - 5 }}', '95')

    # ------------------------------------------------------- test --
    def test_pm_var_subtraction(self):
        self.assertParses('{{one - one}}', '0')
        self.assertParses('{{2 - one}}', '1')
        self.assertParses('{{one - two}}', '-1')
        self.assertParses('{{ ten - two }}', '8')
        self.assertParses('{{ twelve - 5 }}', '7')

    # ------------------------------------------------------- test --
    def test_pm_literal_multiplication(self):
        self.assertParses('{{4 * 14}}', '56')
        self.assertParses('{{1 * 2}}', '2')
        self.assertParses('{{ 10 * 2 }}', '20')

    # ------------------------------------------------------- test --
    def test_pm_var_multiplication(self):
        self.assertParses('{{two * 14}}', '28')
        self.assertParses('{{ten * two}}', '20')
        self.assertParses('{{onePsix * 2}}', '3.2')

    # ------------------------------------------------------- test --
    def test_pm_literal_division(self):
        self.assertParses('{{56 / 14}}', '4')
        self.assertParses('{{56 / 4}}', '14')
        self.assertParses('{{ 10 / 2 }}', '5')
        self.assertParses('{{ 2 / 10 }}', '0.2')

    # ------------------------------------------------------- test --
    def test_pm_var_division(self):
        self.assertParses('{{56 / one}}', '56')
        self.assertParses('{{28 / two}}', '14')
        self.assertParses('{{ten / two}}', '5')
        self.assertParses('{{onePsix / 2}}', '0.8')

# ===================================================================
