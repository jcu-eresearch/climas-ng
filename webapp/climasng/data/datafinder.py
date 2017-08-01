
import os
import re
import json

# ===================================================================

def createSpeciesJson(source_path, output_file):
    # create the species.json file using data from the specified path

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

    # Any dir that matches the regex (starting from source_path) is a dir
    # that contains species level data. For example:
    #
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


    # ---- get common names -----------------------------------------

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


    # ---- species --------------------------------------------------

    # ready to check for modelled species
    species_list = {}

    last_group = ''

    for dir, subdirs, files in os.walk(source_path):

        match = sppdir_regex.search(dir)

        if match:
            spp_path = '/'.join([
                match.group(1), match.group(2), 
                match.group(3), match.group(4), 
                match.group(5), match.group(6), 
                match.group(7) + '_' + match.group(8)
            ])
            sci_name = match.group(7) + ' ' + match.group(8)
            sci_name_underscore = match.group(7) + '_' + match.group(8)
            species_list[sci_name] = {
                "commonNames": common_names.get(sci_name_underscore, [""]),
                "path": spp_path
            }

            # maybe this is a new group?
            this_group = match.group(1) + '::' + match.group(3) + '::' + match.group(4)
            if this_group != last_group:
                print('starting ' + this_group)
                last_group = this_group

            # if we found a species dir, we don't need to keep
            # os.walk()ing into its descendent dirs
            subdirs[:] = []

    # now save our species list
    with open(output_file, 'w') as json_file:
        json.dump(species_list, json_file, sort_keys = True, indent = 4)


# ===================================================================

def createSummaryJson(source_path, output_file):
    # create the summaries.json file using data from the specified path

    # a list of places to look for summaries..
    summary_roots = ['class', 'family', 'kingdom', 'order', 'phylum']

    # here's a regex to test for summary dirs:
    #
    #            group(6) - Genus ---------------------------------------------------------. 
    #            group(5) - Family ---------------------------------------------.          | 
    #            group(4) - Order -----------------------------------.          |          | 
    #            group(3) - Class ------------------------.          |          |          | 
    #            group(2) - Phylum ------------.          |          |          |          | 
    #            group(1) - Kingdom --.        |          |          |          |          | 
    #                                 V        V          V          V          V          V 
    summarydir_regex = re.compile(r'(\w+)(?:/(\w+))?(?:/(\w+))?(?:/(\w+))?(?:/(\w+))?(?:/(\w+))?/current\.richness\.tif$')
    #
    # note that:
    #       \w         is a "word" character (as in, not whitespace or punctuation)
    #       \w+        is one or more word chars -- i.e. a word
    #      (\w+)       is a word that we want to remember
    #     /(\w+)       is a word with a literal slash in front of it
    #    (/(\w+))?     optionally, a word with slash, and remember the whole thing as well as just the word
    #  (?:/(\w+))?     optionally, a word with slash, and remember just the word

    # for example:
    #  Genus ---------------------------------------------. 
    #  Family -------------------------------------.      | 
    #  Order ------------------------------.       |      | 
    #  Class ----------------------.       |       |      | 
    #  Phylum ------------.        |       |       |      | 
    #  Kingdom --.        |        |       |       |      | 
    #            V        V        V       V       V      V 
    #        Animalia/Chordata/Amphibia/Anura/Alytidae/Alytes/current.richness.tif

    common_names = {}

    summary_list = {}

    for root in summary_roots:
        print('==== Now checking in ' + root + ' ====')

        last_group = root

        root_dir = os.path.join(source_path, root)
        for dir, subdirs, files in os.walk(root_dir):

            for file in files:
                matchable_path = (dir + '/' + file)[len(root_dir)+1:] # the path from root_dir in
                match = summarydir_regex.search(matchable_path)

                if match:
                    path = '/' + match.group(0).replace('/current.richness.tif', '')
                    # use the last name for the "short" name; the list comprehension is
                    # used to filter out all the trailing Nones.
                    short_name = [n for n in match.groups() if n is not None][-1]
                    summary_list[short_name] = {
                        "commonNames": common_names.get(short_name, [""]),
                        "path": path
                    }

                    # maybe this is a new group?
                    this_group = match.group(1) + '::' + short_name
                    if this_group != last_group:
                        print('starting ' + this_group)
                        last_group = this_group

                    break # leave file loop once we've matched here

    # now save our summaries list
    with open(output_file, 'w') as json_file:
        json.dump(summary_list, json_file, sort_keys = True, indent = 4)


# ===================================================================

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










