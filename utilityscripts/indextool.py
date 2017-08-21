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

from whoosh.fields import Schema, TEXT, NGRAM, NGRAMWORDS, ID, STORED, KEYWORD
from whoosh import index
from whoosh.qparser import QueryParser
from whoosh.query import Or, And, Term

# -------------------------------------------------------------------
# config

json_data_dir = '/var/wallacewebapp/climasng/data'
species_json_file = 'species.json'
summaries_json_file = 'summaries.json'

search_index_dir = os.path.join(json_data_dir, 'searchindex')

if os.path.isdir('/Users/pvrdwb'):

	# ..overwrite with local dev paths
	json_data_dir = '/Users/pvrdwb/projects/climas-global/webapp/climasng/data'
	search_index_dir = os.path.join(json_data_dir, 'searchindex')


# define schema for indexed info
schema = Schema(
	nice_name = NGRAMWORDS(2, 8, at='start', sortable=True, stored=True),
	name_id   = ID(stored=True, unique=True),
	item_id   = ID(stored=True),
	item_path = STORED,
	item_type = KEYWORD(stored=True)
)

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
def obtain_index(create=False):
	# make an index that'll hold the data
	if create:
		return index.create_in(search_index_dir, schema)
	else:
		return index.open_dir(search_index_dir)

# -------------------------------------------------------------------
def create_writer(search_index):
	# get a writer that can put data in the index
	return search_index.writer()

# -------------------------------------------------------------------
def insert_species(writer):
	with open(os.path.join(json_data_dir, species_json_file)) as f:
		spps = json.load(f)

		for spp in spps:
			info = spps[spp]

			if len(info['commonNames']) > 0:
				# if there's common names, make an entry for every common name
				for cn in info['commonNames']:
					writer.update_document(
						nice_name = cn + u' (' + spp + u')',
						name_id = cn + u' (' + spp + u')',
						item_id = spp,
						item_path = info['path'],
						item_type = u'species'
					)
			else:
				# if there were no common names, just make a sciname entry
				writer.update_document(
					nice_name = u'(' + spp + u')',
					name_id = u'(' + spp + u')',
					item_id = spp,
					item_path = info['path'],
					item_type = u'species'
				)

# -------------------------------------------------------------------
def insert_summaries(writer):
	with open(os.path.join(json_data_dir, summaries_json_file)) as f:
		summaries = json.load(f)

		for summary in summaries:
			info = summaries[summary]

			# add richness summary
			writer.update_document(
				nice_name = u'Richness - ' + info['level'] + u': ' + summary,
				name_id = u'Richness - ' + info['level'] + u': ' + summary,
				item_id = summary,
				item_path = info['path'],
				item_type = u'richness'
			)

			# add refugia summary
			writer.update_document(
				nice_name = u'Refugia - ' + info['level'] + u': ' + summary,
				name_id = u'Refugia - ' + info['level'] + u': ' + summary,
				item_id = summary,
				item_path = info['path'],
				item_type = u'refugia'
			)

			# add area-of-concern summary
			writer.update_document(
				nice_name = u'Concern - ' + info['level'] + u': ' + summary,
				name_id = u'Concern - ' + info['level'] + u': ' + summary,
				item_id = summary,
				item_path = info['path'],
				item_type = u'aoc'
			)


# -------------------------------------------------------------------
def commit_changes(writer):
	writer.commit()

# -------------------------------------------------------------------
def insert_examples(writer):
	writer.update_document(
		nice_name = u'Giraffe (Giraffa camelopardalis)',
		name_id = u'Giraffe (Giraffa camelopardalis)',
		item_id = u'Giraffa camelopardalis',
		item_path = u'Animalia/Chordata/Mammalia/Artiodactyla/Giraffidae/Giraffa/Giraffa_camelopardalis',
		item_type = u'species'
	)

	writer.update_document(
		nice_name = u'Meercat (Suricata suricatta)',
		name_id = u'Meercat (Suricata suricatta)',
		item_id = u'Suricata suricatta',
		item_path = u'Animalia/Chordata/Mammalia/Carnivora/Herpestidae/Suricata/Suricata_suricatta',
		item_type = u'species'
	)

	writer.update_document(
		nice_name = u'Climate: precipitation, annual average',
		name_id = u'Climate: precipitation, annual average',
		item_id = u'Climate precipitation average',
		item_path = u'precipitation/average',
		item_type = u'climate'
	)

# -------------------------------------------------------------------
def add(the_index):
	msg('preparing index writer')
	writer = create_writer(the_index)

	msg('adding species to index')
	insert_species(writer)

	msg('adding summaries to index')
	insert_summaries(writer)

	msg('writing and optimising index')
	writer.commit(optimize=True)
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# commands
# -------------------------------------------------------------------
def addnew():
	msg('locating existing index')
	the_index = obtain_index()
	add(the_index)
# -------------------------------------------------------------------
def rebuild():
	msg('creating new index')
	the_index = obtain_index(create=True)
	add(the_index)
# -------------------------------------------------------------------
def optimise():
	msg('locating existing index')
	the_index = obtain_index()

	msg('preparing index writer')
	writer = create_writer(the_index)

	msg('optimising index')
	writer.commit(optimize=True)
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# -------------------------------------------------------------------
def perform(command):
	if command == 'addnew':
		addnew()
	elif command == 'rebuild':
		rebuild()
	elif command in ['optimise', 'optimize']:
		optimise()
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






