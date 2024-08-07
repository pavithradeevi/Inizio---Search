#!/usr/bin/env bash

# Update package lists and install necessary dependencies
apt-get update && apt-get install -y wget gnupg
wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
apt-get update && apt-get install -y google-chrome-stable

# Check if Chrome is installed and output its path
echo "Checking Chrome installation path:"
which google-chrome
echo "Chrome version:"
google-chrome --version

# Install npm dependencies
npm install
