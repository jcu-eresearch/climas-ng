import os
import pypandoc

from pyramid.response import Response
from pyramid.response import FileResponse
from pyramid.view import view_config
from tempfile import NamedTemporaryFile

from climasng.parsing.docparser import DocParser
from climasng.docassembly.docassembler import DocAssembler
from climasng.docassembly.sectiondata import SectionData

# -------------------------------------------------------------------
# -------------------------------------------------------------------

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

        root_section = SectionData(self.request.registry.settings['climas.report_section_path'])

        da = DocAssembler(
            doc_data,
            root_section,
            settings={
                'region_url_pattern': 'http://localhost:8080/regiondata/${region_type}/${region_id}',
                'region_data_path_pattern': self.request.registry.settings['climas.region_data_path'] + '/${region_type}/${region_id}',
                'section_debug': True
            },
        )

        with NamedTemporaryFile(prefix='CliMAS-Report-', suffix='.pdf', delete=True) as tf:
            tfpath = os.path.abspath(tf.name)

            doc = pypandoc.convert(da.result(), 'latex', format='markdown', extra_args=(
                '-o', tfpath,
                '--latex-engine=/usr/local/texlive/2014/bin/x86_64-linux/pdflatex',
                '--template=' + self.request.registry.settings['climas.doc_template_path'] + '/default.latex'
            ))

            response = FileResponse(tfpath)
            # response.content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            # response.content_disposition = "attachment; filename=CliMAS-Report.docx"
            response.content_type = "application/pdf"
            response.content_disposition = "attachment; filename=CliMAS-Report.pdf"
            return response

# -------------------------------------------------------------------
