import os

from pyramid.response import Response
from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

from climasng.docassembly.sectiondata import SectionData
from climasng.data import datafinder

# -------------------------------------------------------------------

class DataView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='data')
    def __call__(self):

        data_name = self.request.matchdict['data_name']

        data_path = os.path.join(os.path.dirname(__file__), '..', 'data')

        # if they wanted the report section list, get that
        if data_name == 'reportsections':
            root_section = SectionData(self.request.registry.settings['climas.report_section_path'])
            return Response(body=root_section.toJson(), content_type='application/json')

        elif data_name == 'species':
            species_file = os.path.join(data_path, data_name + '.json')
            if not os.path.isfile(species_file):
                # species.json doesn't exist, create it
                datafinder.createSpeciesJson(self.request.registry.settings['climas.species_data_path'])

        elif data_name == 'biodiversity':
            biodiversity_file = os.path.join(data_path, data_name + '.json')
            if not os.path.isfile(biodiversity_file):
                # biodiversity.json doesn't exist, create it
                datafinder.createBiodiversityJson(self.request.registry.settings['climas.species_data_path'])

        return FileResponse(
            os.path.join(data_path, data_name + '.json'),
            request=self.request,
            content_type='application/json'
        )

# -------------------------------------------------------------------

