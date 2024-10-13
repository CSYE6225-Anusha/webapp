#!/bin/bash
sudo mkdir -p /opt/csye6225/app

sudo cp /tmp/webapp-main.zip /opt/csye6225/app/

cd /opt/csye6225/app && sudo unzip webapp-main.zip

cd webapp-main

# Update system packages
sudo apt-get update -y

# Install required dependencies (gcc-c++ and make)
sudo apt-get install gcc g++ make -y

# Install Node.js 14.x
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node -v

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service and enable it on boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create and Alter PostgreSQL user and database
POSTGRES_PASSWORD="1234"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';"
sudo -u postgres createdb dev
sudo -u postgres createdb test


# Change directory to your project
# Example: cd yourproject
# Install project dependencies

ls -al

npm install


