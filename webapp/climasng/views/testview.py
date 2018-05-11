import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------
class TestView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='test', renderer='../templates/test.html.pt')
    def __call__(self):
        return { }

