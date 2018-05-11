import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class MapsView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='maps', renderer='../templates/maps.html.pt')
    def __call__(self):
        return {
            'species_data_url': self.request.registry.settings['climas.species_data_url'],
            'biodiv_data_url': self.request.registry.settings['climas.biodiv_data_url'],
            'raster_api_url': self.request.registry.settings['climas.raster_api_url']
        }

# -------------------------------------------------------------------

