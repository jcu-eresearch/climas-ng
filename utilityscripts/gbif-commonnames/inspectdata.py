#!/usr/bin/env python


import sys
import random
import time
import os
import json
import codecs

import pandas as pa
import numpy as np

t_path = './data/backbone/Taxon.tsv'
v_path = './data/backbone/VernacularName.tsv'

# ---------------------------------------------------------
def rowcount(dframe, message="items"):
	return "{:20,} {}".format(dframe.shape[0], message)
# ---------------------------------------------------------

#
# vernacular table #####
#

print()
print('Loading common names table from {} ...'.format(v_path))

v = pa.read_table(v_path, 
	dtype={ 'language': str, 'country': str, 'countryCode': str },
	usecols=['taxonID', 'vernacularName', 'language', 'country', 'countryCode']
)
v.fillna('', inplace=True)

print(rowcount(v, 'vernacular names'))

v = v.query('language == ""')

print(rowcount(v, 'names are english or unspecified'))

for country in v.country.unique():
	cv = v[v['country'] == country]
	count = cv.shape[0]
	if count > 500:
		code = cv.countryCode.unique().tolist()[0]
		print()
		print(code, ':: ', country)
		# print(rowcount(cv, 'common names for {} ({})'.format(country, code)))
		print(', '.join( cv.sample(30).vernacularName.unique().tolist() ))
