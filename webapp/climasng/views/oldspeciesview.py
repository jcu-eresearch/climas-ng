import os

from pyramid.response import Response
from pyramid.view import view_config
import pyramid.httpexceptions as httpexceptions

from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_

# from climasng.models import DBSession, Species
from climasng.models import *

# -------------------------------------------------------------------

class OldSpeciesView(object):

    def __init__(self, request):
        self.request = request

    @view_config(route_name='oldspecies', renderer='../templates/oldspecies.html.pt')
    def __call__(self):

        regionid = self.request.matchdict['region']
        year = self.request.matchdict['year']

        try:
            region = DBSession.query(Region)
            region = region.filter(Region.id == regionid)
            region = region.first()

            region_presences = DBSession.query(Region, PresenceList, Species)\
                .filter(Region.id == PresenceList.region_id)\
                .filter(Region.id == regionid)\
                .filter(Species.id == PresenceList.species_id)\
                .filter(or_(
                        PresenceList.occurrences > 0,
                        getattr(PresenceList, 'presence' + year + 'low') != '',
                        getattr(PresenceList, 'presence' + year + 'high') != ''
                )).all()

        except DBAPIError:
            return Response(conn_err_msg, content_type='text/plain', status_int=500)

        return {
            'presences': region_presences,
            'region': region,
            'year': year
        }

# -------------------------------------------------------------------

