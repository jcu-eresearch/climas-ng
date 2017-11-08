#!/usr/bin/env python

import sys
import os
import subprocess
import shutil

import argparse

# -------------------------------------------------------------------
# config

debug_output_level = 3 # max 5 (only errors show)

# -------------------------------------------------------------------
def msg(message, debug_level=3):
	''' debug level goes from 1 (very minor) to 5 (massive problem) '''
	if debug_level >= debug_output_level:
		prefix = ['', 'dbug', 'info', 'mesg', 'warn', 'BOOM'][debug_level]
		print(prefix + ': ' + message)

	if debug_level == 5:
		sys.exit()

# -------------------------------------------------------------------
def checkforgdal():
	gdalv = subprocess.check_output(['gdalinfo', '--version'])

	if gdalv[0:4] == b'GDAL':
		return True

	return False

# -------------------------------------------------------------------
def gdalinfo(file):
	info_str = subprocess.check_output(['gdalinfo', file])
	info_str = info_str.decode(sys.stdout.encoding)

	info = { 'compression': 'unknown', 'srs': 'unknown' }

	if 'COMPRESSION=LZW' in info_str:
		info['compression'] = 'LZW'

	if 'COMPRESSION=DEFLATE' in info_str:
		info['compression'] = 'DEFLATE'

	if 'COMPRESSION=NONE' in info_str:
		info['compression'] = 'NONE'

	if 'AUTHORITY["EPSG","4326"]]' in info_str:
		info['srs'] = 'EPSG:4326'

	return info

# -------------------------------------------------------------------
def careful_copy(fromfile, destfile):

	if not os.access(fromfile, os.R_OK):
		msg('careful_copy says could not read from file: ' + fromfile, 3)
		return False

	if not os.path.isfile(fromfile):
		msg('careful_copy says not a normal file: ' + fromfile, 3)
		return False

	try:
		shutil.copyfile(fromfile, destfile)
		shutil.copystat(fromfile, destfile)
	except Exception as e:
		msg(repr(e), 3)
		return False

	# copy is done, check sizes match
	if os.path.getsize(fromfile) == os.path.getsize(destfile):
		return True
	else:
		msg('careful_copy says copied file size does not match:', 3)
		msg('    ' + os.path.getsize(fromfile) + ' : ' + fromfile, 3)
		msg('    ' + os.path.getsize(destfile) + ' : ' + destfile, 3)
		return False

# -------------------------------------------------------------------
def gdalconvert(infile, outfile):
	convert_result = subprocess.check_output([
		'gdal_translate', infile, outfile, 
		'-a_srs', 'EPSG:4326',
		'-co', 'COMPRESS=DEFLATE',
		'-co', 'PREDICTOR=1',
		'-of', 'GTiff',
		'-q'
	])

	return convert_result

# -------------------------------------------------------------------
def searchtiffs(startingdir, convert=False, removeBackup=False):

	# confirm GDAL
	if not checkforgdal():
		msg('Could not find GDAL. Plz install it', 5)

	if not startingdir:
		msg('Specify a directory on the command line to search inside of', 5)

	# confirm starting dir
	if not os.access(startingdir, os.R_OK):
		msg('Could not access starting directory ( ' + startingdir + ' ).', 5)

	# loop into starting dir
	for dir, subdirs, files in os.walk(startingdir):

		for file in files:

			filewithpath = os.path.join(dir, file)

			# is this a tiff file?
			if file[-4:].lower() != '.tif':
				# not a tif file
				msg('' + filewithpath + ' does not have .tif extension', 1)
				continue

			msg('examining ' + filewithpath, 1)

			fileinfo = gdalinfo(filewithpath)

			file_okay = True

			if fileinfo['compression'] != 'DEFLATE':
				msg('' + filewithpath + ' compression is not DEFLATE', 1)
				file_okay = False

			if file_okay and fileinfo['srs'] != 'EPSG:4326':
				msg('' + filewithpath + ' SRS is not EPSG:4326', 1)
				file_okay = False

			if file_okay:

				if not convert:
					# no conversion requested -- message required
					msg('already good: ' + filewithpath)

			else:

				if convert:
					msg('conversion needed: ' + file, 2)

					copied_original = filewithpath + '.original-pre-conversion'

					if not careful_copy(filewithpath, copied_original):
						msg('could not copy original -- not processing ' + file, 4)
						continue

					gdalconvert(copied_original, filewithpath)

					if (removeBackup):
						# check first
						newfileinfo = gdalinfo(filewithpath)
						if newfileinfo['compression'] == 'DEFLATE' and newfileinfo['srs'] == 'EPSG:4326':
							# .. then we're okay to remove the backup
							os.remove(copied_original)
						else:
							msg('Conversion is suspect, leaving backup: ' + copied_original, 4)

				else:
					# not converting, so message is required 
					print('conversion needed: ' + filewithpath)

# -------------------------------------------------------------------
# -------------------------------------------------------------------
# -------------------------------------------------------------------
# commands
# -------------------------------------------------------------------

def accept_command():
	parser = argparse.ArgumentParser(add_help=False,
			description='Recursively examine / convert tiffs in a given directory.',
	)
	parser.add_argument('command', metavar='command', default='help', nargs='?', 
			help='action to take: help (the default), detect, convert, replace.',
			choices=['help', 'detect', 'convert', 'replace']
	)
	parser.add_argument('targetdir', metavar='targetdir', nargs='?', 
			help="Target directory within which the action will happen."
	)
	parser.add_argument('--verbose', dest='verbose', action='store_true')
	parser.add_argument('--no-verbose', dest='verbose', action='store_false')

	args = parser.parse_args()

	if args.command == 'help':
		parser.print_help()
	elif args.command == 'detect':
		searchtiffs(args.targetdir, convert=False, removeBackup=False)
	elif args.command == 'convert':
		searchtiffs(args.targetdir, convert=True, removeBackup=False)
	elif args.command == 'replace':
		searchtiffs(args.targetdir, convert=True, removeBackup=True)

# -------------------------------------------------------------------
if __name__ == "__main__":
	accept_command()






