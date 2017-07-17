#!/usr/bin/env python

# run this to create species.json and biodiversity.json in the
# webapp's static/data directory.

## HPC / prod paths
jsondir = '/var/wallacewebapp/climasng/static/data'
datadir = '/rdsi/vol08/wallace2/W2_website'

if os.path.isdir('/Users/pvrdwb'):

	## local dev paths
	jsondir = '/Users/pvrdwb/projects/climas-global/webapp/climasng/static/data'
	datadir = '/Users/pvrdwb/projects/climas-global/testdata'

#################################################

import os
import sys
sys.path.append('.')
import datafinder

datafinder.createSpeciesJson(datadir, os.path.join(jsondir, 'species.json'))
# datafinder.createBiodiversityJson(datadir)
