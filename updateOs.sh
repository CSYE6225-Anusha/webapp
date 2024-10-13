#!/bin/bash

set -e

sudo apt-get update
sudo apt-get upgrade -y
sudo apt install unzip -y
sudo apt-get clean
