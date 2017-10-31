
This dir is where you put the GBIF "backbone" dataset.

Download backbone.zip from GBIF and unzip.  You can probably
find it here: 

https://www.gbif.org/dataset/d7dddbf4-2cf0-4f39-9b2a-bb099caae36c

..or search for "gbif backbone".

Once you unzip you should get this folder setup:


    --+ data/
      |
      '--+ backbone/
         |
         +--+ dataset/
         |  |
         |  '--- ...many files with {UUID} names...
         |
         +--- Distribution.tsv
         |
         +--- Taxon.tsv
         |
         +--- VernacularName.tsv
         |
         '--- ...other files...


The `Taxon.tsv` and `VernacularName.tsv` tab-separated files 
are where the `getcommons.py` script sources common names from.
