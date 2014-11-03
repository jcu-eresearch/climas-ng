
### Regional Biodiversity Implications

{{rg_name}} currently hosts {{baseline_b_all_count}} species.  [[ hi_{{year}}_b_all_gain_50th > baseline_b_all_count / 5 OR hi_{{year}}_b_all_loss_50th > baseline_b_all_count / 5]]By {{year}} biodiversity in this region is projected to undergo significant change.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th >= baseline_b_all_count ]]
Models agree that regional biodiversity will increase, by between {{ hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute }} and {{ hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute }} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th > baseline_b_all_count
AND hi_{{year}}_b_all_count_90th - hi_{{year}}_b_all_count_50th < hi_{{year}}_b_all_count_50th - baseline_b_all_count
]]
Most models predict an increase in species count, by as much as {{ hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute }}, however some models predict a decrease of as much as {{ hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute }} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_90th - hi_{{year}}_b_all_count_50th >= hi_{{year}}_b_all_count_50th - baseline_b_all_count
AND hi_{{year}}_b_all_count_50th - hi_{{year}}_b_all_count_10th >= baseline_b_all_count - hi_{{year}}_b_all_count_50th
]]
There is little agreement between models on whether regional species count will increase or decrease. Projections range from a decrease of up to {{ hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute }} species to an increase of as much as {{ hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute }} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th - hi_{{year}}_b_all_count_10th < baseline_b_all_count - hi_{{year}}_b_all_count_50th
]]
Most models predict a decrease in species count, by as much as {{ hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute }}, however some predict an increase of as much as {{ hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute }} species.

[[  hi_{{year}}_b_all_count_90th <= baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count ]]
Almost all models agree on a decrease in the number of species, by between {{ hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute }} and {{ hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute }}.

[[always]]

Overall species count is not the full story for biodiversity in {{rg_name}}.  Even a relatively stable species count may be the result of significant gains and losses, and represent a different species composition than that which currently exists.

[[ hi_{{year}}_b_all_loss_10th > 0 ]]
Models agree that by {{year}}, between {{hi_{{year}}_b_all_loss_10th}} and {{hi_{{year}}_b_all_loss_90th}} of these species will be lost to the region, with a median expected loss of {{hi_{{year}}_b_all_loss_50th}} species.

[[  hi_{{year}}_b_all_loss_10th == 0
and hi_{{year}}_b_all_loss_50th > 0 ]]
Most models project a loss of some species by {{year}}, with a median of {{hi_{{year}}_b_all_loss_50th}} lost species and some models predicting losses of up to {{hi_{{year}}_b_all_loss_90th}} species.

[[ hi_{{year}}_b_all_loss_50th == 0 and hi_{{year}}_b_all_loss_90th < 0 ]]
Some models project losses of up to {{hi_{{year}}_b_all_loss_90th}} species, however most models agree that by {{year}} no species will be lost.

[[ hi_{{year}}_b_all_loss_90th == 0 ]]
Models agree that by {{year}} no species will be lost.


[[always]]

In addition to the loss of currently present species, climate changes in {{rg_name}} may result in the arrival of species previously not found in the region.

[[ hi_{{year}}_b_all_gain_10th > 0 ]]
Models agree that by {{year}}, between {{hi_{{year}}_b_all_gain_10th}} and {{hi_{{year}}_b_all_gain_90th}} additional species will live in the region, with a median expected gain of {{hi_{{year}}_b_all_gain_50th}} species.

[[  hi_{{year}}_b_all_gain_10th == 0
and hi_{{year}}_b_all_gain_50th > 0 ]]
Most models project some species arriving in {{rg_name}} by {{year}}, with a median of {{hi_{{year}}_b_all_gain_50th}} new species and some models predicting up to {{hi_{{year}}_b_all_gain_90th}} new species.

[[ hi_{{year}}_b_all_gain_50th == 0 and hi_{{year}}_b_all_gain_90th < 0 ]]
Some models project gains of up to {{hi_{{year}}_b_all_gain_90th}} species, however most models agree that by {{year}} no new species will arrive.

[[ hi_{{year}}_b_all_gain_90th == 0 ]]
However, models agree that by {{year}} no new species will enter the region.

[[ hi_{{year}}_b_all_gain_90th > 0 ]]
In light of possible species gains, it is important to consider that even Australian natives may behave like invasive pests when entering new space.  Interaction with other species has not been modelled.

[[always]]

### Tabular Biodiversity Summary

\renewcommand*{\arraystretch}{2.0}

Table: Current and Future Species Counts in {{rg_name}} in {{year}} for Low and High Emission Scenarios

| Class | Current | \parbox[b]{3.5cm}{\centering Low Emissions Scenario \\ in {{year}} \\ count (+gained -lost)} | \parbox[b]{3.5cm}{\centering High Emissions Scenario \\ in {{year}} \\ count (+gained -lost)} |
|:----- |:-------:|:-------------------------:|:--------------------------:|
| Mammals | {{baseline_b_mammal_count}} | {{lo_{{year}}_b_mammal_count_50th}} (+{{lo_{{year}}_b_mammal_gain_50th}} -{{lo_{{year}}_b_mammal_loss_50th}}) | {{hi_{{year}}_b_mammal_count_50th}} (+{{hi_{{year}}_b_mammal_gain_50th}} -{{hi_{{year}}_b_mammal_loss_50th}}) |
| Birds | {{baseline_b_bird_count}} | {{lo_{{year}}_b_bird_count_50th}} (+{{lo_{{year}}_b_bird_gain_50th}} -{{lo_{{year}}_b_bird_loss_50th}}) | {{hi_{{year}}_b_bird_count_50th}} (+{{hi_{{year}}_b_bird_gain_50th}} -{{hi_{{year}}_b_bird_loss_50th}}) |
| Reptiles | {{baseline_b_reptile_count}} | {{lo_{{year}}_b_reptile_count_50th}} (+{{lo_{{year}}_b_reptile_gain_50th}} -{{lo_{{year}}_b_reptile_loss_50th}}) | {{hi_{{year}}_b_reptile_count_50th}} (+{{hi_{{year}}_b_reptile_gain_50th}} -{{hi_{{year}}_b_reptile_loss_50th}}) |
| Amphibians | {{baseline_b_amphibian_count}} | {{lo_{{year}}_b_amphibian_count_50th}} (+{{lo_{{year}}_b_amphibian_gain_50th}} -{{lo_{{year}}_b_amphibian_loss_50th}}) | {{hi_{{year}}_b_amphibian_count_50th}} (+{{hi_{{year}}_b_amphibian_gain_50th}} -{{hi_{{year}}_b_amphibian_loss_50th}}) |

\renewcommand*{\arraystretch}{1.1}


