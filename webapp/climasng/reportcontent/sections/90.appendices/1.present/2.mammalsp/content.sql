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
    AND species.taxon = 'mammals'

    -- don't include species that aren't there and never will be
    AND NOT (
        presences.current = 'absent'
        AND presences.RCP45_50th = ''
        AND presences.RCP85_50th = ''
    )

order by
    species.scientific_name