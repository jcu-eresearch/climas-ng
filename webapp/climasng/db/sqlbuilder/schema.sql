PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE "region_types" (
    "regiontype" VARCHAR(16) NOT NULL,
    "regiontypename_singular" VARCHAR(32),
    "regiontypename_plural" VARCHAR(32),
    "regiontypeurl" VARCHAR(255),

    PRIMARY KEY("regiontype")
);

INSERT INTO "region_types" VALUES(
    'NRM',
    'NRM region',
    'NRM regions',
    'http://www.nrm.gov.au/about/nrm/regions/'
);
INSERT INTO "region_types" VALUES(
    'State',
    'Australian state or territory',
    'Australian states and territories',
    'http://australia.gov.au/'
);
INSERT INTO "region_types" VALUES(
    'IBRA',
    'IBRA bioregion',
    'IBRA bioregions',
    'http://www.environment.gov.au/parks/nrs/science/bioregion-framework/ibra/'
);
-- INSERT INTO "region_types" VALUES(
--     'subWA',
--     'Rangelands NRM subregion',
--     'Rangelands NRM subregions',
--     ''
-- );
-- INSERT INTO "region_types" VALUES(
--     'subNT',
--     'Territory NRM subregion',
--     'Territory NRM subregions',
--     ''
-- );

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE "regions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type_local_code" VARCHAR(16),
    "shapefile_id" INTEGER,
    "name" VARCHAR(64),
    "long_name" VARCHAR(64),
    "state" VARCHAR(16),
    "governing_body" VARCHAR(128),
    "reportable" BOOLEAN,
    "includes_significant_sea" BOOLEAN,
    "region_type_regiontype" VARCHAR(16) NOT NULL
);

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE "species" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "taxon" VARCHAR(32),
    "subtaxon" VARCHAR(32),
    "scientific_name" VARCHAR(128),
    "common_name" VARCHAR(64)
);

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE TABLE "presences" (

    "species_id" INTEGER NOT NULL,
    "region_id" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,

    "current" VARCHAR(7),
    "RCP45_10th" VARCHAR(4),
    "RCP45_50th" VARCHAR(4),
    "RCP45_90th" VARCHAR(4),
    "RCP85_10th" VARCHAR(4),
    "RCP85_50th" VARCHAR(4),
    "RCP85_90th" VARCHAR(4),

    PRIMARY KEY("species_id", "region_id", "year")
);

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

CREATE INDEX "index_presence_region" ON "presences" ("region_id");
CREATE INDEX "index_presence_species" ON "presences" ("species_id");

CREATE INDEX "index_regions_region_type" ON "regions" ("region_type_regiontype");
CREATE INDEX "index_regions_shapefile_id" ON "regions" ("shapefile_id");

CREATE UNIQUE INDEX "index_species_scientific_name" on "species" ("scientific_name");
CREATE INDEX "index_species_taxon" on "species" ("taxon");

-- ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

COMMIT;
