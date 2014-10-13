
import os
import re
import json

def createSpeciesJson(source_data_path):
    # create the species.json file using data from the specified path

    # traverse directories looking for dirs named "1km".  If it's
    # path matches this pattern:
    # .../<taxon-name>/models/<species-name>/1km
    # then record that as a species / taxon record.

    # here's a regex to test for species dirs:
    one_km_regex = re.compile(r'/(\w+)/species/(\w+)/1km$')

    # we'll get the species common name from here:
    common_names = {}
    cn_file = os.path.join(os.path.dirname(__file__), 'all_species.json')
    try:
        # try reading in the list of sci-to-common species names
        with open(cn_file) as f:
            common_names = json.load(f)
    except:
        # give up on common names if we can't read them
        common_names = {}

    #
    # okay, ready to check for modelled species
    #
    species_list = {}
    for dir, subdirs, files in os.walk(source_data_path):

        match = one_km_regex.search(dir)

        if match:
            taxon = match.group(1)
            sci_name = match.group(2).replace('_', ' ')
            species_list[sci_name] = {
                "commonNames": common_names.get(sci_name, [""]),
                "group": taxon
            }

            # if we found a species dir, we don't need to keep
            # os.walk()ing into its descendent dirs
            subdirs[:] = []

    # now save our species list
    json_path = os.path.join(os.path.dirname(__file__), 'species.json')
    with open(json_path, 'w') as json_file:
        json.dump(species_list, json_file, sort_keys = True, indent = 4)


def createBiodiversityJson(source_data_path):
    # create the biodiversity.json file using data from the specified path

    # traverse directories looking for "deciles" dirs.
    # If a dir's path matches this pattern:
    # .../<taxon-name>/biodiversity/deciles
    # then record that as a taxon / biodiversity record.

    # here's a regex to test for biodiv dirs:
    biodiv_regex = re.compile(r'/(\w+)/biodiversity/deciles$')

    biodiv_list = {}
    for dir, subdirs, files in os.walk(source_data_path):

        match = biodiv_regex.search(dir)

        if match:
            taxon = match.group(1)
            biodiv_list[taxon] = {
                "group": taxon
            }

            # if we found a biodiv dir, we don't need to keep
            # os.walk()ing into its descendent dirs
            subdirs[:] = []

    # now save our biodiv list
    json_path = os.path.join(os.path.dirname(__file__), 'biodiversity.json')
    with open(json_path, 'w') as json_file:
        json.dump(biodiv_list, json_file, sort_keys = True, indent = 4)










