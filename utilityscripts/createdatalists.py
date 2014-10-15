#!/usr/bin/env python

# run this to create species.json and biodiversity.json in the
# .../climasng/data/ directory.

## local dev paths
# jsondir = '/Users/pvrdwb/jcu/cng/webapp/climasng/data'
# datadir = '/Volumes/DanielsDisk/work/CliMAS-NG/datasubset'

## HPC / prod paths
jsondir = '/var/climaswebapp/climasng/data'
datadir = '/rdsi/climas/taxa-test'

import sys
sys.path.append(jsondir)
import datafinder

datafinder.createSpeciesJson(datadir)
datafinder.createBiodiversityJson(datadir)












