
### Regional Biodiversity Implications

{{rg_name}} currently hosts {{baseline_b_all_count}} species.

[[  hi_{{rpt_year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_10th >= baseline_b_all_count ]]
Models agree that regional biodiversity will increase, by between {{ hi_{{rpt_year}}_b_all_count_10th - baseline_b_all_count, absolute }} and {{ hi_{{rpt_year}}_b_all_count_90th - baseline_b_all_count, absolute }} species.

[[  hi_{{rpt_year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_50th > baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_90th - hi_{{rpt_year}}_b_all_count_50th < hi_{{rpt_year}}_b_all_count_50th - baseline_b_all_count
]]
Most models predict an increase in species count, by as much as {{ hi_{{rpt_year}}_b_all_count_90th - baseline_b_all_count, absolute }}, however some models predict a decrease of as much as {{ hi_{{rpt_year}}_b_all_count_10th - baseline_b_all_count, absolute }} species.

[[  hi_{{rpt_year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_90th - hi_{{rpt_year}}_b_all_count_50th >= hi_{{rpt_year}}_b_all_count_50th - baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_50th - hi_{{rpt_year}}_b_all_count_10th >= baseline_b_all_count - hi_{{rpt_year}}_b_all_count_50th
]]
There is little agreement between models on whether regional species count will increase or decrease. Projections range from a decrease of up to {{ hi_{{rpt_year}}_b_all_count_10th - baseline_b_all_count, absolute }} species to an increase of as much as {{ hi_{{rpt_year}}_b_all_count_90th - baseline_b_all_count, absolute }} species.

[[  hi_{{rpt_year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_50th < baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_50th - hi_{{rpt_year}}_b_all_count_10th < baseline_b_all_count - hi_{{rpt_year}}_b_all_count_50th
]]
Most models predict a decrease in species count, by as much as {{ hi_{{rpt_year}}_b_all_count_10th - baseline_b_all_count, absolute }}, however some predict an increase of as much as {{ hi_{{rpt_year}}_b_all_count_90th - baseline_b_all_count, absolute }} species.

[[  hi_{{rpt_year}}_b_all_count_90th <= baseline_b_all_count
AND hi_{{rpt_year}}_b_all_count_10th < baseline_b_all_count ]]
Almost all models agree on a decrease in the number of species, by between {{ hi_{{rpt_year}}_b_all_count_90th - baseline_b_all_count, absolute }} and {{ hi_{{rpt_year}}_b_all_count_10th - baseline_b_all_count, absolute }}.

[[always]]

Overall species count is not the full story for biodiversity in {{rg_name}}.  Even a relatively stable species count may be the result of significant gains and losses, and represent a different species composition than that which currently exists.

[[ hi_{{rpt_year}}_b_all_loss_10th > 0 ]]
Models agree that by {{rpt_year}}, between {{hi_{{rpt_year}}_b_all_loss_10th}} and {{hi_{{rpt_year}}_b_all_loss_90th}} of these species will be lost to the region, with a median expected loss of {{hi_{{rpt_year}}_b_all_loss_50th}} species.

[[  hi_{{rpt_year}}_b_all_loss_10th == 0
and hi_{{rpt_year}}_b_all_loss_50th > 0 ]]
Most models project a loss of some species by {{rpt_year}}, with a median of {{hi_{{rpt_year}}_b_all_loss_50th}} lost species and some models predicting losses of up to {{hi_{{rpt_year}}_b_all_loss_90th}} species.

[[ hi_{{rpt_year}}_b_all_loss_50th == 0 and hi_{{rpt_year}}_b_all_loss_90th < 0 ]]
Some models project losses of up to {{hi_{{rpt_year}}_b_all_loss_90th}} species, however most models agree that by {{rpt_year}} no species will be lost.

[[ hi_{{rpt_year}}_b_all_loss_90th == 0 ]]
Models agree that by {{rpt_year}} no species will be lost.


[[always]]

In addition to the loss of currently present species, climate changes in {{rg_name}} may result in the arrival of species previously not found in the region.

[[ hi_{{rpt_year}}_b_all_gain_10th > 0 ]]
Models agree that by {{rpt_year}}, between {{hi_{{rpt_year}}_b_all_gain_10th}} and {{hi_{{rpt_year}}_b_all_gain_90th}} additional species will live in the region, with a median expected gain of {{hi_{{rpt_year}}_b_all_gain_50th}} species.

[[  hi_{{rpt_year}}_b_all_gain_10th == 0
and hi_{{rpt_year}}_b_all_gain_50th > 0 ]]
Most models project some species arriving in {{rg_name}} by {{rpt_year}}, with a median of {{hi_{{rpt_year}}_b_all_gain_50th}} new species and some models predicting up to {{hi_{{rpt_year}}_b_all_gain_90th}} new species.

[[ hi_{{rpt_year}}_b_all_gain_50th == 0 and hi_{{rpt_year}}_b_all_gain_90th < 0 ]]
Some models project gains of up to {{hi_{{rpt_year}}_b_all_gain_90th}} species, however most models agree that by {{rpt_year}} no new species will arrive.

[[ hi_{{rpt_year}}_b_all_gain_90th == 0 ]]
However, models agree that by {{rpt_year}} no new species will enter the region.


[[always]]


(old stuff below)

[[  hi_{{rpt_year}}_b_all_gain_50th == 0
and hi_{{rpt_year}}_b_all_loss_50th == 0
]]

{{rg_name}} currently hosts {{baseline_b_all_count}} species. Median projections estimate that in {{rpt_year}} the region will remain suitable for all of those species.
[[  hi_{{rpt_year}}_b_all_gain_50th == 0
and hi_{{rpt_year}}_b_all_loss_50th == 0
and hi_{{rpt_year}}_b_all_count_10th >5%< hi_{{rpt_year}}_b_all_count_90th]]  GCMs do not all agree, and projections for species count varies from {{hi_{{rpt_year}}_b_all_count_10th}} to {{hi_{{rpt_year}}_b_all_count_90th}}.[[always]]

[[ hi_{{rpt_year}}_b_all_gain_50th == hi_{{rpt_year}}_b_all_loss_50th ]]
{{rg_name}} currently has climate suitable for {{baseline_b_all_count}}
species. By  {{rpt_year}}, the total number of species is projected to stay the same, however a change in climate suitability suggests a change in species composition.  The climate is projected to become
unsuitable for $$hi_{{rpt_year}}_b_all_loss_50th species and suitable for $$high_total_added {{rpt_year}} species.

[[  hi_{{rpt_year}}_b_all_gain_50th > 0
and hi_{{rpt_year}}_b_all_loss_50th == 0
]]
{{rg_name}} currently has climate suitable for {{baseline_b_all_count}}
species. By  {{rpt_year}} this number is projected to increase by $$high_delta_up_{{rpt_year}} species to $$high_total_total_{{rpt_year}}.
The climate is likely to remain suitable for species currently
found in the region.

[[     hi_{{rpt_year}}_b_all_gain_50th > hi_{{rpt_year}}_b_all_loss_50th
    and hi_{{rpt_year}}_b_all_loss_50th > 0
]]
{{rg_name}} currently has climate suitable for {{baseline_b_all_count}}
species. By  {{rpt_year}} this number is projected to increase to $$high_total_total_{{rpt_year}} species.
While there is an overall increase in biodiversity, the region is
likely to lose suitable climate space for of some species currently found in the region.  The climate is projected to become unsuitable for $$hi_{{rpt_year}}_b_all_loss_50th species and suitable for $$hi_{{rpt_year}}_b_all_gain_50th species species from outside the region.

[[      hi_{{rpt_year}}_b_all_gain_50th == 0
    and hi_{{rpt_year}}_b_all_loss_50th  > 0
]]
{{rg_name}} currently has climate suitable for $$high_total_current
species. By  {{rpt_year}} this number is projected to decrease by $$high_delta_down_{{rpt_year}} to $$high_total_total_{{rpt_year}}.

[[    hi_{{rpt_year}}_b_all_loss_50th > hi_{{rpt_year}}_b_all_gain_50th
    and hi_{{rpt_year}}_b_all_gain_50th > 0
]]
{{rg_name}} currently has climate suitable for {{baseline_b_all_count}}
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

Table: Current and Future Species Counts in {{rg_name}} in {{rpt_year}} for Low and High Emission Scenarios

| Class | Current | \parbox[b]{3.5cm}{\centering Low Emissions Scenario \\ in {{rpt_year}} \\ count (+gained -lost)} | \parbox[b]{3.5cm}{\centering High Emissions Scenario \\ in {{rpt_year}} \\ count (+gained -lost)} |
|:----- |:-------:|:-------------------------:|:--------------------------:|
| Mammals | {{baseline_b_mammal_count}} | {{lo_{{rpt_year}}_b_mammal_count_50th}} (+{{lo_{{rpt_year}}_b_mammal_gain_50th}} -{{lo_{{rpt_year}}_b_mammal_loss_50th}}) | {{hi_{{rpt_year}}_b_mammal_count_50th}} (+{{hi_{{rpt_year}}_b_mammal_gain_50th}} -{{hi_{{rpt_year}}_b_mammal_loss_50th}}) |
| Birds | {{baseline_b_bird_count}} | {{lo_{{rpt_year}}_b_bird_count_50th}} (+{{lo_{{rpt_year}}_b_bird_gain_50th}} -{{lo_{{rpt_year}}_b_bird_loss_50th}}) | {{hi_{{rpt_year}}_b_bird_count_50th}} (+{{hi_{{rpt_year}}_b_bird_gain_50th}} -{{hi_{{rpt_year}}_b_bird_loss_50th}}) |
| Reptiles | {{baseline_b_reptile_count}} | {{lo_{{rpt_year}}_b_reptile_count_50th}} (+{{lo_{{rpt_year}}_b_reptile_gain_50th}} -{{lo_{{rpt_year}}_b_reptile_loss_50th}}) | {{hi_{{rpt_year}}_b_reptile_count_50th}} (+{{hi_{{rpt_year}}_b_reptile_gain_50th}} -{{hi_{{rpt_year}}_b_reptile_loss_50th}}) |
| Amphibians | {{baseline_b_amphibian_count}} | {{lo_{{rpt_year}}_b_amphibian_count_50th}} (+{{lo_{{rpt_year}}_b_amphibian_gain_50th}} -{{lo_{{rpt_year}}_b_amphibian_loss_50th}}) | {{hi_{{rpt_year}}_b_amphibian_count_50th}} (+{{hi_{{rpt_year}}_b_amphibian_gain_50th}} -{{hi_{{rpt_year}}_b_amphibian_loss_50th}}) |

