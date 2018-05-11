import os
import cgi
import re

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# -------------------------------------------------------------------

class ReflectorView(object):

    def __init__(self, request):
        self.request = request

    # @view_config(route_name='reflector')
    def __call__(self):

                # # find the filename, css files, and format they wanted
                # filename = params['filename'] || 'RegionReport'
                # format = params['format'] || 'html'
                # css_to_include = (params['css'] && params['css'].split(',')) || []

        # grab some params
        filename = self.request.params.get('filename', 'RegionReport')
        css_inclusions = self.request.params.get('css', '')
        css_inclusions = css_inclusions.split(',')

        # start our response
        response = Response()
        # use this to write body content to (better than a giant memory-hogging string)
        body = response.body_file

        # tell the client this is a downloadable html file
        response.content_type='application/octet-stream'
        response.content_disposition='attachment; filename="' + filename + '.html"'
        response.headers['Content-Desciption'] = 'File Transfer' # unnecessary?

        # don't cache this file
        response.cache_expires(0) # sets various cache headers

        # now start filling out the body
        body.write("<html><head>\n")

        # add in the css they wanted
        for css in css_inclusions:
            # skip a blank css file (from splitting a blank string, for example)
            if len(css) == 0:
                continue
            # throw away path in case we're being hacked
            css_file = os.path.join(
                os.path.dirname(__file__),
                '..', 'static', 'css',
                # also replace extension with .css coz SECURITAY
                os.path.splitext(os.path.basename(css))[0] + '.css'
            )
            css_content = ''
            try:
                with file(css_file) as f:
                    css_content = f.read()
            except IOError:
                css_content = '/* could not load "' + cgi.escape(css, True) + '" */'

            body.write("<style>" + css_content + "</style>\n")

        content = self.request.params.get('content', '(no content was supplied)')
        content = content.replace(
            '<img src="/',
            '<img src="' + self.request.route_url('home')
        )

        body.write("</head><body><div id='report'>\n")
        body.write(content)
        body.write("\n</div></body></html>\n")

        return response

# -------------------------------------------------------------------

