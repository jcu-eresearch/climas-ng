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
            'a':             'Aaa',
            'b':             'Bbb',
            'one':            1,
            'oneandabit':     1.00001,
            'onePone':        1.1,
            'onePsix':        1.6,
            'two':            2,
            'ten':           10,
            'twelve':        10,
            'hasinnerword':  'has inner word',
            'strInner':      'inner'
        }

    # ------------------------------------------------------- test --
    def test_pm_basic_subs(self):
        self.assertParses('{{a}}', 'Aaa')
        self.assertParses('{{ a }}', 'Aaa')
        self.assertParses('{{a }}', 'Aaa')
        self.assertParses("{{\na\n}}", 'Aaa')

    # ------------------------------------------------------- test --
    def test_pm_basic_string_subs(self):
        self.assertParses('{{b}}', 'Bbb')
        self.assertParses('{{a}}{{b}}', 'AaaBbb')
        self.assertParses('{{a}} {{b}}', 'Aaa Bbb')
        self.assertParses(' {{a}} {{b}}{{a}}', ' Aaa BbbAaa')
        self.assertParses('Xxx{{a}}Yyy{{b}}Zzz', 'XxxAaaYyyBbbZzz')

    # ------------------------------------------------------- test --
    def test_pm_basic_number_subs(self):
        self.assertParses('{{one}}', '1')
        self.assertParses('{{oneandabit}}', '1.00001')
        self.assertParses('{{a}}{{one}}', 'Aaa1')
        self.assertParses('{{onePone}}', '1.1')

    # ------------------------------------------------------- test --
    def test_pm_basic_number_subs(self):
        self.assertParses('{{one}}', '1')
        self.assertParses('{{a}}{{one}}', 'Aaa1')
        self.assertParses('{{onePone}}', '1.1')

    # ------------------------------------------------------- test --
    def test_pm_recursive_varname_subs(self):
        self.assertParses('{{hasinnerword}}', 'has inner word')
        self.assertParses('{{strInner}}', 'inner')
        self.assertParses('{{has{{strInner}}word}}', 'has inner word')
        self.assertParses('{{has{{ strInner }}word}}', 'has inner word')
        self.assertParses('{{ has{{strInner }}word}}', 'has inner word')

# ===================================================================
