#!/usr/bin/env python

# This copies data for a specific taxon into it's final resting place.
# set env vars:
#   CLIMAS_SRC place to copy from (specific taxon dir)
#   CLIMAS_DEST place to copy to, root of the tree
#   CLIMAS_TAXON the taxon name (lowercase plural: "mammals")
#
# e.g.:
# CLIMAS_SRC = /rdsi/ccimpacts/NRM/mammals
# CLIMAS_DEST = /rdsi/climas/maps
# CLIMAS_TAXON = mammals
#
# ..then this script will put maps at:
# /rdsi/climas/maps/mammals/biodiversity/**

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
                sys.stdout.write("\nCLIMAS TAXA PREP: ")

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
# creates dir if necessary
def ensure_exists(dir):
    try:
        if os.path.isdir(dir):
            log1('dir (' + str(dir) + ') exists already')
        else:
            log1('creating dir (' + str(dir) + ')')
            os.makedirs(dir)
    except Exception as e:
        bailout('could not ensure existence of (' + str(dir) + ') because of ' + str(e))
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
# check we have taxon name
taxon = os.environ.get('CLIMAS_TAXON')

if not taxon:
    bailout('taxon name (' + str(taxon) + ') is unconvincing')

log1('Processing taxon ' + taxon)

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
# Create destination taxa dir
log2('creating taxa biodiversity dir')
biodiv_dir = os.path.join(dest, taxon, 'biodiversity')
ensure_exists(biodiv_dir)
log2('will drop data files into ' + biodiv_dir)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# start the zip file for this taxa
log2('creating taxa zip file')
zip_path = os.path.join(biodiv_dir, taxon + '.zip')
# start an uncompressed zip file
zip_f = zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_STORED, True)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# current biodiversity map
log2('processing current biodiversity')
src_pattern = os.path.join(source, 'biodiversity_current.asc.gz')
dest_subdir = ''

copy_over(src_pattern, dest_subdir, zip_f, biodiv_dir)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# projected biodiversity files, per GCM
log2('processing GCM-specific projected biodiversity maps')

# there's dirs in the biodiv dir, each with model-point projections
for gcm_dir in glob.glob(os.path.join(biodiv_dir, 'RCP*')):
    gcm_subdir = gcm_dir.replace(biodiv_dir + '/', '', 1)
    src_pattern = os.path.join(gcm_dir, '*.asc.gz')
    copy_over(src_pattern, gcm_subdir, zip_f)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# biodiversity decile files
log2('processing projected biodiversity decile summaries')
src_pattern = os.path.join(source, 'deciles', '*.asc.gz')
dest_subdir = 'deciles'
create_or_recreate(os.path.join(biodiv_dir, dest_subdir))

copy_over(src_pattern, dest_subdir, zip_f, biodiv_dir)

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# close the zip file
log2('closing zip file')
zip_f.close()
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
log3('all done.')
log1("\n")










