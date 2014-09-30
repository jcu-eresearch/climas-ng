#!/usr/bin/env python

# go through a directory finding species, and kicking off a
# process for each species.
#

import re
import os
import string

source = '/Volumes/DanielsDisk/work/CliMAS-NG/datasubset ALL data'
dest = '/Volumes/DanielsDisk/work/CliMAS-NG/datasubset'

# process template needs to include these four items:
# src = will be replaced with the source dir for the species
#       e.g. /rdsi/ccimpacts/NRM/mammals/models/Acrobates_pygmaeus
# dest = will be replaced with the dest dir set above
# taxon = will be replaced with the taxon, e.g. mammals
# spp = will be replaced with the species name, e.g. Acrobates_pygmaeus
process = string.Template(' '.join([
    'export CLIMAS_SRC="${src}" &&',
    'export CLIMAS_DEST="${dest}" &&',
    'export CLIMAS_TAXON="${taxon}" &&',
    'export CLIMAS_SPP="${spp}" &&',
    '/Users/pvrdwb/jcu/cng/utilityscripts/prepspecies.py'
]))

# this regex will trigger for species' 1km dirs
# match[1] is the species dir   .--------------------------.
# match[2] is the taxon         :    .---.                 :
# match[3] is the species name  :    :   :        .---.    :
onek_dir_pattern = re.compile(r'(^.*/(\w+)/models/(\w+)/1km)$')

for dir, subdirs, files in os.walk(source):
    match = onek_dir_pattern.search(dir)
    if match:
        try:
            spp_dir = match.group(1)
            taxon = match.group(2)
            spp = match.group(3)

            os.system(process.substitute(src=spp_dir, dest=dest, taxon=taxon, spp=spp))
        except Exception as e:
            print("problem dealing with dir " + match.group(0) + ': ' + str(e))

        # don't recurse any further
        subdirs[:] = []
