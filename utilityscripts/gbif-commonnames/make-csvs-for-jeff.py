#!/usr/bin/env python

import sys
import os
import json

import csv

jsonfile = './species.json'

csvoutput = './species-with-names.csv'

#
# read in json
#

with open(jsonfile) as jf:
	spps = json.load(jf)

spplist = []

for spp in spps:
	longest_commonname = 0
	info = [
		spp,
		spps[spp]['path']
	]
	# for name in spps[spp]['commonNames']:
	# 	longest_commonname = max(longest_commonname, len(name))

	# info.append(longest_commonname)

	for name in spps[spp]['commonNames']:
		info.append(name)

	spplist.append(info)


print(spplist[0])


with open(csvoutput, 'w') as cf:
	cf.write('\ufeff')
	writer = csv.writer(cf, quoting=csv.QUOTE_MINIMAL)
	for s in spplist:
		writer.writerow(s)


