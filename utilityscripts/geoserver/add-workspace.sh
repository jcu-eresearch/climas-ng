
HOSTNAME=wallace-maps.hpc.jcu.edu.au
PORT=80

USER=admin
PASS=${GEOSERVER_PASS:-geoserver}
echo "set GEOSERVER_PASS environment variable for this to work."

WORKSPACE=wallace

# create the workspace
curl -s -u $USER:$PASS -XPOST -H "Content-type: text/xml" \
  -d "<workspace><name>$WORKSPACE</name></workspace>" \
  "http://$HOSTNAME:$PORT/geoserver/rest/workspaces"
