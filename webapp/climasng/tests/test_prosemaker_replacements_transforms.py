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
            "a":             "Aaa",
            "b":             "Bbb",
            "one":            1,
            "onePone":        1.1,
            "onePsix":        1.6,
            "zero":           0,
            "negone":        -1,
            "negonePone":    -1.1,
            "negonePsix":    -1.6,
            "two":            2,
            "ten":           10,
            "twelve":        12,
            "sixteen":       16,
            "hasinnerword":  "has inner word",
            "strInner":      "inner"
        }'''

    # ------------------------------------------------------- test --
    def test_pm_transform_bad(self):
        self.assertParses('{{onePone}}', '1.1')
        self.assertParses(
            '{{onePone, notatransform}}',
            '{{onePone, notatransform}}'
        )

    # ------------------------------------------------------- test --
    def test_pm_transform_absolute(self):
        self.assertParses('{{onePone, absolute}}', '1.1')
        self.assertParses('{{negonePone}}', '-1.1')
        self.assertParses('{{negonePone, absolute}}', '1.1')

    # ------------------------------------------------------- test --
    def test_pm_transform_round(self):
        self.assertParses('{{onePone, round}}', '1')
        self.assertParses('{{negonePone, round}}', '-1')
        self.assertParses('{{negonePsix, round}}', '-2')

    # ------------------------------------------------------- test --
    def test_pm_transform_round_to(self):
        self.assertParses('{{negone, round 0.5}}', '-1')
        self.assertParses('{{one, round 0.5}}', '1')
        self.assertParses('{{onePone, round 0.5}}', '1')
        self.assertParses('{{onePsix, round 0.5}}', '1.5')
        self.assertParses('{{ten, round 0.5}}', '10')

        self.assertParses('{{negone, round 10}}', '0')
        self.assertParses('{{one, round 10}}', '0')
        self.assertParses('{{onePone, round 10}}', '0')
        self.assertParses('{{ten, round 10}}', '10')
        self.assertParses('{{twelve, round 10}}', '10')

    # ------------------------------------------------------- test --
    def test_pm_transform_roundup(self):
        self.assertParses('{{onePone, roundup}}', '2')
        self.assertParses('{{onePsix, roundup}}', '2')
        self.assertParses('{{negonePone, roundup}}', '-2')
        self.assertParses('{{negonePsix, roundup}}', '-2')

    # ------------------------------------------------------- test --
    def test_pm_transform_roundup_to(self):
        self.assertParses('{{negone, roundup 0.5}}', '-1')
        self.assertParses('{{one, roundup 0.5}}', '1')
        self.assertParses('{{onePone, roundup 0.5}}', '1.5')
        self.assertParses('{{onePsix, roundup 0.5}}', '2')
        self.assertParses('{{ten, roundup 0.5}}', '10')

        self.assertParses('{{negone, roundup 10}}', '-10')
        self.assertParses('{{one, roundup 10}}', '10')
        self.assertParses('{{onePone, roundup 10}}', '10')
        self.assertParses('{{ten, roundup 10}}', '10')
        self.assertParses('{{twelve, roundup 10}}', '20')

    # ------------------------------------------------------- test --
    def test_pm_transform_rounddown(self):
        self.assertParses('{{onePone, rounddown}}', '1')
        self.assertParses('{{onePsix, rounddown}}', '1')
        self.assertParses('{{negonePone, rounddown}}', '-1')
        self.assertParses('{{negonePsix, rounddown}}', '-1')

    # ------------------------------------------------------- test --
    def test_pm_transform_rounddown_to(self):
        self.assertParses('{{negone, rounddown 0.5}}', '-1')
        self.assertParses('{{one, rounddown 0.5}}', '1')
        self.assertParses('{{onePone, rounddown 0.5}}', '1')
        self.assertParses('{{onePsix, rounddown 0.5}}', '1.5')
        self.assertParses('{{ten, rounddown 0.5}}', '10')

        self.assertParses('{{negone, rounddown 10}}', '0')
        self.assertParses('{{one, rounddown 10}}', '0')
        self.assertParses('{{onePone, rounddown 10}}', '0')
        self.assertParses('{{ten, rounddown 10}}', '10')
        self.assertParses('{{twelve, rounddown 10}}', '10')

    # ------------------------------------------------------- test --
    def test_pm_transform_plural(self):
        self.assertParses('{{one, plural}}', '')
        self.assertParses('{{onePsix, plural}}', 's')
        self.assertParses('{{negone, plural}}', 's')

        self.assertParses('ox{{one, plural en}}', 'ox')
        self.assertParses('ox{{two, plural en}}', 'oxen')

        self.assertParses('{{one, plural radii radius}}', 'radius')
        self.assertParses('{{two, plural radii radius}}', 'radii')

    # ------------------------------------------------------- test --
    def test_pm_transform_quotedargs(self):
        self.assertParses('{{one, plural "knights errant" "knight errant"}}', 'knight errant')
        self.assertParses("{{two, plural 'knights errant' 'knight errant'}}", 'knights errant')
        self.assertParses("{{two, plural \"knights errant\" 'knight errant'}}", 'knights errant')

    # ------------------------------------------------------- test --
    def test_pm_transform_change(self):
        self.assertParses('{{one, change}}', 'increase')
        self.assertParses('{{zero, change}}', 'change')
        self.assertParses('{{negone, change}}', 'decrease')

# ===================================================================






























#