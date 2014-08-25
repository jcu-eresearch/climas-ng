
import json
import urllib2
import os
import re
from string import Template
from decimal import Decimal


class SectionData(object):

    def __init__(self, sectiondir, parent=None):
        self._parent = parent
        self._dir = sectiondir
        self.fetch_data()


    ## id -----------------------------------------------------------
    @property
    def id(self): return self._metadata['id']

    ## name ---------------------------------------------------------
    @property
    def name(self): return self._metadata['name']

    ## description --------------------------------------------------
    @property
    def description(self): return self._metadata['description']

    ## presence -----------------------------------------------------
    @property
    def presence(self): return self._metadata['presence']

    ## sections -----------------------------------------------------
    @property
    def sections(self): return self._sections

    ## dir ----------------------------------------------------------
    @property
    def dir(self): return self._dir

    ## contentpath --------------------------------------------------
    @property
    def contentpath(self): return os.path.join(self._dir, 'content.md')

    ## parent -------------------------------------------------------
    @property
    def parent(self): return self._parent


    def fetch_data(self):

        try:
            with open(os.path.join(self._dir, 'meta.json')) as meta_file:
                self._metadata = json.load(meta_file)
                if self._parent is not None and self._parent.id is not '':
                    self._metadata['id'] = self._parent.id + '.' + self._metadata['id']
        except IOError:
            self._metadata = {
                'id': '',
                'name': '(no name provided)',
                'description': '(no description provided)',
                'presence': 'required'
            }

        # grab a list of dirs
        # Python doesn't love you at all, so it lacks a function to
        # get dirs.  So this starts a 'walk', which is a generator
        # that returns directory listings for a dir tree.  The first
        # item returned (fetched by .next()) is the current dir, and
        # the content is (path, dirlist, filelist) so the [1] gets
        # just the dirs.
        dirs = os.walk(self._dir).next()[1]
        # sort here so they're in order for the filtering that happens below.
        dirs.sort()

        # pull out sections that are named with number-dot at the start
        # section_dirs = [s.split('.', 1)[1] for s in dirs if re.match(r'\d+\.', s)]
        section_dirs = [s for s in dirs if re.match(r'\d+\.', s)]

        # now add the dir names that *don't* start with number-dot
        section_dirs.extend( [s for s in dirs if not re.match(r'\d+\.', s)] )
        sections = []
        for section_dir in section_dirs:
            sname = re.sub(r'^\d+\.', '', section_dir)
            section = SectionData(os.path.join(self._dir, section_dir), self)
            sections.append(section)

        self._sections = sections


    def __iter__(self):
        yield self
        for sect in self._sections:
            for subsect in sect:
               yield subsect

#    def fetchSections(self, dir, parent_section=None):
#        # (recursively) get sections.
#
#        # grab a list of dirs
#        # Python doesn't love you at all, so it lacks a function to
#        # get dirs.  So this starts a 'walk', which is a generator
#        # that returns directory listings for a dir tree.  The first
#        # item returned (fetched by .next()) is the current dir, and
#        # the content is (path, dirlist, filelist) so the [1] gets
#        # just the dirs.
#        dirs = os.walk(dir).next()[1]
#        # sort here so they're in order for the filtering that happens below.
#        dirs.sort()
#
#        # pull out sections that are named with number-dot at the start
#        # section_dirs = [s.split('.', 1)[1] for s in dirs if re.match(r'\d+\.', s)]
#        section_dirs = [s for s in dirs if re.match(r'\d+\.', s)]
#
#        # now add the dir names that *don't* start with number-dot
#        section_dirs.extend( [s for s in dirs if not re.match(r'\d+\.', s)] )
#
#        sections = []
#        for section_dir in section_dirs:
#            sname = re.sub(r'^\d+\.', '', section_dir)
#            section = {}
#            try:
#                with open(os.path.join(dir, section_dir, 'meta.json')) as metadata:
#                    section = json.load(metadata)
#                    if parent_section is not None:
#                        section['id'] = parent_section['id'] + '.' + section['id']
#                    section['contentpath'] = os.path.join(dir, section_dir, 'content.md')
#                    section['sections'] = self.fetchSections(os.path.join(dir, section_dir), section)
#                    sections.append(section)
#            except IOError:
#                # yep that's fine, no metadata.
#                pass
#
#        print("sections:")
#        print(sections)
#
#        return sections
#
#
#    def sections(self):
#        return self._sections
