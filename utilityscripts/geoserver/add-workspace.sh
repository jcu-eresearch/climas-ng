
HOSTNAME=wallace-maps.hpc.jcu.edu.au
PORT=80

USER=admin
PASS=geoserver

WORKSPACE=wallace

# create the workspace
curl -s -u $USER:$PASS -XPOST -H "Content-type: text/xml" \
  -d "<workspace><name>$WORKSPACE</name></workspace>" \
  "http://$HOSTNAME:$PORT/geoserver/rest/workspaces"
