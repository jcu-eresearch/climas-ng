

ES_SERVER="http://localhost:9200"
ES_INDEX="wallace"

echo "delete index '$ES_INDEX':"
curl -XDELETE "$ES_SERVER/$ES_INDEX"

echo
echo "create index '$ES_INDEX':"
curl -XPUT "$ES_SERVER/$ES_INDEX" --data @maptype.json

echo
read -rsn1 -p "CTRL-C to finish now; any other key to install sample data: "
echo

echo
echo "insert:"
curl -XPUT '$ES_SERVER/$ES_INDEX/map/1' -H 'Content-Type: application/json' -d'{
	"nice_name": "A Test (Tester McTesting)",
	"name_id": "A Test (Tester McTesting)",
	"item_id": "Tester McTestus",
	"item_path": "/dir/tester_mctesting",
	"item_type": "species"
}'

echo
curl -XPUT '$ES_SERVER/$ES_INDEX/map/2' -H 'Content-Type: application/json' -d'{
	"nice_name": "Another Test (Schmester McSchmesting)",
	"name_id": "Another Test (Schmester McSchmesting)",
	"item_id": "Schmester McSchmesting",
	"item_path": "/dir/schmester_mcschmesting",
	"item_type": "species"
}'

echo

NAMES=(
	"name one"
	"name two"
	"one name two"
	"nam one"
	"name on"
	"three one"
)

for NAME in "${NAMES[@]}"; do

	echo -n "inserting $NAME: "
	curl -XPOST '$ES_SERVER/$ES_INDEX/map' \
	--silent --output /dev/null --write-out "result: %{http_code} " \
	-H 'Content-Type: application/json' -d"{
		\"nice_name\": \"$NAME\",
		\"name_id\": \"$NAME\",
		\"item_id\": \"$NAME\",
		\"item_path\": \"/dir/$NAME\",
		\"item_type\": \"species\"
	}"
	curl -XPOST '$ES_SERVER/$ES_INDEX/map' \
	--silent --output /dev/null --write-out "result: %{http_code} " \
	-H 'Content-Type: application/json' -d"{
		\"nice_name\": \"$NAME\",
		\"name_id\": \"$NAME\",
		\"item_id\": \"$NAME\",
		\"item_path\": \"/dir/$NAME\",
		\"item_type\": \"richness\"
	}"
	echo

done