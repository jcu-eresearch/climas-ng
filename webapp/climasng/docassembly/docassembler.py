
import json
import urllib2
import os
from string import Template
from decimal import Decimal

# database stuff
from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_
from climasng.models import *

from climasng.parsing.prosemaker import ProseMaker

class DocAssembler(object):

    def __init__(self, doc_data, section_data, settings={}):
        self._defaults = {
            # pattern can use region_id and region_type to make a url
            'region_url_pattern': 'http://localhost:6543/regiondata/${region_type}/${region_id}',
        }
        # merge in the user settings
        self._settings = dict(self._defaults.items() + settings.items())

        self._doc_data = doc_data
        self._sect_data = section_data
        self._region_type = doc_data['regiontype']
        self._region_id = doc_data['regionid']
        self._region_url_template = Template(self._settings['region_url_pattern'])
        self._region_data_path_template = Template(self._settings['region_data_path_pattern'])
        self._selected_sections = doc_data['selected_sections']
        self._format = doc_data['format_dest']
        self._year = int(doc_data['year'])

        self._section_debug = self._settings.get('section_debug', False)

        self.getRegionData()
        self.getSource()


    def getRegionData(self, region_id=None, region_type=None):
        region_type = self._region_type if region_type is None else region_type
        region_id = self._region_id if region_id is None else region_id

        self._region = {
            'year': self._year,
            'region_type': region_type,
            'region_id': region_id
        }
        # resolve the region url template with region info
        self._region['region_url'] = self._region_url_template.substitute(self._region)
        self._region['region_data_path'] = self._region_data_path_template.substitute(self._region)

        json_string = urllib2.urlopen(self._region['region_url']).read()
        new_data = json.loads(
            json_string,
            parse_float=Decimal, parse_int=Decimal, parse_constant=Decimal
        )
        self._region.update(new_data) # merge, new_data wins

        self.addSectionsToData() # add indicators showing included sections

        # raise Exception(region_data_url)
        # raise Exception(self._region)
        # raise Exception(self._sections)

        return self._region


    def getSource(self):
        sources = []
        for sect in self._sect_data:
            if sect.id in self._selected_sections:
                sources.append(self.getSectionSource(sect))
        self._source = ''.join(sources)
        return self._source


    def addSectionsToData(self):
        for sect in self._sect_data:
            if sect.id in self._selected_sections:
                self._region['section_' + sect.id.replace('.', '_')] = Decimal(1)
            else:
                self._region['section_' + sect.id.replace('.', '_')] = Decimal(0)


    def getSectionSource(self, sect):
        try:
            source = []
            if self._section_debug:
                # work out a shortish path to this section by taking
                # the full path to the section content, and removing
                # the initial part that is in common with this file.
                this_file_dirs = __file__.split(os.path.sep)
                sect_dirs = sect.contentpath.split(os.path.sep)[:-1]
                for dir in this_file_dirs:
                    if sect_dirs[0] == dir:
                        sect_dirs = sect_dirs[1:]
                    else:
                        break
                # write out the shortish path to the content
                source.append("\n\n( ` -- " + os.path.sep.join(sect_dirs) + " -- ` )\n\n")
            with open(sect.contentpath) as contentf:
                # start with the normal content
                source.append( contentf.read() )
                # if it's a query, run the query and append the result
                if sect.is_query:
                    with open(sect.querypath) as qf, open(sect.rowtemplatepath) as rtf:
                        query = qf.read()
                        region_name = ' '.join(self._region_id.split('_')[1:])
                        result_set = DBSession.execute(query, {
                            "year": self._year,
                            "regionname": region_name,
                            "regiontype": self._region_type
                        })

                        # separate template for odd and even rows
                        even_row = Template(rtf.read())
                        odd_row = even_row
                        if sect.has_oddrowtemplate:
                            with open(sect.oddrowtemplatepath) as ortf:
                                odd_row = Template(ortf.read())
                        index = 0
                        # now resolve the row template with this row's data
                        for result in result_set:
                            index += 1
                            if index % 2 == 0:
                                source.append(odd_row.safe_substitute(result))
                            else:
                                source.append(even_row.safe_substitute(result))

                        # separate template for no results?
                        if index < 1 and sect.has_emptytemplate:
                            with open(sect.emptytemplatepath) as mtf:
                                source.append(mtf.read())


                return ''.join(source)

        except IOError as e:
            return ''


    def result(self):
        pm = ProseMaker()
        pm.data = self._region
        pm.source = self._source

        # currently returning raw Markdown.
        return pm.doc

