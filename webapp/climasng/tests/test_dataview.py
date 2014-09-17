import unittest
import transaction
import json

from pyramid import testing

from climasng.views.dataview import DataView
from climasng.tests import ClimasTestCase

class TestDataView(ClimasTestCase):

    # setup and teardown already implemented by parent class

    # ------------------------------------------------------- test --
    def test_view_gets_data(self):
        # pretend we're asking for the demo_species data
        req = testing.DummyRequest()
        req.matchdict = {
            'data_name': 'test_fixture_species'
        }
        view = DataView(req)
        info = view()

        # it should be JSON
        self.assertEqual(info.content_type, 'application/json')

        # it should have this data
        correct_answer = json.loads('''{
            "Sciname species1": ["Species One", "Species 1", "Uno Species"],
            "Sciname species2": ["Species Two", "Species 2", "Dos Species"]
        }''')

        view_answer = json.loads(info.body)
        self.assertEqual(view_answer, correct_answer)
