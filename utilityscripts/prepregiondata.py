#!/usr/bin/env python

import os
import sys
import shutil
import glob
import re
# import simplejson as json
import json
from decimal import Decimal

## dev paths
# biodiv_src = '/Volumes/DanielsDisk/work/CliMAS-NG/regions-biodiv'
# climate_src = '/Volumes/DanielsDisk/work/CliMAS-NG/regions-original'
# dest = '/Volumes/DanielsDisk/work/CliMAS-NG/regions-output'

## HPC paths
biodiv_src = '/rdsi/ccimpacts/NRM/summary'
climate_src = '/rdsi/ccimpacts/NRM/prior_region_summaries'
dest = '/rdsi/climas/regions-test'

remaps = {
    'rainfall_current_min': 'baseline_p_min',
    'rainfall_current_mean': 'baseline_p_mean',
    'rainfall_current_max': 'baseline_p_max',

    'temperature_current_min': 'baseline_t_min',
    'temperature_current_mean': 'baseline_t_mean',
    'temperature_current_max': 'baseline_t_max'
}
for year in ['2015','2025','2035','2045','2055','2065','2075','2085']:
    remaps['rainfall_low_' + year + '_tenth_min'] = 'lo_' + year + '_p_min_10th'
    remaps['rainfall_low_' + year + '_fiftieth_min'] = 'lo_' + year + '_p_min_50th'
    remaps['rainfall_low_' + year + '_ninetieth_min'] = 'lo_' + year + '_p_min_90th'

    remaps['rainfall_low_' + year + '_tenth_mean'] = 'lo_' + year + '_p_mean_10th'
    remaps['rainfall_low_' + year + '_fiftieth_mean'] = 'lo_' + year + '_p_mean_50th'
    remaps['rainfall_low_' + year + '_ninetieth_mean'] = 'lo_' + year + '_p_mean_90th'

    remaps['rainfall_low_' + year + '_tenth_max'] = 'lo_' + year + '_p_max_10th'
    remaps['rainfall_low_' + year + '_fiftieth_max'] = 'lo_' + year + '_p_max_50th'
    remaps['rainfall_low_' + year + '_ninetieth_max'] = 'lo_' + year + '_p_max_90th'

    remaps['rainfall_high_' + year + '_tenth_min'] = 'hi_' + year + '_p_min_10th'
    remaps['rainfall_high_' + year + '_fiftieth_min'] = 'hi_' + year + '_p_min_50th'
    remaps['rainfall_high_' + year + '_ninetieth_min'] = 'hi_' + year + '_p_min_90th'

    remaps['rainfall_high_' + year + '_tenth_mean'] = 'hi_' + year + '_p_mean_10th'
    remaps['rainfall_high_' + year + '_fiftieth_mean'] = 'hi_' + year + '_p_mean_50th'
    remaps['rainfall_high_' + year + '_ninetieth_mean'] = 'hi_' + year + '_p_mean_90th'

    remaps['rainfall_high_' + year + '_tenth_max'] = 'hi_' + year + '_p_max_10th'
    remaps['rainfall_high_' + year + '_fiftieth_max'] = 'hi_' + year + '_p_max_50th'
    remaps['rainfall_high_' + year + '_ninetieth_max'] = 'hi_' + year + '_p_max_90th'

    remaps['temperature_low_' + year + '_tenth_min'] = 'lo_' + year + '_t_min_10th'
    remaps['temperature_low_' + year + '_fiftieth_min'] = 'lo_' + year + '_t_min_50th'
    remaps['temperature_low_' + year + '_ninetieth_min'] = 'lo_' + year + '_t_min_90th'

    remaps['temperature_low_' + year + '_tenth_mean'] = 'lo_' + year + '_t_mean_10th'
    remaps['temperature_low_' + year + '_fiftieth_mean'] = 'lo_' + year + '_t_mean_50th'
    remaps['temperature_low_' + year + '_ninetieth_mean'] = 'lo_' + year + '_t_mean_90th'

    remaps['temperature_low_' + year + '_tenth_max'] = 'lo_' + year + '_t_max_10th'
    remaps['temperature_low_' + year + '_fiftieth_max'] = 'lo_' + year + '_t_max_50th'
    remaps['temperature_low_' + year + '_ninetieth_max'] = 'lo_' + year + '_t_max_90th'

    remaps['temperature_high_' + year + '_tenth_min'] = 'hi_' + year + '_t_min_10th'
    remaps['temperature_high_' + year + '_fiftieth_min'] = 'hi_' + year + '_t_min_50th'
    remaps['temperature_high_' + year + '_ninetieth_min'] = 'hi_' + year + '_t_min_90th'

    remaps['temperature_high_' + year + '_tenth_mean'] = 'hi_' + year + '_t_mean_10th'
    remaps['temperature_high_' + year + '_fiftieth_mean'] = 'hi_' + year + '_t_mean_50th'
    remaps['temperature_high_' + year + '_ninetieth_mean'] = 'hi_' + year + '_t_mean_90th'

    remaps['temperature_high_' + year + '_tenth_max'] = 'hi_' + year + '_t_max_10th'
    remaps['temperature_high_' + year + '_fiftieth_max'] = 'hi_' + year + '_t_max_50th'
    remaps['temperature_high_' + year + '_ninetieth_max'] = 'hi_' + year + '_t_max_90th'


# In python 2.6 simplejson exists, but doesn't support use_decimal.
# I don't know how to test for use_decimal support, so I have to
# abandon simplejson's native support and use this alternative
# solution from Stack Overflow:
# http://stackoverflow.com/questions/1960516/python-json-serialize-a-decimal-object
class DecimalEncoder(json.JSONEncoder):
    def _iterencode(self, o, markers=None):
        if isinstance(o, Decimal):
            return (str(o) for o in [o])
        return super(DecimalEncoder, self)._iterencode(o, markers)
# now use cls=DecimalEncoder in json.dump(s) calls.

clim_src_dirs = glob.glob(climate_src + '/*')

for clim_src_dir in clim_src_dirs:
    if os.path.isdir(clim_src_dir):
        # it's a dir, assume it's a region dir
        reg_id_string = os.path.basename(clim_src_dir)
        reg_type, reg_name = reg_id_string.split('_', 1)
        reg_name = reg_name.replace('_', ' ')

        dest_dir = os.path.join(dest, reg_type, reg_id_string)
        os.makedirs(dest_dir)

        #
        # copy over any useful graphics
        #
        graphs = glob.glob(os.path.join(clim_src_dir, '*.png'))
        for graphfile in graphs:
            destination = os.path.join(
                dest_dir,
                os.path.basename(graphfile).replace('.', '_').replace('_png', '.png')
            )
            shutil.copy(graphfile, destination)

        #
        # read in climate data
        #
        clim_file = os.path.join(clim_src_dir, 'data.json')
        with open(clim_file) as cf:
            clim = json.load(
                cf,
                # can't use simplejson's use_decimal arg here because
                # that only applies to floats, we want ints etc as well.
                parse_float=Decimal,
                parse_int=Decimal,
                parse_constant=Decimal
            )

        #
        # remap the old data names to new data names
        #
        new_data = {}
        for old_datum in remaps:
            value = clim.get(old_datum, False)
            if value:
                new_data[remaps[old_datum]] = Decimal(value)
            else:
                print('problem: did not find ' + old_datum + ' in ' + clim_src_dir)

        #
        # read biodiversity file
        #
        biodiv_file = os.path.join(biodiv_src, reg_id_string + '.txt')
        with open(biodiv_file) as bf:
            biodiv = json.load(
                bf,
                parse_float=Decimal,
                parse_int=Decimal,
                parse_constant=Decimal
            )

        #
        # merge in biodiv info
        #
        for biodiv_datum in biodiv:
            new_data[biodiv_datum] = biodiv[biodiv_datum]

        #
        # add nice region names
        #
        # fancy-up a pretty version of the name for humans to read:
        reg_nice_name = reg_name

        # NRM regions get called "Northern Thingy Region"
        if reg_type == 'NRM':
            reg_nice_name += ' NRM Region'

        # IBRA regions get called "Northern Thingy Bioregion"
        if reg_type == 'IBRA':
            reg_nice_name += ' IBRA Bioregion'
        # States just get called "Thingy" (no suffix)

        # put the fancy name into a phrase for use in textual descriptions:

        reg_name_phrase = reg_nice_name

        if reg_type == 'NRM':
            # NRM Regions get called 'the Australian NRM region of ...'
            reg_name_phrase = 'the Australian NRM region of ' + reg_name
            reg_name_title_phrase = 'the Australian NRM Region of ' + reg_name

        elif reg_type == 'IBRA':
            # IBRA Regions get called 'the Australian IBRA bioregion of ...'
            reg_name_phrase = 'the Australian IBRA bioregion of ' + reg_name
            reg_name_title_phrase = 'the Australian IBRA Bioregion of ' + reg_name

        elif reg_type == 'State' and reg_name.startswith('Australian'):
            # Territories starting with 'Australian' get called 'the [Australian]...'
            reg_name_phrase = 'the ' + reg_name
            reg_name_title_phrase = reg_name_phrase

        elif reg_type == 'State' and reg_name.endswith('Territory'):
            # Other territories get called 'the ...[Territory] of Australia'
            reg_name_phrase = 'the ' + reg_name + ' of Australia'
            reg_name_title_phrase = reg_name_phrase

        elif reg_type == 'State':
            # States get called 'the Australian state of ...'
            reg_name_phrase = 'the Australian state of ' + reg_name
            reg_name_title_phrase = 'the Australian State of ' + reg_name

        new_data['rg_name'] = reg_name
        new_data['rg_nicename'] = reg_nice_name
        new_data['rg_namephrase'] = reg_name_phrase
        new_data['rg_nametitlephrase'] = reg_name_title_phrase

        #
        # write out final json file
        #
        output_file = os.path.join(dest_dir, reg_id_string + '.json')
        with open(output_file, 'w') as of:
            # json.dump(new_data, of, indent=4, use_decimal=True, sort_keys=True)
            json.dump(new_data, of, indent=4, sort_keys=True, cls=DecimalEncoder)

        sys.stdout.write('.')
        sys.stdout.flush()
    else:
        # not a dir, skip it
        pass

print('done.')

