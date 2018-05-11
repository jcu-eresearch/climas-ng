#!/usr/bin/env python


import sys
import random
import time
import os
import json
import codecs
import csv

import pandas as pa
import numpy as np

t_path = './data/backbone/Taxon.tsv'
v_path = './data/backbone/VernacularName.tsv'

cn_out_file = './commonnames.json'

MAX_COMMON_NAMES = 5

# ---------------------------------------------------------
def rowcount(dframe, message="items"):
	return "{:20,} {}".format(dframe.shape[0], message)
# ---------------------------------------------------------

#
# taxon table #####
#

print('Loading taxa table from {} ...'.format(t_path))

t = pa.read_table(t_path, usecols=['taxonID', 'taxonRank', 'canonicalName', 'genericName', 'specificEpithet'])

print(rowcount(t, "taxa"))

t.fillna('', inplace=True)
t = t[t['taxonRank'] == 'species']   # must be taxon rank species
t = t[t['specificEpithet'] != '']    # also must have a 'specific' name

print(rowcount(t, "species level"))

t['synthName'] = t['genericName'] + ' ' + t['specificEpithet']

weird = t[t['canonicalName'] != t['synthName']]
# weird = t.query('canonicalName != synthName')
print(rowcount(weird, "(\"species\" with weird names)"))

t = t[t['canonicalName'] == t['synthName']]
# t = t.query('canonicalName == synthName')

print(rowcount(t, "species with normal names"))

# work on a subset
# t = t.iloc[:5000]


#
# vernacular table #####
#

print()
print('Loading common names table from {} ...'.format(v_path))

v = pa.read_table(v_path, 
	dtype={ 'language': str, 'country': str, 'countryCode': str },
	usecols=['taxonID', 'vernacularName', 'language', 'country', 'countryCode'],
	quoting=csv.QUOTE_NONE
)
v.fillna('', inplace=True)

print(rowcount(v, 'vernacular names'))

v = v.query('language == "en" or (language == "" and countryCode == "")')

print(rowcount(v, 'names are either English, or unspecified origin'))


#
# make the species list
#

# spps = t.sample(n=50000)
spps = t

start = time.time()

slist = {}

total = spps.shape[0]
progress = 0
step = round(max(total / 100, 100) / 100) * 100
print("\nProcessing {} species (one progress '.' is {} species)".format(total, step))

for species in spps.itertuples():

	progress += 1
	if progress % step == 0:
		sys.stdout.write('.')
		sys.stdout.flush()

	matching_names = v[ v['taxonID'] == species.taxonID ]
	matching_en_names = matching_names[ matching_names['language'] == 'en' ]
	matching_xx_names = matching_names[ matching_names['language'] != 'en' ]

	cnames = []
	downcase_cnames = []

	for names in [matching_en_names, matching_xx_names]: # ordered by priority
	# for names in [matching_names]:

		for cn in names.itertuples():
			if len(cnames) < MAX_COMMON_NAMES:
				if cn.vernacularName.lower() not in downcase_cnames:
					cnames.append(cn.vernacularName)
					downcase_cnames.append(cn.vernacularName.lower())

	if len(cnames) > 0:
		slist[species.canonicalName] = cnames



print('.')
print("There are {} species with common names.".format(len(slist)))

end = time.time()
# print('That took {} minutes'.format(round((end - start)/60, 1)))
print('That took {} seconds'.format(round((end - start), 1)))

print('Saving...')
with open(cn_out_file, 'wb') as out:
	# this is what you have to do to get utf8 on both Python 2 and 3
	json.dump(slist, codecs.getwriter('utf-8')(out), ensure_ascii=False, indent=4)


