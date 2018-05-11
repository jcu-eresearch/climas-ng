
import os
import json
import codecs

sqljson_file = './sqljson.json'
output_file = './commonnames.json'

# the sqljson.json file holds a giant array that 
# looks like this:
# [
#     {   "spp": "Abrothrix_andinus",
#         "commonNames": [
#             "Andean Altiplano Mouse",
#             "Andean Akodont"
#         ]
#     },
#     ...
# ]
#
# What we're doing here is turning that into a giant
# dict, with species names as keys, and the commonNames
# list as that key's value; then saving that into 
# commonnames.json.
# 
# {
#     "Abrothrix_andinus": [
#         "Andean Altiplano Mouse",
#         "Andean Akodont"
#     ],
#     ...
# }

cnames = {}

# try reading in the list of sci-to-common species names
with open(sqljson_file) as f:
    sql_list = json.load(f)

    for item in sql_list:
    	cnames[item['spp']] = list(set(item['commonNames']))

with open(output_file, 'wb') as out:
	# this is what you have to do to get utf8 on both Python 2 and 3
	json.dump(cnames, codecs.getwriter('utf-8')(out), ensure_ascii=False, indent=4)

