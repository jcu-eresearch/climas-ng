#!/usr/bin/env python

# This copies data for a specific species into it's final resting place.
# set env vars:
#   CLIMAS_SRC place to copy from (specific species dir)
#   CLIMAS_DEST place to copy to, root of the tree
#   CLIMAS_SPP the species name (cap genus with underscore: "Genusname_speciesname")
#   CLIMAS_TAXON the taxon name (lowercase plural: "mammals")
#
# e.g.:
# CLIMAS_SRC = /rdsi/ccimpacts/NRM/mammals/models/Acrobates_pygmaeus/1km
# CLIMAS_DEST = /rdsi/climas/maps
# CLIMAS_TAXON = mammals
# CLIMAS_SPP = Acrobates_pygmaeus
#
# ..then this script will put maps at:
# /rdsi/climas/maps/mammals/species/Acrobates_pygmaeus/1km/**

import os
import sys
import shutil
import glob
import re
import tempfile
import zipfile

# -------------------------------------------------------------------
# log a message then bail out
def bailout(message):
    log1(message)
    sys.exit(message)
# -------------------------------------------------------------------
# log a message to stdout
def log(message, level=2):
    maxlevel = 3
    maxlevel = 2
    maxlevel = 1

    if level >= maxlevel:
        if message == "\n":
            sys.stdout.write("\n")

        else:
            if message is not '.':
                # if it's not a dot, add an initial newline and prefix
                sys.stdout.write("\nCLIMAS SPP PREP: ")

            # dots don't need initial newlines
            sys.stdout.write(message)

        sys.stdout.flush()
# -------------------------------------------------------------------
def log1(message):
    log(message, 1)
# -------------------------------------------------------------------
def log2(message):
    log(message, 2)
# -------------------------------------------------------------------
def log3(message):
    log(message, 3)
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# creates dir, deleting the existing one if necessary
def create_or_recreate(dir):
    try:
        if os.path.isdir(dir):
            shutil.rmtree(dir)
            log1('dir (' + str(dir) + ') exists, removing it')

        log1('creating dir (' + str(dir) + ')')
        os.makedirs(dir)
    except Exception as e:
        bailout('could not (re)create (' + str(dir) + ') because of ' + str(e))
# -------------------------------------------------------------------
# copy over files, dropping them into the zip and optionally the
# destination dir too.
# files: globbable path string
# dest_subdir: subdirectory to copy the files to
# zip_dest: ZipFile reference to add the files to (in dest_subdir)
# dir_dest: optional path to copy files to.
#
# Note that for a dir_dest (but NOT the zip_dest), any ASCIIgrid
# files (*.asc.gz) will be converted to GeoTIFFs (*.tif)
def copy_over(files, dest_subdir, zip_dest, dir_dest=False):

    if dir_dest:
        msg = 'TIFF translating "' + dest_subdir + '"'
    else:
        msg = 'copying "' + dest_subdir + '"'

    # de-glob
    originals = glob.glob(files)

    log3(msg + ' (' + str(len(originals)) + ' files) ')

    for file in originals:
        fname = os.path.basename(file)
        if dir_dest:
            # convert to tif
            tif_file = make_geotiff(file, os.path.join(dir_dest, dest_subdir))

        # write into the zip
        zip_dest.write(file, dest_subdir + '/' + fname)

        log3('.')


# -------------------------------------------------------------------
# given an ascii-gzip file specified by ascii_gzip, turn it into
# a geotiff inside the dest_dir.
def make_geotiff(ascii_gzip, dest_dir):
    rootname = os.path.basename(ascii_gzip).replace('.asc.gz', '')
    workspace = tempfile.mkdtemp(prefix=rootname)
    try:
        # unzip the ascii-gzip to get the ascii
        ascii = os.path.join(workspace, rootname + '.asc')
        tif = os.path.join(dest_dir, rootname + '.tif')
        os.system('gunzip -c "' + ascii_gzip + '" > "' + ascii + '"')
        os.system('gdal_translate "' + ascii + '" "' + tif + '" -co "COMPRESS=lzw" -co "PREDICTOR=2" -of GTiff -q')
        return tif
    except Exception as e:
        log1('Could not gdal-translate (' + ascii_gzip + ') because ' + str(e))
        raise e
    finally:
        shutil.rmtree(workspace)
# -------------------------------------------------------------------
# -------------------------------------------------------------------
log1("\n")
# check we have species name and taxon
spp = os.environ.get('CLIMAS_SPP')
taxon = os.environ.get('CLIMAS_TAXON')

if not spp:
    bailout('species name (' + str(spp) + ') is unconvincing')
if not taxon:
    bailout('species taxon (' + str(taxon) + ') is unconvincing')

log1('Processing ' + spp + ' in ' + taxon)

# check we have source and destination in environment vars
source = os.environ.get('CLIMAS_SRC')
dest = os.environ.get('CLIMAS_DEST')

if not (source and dest):
    bailout('CLIMAS_SRC and CLIMAS_DEST must be set as environment vars')
else:
    log2('CLIMAS_SRC is ' + source)
    log2('CLIMAS_DEST is ' + dest)

# check source and dest exist and are accessible
if not (os.path.isdir(source)):
    bailout('source (' + source + ') does not exist')
if not os.access(source, os.R_OK):
    bailout('source (' + source + ') is not readable')

if not (os.path.isdir(dest)):
    bailout('destination (' + dest + ') does not exist')
if not os.access(dest, os.W_OK):
    bailout('destination (' + dest + ') is not writable')

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# Create destination species dir
log2('creating spp dir')
onek_dir = os.path.join(dest, taxon, 'species', spp, '1km')
create_or_recreate(onek_dir)
log2('will drop data files into ' + onek_dir)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# start the zip file for this species
log2('creating spp zip file')
zip_path = os.path.join(onek_dir, spp + '.zip')
# start an uncompressed zip file
zip_f = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_STORED, True)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# suitability files
log2('processing suitability')
src_pattern = os.path.join(source, 'suitability', '*.asc.gz')
dest_subdir = 'suitability'

copy_over(src_pattern, dest_subdir, zip_f)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# realized files
log2('processing current realised')
src_pattern = os.path.join(source, 'realized', 'vet.suit.cur.asc.gz')
dest_subdir = 'realized'
dest_dir = os.path.join(onek_dir, dest_subdir)
create_or_recreate(dest_dir)

copy_over(src_pattern, dest_subdir, zip_f, onek_dir)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# projected realized files, per GCM
log2('processing future dispersal-realised')

# there's dirs in the realized/ dir, each with model-point projections
for gcm_dir in glob.glob(os.path.join(source, 'dispersal', 'RCP*')):
    gcm_subdir = gcm_dir.replace(source + '/', '')
    src_pattern = os.path.join(gcm_dir, '*.asc.gz')
    copy_over(src_pattern, gcm_subdir, zip_f)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# projected realized files, summarised deciles across GCMs
log2('processing future dispersal-realised deciles')

src_pattern = os.path.join(source, 'dispersal/deciles', '*.asc.gz')
dest_subdir = 'dispersal/deciles'
dest_dir = os.path.join(onek_dir, dest_subdir)
create_or_recreate(dest_dir)

copy_over(src_pattern, dest_subdir, zip_f, onek_dir)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# close the zip file
log2('closing zip file')
zip_f.close()
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
log3('all done.')
log1("\n")
























