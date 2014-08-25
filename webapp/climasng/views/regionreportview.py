import os

from pyramid.response import Response
from pyramid.view import view_config

from climasng.parsing.docparser import DocParser
from climasng.docassembly.docassembler import DocAssembler
from climasng.docassembly.sectiondata import SectionData

# -------------------------------------------------------------------
# -------------------------------------------------------------------

class RegionReportView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='regionreport', renderer='../templates/regionreport.html.pt')
    def __call__(self):
        params = self.request.params

        doc_data = {
            'year': params['year'],
            'regiontype': params['regiontype'],
            'regionid': params['region'],
            'selected_sections': params['sections'].split(' '),
            'format': 'pdf'
        }

        root_section = SectionData('/var/climaswebapp/climasng/reportcontent/sections')

        da = DocAssembler(
            doc_data,
            root_section,
            settings={
                'region_url_pattern': 'http://localhost:8080/regiondata/${region_type}/${region_id}'
            },
        )


        return { 'report_content': da.result() }

# -------------------------------------------------------------------
