
HOSTNAME=wallace-maps.hpc.jcu.edu.au
PORT=80

USER=admin
PASS=geoserver

STYLESDIR=./styles

for STYLEFILE in $STYLESDIR/*.sld ; do

	STYLENAME=${STYLEFILE%%.sld}
	STYLENAME=${STYLENAME#$STYLESDIR/}

	# post to create the new style (doesn't actually define it though)
	echo "creating style '$STYLENAME'..."
	curl -w " (result: %{http_code})" \
		-u "$USER:$PASS" \
		-XPOST \
		-H "Content-type: text/xml" \
		-d "<style><name>$STYLENAME</name><filename>$STYLENAME.sld</filename></style>" \
		"http://$HOSTNAME:$PORT/geoserver/rest/styles"
	echo

	# put the style's definiiton into the style created above
	echo "updating style '$STYLENAME'..."
	curl -w " (result: %{http_code})" \
		-u "$USER:$PASS" \
		-XPUT \
		-H "Content-type: application/vnd.ogc.sld+xml" \
		-d @"./styles/$STYLENAME.sld" \
		"http://$HOSTNAME:$PORT/geoserver/rest/styles/$STYLENAME"

	echo
done


