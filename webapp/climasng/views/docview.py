import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class DocView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='doc', renderer='../templates/doc.html.pt')
    def __call__(self):
        try:
            page_content_file = os.path.join(os.path.dirname(__file__), '..', 'pagecontent', self.request.matchdict['doc_name'] + '.html')
            with file(page_content_file) as f:
                page_content = f.read()
        except IOError:
            return httpexceptions.HTTPNotFound()

        return { 'doc': self.request.matchdict['doc_name'], 'page_content': page_content }

# -------------------------------------------------------------------

