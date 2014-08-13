import unittest
import transaction

from pyramid import testing

from climasng.tests import ProseMakerTestCase
from climasng.parsing.prosemaker import ProseMaker

# ===================================================================
class TestProseMakerGeneral(ProseMakerTestCase):

    # ------------------------------------------------------- test --
    def test_pm_properties(self):
        a_string = 'test source string'

        # if you use " around keys, JSON is pretty close to Python's
        # literal dict notation.
        some_data =  { "a": "Aaa", "b": "Bbb" }
        some_json = '{ "a": "Aaa", "b": "Bbb" }'

        other_data =  { "c": "Ccc", "d": "Ddd" }
        other_json = '{ "c": "Ccc", "d": "Ddd" }'

        self.pm.data = some_data
        self.assertEqual(self.pm.data, some_data)
        self.assertEqual(self.pm.dataJSON.split(), some_json.split())

        self.pm.source = a_string
        self.assertEqual(self.pm.source, a_string)
        self.assertEqual(self.pm.doc, a_string)

        self.pm.dataJSON = other_json
        self.assertEqual(self.pm.data, other_data)
        self.assertEqual(self.pm.dataJSON.split(), other_json.split())

# ===================================================================
