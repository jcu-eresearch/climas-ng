
## Projection of Future Species Distribution

Bird, mammal, amphibian and reptile observation records were retrieved from the Atlas of Living Australia database to generate current and future species distribution models. These are built for each of 4 Representative Concentration Pathways (RCPs, analogous to greenhouse gas emission scenarios) using the mid-point of 18 global climate models (GCMs) at decadal time steps between 2015 and 2085.

Vertebrate observation records retrieved from the Atlas of Living Australia's (ALA) database have been filtered to exclude records with obvious issues. BirdLife Australia provided detailed species range information that allowed us to model only bird observation records that fall within core habitat.  Expert researchers from James Cook University vetted the data for mammals, amphibians and reptiles.

Only species with >10 unique location records are modeled.

Climate suitability maps for a species represent what scientists call a Species Distribution Model. These models shows the relationship between where species have currently been observed and the climate at that location. Once the relationship between climate and observations is known, it can be projected into the future using GCMs.

All climate suitability maps for a chosen taxon are converted to binary (sutable/unsuitable) and summed to create species richness maps.

Importantly, all potentially suitable climate space is shown, even if the species has not been observed there, or could not realistically move there in the future.  We show this because species can be relocated, intentionally (ie. for their preservation) or unintentionally (where they may become pests).

Models for each species can be found at [http://tropicaldatahub.org/goto/climas/suitability](http://tropicaldatahub.org/goto/climas/suitability).

Richness maps for birds, mammals, amphibians and reptiles, and all their sub families or genera can be found at [http://tropicaldatahub.org/goto/climas/biodiversity](http://tropicaldatahub.org/goto/climas/biodiversity).

### Regional Biodiversity Implications

[[  hi_{{rpt_year}}_b_all_gain_50th == 0
and hi_{{rpt_year}}_b_all_loss_50th == 0
]]

$$rg_long_name currently has climate suitable for $$high_total_total_current species. The climate in  {{rpt_year}} is projected to remain suitable for all species.

[[ hi_{{rpt_year}}_b_all_gain_50th == hi_{{rpt_year}}_b_all_loss_50th ]]
$$rg_long_name currently has climate suitable for $$high_total_total_current
species. By  {{rpt_year}}, the total number of species is projected to stay the same, however a change in climate suitability suggests a change in species composition.  The climate is projected to become
unsuitable for $$hi_{{rpt_year}}_b_all_loss_50th species and suitable for $$high_total_added {{rpt_year}} species.

[[  hi_{{rpt_year}}_b_all_gain_50th > 0
and hi_{{rpt_year}}_b_all_loss_50th == 0
]]
$$rg_long_name currently has climate suitable for $$high_total_total_current
species. By  {{rpt_year}} this number is projected to increase by $$high_delta_up_{{rpt_year}} species to $$high_total_total_{{rpt_year}}.
The climate is likely to remain suitable for species currently
found in the region.

[[     hi_{{rpt_year}}_b_all_gain_50th > hi_{{rpt_year}}_b_all_loss_50th
    and hi_{{rpt_year}}_b_all_loss_50th > 0
]]



$$rg_long_name currently has climate suitable for $$high_total_total_current
species. By  {{rpt_year}} this number is projected to increase to $$high_total_total_{{rpt_year}} species.
While there is an overall increase in biodiversity, the region is
likely to lose suitable climate space for of some species currently found in the region.  The climate is projected to become unsuitable for $$hi_{{rpt_year}}_b_all_loss_50th species and suitable for $$hi_{{rpt_year}}_b_all_gain_50th species species from outside the region.

[[      hi_{{rpt_year}}_b_all_gain_50th == 0
    and hi_{{rpt_year}}_b_all_loss_50th  > 0
]]


$$rg_long_name currently has climate suitable for $$high_total_current
species. By  {{rpt_year}} this number is projected to decrease by $$high_delta_down_{{rpt_year}} to $$high_total_total_{{rpt_year}}.

[[    hi_{{rpt_year}}_b_all_loss_50th > hi_{{rpt_year}}_b_all_gain_50th
    and hi_{{rpt_year}}_b_all_gain_50th > 0
]]



$$rg_long_name currently has climate suitable for $$high_total_total_current
species. By  {{rpt_year}} this number is projected to decrease to $$high_total_total_{{rpt_year}} species. While there is an overall decrease in biodiversity, the climate space of the region is likely to become suitable for some species currently not found in the region.  The climate is projected to become unsuitable for $$hi_{{rpt_year}}_b_all_loss_50th species and suitable for $$hi_{{rpt_year}}_b_all_gain_50th species from outside the region.

[[ hi_{{rpt_year}}_b_all_gain_50th > 0 ]]
Note that independent movement of species
into new climate space is limited by the capacity of a species to
disperse.  In light of possible species gains, it is important to
consider that even Australian natives may behave like invasive pests
when invading new space.  Species movement capacity and interaction
with other species is not modelled here.

[[ always ]]
### Tabular Biodiversity Summary

<table>
    <tr>
        <th rowspan="3">Class</th>
        <th rowspan="3">Observed<br>species<br>count</th>
        <th colspan="3">
            Count of species with projected suitable climate
            <br>in $$rg_long_name
        </th>
    </tr><tr>
        <th rowspan="2">Current<br>climate</th>
        <th colspan="2">
            Climate in  {{rpt_year}}
        </th>
    </tr><tr>
        <th>
            Low emission scenario
            <br>count
            (<span class="gained">+gained</span>
            <span class="lost">-lost</span>)
        </th>
        <th>
            High emission scenario
            <br>count
            (<span class="gained">+gained</span>
            <span class="lost">-lost</span>)
        </th>
    </tr><tr>
        <td>Mammals</td>
        <td>
            $$occur_mammals_current
        </td><td>
            $$low_mammals_total_current
        </td><td>
            $$low_mammals_total_{{rpt_year}}
            (<span class="gained">+$$low_mammals_added_{{rpt_year}}</span>
            <span class="lost">-$$low_mammals_lost_{{rpt_year}}</span>)
        </td><td>
            $$high_mammals_total_{{rpt_year}}
            (<span class="gained">+$$high_mammals_added_{{rpt_year}}</span>
            <span class="lost">-$$high_mammals_lost_{{rpt_year}}</span>)
        </td>
    </tr><tr>
        <td>Birds</td>
        <td>
            $$occur_birds_current
        </td><td>
            $$low_birds_total_current
        </td><td>
            $$low_birds_total_{{rpt_year}}
            (<span class="gained">+$$low_birds_added_{{rpt_year}}</span>
            <span class="lost">-$$low_birds_lost_{{rpt_year}}</span>)
        </td>
        <td>
            $$high_birds_total_{{rpt_year}}
            (<span class="gained">+$$high_birds_added_{{rpt_year}}</span>
            <span class="lost">-$$high_birds_lost_{{rpt_year}}</span>)
        </td>
    </tr><tr>
        <td>Amphibians</td>
        <td>
            $$occur_amphibians_current
        </td><td>
            $$low_amphibians_total_current
        </td><td>
            $$low_amphibians_total_{{rpt_year}}
            (<span class="gained">+$$low_amphibians_added_{{rpt_year}}</span>
            <span class="lost">-$$low_amphibians_lost_{{rpt_year}}</span>)
        </td>
        <td>
            $$high_amphibians_total_{{rpt_year}}
            (<span class="gained">+$$high_amphibians_added_{{rpt_year}}</span>
            <span class="lost">-$$high_amphibians_lost_{{rpt_year}}</span>)
        </td>
    </tr><tr>
        <td>Reptiles</td>
        <td>
            $$occur_reptiles_current
        </td><td>
            $$low_reptiles_total_current
        </td><td>
            $$low_reptiles_total_{{rpt_year}}
            (<span class="gained">+$$low_reptiles_added_{{rpt_year}}</span>
            <span class="lost">-$$low_reptiles_lost_{{rpt_year}}</span>)
        </td>
        <td>
            $$high_reptiles_total_{{rpt_year}}
            (<span class="gained">+$$high_reptiles_added_{{rpt_year}}</span>
            <span class="lost">-$$high_reptiles_lost_{{rpt_year}}</span>)
        </td>
    </tr><tr class="totals">
        <td>Totals</td>
        <td>
            $$occur_total_current
        </td><td>
            $$low_total_total_current
        </td><td>
            $$low_total_total_{{rpt_year}}
            (<span class="gained">+$$low_total_added_{{rpt_year}}</span>
            <span class="lost">-$$low_total_lost_{{rpt_year}}</span>)
        </td>
        <td>
            $$high_total_total_{{rpt_year}}
            (<span class="gained">+$$hi_{{rpt_year}}_b_all_gain_50th</span>
            <span class="lost">-$$hi_{{rpt_year}}_b_all_loss_50th</span>)
        </td>
    </tr>
</table>

