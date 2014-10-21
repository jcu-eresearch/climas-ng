from sqlalchemy import *

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.declarative import DeferredReflection

from sqlalchemy.orm import (
    scoped_session,
    sessionmaker,
    mapper,
    )

from zope.sqlalchemy import ZopeTransactionExtension

DBSession = scoped_session(sessionmaker(extension=ZopeTransactionExtension()))
Base = declarative_base(cls=DeferredReflection)

# -------------------------------------------------------------------
class Species(Base):
    # CREATE TABLE "species" (
    #     "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    #     "class" VARCHAR(32),
    #     "family" VARCHAR(32),
    #     "scientific_name" VARCHAR(128),
    #     "common_name" VARCHAR(64)
    # );
    __tablename__ = 'species'
    klass = Column('class')

# -------------------------------------------------------------------
class PresenceList(Base):
    # CREATE TABLE "presences" (
    #     "species_id" INTEGER NOT NULL,
    #     "region_id" INTEGER NOT NULL,
    #     "year" INTEGER NOT NULL,
    #     "current" VARCHAR(7),
    #     "RCP45_10th" VARCHAR(4),
    #     "RCP45_50th" VARCHAR(4),
    #     "RCP45_90th" VARCHAR(4),
    #     "RCP85_10th" VARCHAR(4),
    #     "RCP85_50th" VARCHAR(4),
    #     "RCP85_90th" VARCHAR(4),
    #     PRIMARY KEY("species_id", "region_id", "year")
    __tablename__ = 'presences'

# -------------------------------------------------------------------
class RegionType(Base):
    # CREATE TABLE "region_types" (
    #     "regiontype" VARCHAR(16) NOT NULL,
    #     "regiontypename_singular" VARCHAR(32),
    #     "regiontypename_plural" VARCHAR(32),
    #     "regiontypeurl" VARCHAR(255),
    #     PRIMARY KEY("regiontype")
    # );
    __tablename__ = 'region_types'

# -------------------------------------------------------------------
class Region(Base):
    # CREATE TABLE "regions" (
    #     "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    #     "type_local_code" VARCHAR(16),
    #     "shapefile_id" INTEGER,
    #     "name" VARCHAR(64),
    #     "long_name" VARCHAR(64),
    #     "state" VARCHAR(16),
    #     "governing_body" VARCHAR(128),
    #     "reportable" BOOLEAN,
    #     "includes_significant_sea" BOOLEAN,
    #     "region_type_regiontype" VARCHAR(16) NOT NULL
    # );
    __tablename__ = 'regions'


