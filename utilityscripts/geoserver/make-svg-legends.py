#!/usr/bin/env python

import os
import sys
import hashlib
import re
import decimal
from xml.dom import minidom


LEGEND_FONT_SIZE = 3.4  # lineheight: "units" between lines of text, if legend is 100 units tall
LEGEND_W = 12           # "units" wide, if legend is 100 units tall
PIXELS_PER_UNIT = 2.66  # what's a nice number of pixels per "unit", if legend is 100 units tall

# ---------------------------------------------------------
def qty_label(qty, prefix='', suffix='', show_plus=False):

	## label = "%g" % qty 
	# can't use %g coz big numbers go to sci notation; instead,
	# do a stupid dance through Decimal format *eyeroll*
	ctx = decimal.Context()
	ctx.prec = 20
	label = format(ctx.create_decimal(repr(qty)), 'f')

	# discard trailing decimal-zero
	label = re.sub(r'.0$', r'', label)

	# replace 1200000 and 3000000 with 1.2M and 3M
	label = re.sub(r'(\d)([1-9])00000$', r'\1.\2M', label)
	label = re.sub(r'000000$', 'M', label)

	# replace 1200 and 3000 with 1.2k and 3k
	label = re.sub(r'(\d)([1-9])00$', r'\1.\2k', label)
	label = re.sub(r'000$', 'k', label)

	# add a plus sign to positive values (and 0)?
	if show_plus:
		label = re.sub(r'^([\d])', r'+\1', label)

	return str(prefix) + label + str(suffix)

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

		px_height = PIXELS_PER_UNIT * 100
		px_width = PIXELS_PER_UNIT * LEGEND_W
		svg_ns = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"'

		f.write('<svg %s width="%i" height="%i" viewBox="0 0 %i %i">' % (svg_ns, px_width, px_height, LEGEND_W, 100))
		f.write('<defs><linearGradient id="legend-gradient-%s" x1="0" x2="0" y1="0" y2="1">' % sld_code)

		offset = fix_alloc # start with a fixed space of initial padding
		for t in lthings:
			f.write('<stop offset="%g%%" stop-color="%s"></stop>' % (offset, t['col1']))
			offset += t['height']
			f.write('<stop offset="%g%%" stop-color="%s"></stop>' % (offset, t['col2']))

		f.write('</linearGradient></defs>')
		f.write('<rect x="0" y="0" width="%i" height="100" fill="url(#legend-gradient-%s)"></rect>' % (LEGEND_W, sld_code))

		offset = fix_alloc # start with a fixed space of initial padding
		for t in lthings:
			textpos = offset + float(t['height']) / 2

			if t.get('value') is not None:
				# there's a value to write
				th = LEGEND_FONT_SIZE
				label = qty_label(t['value'], show_plus=('delta' in legend))

				label_bg_w = 7.5 # label background width
				if len(label) > 3:
					label_bg_w = 9 # a wider label gets a wider background

				# draw whitish background for the label
				label_bg_x = (LEGEND_W / 2) - (label_bg_w / 2)
				f.write('<rect fill="white" fill-opacity="0.5" x="%g" y="%g" width="%g" height="%g" rx="%g" ry="%g" />' % (label_bg_x, textpos - (th/2), label_bg_w, th, th/2, th/2))

				# draw the label
				f.write('<text x="%g" y="%g" dy="0.35em" font-family="sans-serif" font-size="%g" style="text-anchor: middle">%s</text>' % ((LEGEND_W/2), textpos, LEGEND_FONT_SIZE, label))

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