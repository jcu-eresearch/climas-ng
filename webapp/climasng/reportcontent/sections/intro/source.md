
<span>Climate Change</span> and <span>Biodiversity Report</span>
================================================================
for
===
{{ rg_name }}
==================

<p class="frontpagecredits">
Prepared by the James Cook University eResearch Centre and Centre for Tropical Biodiversity and Climate Change using species occurence data from the Atlas of Living Australia (ALA) and climate layers derived from http://climascope.tyndall.ac.uk prepared by Jeremy VanDerWal.
</p>

# Introduction

Patterns of biodiversity are already shifting as a result of the
changing climate.  However, there is very little information available regarding how climate might change at a regional level, let alone how this change might impact regional species distributions in the future.  This lack of relevant regional infomation makes the task of future planning extremely difficult for regional biodiversity managers.

## Regional Future Climate and Species Distribution

** adapt to comment on included sections only

This report uses future Global Circulation Models
(GCMs) to project the impact of both low and high emissions scenarios
on biodiversity in the future.  It shows how annual mean temperature
and rainfall change decadally to 2085 and the resulting regional
spatial pattern of change in 2085[[rpt_year == 2085]].[[rpt_year < 2085]],
but focuses on the projected climate and biodiversity situation in
 {{rpt_year}}.
[[always]]

Biodiversity changes, including climate space losses and gains, is summarised, and detailed lists of all species lost, gained, or kept are reported.

## Projection of Future Climate

Climate data was sourced from the Australian Water Availability Project (AWAP) to calculate important climate variables such as current annual mean temperature, temperature seasonality, and annual precipitation. We calculated likely future climate for each climate variable considered important to vertebrate distributions using all 18 global climate models (GCMs) for a high and low RCP scenario (RCP4.5, RCP8.5) at 8 time steps between 2015 and 2085.

In this report, we consider RCP8.5 to represent 'business as usual', and RCP4.5 to represent a low, potentially achievable emissions target.  All explanations focus on the high scenario as it represents the best projection of our current trajectory.


### Temperature

All of Australia is projected to experience warming in the future.  The mean annual temperature for {{ rg_name }} is {{ baseline_t_mean, round 0.1 }}&deg;C.

[[ hi_{{rpt_year}}_t_mean_50th > baseline_t_mean ]]
By {{rpt_year}}, temperature is projected to increase to {{ hi_{{rpt_year}}_10th_t_mean, round 0.1 }} &ndash; {{ hi_{{rpt_year}}_90th_t_mean, round 0.1 }}&deg;C.
[[ hi_{{rpt_year}}_t_mean_50th < baseline_t_mean ]]
By {{rpt_year}}, temperature is projected to decrease to {{ hi_{{rpt_year}}_10th_t_mean, round 0.1 }} &ndash; {{ hi_{{rpt_year}}_90th_t_mean, round 0.1 }}&deg;C.
[[ rpt_year != 2085 ]]
By 2085 mean temperatures in the region are likely to be {{ hi_2085_10th_t_mean, round 0.1 }} &ndash; {{ hi_2085_90th_t_mean, round 0.1 }}&deg;C.


----
[[hi_{{rpt_year}}_t_mean_50th > baseline_t_mean]]
increase by 
{{hi_{{rpt_year}}_t_mean_50th - baseline_t_mean}} 
&deg;C to
{{hi_{{rpt_year}}_t_mean_50th}}
&deg;C.

[[hi_{{rpt_year}}_t_mean_50th < baseline_t_mean]]
decrease by 
{{hi_{{rpt_year}}_50th_t_}}
&deg;C to 
$$hi_{{rpt_year}}_t_mean_50th
&deg;C, however 
$$t_high_2085_fiftieth_d_down
&deg;C of warming is projected by 2085.





[[always]]

Figure 1 tracks increase of mean annual temperature in $$rg_short_name between 2015 and 2085.

![Figure 1: Average Projected Temperature]($$rg_url/absolute.climate.temperature.png)

Figure 2 shows the projected [[hi_{{rpt_year}}_t_mean_50th > baseline_t_mean]]  increase  [[hi_{{rpt_year}}_t_mean_50th < baseline_t_mean]]  change [[always]] in annual average temperature across $$rg_short_name, in low and high emission scenarios.  The images of the 10th, 50th and 90th percentiles visualise the variation between the 18 different GCMs.  The 10th percentile depicts the lower end of warming projected, at only [[hi_{{rpt_year}}_t_mean_50th > baseline_t_mean]] $$t_high_{{rpt_year}}_tenth_mean&deg;C ($$t_high_{{rpt_year}}_tenth_d_up&deg;C increase), and the 90th percentile represents the high end of waming projected at $$t_high_{{rpt_year}}_ninetieth_mean&deg;C ($$t_high_{{rpt_year}}_ninetieth_d_up&deg;C increase) [[hi_{{rpt_year}}_t_mean_50th < baseline_t_mean]] $$t_high_{{rpt_year}}_tenth_mean&deg;C ($$t_high_{{rpt_year}}_tenth_d_down&deg;C decrease), and the 90th percentile represents the high end of waming projected at $$t_high_{{rpt_year}}_ninetieth_mean&deg;C ($$t_high_{{rpt_year}}_ninetieth_d_up&deg;C increase) [[always]] both for the high scenario.

![Figure 2: Projected Temperature Change]($$rg_url/delta.temperature.png)

[[rpt_year < 2085]]Note that this figure shows projections for 2085.[[always]]

###Rainfall

Currently, the mean annual rainfall for $$rg_short_name is $$baseline_p_mean mL, experiencing a range of averages between $$rainfall_current_min mL and $$rainfall_current_max mL.  [[always]]

Future rainfall projections are much more variable.  By  {{rpt_year}}, rainfall is projected to [[hi_{{rpt_year}}_p_mean_50th > baseline_p_mean]]  increase by $$rainfall_high_{{rpt_year}}_fiftieth_d_up mL to $$hi_{{rpt_year}}_p_mean_50th mL. [[hi_{{rpt_year}}_p_mean_50th < baseline_p_mean]]  decrease by $$rainfall_high_{{rpt_year}}_fiftieth_d_down mL to $$hi_{{rpt_year}}_p_mean_50th mL.
[[always]]

Figure 3 tracks increase of rainfall in $$rg_short_name between 2015 and 2085.

[[hi_{{rpt_year}}_p_mean_50th < baseline_p_mean
    and hi_{{rpt_year}}_p_mean_90th < baseline_p_mean]]

All models predict a decrease in rainfall, by between $$rainfall_high_{{rpt_year}}_tenth_d_down mL and $$rainfall_high_{{rpt_year}}_ninetieth_d_down mL.

[[hi_{{rpt_year}}_p_mean_50th < baseline_p_mean
    and hi_{{rpt_year}}_p_mean_90th > baseline_p_mean]]

Most models predict a decrease in rainfall, by as much as $$rainfall_high_{{rpt_year}}_tenth_d_down mL, however some predict an increase of as much as $$rainfall_high_{{rpt_year}}_ninetieth_d_up mL.

[[hi_{{rpt_year}}_p_mean_50th > baseline_p_mean
    and hi_{{rpt_year}}_p_mean_10th > baseline_p_mean]]

All models predict an increase in rainfall, by between $$rainfall_high_{{rpt_year}}_tenth_d_up mL and $$rainfall_high_{{rpt_year}}_ninetieth_d_up mL.

[[hi_{{rpt_year}}_p_mean_50th > baseline_p_mean
    and hi_{{rpt_year}}_p_mean_10th < baseline_p_mean]]

Most models predict an increase in rainfall, by as much as $$rainfall_high_{{rpt_year}}_ninetieth_d_up, however some predict a decrease of as much as $$rainfall_high_{{rpt_year}}_tenth_d_down.

[[always]]

![Figure 3: Average Projected rainfall]($$rg_url/absolute.climate.rainfall.png)

Figure 4 shows the projected [[hi_{{rpt_year}}_p_mean_50th > baseline_p_mean]]  increase [[hi_{{rpt_year}}_p_mean_50th < baseline_p_mean]]  change [[always]] in annual average rainfall across $$rg_short_name, in low and high emission scenarios.

![Figure 4: Projected rainfall Change]($$rg_url/delta.rainfall.png)
[[rpt_year < 2085]]Note that this figure shows projections for 2085.[[always]]

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

