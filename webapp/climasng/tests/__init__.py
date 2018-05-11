import unittest
import transaction
import os
from paste.deploy.loadwsgi import appconfig
from pyramid.config import Configurator

from pyramid import testing
from climasng.views.oldspeciesview import OldSpeciesView
from climasng.models import *

from climasng.parsing.prosemaker import ProseMaker

# -------------------------------------------------------------------
class ClimasTestCase(unittest.TestCase):
    def setUp(self):
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()

# -------------------------------------------------------------------
class ProseMakerTestCase(unittest.TestCase):

    def setUp(self):
        self.pm = ProseMaker()
        self.config = testing.setUp()

    def tearDown(self):
        testing.tearDown()

    def assertParses(self, source, expected, parser=None):
        if parser is None:
            parser = self.pm
        parser.source = source
        self.assertEqual(
            parser.doc,
            expected,
            "'%s' gave '%s'; expected '%s'" % (source, parser.doc, expected)
        )

# -------------------------------------------------------------------
class ClimasDataTestCase(unittest.TestCase):
    def setUp(self):
        self.config = testing.setUp()

        # get the db ready
        root = os.path.dirname(__file__)
        settings = appconfig('config:' + os.path.join(root, '..', '..', 'test.ini'))
        config = Configurator(settings=settings)
        config.include('pyramid_chameleon')
        engine = engine_from_config(settings, 'sqlalchemy.')
        DBSession.configure(bind=engine)
        Base.metadata.bind = engine
        Base.prepare(engine)

    def tearDown(self):
        DBSession.remove()
        testing.tearDown()
