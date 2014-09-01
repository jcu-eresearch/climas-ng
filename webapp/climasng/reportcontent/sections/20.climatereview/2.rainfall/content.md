
###Rainfall

Currently, the mean annual rainfall for {{ rg_name }} is {{baseline_p_mean, round}} mL, experiencing a range of averages between {{baseline_p_min, round}} mL and {{baseline_p_max, round}} mL.

Future rainfall projections are much more variable.  By {{rpt_year}}, rainfall is projected to be in the range {{ hi_{{rpt_year}}_p_mean_10th, round}} &ndash; {{ hi_{{rpt_year}}_p_mean_90th, round}} mL.

xxxxxx

baseline_p_mean {{baseline_p_mean}}

hi_2065_p_mean_10th {{hi_2065_p_mean_10th}}

hi_2065_p_mean_50th {{hi_2065_p_mean_50th}}

hi_2065_p_mean_90th {{hi_2065_p_mean_90th}}

xxxxxx

Figure 3 tracks change in rainfall in {{ rg_name }} between 2015 and 2085.

[[  hi_{{rpt_year}}_p_mean_90th > baseline_p_mean
AND hi_{{rpt_year}}_p_mean_10th >= baseline_p_mean ]]
Almost all models agree on an increase in rainfall, by between {{ hi_{{rpt_year}}_p_mean_10th - baseline_p_mean, absolute, round }} mL and {{ hi_{{rpt_year}}_p_mean_90th - baseline_p_mean, absolute, round }} mL.

[[  hi_{{rpt_year}}_p_mean_90th > baseline_p_mean
AND hi_{{rpt_year}}_p_mean_10th < baseline_p_mean
AND hi_{{rpt_year}}_p_mean_50th > baseline_p_mean
AND hi_{{rpt_year}}_p_mean_90th - hi_{{rpt_year}}_p_mean_50th < hi_{{rpt_year}}_p_mean_50th - baseline_p_mean
]]
Most models predict an increase in rainfall, by as much as {{ hi_{{rpt_year}}_p_mean_90th - baseline_p_mean, absolute, round }} mL, however some predict a decrease of as much as {{ hi_{{rpt_year}}_p_mean_10th - baseline_p_mean, absolute, round }} mL.

[[  hi_{{rpt_year}}_p_mean_90th > baseline_p_mean
AND hi_{{rpt_year}}_p_mean_10th < baseline_p_mean
AND hi_{{rpt_year}}_p_mean_90th - hi_{{rpt_year}}_p_mean_50th >= hi_{{rpt_year}}_p_mean_50th - baseline_p_mean
AND hi_{{rpt_year}}_p_mean_50th - hi_{{rpt_year}}_p_mean_10th >= baseline_p_mean - hi_{{rpt_year}}_p_mean_50th
]]
There is little agreement between models on whether rainfall will increase or decrease. Projections range from a decrease of up to {{ hi_{{rpt_year}}_p_mean_10th - baseline_p_mean, absolute, round }} mL to an increase of as much as {{ hi_{{rpt_year}}_p_mean_90th - baseline_p_mean, absolute, round }} mL.

[[  hi_{{rpt_year}}_p_mean_90th > baseline_p_mean
AND hi_{{rpt_year}}_p_mean_10th < baseline_p_mean
AND hi_{{rpt_year}}_p_mean_50th < baseline_p_mean
AND hi_{{rpt_year}}_p_mean_50th - hi_{{rpt_year}}_p_mean_10th < baseline_p_mean - hi_{{rpt_year}}_p_mean_50th
]]
Most models predict a decrease in rainfall, by as much as {{ hi_{{rpt_year}}_p_mean_10th - baseline_p_mean, absolute, round }} mL, however some predict an increase of as much as {{ hi_{{rpt_year}}_p_mean_90th - baseline_p_mean, absolute, round }} mL.

[[  hi_{{rpt_year}}_p_mean_90th <= baseline_p_mean
AND hi_{{rpt_year}}_p_mean_10th < baseline_p_mean ]]
Almost all models agree on a decrease in rainfall, by between {{ hi_{{rpt_year}}_p_mean_90th - baseline_p_mean, absolute, round }} mL and {{ hi_{{rpt_year}}_p_mean_10th - baseline_p_mean, absolute, round }} mL.


[[always]]
----

! Figure 3: Average Projected rainfall ({{region_url}}/absolute_climate_rainfall.png)

Figure 4 shows the median projected change in annual average rainfall across {{ rg_name }}, in low and high emission scenarios.

! Figure 4: Projected rainfall Change ({{region_url}}/delta_rainfall.png)
[[rpt_year < 2085]]Note that this figure shows projections for 2085.[[always]]


