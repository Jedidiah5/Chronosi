#!/bin/bash

echo "Starting Chronosi Backend..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if PostgreSQL is running (you may need to adjust this check)
echo "Checking database connection..."
cd backend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
fi

# Setup database tables
echo "Setting up database tables..."
npm run setup
if [ $? -ne 0 ]; then
    echo "Warning: Database setup failed. Make sure PostgreSQL is running."
    echo "Continuing anyway..."
fi

# Start the backend server
echo "Starting backend server..."
npm run dev
