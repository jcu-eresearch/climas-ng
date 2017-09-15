#!/usr/bin/env python

import os
import sys
import hashlib
from xml.dom import minidom


LEGEND_FONT_SIZE = 4.0 # lineheight: "units" between lines of text, legend is 100 units tall


# ---------------------------------------------------------
def make_legend(sld, legend):

	print('generating legend for ' + sld)

	# uniq code for this sld
	sld_code = hashlib.md5(sld.encode('utf8')).hexdigest()[:5]

	dom = minidom.parse(sld)
	colorentries = dom.getElementsByTagName('ColorMapEntry')
	colorentries = sorted(colorentries, key=lambda e: float(e.getAttribute('quantity')), reverse=True)

	# make a new list of "legend things"
	lthings = []
	prev_color = None
	prev_value = None
	prev_inflection = None
	for c in colorentries:

		# skip the transparent ones
		if c.getAttribute('opacity') == "0":
			continue

##################
##################
##################
##################
##################
##################
##################
##################
##################
##################
##################
################## this next bit is for detecting the inflection points...
##################

		# # maybe this is a post-inflection point
		# if 'post-inflection' in c.getAttribute('label'):
		# 	prev_inflection = {
        #
		# 	}

		newthing = {}

		# gradient from previous one
		if prev_color is not None:

			newthing['type'] = 'gradientgap'
			newthing['col1'] = prev_color
			newthing['col2'] = c.getAttribute('color')
			newthing['fixed'] = 0
			newthing['variable'] = 3

			lthings.append(newthing)

			newthing = {}

		newthing['type'] = 'labelpoint'
		newthing['value'] = float(c.getAttribute('quantity'))
		newthing['col1'] = c.getAttribute('color')
		newthing['col2'] = c.getAttribute('color')
		newthing['fixed'] = 2
		newthing['variable'] = 0

		lthings.append(newthing)
		prev_color = newthing['col1']
		prev_value = newthing['value']

	legend_fixed_size = 2 # fixed gap at top and bottom
	legend_var_size = 0
	for t in lthings:
		legend_var_size += t['variable']
		legend_fixed_size += t['fixed']

	legend_total_size = legend_fixed_size + legend_var_size

	# allocate sizes from the 100% we have available.
	fix_alloc = 0.8 * LEGEND_FONT_SIZE # remember a label gets two of these
	var_alloc = (100.0 - (float(fix_alloc) * float(legend_fixed_size))) / float(legend_var_size)

	for t in lthings:
		t['height'] = (t['fixed'] * fix_alloc) + (t['variable'] * var_alloc)

	with open(legend, 'w') as f:

		f.write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100" height="400" viewBox="0 0 25 100">')
		f.write('<defs><linearGradient id="legend-gradient-%s" x1="0" x2="0" y1="0" y2="1">' % sld_code)

		offset = fix_alloc # start with a fixed space of initial padding
		for t in lthings:
			f.write('<stop offset="%g%%" stop-color="%s"></stop>' % (offset, t['col1']))
			offset += t['height']
			f.write('<stop offset="%g%%" stop-color="%s"></stop>' % (offset, t['col2']))

		f.write('</linearGradient></defs>')
		f.write('<rect x="0" y="0" width="25" height="100" fill="url(#legend-gradient-%s)"></rect>' % sld_code)

		offset = fix_alloc # start with a fixed space of initial padding
		for t in lthings:
			textpos = offset + float(t['height']) / 2
			if t.get('value') is not None:
				th = LEGEND_FONT_SIZE
				f.write('<rect fill="white" fill-opacity="0.8" x="7" y="%g" width="11" height="%g" rx="%g" ry="%g" />' % (textpos - (th/2), th, th/2, th/2))
				f.write('<text x="12.5" y="%g" dy="0.33em" font-family="sans-serif" font-size="%g" style="text-anchor: middle">%g</text>' % (textpos, LEGEND_FONT_SIZE, t['value']))

			offset += t['height']

		f.write('</svg>')

# ---------------------------------------------------------
def make_legends(srcpath, destpath):

    for dir, subdirs, files in os.walk(srcpath):

    	for file in files:
    		if file[-4:].lower() == '.sld':
    			src = os.path.join(srcpath, file)
    			dest = os.path.join(destpath, file + '.svg.html')
    			make_legend(src, dest)
# ---------------------------------------------------------
def usage():
	print('Usage:')
	print('    make-legends.py [source dir [destination dir]]')
	print('        source dir: where to find .sld files')
	print('        destination dir: where to put .html files (defaults to ./legends)')

if __name__ == "__main__":

	src = 'styles'
	dst = 'legends'

	if len(sys.argv) > 1:
		src = argv[1]

	if len(sys.argv) > 2:
		dst = argv[2]

	if os.path.isdir(src) and os.path.isdir(dst):
		make_legends(src, dst)

	else:
		usage()