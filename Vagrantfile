# -*- mode: ruby -*-
# vi: set ft=ruby :

# here's a shell script to get stuff set up
$provisioning_script = <<SCRIPT_TERMINATOR
# now in shell script..
echo ''
echo ' *************************************************************'
echo ' ******************************  installing OS-level stuff... '
echo ' *************************************************************'

yum install -y yum-plugin-priorities
wget -nv http://sherkin.justhub.org/el6/RPMS/x86_64/justhub-release-2.0-4.0.el6.x86_64.rpm
rpm -Uvh justhub-release-*.rpm
yum repolist

echo ''
echo ' *************************************************************'
echo ' **************************************  installing python... '
echo ' *************************************************************'

# get zlib, ssl, sqlite
yum install -y zlib-devel openssl-devel sqlite-devel

# get python source and compile it (EPEL doesn't have Python 2.7)
wget -nv http://www.python.org/ftp/python/2.7.6/Python-2.7.6.tar.xz
xz -d Python-2.7.6.tar.xz
tar -xvf Python-2.7.6.tar
pushd Python-2.7.6
./configure --prefix=/usr/local
make
make altinstall
popd

# pip and setuptools
wget -nv https://bootstrap.pypa.io/get-pip.py
/usr/local/bin/python2.7 get-pip.py

# virtualenv
/usr/local/bin/pip2.7 install virtualenv


# echo ''
# echo ' *************************************************************'
# echo ' ********************************  installing pandoc & tex... '
# echo ' *************************************************************'

__=' ***** commenting out the haskell stuff..
# haskell
yum install -y haskell
# pandoc
cabal update
cabal install pandoc
# laTeX
yum install -y texlive
****** end of haskell disabler ***** '

echo ''
echo ' *************************************************************'
echo ' **************************************  installing CliMAS... '
echo ' *************************************************************'

# on a vagrant machine, the project dir is shared in at /vagrant,
# which is a bit vagrant-specific for me to add that path to the
# example ini files.  Instead this Vagrantfile maps the
# project's ./webapp/ dir to /var/climaswebapp/ on the VM, and uses
# that as the path for the production ini file.

# do project setup as non-superuser
su vagrant
pushd /var/climaswebapp/
/usr/local/bin/virtualenv-2.7 .
./bin/pip install setuptools --upgrade
./bin/python setup.py install
popd
exit

echo ''
echo ' *************************************************************'
echo ' ************************  shell level provisioning all done! '
echo ' *************************************************************'

echo ''
SCRIPT_TERMINATOR


# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box     = "centos-65-x64-vbox4.3.6"
  # config.vm.box_url = "https://github.com/2creatives/vagrant-centos/releases/download/v6.5.3/centos65-x86_64-20140116.box"
  config.vm.box_url = "http://puppet-vagrant-boxes.puppetlabs.com/centos-65-x64-virtualbox-nocm.box"

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  # config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  # config.vm.network "private_network", ip: "192.168.33.10"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # If true, then any SSH connections made will enable agent forwarding.
  # Default value: false
  # config.ssh.forward_agent = true

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.synced_folder "./webapp", "/var/climaswebapp"

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  # config.vm.provider "virtualbox" do |vb|
  #   # Don't boot with headless mode
  #   vb.gui = true
  #
  #   # Use VBoxManage to customize the VM. For example to change memory:
  #   vb.customize ["modifyvm", :id, "--memory", "1024"]
  # end
  #
  # View the documentation for the provider you're using for more
  # information on available options.

  # provision the VM via these shell commands, provided inline (as a var)
  config.vm.provision :shell, :inline => $provisioning_script

  # (commented out examples for other provisioners removed..)
end
