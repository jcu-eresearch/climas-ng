import os

from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class RegionDataView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='regiondata')
    def __call__(self):

        srm = self.request.matchdict

        data_path = self.request.registry.settings['climas.region_data_path']

        return FileResponse(
            os.path.join(
                data_path,
                srm['regiontype'],
                srm['regionid'],
                srm['regionid'] + '.' + srm['datatype'] + '.json'
            ),
            request=self.request
        )

# -------------------------------------------------------------------

