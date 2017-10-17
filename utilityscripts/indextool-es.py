#!/usr/bin/env python


#
# you can monitor the availability of the index with something like this:
#
#     watch "echo \"\`date +'%Y-%m-%d %H:%M:%S '\` \`curl -s http://wallace.jcu.io/api/namesearch/?term=lion | wc -w\`\" >> resultcount.log"
#
# ...which will log the number of words in the search response every two 
# seconds. So far, optimising the index appears not to affect availability
# of the search responses.
#

import os
import json

import argparse

# from elasticsearch_dsl.connections import connections
# from elasticsearch_dsl import Mapping, Search
import elasticsearch

# -------------------------------------------------------------------
# config

json_data_dir = '/srv/wallacewebapp/climasng/data'
species_json_file = 'species.json'
summaries_json_file = 'summaries.json'

if os.path.isdir('/Users/pvrdwb'):
	# ..overwrite with local dev path
	json_data_dir = '/Users/pvrdwb/projects/climas-global/webapp/climasng/data'


# make a connection that ElasticSearch funcs will all use
es = elasticsearch.Elasticsearch(hosts=[
	{ 'host': 'localhost', 'port': 9200 }
])
# connections.create_connection(hosts=['localhost'], timeout=10)

## define schema for indexed info
# mapping = Mapping.from_es('wallace', 'map')
## gives these fields, all text:
##  - nice_name  (Common name (sci name), eg "Giraffe (Giraffa camelopardalis)")
##  - name_id    (same as nice name)
##  - item_id    (sci name, eg "Giraffa camelopardalis")
##  - item_path  (path to the dir)
##  - item_type  (species / richness / refugia / aoc / climate)


debug_output_level = 3 # max 5 (only errors show)

# -------------------------------------------------------------------
def msg(message, debug_level=3):
	''' debug level goes from 1 (very minor) to 5 (massive problem) '''
	if debug_level >= debug_output_level:
		prefix = ['', 'dbug', 'info', 'mesg', 'warn', 'BOOM'][debug_level]
		print(prefix + ': ' + message)

	if debug_level == 5:
		sys.exit()

# -------------------------------------------------------------------
def index_map(map_doc):
	es.index(index='wallace', doc_type='map', id=map_doc['name_id'], body=map_doc)

# -------------------------------------------------------------------
def insert_species():
	with open(os.path.join(json_data_dir, species_json_file)) as f:
		spps = json.load(f)

		for spp in spps:
			info = spps[spp]

			if len(info['commonNames']) > 0:
				# if there's common names, make an entry for every common name
				for cn in info['commonNames']:
					index_map({
						"nice_name": cn + u' (' + spp + u')',
						"name_id": cn + u' (' + spp + u')',
						"item_id": spp,
						"item_path": info['path'],
						"item_type": u'species'
					})
			else:
				# if there were no common names, just make a sciname entry
				index_map({
					"nice_name": u'(' + spp + u')',
					"name_id": u'(' + spp + u')',
					"item_id": spp,
					"item_path": info['path'],
					"item_type": u'species'
				})

# -------------------------------------------------------------------
def insert_summaries():
	with open(os.path.join(json_data_dir, summaries_json_file)) as f:
		summaries = json.load(f)

		for summary in summaries:
			info = summaries[summary]

			# add richness summary
			index_map({
				"nice_name": u'Richness - ' + info['level'] + u': ' + summary,
				"name_id": u'Richness - ' + info['level'] + u': ' + summary,
				"item_id": summary,
				"item_path": info['path'],
				"item_type": u'richness'
			})

			# # add refugia summary
			# index_map({
			# 	"nice_name": u'Refugia - ' + info['level'] + u': ' + summary,
			# 	"name_id": u'Refugia - ' + info['level'] + u': ' + summary,
			# 	"item_id": summary,
			# 	"item_path": info['path'],
			# 	"item_type": u'refugia'
			# })

			# add area-of-concern summary
			index_map({
				"nice_name": u'Concern - ' + info['level'] + u': ' + summary,
				"name_id": u'Concern - ' + info['level'] + u': ' + summary,
				"item_id": summary,
				"item_path": info['path'],
				"item_type": u'aoc'
			})


# -------------------------------------------------------------------
def insert_examples():
	index_map({
		"nice_name": u'Giraffe (Giraffa camelopardalis)',
		"name_id": u'Giraffe (Giraffa camelopardalis)',
		"item_id": u'Giraffa camelopardalis',
		"item_path": u'Animalia/Chordata/Mammalia/Artiodactyla/Giraffidae/Giraffa/Giraffa_camelopardalis',
		"item_type": u'species'
	})

	index_map({
		"nice_name": u'Meercat (Suricata suricatta)',
		"name_id": u'Meercat (Suricata suricatta)',
		"item_id": u'Suricata suricatta',
		"item_path": u'Animalia/Chordata/Mammalia/Carnivora/Herpestidae/Suricata/Suricata_suricatta',
		"item_type": u'species'
	})

	index_map({
		"nice_name": u'Climate: precipitation, annual average',
		"name_id": u'Climate: precipitation, annual average',
		"item_id": u'Climate precipitation average',
		"item_path": u'precipitation/average',
		"item_type": u'climate'
	})

# -------------------------------------------------------------------
def add():
	# msg('preparing index writer')
	# writer = create_writer(the_index)

	msg('adding species to index')
	insert_species()

	msg('adding summaries to index')
	insert_summaries()

	# msg('writing and optimising index')
	# writer.commit(optimize=True)
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# commands
# -------------------------------------------------------------------
def addnew():
	msg('locating existing index')
	add()
# -------------------------------------------------------------------
def rebuild():
	msg('creating new index')
	add()
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# -------------------------------------------------------------------
def perform(command):
	if command == 'addnew':
		addnew()
	elif command == 'rebuild':
		rebuild()
	else:
		msg('"' + command + '"' + ' is not implemented yet', 5)
# -------------------------------------------------------------------
def accept_command():
	parser = argparse.ArgumentParser(add_help=False,
			description='Manipulate the map name search index.', 
			epilog="Most of the time you want to use the 'addnew' command."
	)
	parser.add_argument('command', metavar='command', default='help', nargs='?', 
			help='action to take: help (the default), addnew, empty, rebuild',
			choices=['help', 'addnew', 'empty', 'rebuild', 'optimise', 'optimize']
	)
	args = parser.parse_args()

	if args.command == 'help':
		parser.print_help()
	else:
		perform(args.command)


if __name__ == "__main__":
	accept_command()






