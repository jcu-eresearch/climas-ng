import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class HomeView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='home', renderer='../templates/home.html.pt')
    def __call__(self):
        return {}

# -------------------------------------------------------------------

