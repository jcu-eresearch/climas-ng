select
    species.scientific_name as speciesname,
    presences.current as current,
    presences.RCP45_50th as low50th,
    presences.RCP85_50th as high50th

from
    species, presences, regions

where
    -- joins
    species.id = presences.species_id
    AND regions.id = presences.region_id

    -- the selected year and region
    AND presences.year = :year
    AND regions.name = :regionname
    AND regions.region_type_regiontype = :regiontype

    -- the selected taxon
    AND species.taxon = 'amphibians'

    -- only include species that are gained
    AND (
        presences.RCP45_50th = 'gain'
        OR presences.RCP85_50th = 'gain'
    )

order by
    species.scientific_name