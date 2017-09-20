#!/usr/bin/env python

import os
import sys
import hashlib
import re
import decimal
from xml.dom import minidom


LEGEND_FONT_SIZE = 3.6 # lineheight: "units" between lines of text, legend is 100 units tall

# ---------------------------------------------------------
def qty_label(qty):

	# can't do this coz big numbers go to sci notation
	# label = "%g" % qty 
	# instead do a stupid dance through Decimal format

	ctx = decimal.Context()
	ctx.prec = 20
	label = format(ctx.create_decimal(repr(qty)), 'f')

	# decimal zero
	label = re.sub(r'.0$', r'', label)

	# millions
	label = re.sub(r'(\d)([1-9])00000$', r'\1.\2M', label)
	label = re.sub(r'000000$', 'M', label)

	# thousands
	label = re.sub(r'(\d)([1-9])00$', r'\1.\2k', label)
	label = re.sub(r'000$', 'k', label)

	return label

# ---------------------------------------------------------
def make_legend(sld, legend):

	print('generating legend for ' + sld)

	# a "unique" code for this sld, used in SVG element ids
	sld_code = hashlib.md5(sld.encode('utf8')).hexdigest()[:5]

	dom = minidom.parse(sld)
	colorentries = dom.getElementsByTagName('ColorMapEntry')
	colorentries = sorted(colorentries, key=lambda e: float(e.getAttribute('quantity')), reverse=True)

	# make a new list of "legend things"
	lthings = []
	prev_color = None
	prev_value = None
	prev_liminal = None
	for c in colorentries:

		# skip the transparent ones
		if c.getAttribute('opacity') == "0":
			continue

		# maybe this is a color transition point
		if 'liminal' in c.getAttribute('label'):
			if prev_liminal is None:
				prev_liminal = {
	        		'value': float(c.getAttribute('quantity')),
	        		'col': c.getAttribute('color')
				}
				continue

			else:

				# gradient from previous one
				if prev_color is not None:
					# ..then we need a gradient section joining the last
					# colour with this colour
					lthings.append({
						'col1': prev_color,
						'col2': prev_liminal['col'],
						'fixed': 0,
						'variable': 3
					})

				# this is a liminal value, and we just saw a liminal value
				lthings.append({
					'col1': prev_liminal['col'],
					'col2': c.getAttribute('color'),
					'value': (prev_liminal['value'] + float(c.getAttribute('quantity')))/2,
					'fixed': 0,
					'variable': 1
				})
				prev_color = c.getAttribute('color')
				prev_liminal = None
				continue

		else:
			# this ISN'T marked as liminal
			prev_liminal = None


		# gradient from previous one
		if prev_color is not None:
			# .. then gradient from prev_color to us
			lthings.append({
				'col1': prev_color,
				'col2': c.getAttribute('color'),
				'fixed': 0,
				'variable': 3
			})

		if 'hidden' not in c.getAttribute('label'):
			# hidden points have leading-in gradients, but not labels
			lthings.append({
				'value': float(c.getAttribute('quantity')),
				'col1': c.getAttribute('color'),
				'col2': c.getAttribute('color'),
				'fixed': 2,
				'variable': 0,
			})

		prev_color = c.getAttribute('color')
		prev_value = float(c.getAttribute('quantity'))

	legend_fixed_size = 2 # fixed gap at top and bottom
	legend_var_size = 0
	for t in lthings:
		legend_var_size += t['variable']
		legend_fixed_size += t['fixed']

	legend_total_size = legend_fixed_size + legend_var_size

	# allocate sizes from the 100% we have available.
	fix_alloc = 0.55 * LEGEND_FONT_SIZE # remember a label gets two of these
	var_alloc = (100.0 - (float(fix_alloc) * float(legend_fixed_size))) / float(legend_var_size)

	for t in lthings:
		t['height'] = (t['fixed'] * fix_alloc) + (t['variable'] * var_alloc)

	with open(legend, 'w') as f:

		f.write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="60" height="300" viewBox="0 0 12 100">')
		f.write('<defs><linearGradient id="legend-gradient-%s" x1="0" x2="0" y1="0" y2="1">' % sld_code)

		offset = fix_alloc # start with a fixed space of initial padding
		for t in lthings:
			f.write('<stop offset="%g%%" stop-color="%s"></stop>' % (offset, t['col1']))
			offset += t['height']
			f.write('<stop offset="%g%%" stop-color="%s"></stop>' % (offset, t['col2']))

		f.write('</linearGradient></defs>')
		f.write('<rect x="0" y="0" width="12" height="100" fill="url(#legend-gradient-%s)"></rect>' % sld_code)

		offset = fix_alloc # start with a fixed space of initial padding
		for t in lthings:
			textpos = offset + float(t['height']) / 2
			if t.get('value') is not None:
				th = LEGEND_FONT_SIZE
				f.write('<rect fill="white" fill-opacity="0.5" x="1.5" y="%g" width="9" height="%g" rx="%g" ry="%g" />' % (textpos - (th/2), th, th/2, th/2))
				f.write('<text x="6" y="%g" dy="0.33em" font-family="sans-serif" font-size="%g" style="text-anchor: middle">%s</text>' % (textpos, LEGEND_FONT_SIZE, qty_label(t['value'])))

			offset += t['height']

		f.write('</svg>')

# ---------------------------------------------------------
def make_legends(srcpath, destpath):

    for dir, subdirs, files in os.walk(srcpath):

    	for file in files:
    		if file[-4:].lower() == '.sld':
    			src = os.path.join(srcpath, file)
    			dest = os.path.join(destpath, file + '.svg')
    			make_legend(src, dest)

# ---------------------------------------------------------
def usage():
	print('Usage:')
	print('    make-legends.py [source dir [destination dir]]')
	print('        source dir: where to find .sld files (defaults to ./styles)')
	print('        destination dir: where to put .html files (defaults to ./legends)')

# ---------------------------------------------------------
if __name__ == "__main__":

	src = 'styles'
	dst = 'legends'

	if len(sys.argv) > 1:
		src = sys.argv[1]

	if len(sys.argv) > 2:
		dst = sys.argv[2]

	if len(sys.argv) > 3:
		usage()
		sys.exit()

	if os.path.isdir(src) and os.path.isdir(dst):
		make_legends(src, dst)

	else:
		usage()