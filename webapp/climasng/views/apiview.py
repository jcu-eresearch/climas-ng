import os
import json

from pyramid.response import Response
from pyramid.response import FileResponse
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

# database stuff
from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_
from climasng.models import *

# json data stuff
from climasng.docassembly.sectiondata import SectionData
from climasng.data import datafinder

from whoosh.fields import Schema, TEXT, NGRAM, NGRAMWORDS, ID, STORED, KEYWORD
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.query import Or, And, Term

import requests

# -------------------------------------------------------------------

# -------------------------------------------------------------------
class ApiView(object):
    # ---------------------------------------------------------------
    def __init__(self, request):
        self.request = request
    # ---------------------------------------------------------------
    @view_config(route_name='api')
    def __call__(self):

        command = self.request.matchdict['command']
        params = self.request.params

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        if command == 'namesearch':

            search_index = self.request.registry.settings['whoosh_index']
            query_parser = self.request.registry.settings['query_parser']

            with search_index.searcher() as searcher:

                query = query_parser.parse(params['term'])

                # allowable = Or([Term(u'item_type', u'species'), Term(u'item_type', u'climate')])
                # allowable = Or([Term(u'item_type', u'species')])
                allowable = Or([
                    Term(u'item_type', u'species'), 
                    Term(u'item_type', u'refugia'), 
                    Term(u'item_type', u'aoc'),
                    Term(u'item_type', u'richness')
                ])

                results = searcher.search(query, filter=allowable)

                matches = {}

                for result in results:
                    matches[result['nice_name']] = {
                        "type": result['item_type'],
                        "path": result['item_path'],
                        "mapId": result['item_id']
                    }

            json_content = json.dumps(matches)
            return Response(body=json_content, content_type='application/json')
        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        elif command == 'preplayer':

            # ==== what's the map they want?

            # for now assume it's lions
            map_path = "Animalia/Chordata/Mammalia/Carnivora/Felidae/Panthera/Panthera_leo"
            map_type = "species"
            map_id = "Panthera leo"
            map_projection = "TEMP_2_10.no.disp"

            # now we have that we can work out some stuff
            path_to_map_tif = ''.join([
                "file:///rdsi/wallace2/W2_website/species/",
                map_path,
                "/summaries_temperature/",
                map_projection,
                ".tif"
            ])
            coverage_name = ':'.join([map_type, map_projection])

            # ==== insert that map into geoserver

            # todo: put this into a timeout somehow
            poke = requests.put(
                "http://wallace-maps.hpc.jcu.edu.au/geoserver/rest/workspaces/wallace/coveragestores/" + coverage_name + "/external.geotiff",
                data=path_to_map_tif,
                auth=('admin', 'geoserver')
            )

            # ==== return the WMS url for that layer
                
            if poke.status_code == 201:
                result = {
                    "mapUrl": u"http://wallace-maps.hpc.jcu.edu.au/geoserver/wallace/wms",
                    "layerName": u"wallace:" + coverage_name
                }

                json_content = json.dumps(result)
                return Response(body=json_content, content_type='application/json')

            # if we haven't returned uyet, our layer poke didn't work
            return Response(body=poke, content_type='application/json')


    # ---------------------------------------------------------------


