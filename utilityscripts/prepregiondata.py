#!/usr/bin/env python

import os
import sys
import shutil
import glob
import re
import simplejson
from decimal import Decimal

biodiv_src = '/Volumes/DanielsDisk/work/CliMAS-NG/regions-biodiv'
climate_src = '/Volumes/DanielsDisk/work/CliMAS-NG/regions-original'
dest = '/Volumes/DanielsDisk/work/CliMAS-NG/regions-output'

remaps = {
    'rainfall_current_min': 'baseline_p_min',
    'rainfall_current_mean': 'baseline_p_mean',
    'rainfall_current_max': 'baseline_p_max',

    'temperature_current_min': 'baseline_t_min',
    'temperature_current_mean': 'baseline_t_mean',
    'temperature_current_max': 'baseline_t_max'
}
for year in ['2015','2025','2035','2045','2055','2065','2075','2085']:
    remaps['rainfall_low_' + year + '_tenth_min'] = 'low_' + year + '_p_min_10th'
    remaps['rainfall_low_' + year + '_fiftieth_min'] = 'low_' + year + '_p_min_50th'
    remaps['rainfall_low_' + year + '_ninetieth_min'] = 'low_' + year + '_p_min_90th'

    remaps['rainfall_low_' + year + '_tenth_mean'] = 'low_' + year + '_p_mean_10th'
    remaps['rainfall_low_' + year + '_fiftieth_mean'] = 'low_' + year + '_p_mean_50th'
    remaps['rainfall_low_' + year + '_ninetieth_mean'] = 'low_' + year + '_p_mean_90th'

    remaps['rainfall_low_' + year + '_tenth_max'] = 'low_' + year + '_p_max_10th'
    remaps['rainfall_low_' + year + '_fiftieth_max'] = 'low_' + year + '_p_max_50th'
    remaps['rainfall_low_' + year + '_ninetieth_max'] = 'low_' + year + '_p_max_90th'

    remaps['rainfall_high_' + year + '_tenth_min'] = 'hi_' + year + '_p_min_10th'
    remaps['rainfall_high_' + year + '_fiftieth_min'] = 'hi_' + year + '_p_min_50th'
    remaps['rainfall_high_' + year + '_ninetieth_min'] = 'hi_' + year + '_p_min_90th'

    remaps['rainfall_high_' + year + '_tenth_mean'] = 'hi_' + year + '_p_mean_10th'
    remaps['rainfall_high_' + year + '_fiftieth_mean'] = 'hi_' + year + '_p_mean_50th'
    remaps['rainfall_high_' + year + '_ninetieth_mean'] = 'hi_' + year + '_p_mean_90th'

    remaps['rainfall_high_' + year + '_tenth_max'] = 'hi_' + year + '_p_max_10th'
    remaps['rainfall_high_' + year + '_fiftieth_max'] = 'hi_' + year + '_p_max_50th'
    remaps['rainfall_high_' + year + '_ninetieth_max'] = 'hi_' + year + '_p_max_90th'

    remaps['temperature_low_' + year + '_tenth_min'] = 'low_' + year + '_t_min_10th'
    remaps['temperature_low_' + year + '_fiftieth_min'] = 'low_' + year + '_t_min_50th'
    remaps['temperature_low_' + year + '_ninetieth_min'] = 'low_' + year + '_t_min_90th'

    remaps['temperature_low_' + year + '_tenth_mean'] = 'low_' + year + '_t_mean_10th'
    remaps['temperature_low_' + year + '_fiftieth_mean'] = 'low_' + year + '_t_mean_50th'
    remaps['temperature_low_' + year + '_ninetieth_mean'] = 'low_' + year + '_t_mean_90th'

    remaps['temperature_low_' + year + '_tenth_max'] = 'low_' + year + '_t_max_10th'
    remaps['temperature_low_' + year + '_fiftieth_max'] = 'low_' + year + '_t_max_50th'
    remaps['temperature_low_' + year + '_ninetieth_max'] = 'low_' + year + '_t_max_90th'

    remaps['temperature_high_' + year + '_tenth_min'] = 'hi_' + year + '_t_min_10th'
    remaps['temperature_high_' + year + '_fiftieth_min'] = 'hi_' + year + '_t_min_50th'
    remaps['temperature_high_' + year + '_ninetieth_min'] = 'hi_' + year + '_t_min_90th'

    remaps['temperature_high_' + year + '_tenth_mean'] = 'hi_' + year + '_t_mean_10th'
    remaps['temperature_high_' + year + '_fiftieth_mean'] = 'hi_' + year + '_t_mean_50th'
    remaps['temperature_high_' + year + '_ninetieth_mean'] = 'hi_' + year + '_t_mean_90th'

    remaps['temperature_high_' + year + '_tenth_max'] = 'hi_' + year + '_t_max_10th'
    remaps['temperature_high_' + year + '_fiftieth_max'] = 'hi_' + year + '_t_max_50th'
    remaps['temperature_high_' + year + '_ninetieth_max'] = 'hi_' + year + '_t_max_90th'



clim_src_dirs = glob.glob(climate_src + '/*')

for clim_src_dir in clim_src_dirs:
    if os.path.isdir(clim_src_dir):
        # it's a dir, assume it's a region dir
        reg_id_string = os.path.basename(clim_src_dir)
        reg_type, reg_name = reg_id_string.split('_', 1)

        dest_dir = os.path.join(dest, reg_type, reg_id_string)
        os.makedirs(dest_dir)

        #
        # read in climate data
        #
        clim_file = os.path.join(clim_src_dir, 'data.json')
        with open(clim_file) as cf:
            clim = simplejson.load(
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
            biodiv = simplejson.load(
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
        # write out final json file
        #
        output_file = os.path.join(dest_dir, reg_id_string + '.json')
        with open(output_file, 'w') as of:
            simplejson.dump(new_data, of, indent=4, use_decimal=True, sort_keys=True)

    else:
        # not a dir, skip it
        pass



