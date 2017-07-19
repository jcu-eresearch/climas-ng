
import os
import re
import json

def createSpeciesJson(source_path, output_file):
    # create the species.json file using data from the specified path

    # traverse directories looking for dirs named "1km".  If it's
    # path matches this pattern:
    # .../<taxon-name>/models/<species-name>/1km
    # then record that as a species / taxon record.

    # here's a regex to test for species dirs:

    #                group(8) - Species --------------------------------------------.
    #                           (a literal underscore) --------------------------.  |
    #                group(7) - Genus ----------------------------------------.  |  |
    #                group(6) - Genus, again ---------------------------.     |  |  |
    #                group(5) - Family ---------------------------.     |     |  |  |
    #                group(4) - Order ----------------------.     |     |     |  |  |
    #                group(3) - Class ----------------.     |     |     |     |  |  |
    #                group(2) - Phylum ---------.     |     |     |     |     |  |  |
    #                group(1) - Kingdom --.     |     |     |     |     |     |  |  |
    #                                     V     V     V     V     V     V     V  V  V
    sppdir_regex = re.compile(r'species/(\w+)/(\w+)/(\w+)/(\w+)/(\w+)/(\w+)/(\w+)_(\w+)/summaries_temperature$')

    # for example:
    #  Species -----------------------------------------------------------.
    #  Genus ----------------------------------------------------.        |
    #  Genus, again --------------------------------------.      |        |
    #  Family -------------------------------------.      |      |        |
    #  Order ------------------------------.       |      |      |        |
    #  Class ----------------------.       |       |      |      |        |
    #  Phylum ------------.        |       |       |      |      |        |
    #  Kingdom --.        |        |       |       |      |      |        |
    #            V        V        V       V       V      V      V        V
    # species/Animalia/Chordata/Amphibia/Anura/Alytidae/Alytes/Alytes_cisternasii/summaries_temperature/


    # we'll get the species common name from here:
    common_names = {}

    cn_file = os.path.join(os.path.dirname(__file__), 'commonnames.json')
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

    last_sci_class_order = ''

    for dir, subdirs, files in os.walk(source_path):

        match = sppdir_regex.search(dir)

        if match:
            spp_path = '/'.join([
                match(1), match(2), match(3), 
                match(4), match(5), match(6), 
                match(7) + '_' + match(8)
            ])
            sci_name = match.group(7) + ' ' + match.group(8)
            sci_name_underscore = match.group(7) + '_' + match.group(8)
            species_list[sci_name] = {
                "commonNames": common_names.get(sci_name_underscore, [""]),
                "path": spp_path
            }

            # maybe this is a new group?
            this_sci_class_order = sci_class + '::' + match.group(4)
            if this_sci_class_order != last_sci_class_order:
                print('starting ' + this_sci_class_order)
                last_sci_class_order = this_sci_class_order

            # if we found a species dir, we don't need to keep
            # os.walk()ing into its descendent dirs
            subdirs[:] = []

    # now save our species list
    with open(output_file, 'w') as json_file:
        json.dump(species_list, json_file, sort_keys = True, indent = 4)


def createBiodiversityJson(source_path):
    # create the biodiversity.json file using data from the specified path

    # traverse directories looking for "deciles" dirs.
    # If a dir's path matches this pattern:
    # .../<taxon-name>/biodiversity/deciles
    # then record that as a taxon / biodiversity record.

    # here's a regex to test for biodiv dirs:
    biodiv_regex = re.compile(r'/(\w+)/biodiversity/deciles$')

    biodiv_list = {}
    for dir, subdirs, files in os.walk(source_path):

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










