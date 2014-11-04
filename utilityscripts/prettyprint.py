#!/usr/bin/env python

import fileinput
import re

content = []
for line in fileinput.input():
    content.append(line)

# here's the content in a big string
content = ''.join(content)

content = content.replace("rg_name", "region")
content = content.replace("hi_{{year}}_b_all_count_", "biodiv_")
content = content.replace("baseline_b_all_count", "current_biodiv")

content = content.replace("hi_{{year}}_b_all_loss_", "loss_")
content = content.replace("hi_{{year}}_b_all_gain_", "gain_")

for tp in ['t','p']:
    content = content.replace(tp + "_mean",               tp)
    content = content.replace("hi_{{year}}_" + tp + "_",  tp + "_")
    content = content.replace("hi_2085_" + tp + "_",      tp + "85_")
    content = content.replace("lo_{{year}}_" + tp + "_",  "low_" + tp + "_")
    content = content.replace("lo_2085_" + tp + "_",      "low_" + tp + "85_")

for taxon in ['mammal', 'bird', 'reptile', 'amphibian']:
    content = content.replace('baseline_b_' + taxon + '_count', 'current_' + taxon[:1])
    for scen in ['lo','hi']:
        content = content.replace(scen + '_{{year}}_b_' + taxon + '_count_50th', scen + '_' + taxon[:1] + '')
        content = content.replace(scen + '_{{year}}_b_' + taxon + '_gain_50th', scen + '_' + taxon[:1] + '_gain')
        content = content.replace(scen + '_{{year}}_b_' + taxon + '_loss_50th', scen + '_' + taxon[:1] + '_loss')

# content = content.replace("rpt_year", "year")

# headings
content = re.sub(r'^(#+)(.*?)$', r'<p>\1<b>\2</b></p>', content, 0, re.M)

# newlines (in tables)
content = re.sub(r'\|\n', r'<br>', content)
# newlines elsewhere
content = re.sub(r'\n\n', r'<p>', content)
# newlines after condition blocks
content = re.sub(r']]\n', r']]<br>', content)

# "and" inside conditions
repls = 1
while repls > 0:
    content, repls = re.subn(r'(\[\[[^\]]*?\s+)([Aa][Nn][Dd])(\s+[^\]]*?\]\])', r'\1<br><span class="punc">\2</span>\3', content)
repls = 1
while repls > 0:
    content, repls = re.subn(r'(\[\[[^\]]*?\s+)([Oo][Rr])(\s+[^\]]*?\]\])', r'\1<br><span class="punc">\2</span>\3', content)

# conditions and substitutions
content = re.sub(r'\[\[\s*([^\]]*?)\s*\]\]', r'<span class="condition"><span class="punc">[[</span> \1 <span class="punc">]]</span></span>', content)
content = re.sub(r'\{\{\s*([^\}]*?)\s*\}\}', r'<span class="sub"><span class="punc">{{</span>\1<span class="punc">}}</span></span>', content)

content = '''
<style>
    body {
        max-width: 40em;
        margin: 0 auto;
        padding: 1em 3em;
        line-height: 1.4;
    }
    span {
        padding: 0.25em 0.1em;
        border-radius: 0.7em;
    }
    span.punc {
        opacity: 0.2;
        text-transform: uppercase;
        font-size: 90%;
        font-weight: bold;
        font-style: normal;
        padding: 0.1em 0.33em 0.1em 0.15em;
    }
    span.condition {
        display: inline-block;
        vertical-align: middle;
        line-height: 1.1;
        font-family: sans-serif;
        font-size: 80%;
        background: #cef;
        color: #369;
        border: 1px solid #bdf;
    }
    span.sub {
        font-style: italic;
        background: #e8fff0;
        color: #063;
        border: 1px solid #bfd;
    }
    .sub .punc { letter-spacing: -0.15em; }
</style>
''' + content

print content