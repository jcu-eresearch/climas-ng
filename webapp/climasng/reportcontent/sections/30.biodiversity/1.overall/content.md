
#### Regional Biodiversity Implications

{{rg_name}} currently hosts {{baseline_b_all_count}} species.  [[ hi_{{year}}_b_all_gain_50th > baseline_b_all_count / 5 OR hi_{{year}}_b_all_loss_50th > baseline_b_all_count / 5]]By {{year}} biodiversity in this region is projected to undergo significant change. [[never]]

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th >= baseline_b_all_count ]]Models agree that regional biodiversity will increase, by between {{hi_{{year}}_b_all_count_10th - baseline_b_all_count}} and {{hi_{{year}}_b_all_count_90th - baseline_b_all_count}} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th > baseline_b_all_count
AND hi_{{year}}_b_all_count_90th - hi_{{year}}_b_all_count_50th < hi_{{year}}_b_all_count_50th - baseline_b_all_count
]]Most models predict an increase in this species count, by up to {{hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute}} species, however some models predict a decrease of as many as {{hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute}} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_90th - hi_{{year}}_b_all_count_50th >= hi_{{year}}_b_all_count_50th - baseline_b_all_count
AND hi_{{year}}_b_all_count_50th - hi_{{year}}_b_all_count_10th >= baseline_b_all_count - hi_{{year}}_b_all_count_50th
]]There is little agreement between models on whether this species count will increase or decrease. Projections range from a decrease of as many as {{hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute}} species to an increase of up to {{hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute}} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th - hi_{{year}}_b_all_count_10th < baseline_b_all_count - hi_{{year}}_b_all_count_50th
]]Most models predict a decrease in this species count, by as much as {{hi_{{year}}_b_all_count_10th - baseline_b_all_count}}, however some predict an increase of as many as {{hi_{{year}}_b_all_count_90th - baseline_b_all_count}} species.

[[  hi_{{year}}_b_all_count_90th <= baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
]]Almost all models agree on a decrease in this species count, by between {{hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute}} and {{hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute}}.

[[always]]

[[ hi_{{year}}_b_all_count_50th =5%= baseline_b_all_count ]]
Even a relatively stable species count may be the result of gains offset by losses.[[never]]

[[ hi_{{year}}_b_all_count_50th >5%< baseline_b_all_count]]
Changes to the region's species count may not be the full story, as gains and losses offset each other.[[never]]

[[ hi_{{year}}_b_all_loss_10th > 0 ]]
Models agree that by {{year}}, between {{hi_{{year}}_b_all_loss_10th}} and {{hi_{{year}}_b_all_loss_90th}} of current species will be lost to the region, with a median expected loss of {{hi_{{year}}_b_all_loss_50th}} species.

[[  hi_{{year}}_b_all_loss_10th == 0
and hi_{{year}}_b_all_loss_50th > 0 ]]
Most models project a loss of some species by {{year}}, with a median of {{hi_{{year}}_b_all_loss_50th}} lost species and some models predicting losses of up to {{hi_{{year}}_b_all_loss_90th}} species.

[[ hi_{{year}}_b_all_loss_50th == 0 and hi_{{year}}_b_all_loss_90th < 0 ]]
Some models project losses of up to {{hi_{{year}}_b_all_loss_90th}} species, however most models agree that by {{year}} no species will be lost.

[[ hi_{{year}}_b_all_loss_90th == 0 ]]
Models agree however that by {{year}}, no species currently in {{rg_name}} will be lost to the region.

[[always]]

Climate variation in {{rg_name}} may also result in the arrival of species previously not found in the region.[[never]]

[[ hi_{{year}}_b_all_gain_10th > 0 ]]
Models agree that by {{year}}, between {{hi_{{year}}_b_all_gain_10th}} and {{hi_{{year}}_b_all_gain_90th}} additional species will live in the region, with a median expected gain of {{hi_{{year}}_b_all_gain_50th}} species.

[[  hi_{{year}}_b_all_gain_10th == 0
and hi_{{year}}_b_all_gain_50th > 0 ]]
Most models project some species arriving by {{year}}, with a median of {{hi_{{year}}_b_all_gain_50th}} new species and some models predicting up to {{hi_{{year}}_b_all_gain_90th}} new species.

[[ hi_{{year}}_b_all_gain_50th == 0 and hi_{{year}}_b_all_gain_90th < 0 ]]
Some models project gains of up to {{hi_{{year}}_b_all_gain_90th}} species, however most models agree that by {{year}} no new species will arrive.

[[ hi_{{year}}_b_all_gain_90th == 0 ]]
However, models agree that by {{year}} no new species will enter the region.

[[ hi_{{year}}_b_all_gain_90th > 0 ]]

In light of possible species gains, it is important to consider that even Australian natives may behave like invasive pests when entering new space.  Interaction with other species has not been modelled.

[[always]]

#### Tabular Biodiversity Summary

\renewcommand*{\arraystretch}{2.0}

Table: Current and Future Species Counts in {{rg_name}} in {{year}} for Low and High Emission Scenarios

| Class | Current | \parbox[b]{3.5cm}{\centering Low Emissions Scenario \\ in {{year}} \\ count (+gained -lost)} | \parbox[b]{3.5cm}{\centering High Emissions Scenario \\ in {{year}} \\ count (+gained -lost)} |
|:----- |:-------:|:-------------------------:|:--------------------------:|
| Mammals | {{baseline_b_mammals_count}} | {{lo_{{year}}_b_mammals_count_50th}} (+{{lo_{{year}}_b_mammals_gain_50th}} -{{lo_{{year}}_b_mammals_loss_50th}}) | {{hi_{{year}}_b_mammals_count_50th}} (+{{hi_{{year}}_b_mammals_gain_50th}} -{{hi_{{year}}_b_mammals_loss_50th}}) |
| Birds | {{baseline_b_birds_count}} | {{lo_{{year}}_b_birds_count_50th}} (+{{lo_{{year}}_b_birds_gain_50th}} -{{lo_{{year}}_b_birds_loss_50th}}) | {{hi_{{year}}_b_birds_count_50th}} (+{{hi_{{year}}_b_birds_gain_50th}} -{{hi_{{year}}_b_birds_loss_50th}}) |
| Reptiles | {{baseline_b_reptiles_count}} | {{lo_{{year}}_b_reptiles_count_50th}} (+{{lo_{{year}}_b_reptiles_gain_50th}} -{{lo_{{year}}_b_reptiles_loss_50th}}) | {{hi_{{year}}_b_reptiles_count_50th}} (+{{hi_{{year}}_b_reptiles_gain_50th}} -{{hi_{{year}}_b_reptiles_loss_50th}}) |
| Amphibians | {{baseline_b_amphibians_count}} | {{lo_{{year}}_b_amphibians_count_50th}} (+{{lo_{{year}}_b_amphibians_gain_50th}} -{{lo_{{year}}_b_amphibians_loss_50th}}) | {{hi_{{year}}_b_amphibians_count_50th}} (+{{hi_{{year}}_b_amphibians_gain_50th}} -{{hi_{{year}}_b_amphibians_loss_50th}}) |

\renewcommand*{\arraystretch}{1.1}


