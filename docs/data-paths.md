Collecting data
===============

```

.------------------------------.    .------------------------------.
|                              |    |                              |
|  (directories holding maps)  |    |     (GBIF backbone data)     |
|                              |    |                              |
'------------------------------'    '------------------------------'
              |                                    |
              |                     utilityscripts/gbif-commonnames/
              |                              getcommons.py
              |                                    |
              |                                    V
              |                     .------------------------------.
              |                     |                              |
              |                     |     u~s~/gbif-commonnames/   |
              |                     |       commonnames.json       |
              |                     |                              |
              |                     '------------------------------'
              |                                    |
              |                              (manual copy)
              |                                    |
              |                                    V
              |                     .------------------------------.
              |                     |                              |
              |                     |     webapp/climasng/data/    |
              |                     |       commonnames.json       |
              |                     |                              |
              |                     '------------------------------'
              |                                    |
              '-----------------.------------------'
                                |
                          utilityscripts/
                        createdatalists.py
                                |
              .-----------------'------------------.
              |                                    |
              V                                    V
.------------------------------.    .------------------------------.
|                              |    |                              |
| [srv/webapp]/climasng/data/  |    | [srv/webapp]/climasng/data/  |
|         species.json         |    |        summaries.json        |
|                              |    |                              |
'------------------------------'    '------------------------------'
              |                                    |
              '------------------------.-----------'
                                       |
                                       |
                                 utilityscripts/
                                 indextool-es.py
                                       |
                                       |
.------------------------------.       |
|                              |       |
|      u~s~/elasticsearch/     |       |
|        maptype.json          |       |
|                              |       |
'------------------------------'       |
              |                        |
       u~s~/elasticsearch              |
          setup-es.sh                  |
              |                        |
              |                        |
              '-----------------.------'
                                |
                               	V
                .------------------------------.
                |                              |
                |        ElasticSearch         |
                |                              |
                '------------------------------'



```