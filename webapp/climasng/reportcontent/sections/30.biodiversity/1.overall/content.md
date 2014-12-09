
### Regional Biodiversity Implications

{{rg_name}} currently overlaps the estimated distributions of {{baseline_b_all_count}} species.  [[ hi_{{year}}_b_all_gain_50th > baseline_b_all_count / 5 OR hi_{{year}}_b_all_loss_50th > baseline_b_all_count / 5]]By {{year}} biodiversity in this region is projected to undergo significant change. [[never]]

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th >= baseline_b_all_count ]]Models agree that regional biodiversity is likely to increase, by between {{hi_{{year}}_b_all_count_10th - baseline_b_all_count}} and {{hi_{{year}}_b_all_count_90th - baseline_b_all_count}} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th > baseline_b_all_count
AND hi_{{year}}_b_all_count_90th - hi_{{year}}_b_all_count_50th < hi_{{year}}_b_all_count_50th - baseline_b_all_count
]]Most models predict a possible increase in this species count, by up to {{hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute}} species, however some models predict a decrease of as many as {{hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute}} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_90th - hi_{{year}}_b_all_count_50th >= hi_{{year}}_b_all_count_50th - baseline_b_all_count
AND hi_{{year}}_b_all_count_50th - hi_{{year}}_b_all_count_10th >= baseline_b_all_count - hi_{{year}}_b_all_count_50th
]]There is little agreement between models on whether this species count will increase or decrease. Projections range from a decrease of as many as {{hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute}} species to a possible increase of up to {{hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute}} species.

[[  hi_{{year}}_b_all_count_90th > baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th < baseline_b_all_count
AND hi_{{year}}_b_all_count_50th - hi_{{year}}_b_all_count_10th < baseline_b_all_count - hi_{{year}}_b_all_count_50th
]]Most models predict a decrease in this species count, by as much as {{hi_{{year}}_b_all_count_10th - baseline_b_all_count}}, however some predict a possible increase of as many as {{hi_{{year}}_b_all_count_90th - baseline_b_all_count}} species.

[[  hi_{{year}}_b_all_count_90th <= baseline_b_all_count
AND hi_{{year}}_b_all_count_10th < baseline_b_all_count
]]Almost all models agree on a decrease in this species count, by between {{hi_{{year}}_b_all_count_90th - baseline_b_all_count, absolute}} and {{hi_{{year}}_b_all_count_10th - baseline_b_all_count, absolute}}.

[[always]]

[[ hi_{{year}}_b_all_count_50th =5%= baseline_b_all_count ]]
Even a relatively stable species count may be the result of gains offset by losses.[[never]]

[[ hi_{{year}}_b_all_count_50th >5%< baseline_b_all_count]]
Changes to the region's species count may not be the full story, as gains and losses offset each other.[[never]]

[[ hi_{{year}}_b_all_loss_90th > 0 ]]
Models agree that by {{year}}, between {{hi_{{year}}_b_all_loss_90th}} and {{hi_{{year}}_b_all_loss_10th}} of current species will be lost to the region, with a median expected loss of {{hi_{{year}}_b_all_loss_50th}} species.

[[  hi_{{year}}_b_all_loss_90th == 0
and hi_{{year}}_b_all_loss_50th > 0 ]]
Most models project a loss of some species by {{year}}, with a median of {{hi_{{year}}_b_all_loss_50th}} lost species and some models predicting losses of up to {{hi_{{year}}_b_all_loss_10th}} species.

[[ hi_{{year}}_b_all_loss_50th == 0 and hi_{{year}}_b_all_loss_10th < 0 ]]
Some models project losses of up to {{hi_{{year}}_b_all_loss_10th}} species, however most models agree that by {{year}} no species will be lost.

[[ hi_{{year}}_b_all_loss_10th == 0 ]]
Models agree however that by {{year}}, no species currently in {{rg_name}} will be lost to the region.

[[always]]

Climate variation in {{rg_name}} may also result in the arrival of species not previously found in the region.[[ hi_{{year}}_b_all_gain_90th > 0 ]]  Projected gains discussed here are plausible when considering only climate and dispersal factors, but in reality may be ruled out by factors not included in the modelling.  Gains described here should be considered maximums.[[never]]

[[ hi_{{year}}_b_all_gain_10th > 0 ]]
The climate in {{rg_name}} is projected to become suitable for species that could enter the region by {{year}}.  Model estimates of the number of these potentially gained species range from {{hi_{{year}}_b_all_gain_10th}} to {{hi_{{year}}_b_all_gain_90th}}, with a median estimate of {{hi_{{year}}_b_all_gain_50th}} species.

[[  hi_{{year}}_b_all_gain_10th == 0
and hi_{{year}}_b_all_gain_50th > 0 ]]
Most models project that the climate in {{rg_name}} will become suitable for some species that could enter the region by {{year}}.  The median estimate of the number of these potentially gained species is {{hi_{{year}}_b_all_gain_50th}} species, with some models estimating up to {{hi_{{year}}_b_all_gain_90th}} species.

[[ hi_{{year}}_b_all_gain_50th == 0 and hi_{{year}}_b_all_gain_90th < 0 ]]
Some models project that the climate in {{rg_name}} will become suitable for up to {{hi_{{year}}_b_all_gain_90th}} species that could enter the region by {{year}}.  Most models however agree that the region will not support additional species.

[[ hi_{{year}}_b_all_gain_90th == 0 ]]
However, models agree that by {{year}} no new species will be supported by the climate in {{rg_name}}.

[[ hi_{{year}}_b_all_gain_90th > 0 OR hi_{{year}}_b_all_loss_10th > 0 ]]
In light of possible species gains or losses, it is important to note that interactions with other species have not been modelled.

[[always]]

### Tabular Biodiversity Summary

\renewcommand*{\arraystretch}{2.0}

Table: Current and future species counts in {{rg_name}} in {{year}} for low and high emission scenarios

| Class | Current | \parbox[b]{3.5cm}{\centering Low Emissions Scenario \\ in {{year}} \\ count (+gained -lost)} | \parbox[b]{3.5cm}{\centering High Emissions Scenario \\ in {{year}} \\ count (+gained -lost)} |
|:----- |:-------:|:-------------------------:|:--------------------------:|
| Mammals | {{baseline_b_mammals_count}} | {{lo_{{year}}_b_mammals_count_50th}} (+{{lo_{{year}}_b_mammals_gain_50th}} -{{lo_{{year}}_b_mammals_loss_50th}}) | {{hi_{{year}}_b_mammals_count_50th}} (+{{hi_{{year}}_b_mammals_gain_50th}} -{{hi_{{year}}_b_mammals_loss_50th}}) |
| Birds | {{baseline_b_birds_count}} | {{lo_{{year}}_b_birds_count_50th}} (+{{lo_{{year}}_b_birds_gain_50th}} -{{lo_{{year}}_b_birds_loss_50th}}) | {{hi_{{year}}_b_birds_count_50th}} (+{{hi_{{year}}_b_birds_gain_50th}} -{{hi_{{year}}_b_birds_loss_50th}}) |
| Reptiles | {{baseline_b_reptiles_count}} | {{lo_{{year}}_b_reptiles_count_50th}} (+{{lo_{{year}}_b_reptiles_gain_50th}} -{{lo_{{year}}_b_reptiles_loss_50th}}) | {{hi_{{year}}_b_reptiles_count_50th}} (+{{hi_{{year}}_b_reptiles_gain_50th}} -{{hi_{{year}}_b_reptiles_loss_50th}}) |
| Amphibians | {{baseline_b_amphibians_count}} | {{lo_{{year}}_b_amphibians_count_50th}} (+{{lo_{{year}}_b_amphibians_gain_50th}} -{{lo_{{year}}_b_amphibians_loss_50th}}) | {{hi_{{year}}_b_amphibians_count_50th}} (+{{hi_{{year}}_b_amphibians_gain_50th}} -{{hi_{{year}}_b_amphibians_loss_50th}}) |
| Freshwater fish | {{baseline_b_fish_count}} | {{lo_{{year}}_b_fish_count_50th}} (+{{lo_{{year}}_b_fish_gain_50th}} -{{lo_{{year}}_b_fish_loss_50th}}) | {{hi_{{year}}_b_fish_count_50th}} (+{{hi_{{year}}_b_fish_gain_50th}} -{{hi_{{year}}_b_fish_loss_50th}}) |
| Crayfish | {{baseline_b_crayfish_count}} | {{lo_{{year}}_b_crayfish_count_50th}} (+{{lo_{{year}}_b_crayfish_gain_50th}} -{{lo_{{year}}_b_crayfish_loss_50th}}) | {{hi_{{year}}_b_crayfish_count_50th}} (+{{hi_{{year}}_b_crayfish_gain_50th}} -{{hi_{{year}}_b_crayfish_loss_50th}}) |

\renewcommand*{\arraystretch}{1.1}


