
import json
import urllib2
import os
from string import Template
from decimal import Decimal

from climasng.parsing.prosemaker import ProseMaker


class DocAssembler(object):

    def __init__(self, doc_data, settings={}):
        self._defaults = {
            # pattern can use region_id and region_type to make a url
            'region_url_pattern': Template('http://localhost:6543/regiondata/${region_type}/${region_id}'),
            'section_path': './climasng/reportcontent/sections'
        }
        # merge in the user settings
        self._settings = dict(self._defaults.items() + settings.items())

        self._doc_data = doc_data

        self._region_type = doc_data['regiontype']
        self._region_id = doc_data['regionid']
        self._sections = doc_data['sections']
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

        region_data_url = self._settings['region_url_pattern'].substitute(self._region)

        json_string = urllib2.urlopen(region_data_url).read()
        data = json.loads(
                    json_string,
                    parse_float=Decimal,
                    parse_int=Decimal,
                    parse_constant=Decimal
        )

        self._region.update(data) # merge, json wins

        # raise Exception(region_data_url)
        # raise Exception(self._region)

        return self._region


    def getSource(self):
        sources = []
        for section in self._sections:
            sources.append(self.getSectionSource(section))
        self._source = "\n\n".join(sources)
        return self._source


    def getSectionSource(self, section):
        section_path = os.path.join(
            self._settings['section_path'],
            os.sep.join(section.split('.')),
            'source.md'
        )
        try:
            with file(section_path) as sourcefile:
                return sourcefile.read()
        except IOError as e:
            return ''


    def result(self):
        pm = ProseMaker()
        pm.data = self._region
        pm.source = self._source

        # currently returning raw Markdown.
        return pm.doc

