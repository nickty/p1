#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Function to log messages with timestamps
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
handle_error() {
    log_message "Error occurred in line $1"
    exit 1
}

# Set up error handling
trap 'handle_error $LINENO' ERR

# Update the server
log_message "Updating server..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm (using Node.js 18.x LTS)
log_message "Installing Node.js and npm..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    log_message "Node.js is already installed. Skipping installation."
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    log_message "Installing PM2..."
    sudo npm install -g pm2
else
    log_message "PM2 is already installed. Skipping installation."
fi

# Navigate to the application directory
log_message "Navigating to application directory..."
cd /var/www/crm-app || handle_error $LINENO

# Fetch the latest changes from the remote repository
log_message "Fetching latest changes..."
git fetch origin main

# Check if there are any changes
if git diff --quiet HEAD origin/main; then
    log_message "No changes detected. Skipping deployment."
    exit 0
fi

# Reset the local branch to match the remote main branch
log_message "Resetting to latest main branch..."
git reset --hard origin/main

# Install backend dependencies
log_message "Installing backend dependencies..."
npm ci --production

# Navigate to client directory
log_message "Navigating to client directory..."
cd client || handle_error $LINENO

# Install frontend dependencies and build
log_message "Installing frontend dependencies and building..."
npm ci --production
npm run build

# Navigate back to the root directory
log_message "Navigating back to root directory..."
cd ..

# Restart the application
log_message "Restarting the application..."
pm2 restart crm-app || pm2 start npm --name "crm-app" -- start

log_message "Deployment completed successfully!"
