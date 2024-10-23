#!/bin/bash

# Update the server
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Navigate to the application directory
cd /var/www/crm-app

# Pull the latest changes from the main branch
git pull origin main

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Restart the application
pm2 restart crm-app