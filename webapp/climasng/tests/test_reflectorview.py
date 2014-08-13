import unittest

from pyramid import testing

from climasng.views.reflectorview import ReflectorView
from climasng.tests import ClimasTestCase

class TestReflectorView(ClimasTestCase):

    # setup and teardown already implemented by parent class

    # ------------------------------------------------------- test --
    def test_minimal_reflection(self):

        def route_url_mock(route):
            return 'fake://url.to/' + route + '/'

        req = testing.DummyRequest()
        req.route_url = route_url_mock

        view = ReflectorView(req)
        info = view()

        # body includes the claim that no content was given
        self.assertIn('no content was supplied', info.body)

        # the filename is RegionReport.html
        self.assertIn('filename="RegionReport.html"', info.content_disposition)

    # ------------------------------------------------------- test --
    def test_maxi_reflection(self):

        def route_url_mock(route):
            return 'fake://url.to/' + route + '/'

        test_data = {
            'filename': 'test-filename',
            'content': ' some <b>content</b>',
            'css': 'report.css'
        }

        req = testing.DummyRequest()
        req.route_url = route_url_mock
        req.params = test_data

        view = ReflectorView(req)
        info = view()

        # the content has what we asked for
        self.assertIn(test_data['content'], info.body)

        # the css we wanted is included
        self.assertRegexpMatches(info.body, '<style>[^<]*size: 210mm 297mm;')

        # the filename is what we said
        self.assertIn('filename="' + test_data['filename'] + '.html"', info.content_disposition)



