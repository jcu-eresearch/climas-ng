#!/usr/bin/env python

import csv
import glob

spp_sqlf = open('sppnames.sql', 'w')
pres_sqlf = open('spppresences.sql', 'w')

spp_sqlf.write('begin transaction;' + "\n")
pres_sqlf.write('begin transaction;' + "\n")

# file list
files = glob.glob('speciesdata/*.csv')

# skip these regions (not covered by data)
region_skip_list = [
    'State-9',
    'NRM-3',
    'NRM-11',
    'NRM-12',
    'NRM-23',
    'NRM-33',
    'NRM-41',
    'NRM-48',
    'IBRA-18',
    'IBRA-42',
    'IBRA-64',
    'IBRA-66',
    'IBRA-79',
    'subWA-1',
    'subNT-1',
    'subNT-2',
    'subNT-3',
    'subNT-4'
]

for taxacsv in files:
    print('   ' + taxacsv)
    last_class = ''
    last_sci = ''
    with open(taxacsv, 'rb') as tf:
        rowreader = csv.DictReader(tf)
        for row in rowreader:

            #
            # add the species
            #
            spp_class = row['class']
            spp_sci = row['scientific_name']
            if spp_sci != last_sci:
                # it's a new species
                spp_sql = "insert or ignore into species values (null, '" + spp_class + "', '" + spp_class + "', '" + spp_sci + "', '');\n"
                spp_sqlf.write(spp_sql)
                last_class = spp_class
                last_sci = spp_sci

            #
            # add the presences
            #
            reg_type = row['region_type']
            if reg_type == 'Kimberley':  reg_type = 'subWA'
            if reg_type == 'Kimberly':   reg_type = 'subWA'
            if reg_type == 'NT':         reg_type = 'subNT'
            reg_shid = row['shapefile_id']

            if reg_type + '-' + str(reg_shid) in region_skip_list:
                continue

            for year in [2015, 2025, 2035, 2045, 2055, 2065, 2075, 2085]:
                value_list = ["'" + row['current'] + "'"]
                for scen in ['RCP45', 'RCP85']:
                    for perc in ['10th','50th','90th']:

                        sheetfieldname = '_'.join([scen, str(year), perc])

                        # pick a word for this time point
                        if row[sheetfieldname] == 'present':
                            value_list.append("'kept'")
                        elif row[sheetfieldname] == 'absent':
                            value_list.append("''")
                        elif row[sheetfieldname] == 'gained':
                            value_list.append("'gain'")
                        else:
                            value_list.append('"' + row[sheetfieldname] + '"')

                pres_sql = ' '.join([
                    "insert into presences values (",
                        "(select id from species where scientific_name is '" + spp_sci + "'),",
                        "(select id from regions where region_type_regiontype = '" + reg_type + "' and shapefile_id = " + reg_shid + "),",
                        str(year) + ",",
                        ", ".join(value_list),
                    ");\n"
                ])

                pres_sqlf.write(pres_sql)

spp_sqlf.write('commit;' + "\n")
pres_sqlf.write('commit;' + "\n")

spp_sqlf.close()
pres_sqlf.close()
