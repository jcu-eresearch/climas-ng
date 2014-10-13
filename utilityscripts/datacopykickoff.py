#!/usr/bin/env python

# go through a directory finding species, and kicking off a
# process for each species.
#

import re
import os
import string
import sys
import time

## local dev paths
# source = '/Volumes/DanielsDisk/work/CliMAS-NG/newsampledata'
# dest = '/Volumes/DanielsDisk/work/CliMAS-NG/datasubset'

## HPC paths
source = '/rdsi/ccimpacts/NRM'
dest = '/rdsi/climas/taxa-test'

here = os.path.dirname(os.path.realpath(__file__))

# this regex will trigger for species' 1km dirs
# match[1] is the species dir          .--------------------------.
# match[2] is the taxon name           :    .---.                 :
# match[3] is the species name         :    :   :        .---.    :
#                                      :    :   :        :   :    :
species_1km_dir_pattern = re.compile(r'(^.*/(\w+)/models/(\w+)/1km)$')

# process_species template needs to include these four items:
# src = will be replaced with the source dir for the species
#       e.g. /rdsi/ccimpacts/NRM/mammals/models/Acrobates_pygmaeus
# dest = will be replaced with the dest dir set above
# taxon = will be replaced with the taxon, e.g. mammals
# spp = will be replaced with the species name, e.g. Acrobates_pygmaeus

## inline version
# process_species = string.Template(' '.join([
#     'export CLIMAS_SRC="${src}" &&',
#     'export CLIMAS_DEST="${dest}" &&',
#     'export CLIMAS_TAXON="${taxon}" &&',
#     'export CLIMAS_SPP="${spp}" &&',
#     os.path.join(here, 'prepspecies.py')
# ]))

## QSUB version
process_species = string.Template(' '.join([
    'qsub',
    '-j oe',                # merge stdout and stderr
    '-N ${spp}',            # name the job (and logfile)
    '-o logs',              # drop logs into the logs subdir
    '-l cput=1:00:00',      # request up to 1 CPU hour
    '-l walltime=1:00:00',  # request up to 1 real hour
    '-l pmem=2000mb',       # request 2Gb
    '-l nodes=1:ppn=1',     # one node, one core
    '-v CLIMAS_SRC="${src}",CLIMAS_DEST="${dest}",CLIMAS_TAXON="${taxon}",CLIMAS_SPP="${spp}"',
    os.path.join(here, 'prepspecies.py')
]))

# this regex will trigger for taxa biodiversity dirs
# match[1] is the taxa dir                   .----------------------.
# match[2] is the taxon name                 :    .---.             :
#                                            :    :   :             :
taxa_biodiversity_dir_pattern = re.compile(r'(^.*/(\w+)/biodiversity)/deciles$')

# process_taxon template needs to include two items:
# src = will be replaced with the source dir for the taxon
#       e.g. /rdsi/ccimpacts/NRM/mammals/biodiversity
# dest = will be replaced with the dest dir set above
# taxon = will be replaced with the taxon, e.g. mammals
# spp = will be replaced with the species name, e.g. Acrobates_pygmaeus
process_taxon = string.Template(' '.join([
    'qsub',
    '-j oe',                # merge stdout and stderr
    '-N ${taxon}',            # name the job (and logfile)
    '-o logs',              # drop logs into the logs subdir
    '-l cput=1:00:00',      # request up to 1 CPU hour
    '-l walltime=1:00:00',  # request up to 1 real hour
    '-l pmem=2000mb',       # request 2Gb
    '-l nodes=1:ppn=1',     # one node, one core
    '-v CLIMAS_SRC="${src}",CLIMAS_DEST="${dest}",CLIMAS_TAXON="${taxon}"',
    os.path.join(here, 'preptaxon.py')
]))

## job management config
# command line to get a job count
count_jobs_command = 'qstat -u pvrdwb | wc -l'

# stop submitting above this number
max_jobs = 1500

# -------------------------------------------------------------------
# -------------------------------------------------------------------
def wait_for_queue_space():
    cmd_result = os.popen(count_jobs_command).readline()
    job_count = int(cmd_result)

    loop_count = 0

    while job_count >= max_jobs:
        if loop_count == 1:
            print('too many jobs (' + str(job_count) + '), waiting')
        if loop_count > 1:
            sys.stdout.write('.')
            sys.stdout.flush()
            time.sleep(5)
        cmd_result = os.popen(count_jobs_command).readline()
        job_count = int(cmd_result)
        loop_count = (loop_count + 1) % 40

# -------------------------------------------------------------------
for dir, subdirs, files in os.walk(source):

    # is it a species dir?
    match = species_1km_dir_pattern.search(dir)
    if match:
        try:
            spp_dir = match.group(1)
            taxon = match.group(2)
            spp = match.group(3)

            wait_for_queue_space()

            command = process_species.substitute(src=spp_dir, dest=dest, taxon=taxon, spp=spp)
            os.system(command)
        except Exception as e:
            print("problem dealing with dir " + match.group(0) + ': ' + str(e))

        # don't recurse any further
        subdirs[:] = []
        # sys.exit('bailing out early')

    # is it a taxa dir?
    match = taxa_biodiversity_dir_pattern.search(dir)
    if match:
        try:
            taxon_dir = match.group(1)
            taxon = match.group(2)

            wait_for_queue_space()

            command = process_taxon.substitute(src=taxon_dir, dest=dest, taxon=taxon)
            os.system(command)
        except Exception as e:
            print("problem dealing with dir " + match.group(0) + ': ' + str(e))

        # don't recurse any further
        subdirs[:] = []















