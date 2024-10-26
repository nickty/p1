#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Update the server
echo "Updating server..."
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm (using a more recent version)
echo "Installing Node.js and npm..."
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Navigate to the application directory
echo "Navigating to application directory..."
cd /var/www/crm-app

# Stash any local changes
echo "Stashing local changes..."
git stash

# Fetch the latest changes from the remote repository
echo "Fetching latest changes..."
git fetch origin main

# Reset the local branch to match the remote main branch
echo "Resetting to latest main branch..."
git reset --hard origin/main

# Install backend dependencies
echo "Installing backend dependencies..."
npm ci

# Navigate to client directory
echo "Navigating to client directory..."
cd client

# Install frontend dependencies and build
echo "Installing frontend dependencies and building..."
npm ci
npm run build

# Navigate back to the root directory
echo "Navigating back to root directory..."
cd ..

# Restart the application
echo "Restarting the application..."
pm2 restart crm-app || pm2 start npm --name "crm-app" -- start

echo "Deployment completed successfully!"