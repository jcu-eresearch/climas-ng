
from pyramid.config import Configurator
from pyramid.httpexceptions import HTTPNotFound

from sqlalchemy import engine_from_config

import sqlite3

# import pprint

from .models import (
    DBSession,
    Base,
    )

def notfound(request):
    # set the 404 page up here
    return HTTPNotFound()

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)
    Base.metadata.bind = engine
    config = Configurator(settings=settings)
    config.include('pyramid_chameleon')

    # now get all the table reflection done
    Base.prepare(engine)

    config.add_static_view('static', 'climasng:static/', cache_max_age=3600)

    config.add_route('test', '/test/')

    config.add_route('home', '/')
    config.add_route('science', '/science/')
    config.add_route('credits', '/credits/')

    config.add_route('maps', '/maps/')

    config.add_route('reports', '/reports/')
    config.add_route('regionreport', '/regionreport/')

    config.add_route('data', '/data/{data_name}/')
    config.add_route('doc', '/info/{doc_name}/')

    config.add_route('oldreports', '/oldreports/')


    config.add_route('oldmap', '/oldmap/')
    config.add_route('oldspecies', '/oldspecies/{region}/{year}/speciestables.html')
    config.add_route('reflector', '/reflector/')

    config.add_route('speciesdata', '/speciesdata/{data_name:.*}')

    config.add_route('regiondata', '/regiondata/{regiontype}/{regionid}')

    config.add_static_view(name='olddata/regions', path=settings['climas.old_report_data_path'])

    # add a 404 view that will retry with an appended slash first
    config.add_notfound_view(notfound, append_slash=True)

    config.scan()

    return config.make_wsgi_app()



