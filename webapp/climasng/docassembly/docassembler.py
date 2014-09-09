
import json
import urllib2
import os
from string import Template
from decimal import Decimal

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
        self._format = doc_data['format']
        self._year = doc_data['year']

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
        data = json.loads(
                    json_string,
                    parse_float=Decimal,
                    parse_int=Decimal,
                    parse_constant=Decimal
        )

        self._region.update(data) # merge, json wins

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
        self._source = "\n\n".join(sources)
        return self._source


    def addSectionsToData(self):
        for sect in self._sect_data:
            if sect.id in self._selected_sections:
                self._region['section_' + sect.id.replace('.', '_')] = Decimal(1)
            else:
                self._region['section_' + sect.id.replace('.', '_')] = Decimal(0)


    def getSectionSource(self, sect):
        try:
            with file(sect.contentpath) as sourcefile:
                return sourcefile.read()
        except IOError as e:
            return ''


    def result(self):
        pm = ProseMaker()
        pm.data = self._region
        pm.source = self._source

        # currently returning raw Markdown.
        return pm.doc

