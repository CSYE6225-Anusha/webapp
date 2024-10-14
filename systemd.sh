#!/bin/bash

sudo cp /tmp/webapp.service /etc/systemd/system/webapp.service

sudo chown -R csye6225:csye6225 /opt/csye6225/webapp

# Reload the systemd daemon to recognize the new service
sudo systemctl daemon-reload

sudo systemctl enable webapp.service

