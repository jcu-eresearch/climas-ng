#!/usr/bin/env python

import os
import sys
from xml.dom import minidom


LEGEND_FONT_SIZE = 12
LEGEND_HEIGHT = 30


# ---------------------------------------------------------
def make_legend(sld, legend):

	sys.stdout.write('generating legend for ' + sld + ': ')
	sys.stdout.flush()

	with open(legend, 'w') as f:

		f.write('<table style="border-collapse: collapse; font-family: sans-serif; font-size: ' + str(LEGEND_FONT_SIZE) + 'px">' + "\n")

		dom = minidom.parse(sld)
		colorentries = dom.getElementsByTagName('ColorMapEntry')

		# skip invisible colors
		colorentries = [e for e in colorentries if e.getAttribute('opacity') != "0"]
		# reverse order (big numbers on top)
		colorentries = sorted(colorentries, key=lambda e: float(e.getAttribute('quantity')), reverse=True)

		n_entries = len(colorentries)
		spare_space = LEGEND_HEIGHT - n_entries
		gradient_height = float(spare_space) /  float((n_entries - 1))

		prev_color = None
		for c in colorentries:

			sys.stdout.write('.')
			sys.stdout.flush()

			# gradient from previous one
			if prev_color is not None:
				styles = '; '.join([
					'background: linear-gradient(to bottom, ' + prev_color + ', ' + c.getAttribute('color') + ')',
					'padding: 0 1em',
					'height: ' + str(gradient_height) + 'em',
				])
				f.write('<tr><td style="' + styles + '"></td></tr>' + "\n")

			styles = '; '.join([
				'background: ' + c.getAttribute('color'),
				'min-width: 3em',
				'max-height: 1em',
				'padding: 0',
				'text-align: center',
				'color: #000',
				# 'text-shadow: 0 0 1px #fff, 0 0 2px #fff, 0 0 3px #fff, 0 0 4px #fff, 0 0 5px #fff'
			])
			spanstyles = '; '.join([
				'display: inline-block',
				''
				'background: rgba(255,255,255, 0.5)',
				'border-radius: 50%',
				'height: 1em',
				'min-width: 2em',
				'padding: 0.1em'
			])

			# f.write('<tr><td style="' + styles + '">' + c.getAttribute('quantity') + '</td></tr>' + "\n")
			f.write('<tr><td style="' + styles + '"><span style="' + spanstyles + '">' + c.getAttribute('quantity') + '</span></td>' + "\n")
			f.write('</tr>' + "\n")

			prev_color = c.getAttribute('color')

		f.write('</table>' + "\n")

	sys.stdout.write("\n")
	sys.stdout.flush()

# ---------------------------------------------------------
def make_legends(srcpath, destpath):

    for dir, subdirs, files in os.walk(srcpath):

    	for file in files:
    		if file[-4:].lower() == '.sld':
    			src = os.path.join(srcpath, file)
    			dest = os.path.join(destpath, file + '.html')
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