import unittest
import transaction
import os
from paste.deploy.loadwsgi import appconfig
from pyramid.config import Configurator

from pyramid import testing
from climasng.views.oldspeciesview import OldSpeciesView
from climasng.models import *
from climasng.tests import ClimasDataTestCase

class TestOldSpeciesView(ClimasDataTestCase):

    # setup and teardown already implemented by parent class

    # ------------------------------------------------------- test --
    def test_view_gets_data(self):
        # pretend we're asking for Queensland, 2085
        req = testing.DummyRequest()
        req.matchdict = {
            'region': '4',
            'year': '2085'
        }
        view = OldSpeciesView(req)
        info = view()

        # it should be for region 4, where 4 is an integer
        self.assertEqual(info['region'].id, 4)

        # it should be for Queensland
        self.assertEqual(info['region'].name, 'Queensland')

        # the year should be '2085', a string
        self.assertEqual(info['year'], '2085')



