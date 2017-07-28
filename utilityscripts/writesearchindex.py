#!/usr/bin/env python


import os
import json

from whoosh.fields import Schema, TEXT, NGRAM, NGRAMWORDS, ID, STORED, KEYWORD
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.query import Or, And, Term

# ---------------------------------------------------------

jsonfile = 'species-2017-07-24.json'
# indexdir = '../webapp/climasng/data/searchindex'
indexdir = '/var/wallacewebapp/climasng/data/searchindex'

# ---------------------------------------------------------

# define schema for indexed info
schema = Schema(
	nice_name = NGRAMWORDS(2, 8, at='start', stored=True),
	item_id =   ID,
	item_path = STORED,
	item_type = KEYWORD
)

# make an "index" that'll hold the data
write_spp_index = index.create_in(indexdir, schema)

# put data in there
writer = write_spp_index.writer()

with open(jsonfile) as f:
    spps = json.load(f)

    for spp in spps:
    	info = spps[spp]

    	if len(info['commonNames']) > 0 and len(info['commonNames'][0]) > 0:
	    	# if there's common names, make an entry for every common name
    		for cn in info['commonNames']:
	    		writer.add_document(
					nice_name = cn + u' (' + spp + u')',
					item_id = spp,
					item_path = info['path'],
					item_type = u'species'
	    		)
    	else:
    		# if there were no common names, just make a sciname entry
    		writer.add_document(
				nice_name = u'(' + spp + u')',
				item_id = spp,
				item_path = info['path'],
				item_type = u'species'
    		)

# writer.add_document(
# 	nice_name = u'Giraffe (Giraffa camelopardalis)',
# 	item_id = u'Giraffa camelopardalis',
# 	item_path = u'Animalia/Chordata/Mammalia/Artiodactyla/Giraffidae/Giraffa/Giraffa_camelopardalis',
# 	item_type = u'species'
# )

# writer.add_document(
# 	nice_name = u'Meercat (Suricata suricatta)',
# 	item_id = u'Suricata suricatta',
# 	item_path = u'Animalia/Chordata/Mammalia/Carnivora/Herpestidae/Suricata/Suricata_suricatta',
# 	item_type = u'species'
# )

# writer.add_document(
# 	nice_name = u'Climate: precipitation, annual average',
# 	item_id = u'Climate precipitation average',
# 	item_path = u'precipitation/average',
# 	item_type = u'climate'
# )

writer.commit()

