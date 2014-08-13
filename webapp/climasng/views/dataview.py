import os

from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class DataView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='data')
    def __call__(self):

        return FileResponse(
            os.path.join(os.path.dirname(__file__), '..', 'data', self.request.matchdict['data_name'] + '.json'),
            request=self.request,
            content_type='application/json'
        )

# -------------------------------------------------------------------

