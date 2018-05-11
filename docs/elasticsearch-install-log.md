
## Actions performed installing Elastic Search onto `wallace.hpc`


Install java:

    yum install java -y
    # installs java-1.8.0-ibm


Install elasticsearch:

    wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.2.rpm
    wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.6.2.rpm.sha1
    # compare the sha:
    cat elasticsearch-5.6.2.rpm.sha1
    sha1sum elasticsearch-5.6.2.rpm 
    # if the SHAs match..
    rpm --install elasticsearch-5.6.2.rpm


Make es run, now and on reboot:

    systemctl daemon-reload
    systemctl enable elasticsearch
    systemctl start elasticsearch


Connect to es and add the "map" index, with our datatype:

    curl -XPUT "localhost:9200/map" --data @maptype.json

If you need to remove the index and start over, try this:

    curl -XDELETE "localhost:9200/map"
    curl -XPUT "localhost:9200/map" --data @maptype.json


----


## Sample ES


#### add docs for ES to index

    curl -XPUT 'localhost:9200/wallace/map/1?pretty' -H 'Content-Type: application/json' -d'
    {
        "nice_name": "A Test (Tester McTesting)",
        "name_id": "A Test (Tester McTesting)",
        "item_id": "Tester McTestus",
        "item_path": "/dir/tester_mctesting",
        "item_type": "species"
    }'


    curl -XPUT 'localhost:9200/wallace/map/2?pretty' -H 'Content-Type: application/json' -d'
    {
        "nice_name": "Another Test (Schmester McSchmesting)",
        "name_id": "Another Test (Schmester McSchmesting)",
        "item_id": "Schmester McSchmesting",
        "item_path": "/dir/schmester_mcschmesting",
        "item_type": "species"
    }'


#### search ES

    curl -XPOST 'localhost:9200/wallace/map/_search' -H 'Content-Type: application/json' -d'{
        "query": {
            "bool": {
                "must": {
                    "match": {
                        "nice_name": { "query": "name", "operator": "and" }
                    }
                },
                "filter": {
                    "terms": { "item_type": ["species", "richness"] }
                }
            }
        },
        "from": 0,
        "size": 3
    }'

