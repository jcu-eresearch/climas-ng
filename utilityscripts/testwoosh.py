#!/usr/bin/env python


import os
import json

from whoosh.fields import Schema, TEXT, NGRAM, NGRAMWORDS, ID, STORED, KEYWORD
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.query import Or, And, Term

# ---------------------------------------------------------

jsonfile = 'species-2017-07-24.json'

# ---------------------------------------------------------

# # define schema for indexed info
# schema = Schema(
# 	nice_name = NGRAMWORDS(2, 8, at='start', stored=True),
# 	item_id =   ID,
# 	item_path = STORED,
# 	item_type = KEYWORD
# )

# # make an "index" that'll hold the data
# write_spp_index = index.create_in('./whooshindex', schema)

# # put data in there
# writer = write_spp_index.writer()

# with open(jsonfile) as f:
#     spps = json.load(f)

#     for spp in spps:
#     	info = spps[spp]

#     	if len(info['commonNames']) > 0 and len(info['commonNames'][0]) > 0:
#     		for cn in info['commonNames']:
# 	    		writer.add_document(
# 					nice_name = cn + ' (' + spp + ')',
# 					item_id = spp,
# 					item_path = info['path'],
# 					item_type = 'species'
# 	    		)
#     	else:
#     		writer.add_document(
# 				nice_name = '(' + spp + ')',
# 				item_id = spp,
# 				item_path = info['path'],
# 				item_type = 'species'
#     		)

# # writer.add_document(
# # 	nice_name = u'Giraffe (Giraffa camelopardalis)',
# # 	item_id = u'Giraffa camelopardalis',
# # 	item_path = u'Animalia/Chordata/Mammalia/Artiodactyla/Giraffidae/Giraffa/Giraffa_camelopardalis',
# # 	item_type = u'species'
# # )
# # writer.add_document(
# # 	nice_name = u'Meercat (Suricata suricatta)',
# # 	item_id = u'Suricata suricatta',
# # 	item_path = u'Animalia/Chordata/Mammalia/Carnivora/Herpestidae/Suricata/Suricata_suricatta',
# # 	item_type = u'species'
# # )
# # writer.add_document(
# # 	nice_name = u'Climate: precipitation, annual average',
# # 	item_id = u'Climate precipitation average',
# # 	item_path = u'precipitation/average',
# # 	item_type = u'climate'
# # )
# writer.commit()


# open index
read_spp_index = index.open_dir('./whooshindex')


# try a search
with read_spp_index.searcher() as searcher:
	qp = QueryParser("nice_name", schema=read_spp_index.schema)

	for searchstr in [u'Giraffe', u'gir', u'aff', u'precip', 'camel']:

		query = qp.parse(searchstr)

		allowable = Or([Term(u'item_type', 'species'), Term(u'item_type', 'climate')])
		allowable = Or([Term(u'item_type', 'species')])

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
# ---------------------------------------------------------
# ---------------------------------------------------------

# import sys
# sys.path.append(appdir + '/climasng/data')
# import datafinder

# datafinder.createSpeciesJson(datadir, os.path.join(jsondir, 'species.json'))
# datafinder.createBiodiversityJson(datadir)
