
## Actions performed installing geoserver onto `wallace-maps.hpc`


Install tomcat:

	yum install tomcat tomcat-webapps tomcat-admin-webapps -y
	systemctl enable tomcat


Install geoserver:

	wget https://downloads.sourceforge.net/project/geoserver/GeoServer/2.11.2/geoserver-2.11.2-war.zip
	yum install unzip -y
	unzip geoserver-2.11.2-war.zip geoserver.war -d /var/lib/tomcat/webapps
	rm geoserver-2.11.2-war.zip
	tomcat stop
	tomcat start


Tomcat doesn't work for some reason, so apply the standard fix of disabling selinux:

	setenforce 0
	vi /etc/sysconfig/selinux
	# edit the SELINUX line to say:
	#   SELINUX=disabled
	tomcat stop
	tomcat start


Install nginx to proxy from port 80 to port 8080:

	yum install nginx -y
	systemctl enable nginx
	echo -e "server {\n\tlisten 80;\n\tserver_name wallace-maps.hpc.jcu.edu.au;\n\tlocation /geoserver {\n\t\tproxy_pass http://localhost:8080;\n\t}\n}" > /etc/nginx/conf.d/geoserver.conf
	systemctl start nginx


Fiddle HTTP and HTTPS into the firewall rules:

	vi /etc/sysconfig/iptables
	# add in -A INPUT -p tcp -m multiport --dports 80,443 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT


Get geoserver set up with workspaces, map styles etc:

	# these scripts are in the `./utilityscripts/geoserver` dir, `cd` into there
	# update the hostname etc inside all these scripts
	./add-styles.sh
	./add-workspace.sh






