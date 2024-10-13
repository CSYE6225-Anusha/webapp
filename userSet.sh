#!/bin/bash

set -e

sudo groupadd csye6225

sudo useradd -r -g csye6225 -s /usr/sbin/nologin csye6225

echo "User has been created successfully."






