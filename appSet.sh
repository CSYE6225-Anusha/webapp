#!/bin/bash
sudo mkdir -p /opt/csye6225/app

sudo cp /tmp/webapp.zip /opt/csye6225/app/

cd /opt/csye6225/app && sudo unzip webapp.zip -d webapp

cd webapp

# Update system packages
sudo apt-get update -y

# Install required dependencies (gcc-c++ and make)
sudo apt-get install gcc g++ make -y

# Install Node.js 14.x
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node -v

pwd
sudo chown -R csye6225:csye6225 /opt/csye6225/app
sudo chmod -R 755 /opt/csye6225/app/webapp
ls -al


sudo npm install