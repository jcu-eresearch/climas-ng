
# delete the db
rm climasng.sqlite

# builds the database
echo 'building schema'
sqlite3 climasng.sqlite < schema.sql

echo 'adding regions'
sqlite3 climasng.sqlite < regions_data.sql

echo 'prepping species info'
./makesppsql.py

echo 'adding species'
sqlite3 climasng.sqlite < sppnames.sql

echo 'adding presences'
sqlite3 climasng.sqlite < spppresences.sql

cp climasng.sqlite ..