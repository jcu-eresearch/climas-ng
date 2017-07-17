#!/usr/bin/env python

# run this to create species.json and biodiversity.json in the
# webapp's static/data directory.


import os


## HPC / prod paths
jsondir = '/var/wallacewebapp/climasng/static/data'
datadir = '/rdsi/wallace2/W2_website'

if os.path.isdir('/Users/pvrdwb'):

	## local dev paths
	jsondir = '/Users/pvrdwb/projects/climas-global/webapp/climasng/static/data'
	datadir = '/Users/pvrdwb/projects/climas-global/testdata'

#################################################

import sys
sys.path.append('.')
import datafinder

datafinder.createSpeciesJson(datadir, os.path.join(jsondir, 'species.json'))
# datafinder.createBiodiversityJson(datadir)
