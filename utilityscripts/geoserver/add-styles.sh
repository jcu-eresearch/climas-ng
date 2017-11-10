
HOSTNAME=wallace-maps.hpc.jcu.edu.au
PORT=80

USER=admin
PASS=${GEOSERVER_PASS:-geoserver} # default to "geoserver" if GEOSERVER_PASS isn't set
echo
echo "set GEOSERVER_PASS environment variable for this to work."
echo

STYLESDIR=./styles

for STYLEFILE in $STYLESDIR/*.sld ; do

	STYLENAME=${STYLEFILE%%.sld}
	STYLENAME=${STYLENAME#$STYLESDIR/}

	# post to create the new style (doesn't actually define it though)
	echo -n "Creating style '$STYLENAME'..."
	curl --silent --write-out " (result: %{http_code})" \
		--output /dev/null \
		--user "$USER:$PASS" \
		-XPOST \
		-H "Content-type: text/xml" \
		-d "<style><name>$STYLENAME</name><filename>$STYLENAME.sld</filename></style>" \
		"http://$HOSTNAME:$PORT/geoserver/rest/styles"
	echo

	# put the style's definiiton into the style created above
	echo -n "Updating style '$STYLENAME'..."
	curl --silent --write-out " (result: %{http_code})" \
		-u "$USER:$PASS" \
		-XPUT \
		-H "Content-type: application/vnd.ogc.sld+xml" \
		-d @"./styles/$STYLENAME.sld" \
		"http://$HOSTNAME:$PORT/geoserver/rest/styles/$STYLENAME"

	echo
done

echo
echo "Making legends:"
echo

./make-svg-legends.py $STYLESDIR
cp -r ./legends/*.svg ./styletestpage/legends/
cp -r ./legends/*.svg ../../webapp/climasng/static/images/legends/



