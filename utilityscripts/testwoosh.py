#!/usr/bin/env python


import os
import json

from whoosh.fields import Schema, TEXT, NGRAM, NGRAMWORDS, ID, STORED, KEYWORD
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.query import Or, And, Term

# ---------------------------------------------------------

# open index
read_spp_index = index.open_dir('../webapp/climasng/data/serversearchindex')


# try a search
with read_spp_index.searcher() as searcher:
    qp = QueryParser("nice_name", schema=read_spp_index.schema)

    # for searchstr in ['richness', u'Giraffe', u'gir', u'aff', u'precip', 'camel']:
    for searchstr in ['richness']:

        query = qp.parse(searchstr)

        allowable = Or([Term(u'item_type', 'species'), Term(u'item_type', 'climate')])
        allowable = Or([Term(u'item_type', 'species')])
        allowable = Or([
            Term(u'item_type', u'species'), 
            Term(u'item_type', u'richness')
        ])

        results = searcher.search(query, filter=allowable)
        if len(results) == 1:
            print(searchstr.ljust(20), len(results), results[0]['nice_name'])
        elif len(results) == 2:
            print(searchstr.ljust(20), len(results), results[0]['nice_name'], results[1]['nice_name'])
        elif len(results) > 2:
            print(searchstr.ljust(20), len(results), results[0]['nice_name'], results[1]['nice_name'], results[2]['nice_name'])
        else:
            print(searchstr.ljust(20), "<< no results >>")


# ---------------------------------------------------------

with read_spp_index.searcher() as searcher:
    qp = QueryParser("nice_name", schema=read_spp_index.schema)

    query = qp.parse("richness")

    allowable = Or([
        Term(u'item_type', u'species'), 
        Term(u'item_type', u'richness')
    ])

    results = searcher.search(query, filter=allowable)

    matches = {}

    for result in results[:1]:

        matches[result['nice_name']] = {
            "type": result['item_type'],
            "path": result['item_path'],
            "mapId": result['item_id']
        }

print('---')
print(matches)
print('---')
json_content = json.dumps(matches)
print(json_content)
# ---------------------------------------------------------
# ---------------------------------------------------------

# import sys
# sys.path.append(appdir + '/climasng/data')
# import datafinder

# datafinder.createSpeciesJson(datadir, os.path.join(jsondir, 'species.json'))
# datafinder.createBiodiversityJson(datadir)
