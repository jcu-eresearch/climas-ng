# -*- mode: ruby -*-
# vi: set ft=ruby :

# here's a shell script to get stuff set up
$install_provisioning = <<SCRIPT_TERMINATOR
# now in shell script..
echo ''
echo ' *************************************************************'
echo ' ******************************  installing OS-level stuff... '
echo ' *************************************************************'


yum install -y yum-plugin-priorities
# wget -nv http://sherkin.justhub.org/el6/RPMS/x86_64/justhub-release-2.0-4.0.el6.x86_64.rpm
# wget -nv http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
# wget -nv http://elgis.argeo.org/repos/6/elgis-release-6-6_0.noarch.rpm
# rpm -Uvh justhub-release-*.rpm epel-release-6*.rpm elgis-release-*.rpm

yum -y install epel-release
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-7

yum repolist
yum install -y supervisor
/sbin/chkconfig supervisord on
service supervisord start

yum install -y git

echo ''
echo ' *************************************************************'
echo ' ********************************  installing python tools... '
echo ' *************************************************************'

# pip and setuptools
yum -y install python-pip
pip install --upgrade pip

# virtualenv
pip install virtualenv


echo ''
echo ' *************************************************************'
echo ' ********************************  installing pandoc & tex... '
echo ' *************************************************************'

yum -y install pandoc

### can't get yum's texlive to actually compile pandoc's latex output.
yum install -y texlive texlive-latex texlive-xetex

__=" @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  disabling stuff..  @@@
### try a manual install of texlive
wget -nv http://mirror.ctan.org/systems/texlive/tlnet/install-tl-unx.tar.gz
tar -zxvf install-tl-unx.tar.gz
pushd install-tl-unx*
./install-tl --profile=/var/climaswebapp/texlive-install.profile
popd
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@  ..end of disabler  @@@"




echo ''
echo ' *************************************************************'
echo ' **************************************  installing CliMAS... '
echo ' *************************************************************'

# on a vagrant machine, the project dir is shared in at /vagrant,
# which is a bit vagrant-specific for me to add that path to the
# example ini files.  Instead this Vagrantfile maps the
# project's ./webapp/ dir to /var/climaswebapp/ on the VM, and uses
# that as the path for the production ini file.

# install CliMAS
pushd /var/climaswebapp
    sudo -u vagrant virtualenv .
    sudo -u vagrant ./bin/pip install setuptools --upgrade

    ## this stuff gets run in another provisioning script..
    # sudo -u vagrant ./bin/python ./setup.py develop

    # # make the database (needs replacing for the real thing)
    # pushd climasng/db/sqlbuilder
    #     sudo -u vagrant ./builddb.sh
    #     cp climasng.sqlite ..
    # popd

popd


# add climas to supervisord.conf

echo "[program:climas]"              >> /etc/supervisord.conf
echo "command=/var/climaswebapp/bin/pserve /var/climaswebapp/virtual.ini" >> /etc/supervisord.conf
echo "priority=999"                  >> /etc/supervisord.conf
echo "autostart=true"                >> /etc/supervisord.conf
echo "autorestart=true"              >> /etc/supervisord.conf
echo "startsecs=10"                  >> /etc/supervisord.conf
echo "startretries=3"                >> /etc/supervisord.conf
echo "exitcodes=0,2"                 >> /etc/supervisord.conf
echo "stopsignal=QUIT"               >> /etc/supervisord.conf
echo "stopwaitsecs=10"               >> /etc/supervisord.conf
echo "user=vagrant"                  >> /etc/supervisord.conf
echo "log_stdout=true"               >> /etc/supervisord.conf
echo "log_stderr=true"               >> /etc/supervisord.conf
echo "logfile=/var/log/climas.log"   >> /etc/supervisord.conf
echo "logfile_maxbytes=1MB"          >> /etc/supervisord.conf
echo "logfile_backups=10"            >> /etc/supervisord.conf
echo ""                              >> /etc/supervisord.conf
service supervisord restart



echo ''
SCRIPT_TERMINATOR

# ============================================================================================================

# boot provisioning
$boot_provisioning = <<SCRIPT_TERMINATOR

# install CliMAS
pushd /var/climaswebapp
    sudo -u vagrant ./bin/python ./setup.py develop

    # make the database (needs replacing for the real thing)
    pushd climasng/db/sqlbuilder
        sudo -u vagrant ./builddb.sh
        cp climasng.sqlite ..
    popd

popd

SCRIPT_TERMINATOR

# ============================================================================================================

$dummy = <<SCRIPT_TERMINATOR



echo ''
echo ' *************************************************************'
echo ' *********************************  installing viz prereqs... '
echo ' *************************************************************'

yum install -y libpng libpng-devel freetype gd gd-devel
yum install -y zlib giflib-devel gcc wget

yum install -y proj proj-devel python-devel

#### yum install -y proj
#### compile proj, yum install doesn't work for some reason?
# wget -nv http://download.osgeo.org/proj/proj-4.8.0.tar.gz
# tar -zxvf proj-4.8.0.tar.gz
# pushd proj-4.8.0
# ./configure
# make
# make check
# make install
# popd

### add proj path to everyone's environment
echo ""                                       >> /etc/bashrc
echo 'export PROJ_LIB=/usr/local/share/proj/' >> /etc/bashrc
## DOESN'T WORK mapserver still doesn't know where proj is.
## See later for additonal attempts to fix this.

yum install -y libcurl agg agg-devel readline-devel zlib-devel
yum install -y libxml2-devel geos-devel gcc-c++ curl-devel
yum install -y libtiff libgeotiff libjpeg geos libxml2

# wget -nv http://proj.badc.rl.ac.uk/cedaservices/raw-attachment/ticket/670/armadillo-3.800.2-1.el6.x86_64.rpm
# yum localinstall -y armadillo-3*.rpm
yum install -y gdal gdal-devel

# scipy needs this..
yum install -y atlas atlas-devel blas blas-devel lapack lapack-devel




echo ''
echo ' *************************************************************'
echo ' *****************************************  installing viz... '
echo ' *************************************************************'

# install bccvl visualiser
mkdir /var/bccvlviz
chown vagrant:vagrant /var/bccvlviz
sudo -u vagrant git clone https://github.com/jcu-eresearch/BCCVL_Visualiser.git /var/bccvlviz
pushd /var/bccvlviz/BCCVL_Visualiser
sudo -u vagrant virtualenv .
sudo -u vagrant ./bin/pip install setuptools --upgrade
# sudo -u vagrant ./bin/pip install numpy==1.8.2
sudo -u vagrant ./bin/pip install numpy
sudo -u vagrant curl https://bootstrap.pypa.io/bootstrap-buildout.py > bootstrap.py
sudo -u vagrant cp /vagrant/vagrant-setup/versions.cfg ./buildout.d
sudo -u vagrant cp /vagrant/vagrant-setup/gis_compile.cfg ./buildout.d
sudo -u vagrant ./bin/python ./bootstrap.py
sudo -u vagrant ./bin/buildout
popd

# add visualiser to supervisord.conf

echo "[program:bccvlviz]"            >> /etc/supervisord.conf
echo "command=/var/bccvlviz/BCCVL_Visualiser/bin/pserve /var/bccvlviz/BCCVL_Visualiser/development.ini" >> /etc/supervisord.conf
echo "priority=999"                  >> /etc/supervisord.conf
echo "autostart=true"                >> /etc/supervisord.conf
echo "autorestart=true"              >> /etc/supervisord.conf
echo "startsecs=10"                  >> /etc/supervisord.conf
echo "startretries=3"                >> /etc/supervisord.conf
echo "exitcodes=0,2"                 >> /etc/supervisord.conf
echo "stopsignal=QUIT"               >> /etc/supervisord.conf
echo "stopwaitsecs=10"               >> /etc/supervisord.conf
echo "user=vagrant"                  >> /etc/supervisord.conf
echo "log_stdout=true"               >> /etc/supervisord.conf
echo "log_stderr=true"               >> /etc/supervisord.conf
echo "logfile=/var/log/bccvlviz.log" >> /etc/supervisord.conf
echo "logfile_maxbytes=1MB"          >> /etc/supervisord.conf
echo "logfile_backups=10"            >> /etc/supervisord.conf

## mapserver needs to know where to find proj.  This sets the
## env var that mapserver checks to get the proj path.
# echo 'environment = PROJ_LIB="/usr/local/share/proj/"' >> /etc/supervisord.conf
# echo ""                              >> /etc/supervisord.conf
## STILL DOESN'T WORK mapserver still can't find it.  See below

## Okay so edit the frickin mapfile to add a config line
## specifying where the frickin proj projections are.
cp /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map.backup
sed -n 'H;${x;s/^\\n//;s/MAP\\s*\\n/&\\n    CONFIG "PROJ_LIB" "\\/usr\\/local\\/share\\/proj\\/"\\n\\n/;p;}' /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map.backup > /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map
service supervisord restart










echo ''
echo ' *************************************************************'
echo ' *********************************  installing viz prereqs... '
echo ' *************************************************************'

yum install -y libpng libpng-devel freetype gd gd-devel
yum install -y zlib giflib-devel gcc

#### yum install -y proj
#### compile proj, yum install doesn't work for some reason?
wget -nv http://download.osgeo.org/proj/proj-4.8.0.tar.gz
tar -zxvf proj-4.8.0.tar.gz
pushd proj-4.8.0
./configure
make
make check
make install
popd

### add proj path to everyone's environment
# echo ""                                       >> /etc/bashrc
# echo 'export PROJ_LIB=/usr/local/share/proj/' >> /etc/bashrc
## DOESN'T WORK mapserver still doesn't know where proj is.
## See later for additonal attempts to fix this.

yum install -y libcurl agg agg-devel readline-devel zlib-devel
yum install -y libxml2-devel geos-devel gcc-c++ curl-devel
yum install -y libtiff libgeotiff libjpeg geos libxml2

wget -nv http://proj.badc.rl.ac.uk/cedaservices/raw-attachment/ticket/670/armadillo-3.800.2-1.el6.x86_64.rpm
yum localinstall -y armadillo-3*.rpm
yum install -y gdal gdal-devel

# scipy needs this..
yum install -y atlas atlas-devel blas blas-devel lapack lapack-devel

echo ''
echo ' *************************************************************'
echo ' *****************************************  installing viz... '
echo ' *************************************************************'

# install bccvl visualiser
mkdir /var/bccvlviz
chown vagrant:vagrant /var/bccvlviz
sudo -u vagrant git clone https://github.com/jcu-eresearch/BCCVL_Visualiser.git /var/bccvlviz
pushd /var/bccvlviz/BCCVL_Visualiser
sudo -u vagrant /usr/local/bin/virtualenv-2.7 .
sudo -u vagrant ./bin/pip2.7 install setuptools --upgrade
sudo -u vagrant ./bin/pip2.7 install numpy==1.8.2
sudo -u vagrant ./bin/python2.7 ./bootstrap.py
sudo -u vagrant ./bin/buildout
popd

# add visualiser to supervisord.conf

echo "[program:bccvlviz]"            >> /etc/supervisord.conf
echo "command=/var/bccvlviz/BCCVL_Visualiser/bin/pserve /var/bccvlviz/BCCVL_Visualiser/development.ini" >> /etc/supervisord.conf
echo "priority=999"                  >> /etc/supervisord.conf
echo "autostart=true"                >> /etc/supervisord.conf
echo "autorestart=true"              >> /etc/supervisord.conf
echo "startsecs=10"                  >> /etc/supervisord.conf
echo "startretries=3"                >> /etc/supervisord.conf
echo "exitcodes=0,2"                 >> /etc/supervisord.conf
echo "stopsignal=QUIT"               >> /etc/supervisord.conf
echo "stopwaitsecs=10"               >> /etc/supervisord.conf
echo "user=vagrant"                  >> /etc/supervisord.conf
echo "log_stdout=true"               >> /etc/supervisord.conf
echo "log_stderr=true"               >> /etc/supervisord.conf
echo "logfile=/var/log/bccvlviz.log" >> /etc/supervisord.conf
echo "logfile_maxbytes=1MB"          >> /etc/supervisord.conf
echo "logfile_backups=10"            >> /etc/supervisord.conf

## mapserver needs to know where to find proj.  This sets the
## env var that mapserver checks to get the proj path.
# echo 'environment = PROJ_LIB="/usr/local/share/proj/"' >> /etc/supervisord.conf
# echo ""                              >> /etc/supervisord.conf
## STILL DOESN'T WORK mapserver still can't find it.  See below

## Okay so edit the frickin mapfile to add a config line
## specifying where the frickin proj projections are.
cp /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map.backup
sed -n 'H;${x;s/^\\n//;s/MAP\\s*\\n/&\\n    CONFIG "PROJ_LIB" "\\/usr\\/local\\/share\\/proj\\/"\\n\\n/;p;}' /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map.backup > /var/bccvlviz/BCCVL_Visualiser/map_files/default_raster.map
service supervisord restart


echo ''
echo ' *************************************************************'
echo ' ************************  shell level provisioning all done! '
echo ' *************************************************************'

echo ''
SCRIPT_TERMINATOR


# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
    # Vagrant configuration happens here.
    config.vm.box     = "centos/7"

    # Disable automatic box update checking?  Not recommended.
    # config.vm.box_check_update = false

    # Port forwarding
    config.vm.network "forwarded_port", guest: 8080, host: 8080
    config.vm.network "forwarded_port", guest: 10600, host: 10600

    # Agent forwarding on SSH?
    # config.ssh.forward_agent = true

    # Share additional folders
    config.vm.synced_folder ".", "/vagrant", type: "rsync", rsync__args: ["--verbose", "--archive", "--delete", "-z"]

    config.vm.synced_folder "./webapp", "/var/climaswebapp"
    # config.vm.synced_folder "./webapp", "/var/climaswebapp", type: "rsync", rsync__args: ["--verbose", "--archive", "--delete", "-z"]

    config.vm.synced_folder "./testdata", "/var/climaswebapp-testdata"
    # config.vm.synced_folder "./testdata", "/var/climaswebapp-testdata", type: "rsync", rsync__args: ["--verbose", "--archive", "--delete", "-z"]

    # config.vm.synced_folder "/Volumes/DanielsDisk/work/CliMAS-NG/datasubset", "/var/climaswebapp-subset"
    # config.vm.synced_folder "/Volumes/DanielsDisk/work/CliMAS-NG/regions-output", "/var/climaswebapp-regions"

    # Provider-specific config
    # Example for VirtualBox:
    # config.vm.provider "virtualbox" do |vb|
    #   # Don't boot with headless mode
    #   vb.gui = true
    #
    #   # Use VBoxManage to customize the VM. For example to change memory:
    #   vb.customize ["modifyvm", :id, "--memory", "1024"]
    # end
    config.vm.provider :virtualbox do |vb|
        # vb.customize ["modifyvm", :id, "--ioapic", "on"]
        vb.name = "CliMAS Global"
        vb.cpus = 1
        vb.memory = 1024
    end

    # provision the VM via a shell script, provided inline (as a variable, set above)
    config.vm.provision :shell, :inline => $install_provisioning

    # setup the VM every boot
    config.vm.provision :shell, :inline => $boot_provisioning, :run => "always"





end
