import os

from pyramid.response import Response
from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

from climasng.docassembly.sectiondata import SectionData

# -------------------------------------------------------------------

class DataView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='data')
    def __call__(self):

        data_name = self.request.matchdict['data_name']

        # if they wanted the report section list, get that
        if data_name == 'reportsections':
            root_section = SectionData(self.request.registry.settings['climas.report_section_path'])
            return Response(body=root_section.toJson(), content_type='application/json')

        return FileResponse(
            os.path.join(os.path.dirname(__file__), '..', 'data', self.request.matchdict['data_name'] + '.json'),
            request=self.request,
            content_type='application/json'
        )

# -------------------------------------------------------------------

