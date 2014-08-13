import os

from pyramid.response import Response
from pyramid.view import view_config

from climasng.parsing.docparser import DocParser
from climasng.docassembly.docassembler import DocAssembler

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
            'sections': params['sections'].split(' '),
            'format': 'pdf'
        }

        da = DocAssembler(doc_data)

        return { 'report_content': da.result() }

# -------------------------------------------------------------------
