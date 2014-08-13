import unittest
import transaction

from pyramid import testing

from climasng.tests import ClimasTestCase
from climasng.models import *

# ===================================================================
class TestSomething(ClimasTestCase):

    # ------------------------------------------------------- test --
    def test_something(self):
        self.assertTrue(True)
