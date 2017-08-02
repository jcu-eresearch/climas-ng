#!/usr/bin/env python


import os
import json

from whoosh.fields import Schema, TEXT, NGRAM, NGRAMWORDS, ID, STORED, KEYWORD
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.query import Or, And, Term

# ---------------------------------------------------------

json_data_dir = '/var/wallacewebapp/climasng/data'
species_json_file = 'species.json'
summaries_json_file = 'summaries.json'

search_index_dir = os.path.join(json_data_dir, 'searchindex')

if os.path.isdir('/Users/pvrdwb'):

	# ..overwrite with local dev paths
	json_data_dir = '/Users/pvrdwb/projects/climas-global/webapp/climasng/data'
	search_index_dir = os.path.join(json_data_dir, 'searchindex')

# ---------------------------------------------------------

# define schema for indexed info
schema = Schema(
	nice_name = NGRAMWORDS(2, 8, at='start', sortable=True, stored=True),
	item_id =   ID(stored=True),
	item_path = STORED,
	item_type = KEYWORD(stored=True)
)

# make an index that'll hold the data
write_spp_index = index.create_in(search_index_dir, schema)

# get a writer that can put data in the index
writer = write_spp_index.writer()


# -------------------------------------------------------------------
# species
#
# with open(species_json_file) as f:
#     spps = json.load(f)

#     for spp in spps:
#     	info = spps[spp]

#     	if len(info['commonNames']) > 0 and len(info['commonNames'][0]) > 0:
# 	    	# if there's common names, make an entry for every common name
#     		for cn in info['commonNames']:
# 	    		writer.add_document(
# 					nice_name = cn + u' (' + spp + u')',
# 					item_id = spp,
# 					item_path = info['path'],
# 					item_type = u'species'
# 	    		)
#     	else:
#     		# if there were no common names, just make a sciname entry
#     		writer.add_document(
# 				nice_name = u'(' + spp + u')',
# 				item_id = spp,
# 				item_path = info['path'],
# 				item_type = u'species'
#     		)

# writer.commit()

# -------------------------------------------------------------------
# summaries
#
with open(summaries_json_file) as f:
	summaries = json.load(f)

	for summary in summaries:
		info = summaries[summary]

		# add richness summary
		writer.add_document(
			nice_name = u'Richness - ' + info['level'] + u': (' + summary + u')',
			item_id = summary,
			item_path = info['path'],
			item_type = u'richness'
		)

writer.commit()



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


