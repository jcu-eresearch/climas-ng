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

import pprint

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
        if command == 'mapsearch':

            es = self.request.registry.settings['search_conn']

            allowable = ['species', 'refugia', 'aoc', 'richness']
            query = {
                "query": { "bool": {
                    "must": { "match": {
                        "nice_name": { 
                            "query": params['term'],
                            "operator": "and"
                        }
                    }},
                    "filter": {
                        "terms": { "item_type": allowable }
                    }
                }},
                "from": 0, "size": 10
            }

            results = es.search(index='wallace', doc_type='map', body=query)

            matches = {}
            for result in results['hits']['hits']:
                doc = result['_source']
                matches[doc['nice_name']] = {
                    "type": doc['item_type'],
                    "path": doc['item_path'],
                    "mapId": doc['item_id']
                }

            json_content = json.dumps(matches)
            return Response(body=json_content, content_type='application/json')

        # - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        elif command == 'preplayer':

            gs_user = self.request.registry.settings['climas.gs_user']
            gs_pass = self.request.registry.settings['climas.gs_pass']

            # ==== what's the map they want?

            map_type = params['info[type]']
            map_path = params['info[path]']
            map_id   = params['info[mapId]']
            map_projection = params['proj']

            if map_type == 'species':
                path_to_map_tif = ''.join([
                    "file:///rdsi/wallace2/W2_website/species/",
                    map_path,
                    "/summaries_temperature/",
                    map_projection,
                    ".tif"
                ])

            else:
                # all the summary maps types have the same path 
                path_to_map_tif = ''.join([
                    "file:///rdsi/wallace2/W2_website/",
                    map_path,
                    "/",
                    map_projection,
                    ".tif"
                ])

            coverage_name = '@'.join([map_type, map_id.replace(' ', '_'), map_projection])

            # TODO: remove this debug
            print(path_to_map_tif)

            # ==== insert that map into geoserver

            # todo: put this into a timeout somehow
            poke = requests.put(
                "http://wallace-maps.hpc.jcu.edu.au/geoserver/rest/workspaces/wallace/coveragestores/" + coverage_name + "/external.geotiff",
                data=path_to_map_tif,
                auth=(gs_user, gs_pass)
            )
            poke = requests.post(
                "http://wallace-maps.hpc.jcu.edu.au/geoserver/rest/workspaces/wallace/coveragestores/" + coverage_name + "/coverages",
                data="<coverage><name>" + coverage_name + "</name><nativeName>" + map_projection + "</nativeName></coverage>",
                auth=(gs_user, gs_pass),
                headers={'Content-type': 'text/xml'}
            )

            # ==== return the WMS url for that layer
                
            if (poke.ok or 'already exists' in poke.text):
                result = {
                    "ok": True,
                    "mapUrl": u"http://wallace-maps.hpc.jcu.edu.au/geoserver/wallace/wms",
                    "layerName": u"wallace:" + coverage_name
                }

                json_content = json.dumps(result)
                return Response(body=json_content, content_type='application/json')

            json_content = json.dumps({
                "ok": False,
                "status_code": poke.status_code,
                "status_reason": poke.reason,
                "result": poke.text
            })

            # if we haven't returned yet, our layer poke didn't work
            return Response(status_code=500, body=json_content, content_type='application/json')


    # ---------------------------------------------------------------


