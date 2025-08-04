#!/usr/bin/env bash

# IDK if this works 
# Use on your own risk

# Check for .env file
if [ ! -f "./.env" ]; then
  echo "Create a .env file in this directory and fill it with the correct information."
  read -n 1 -s -r -p "Press any key to exit..."
  echo
  exit 1
fi

# Run your npm commands
call npm run build
call npm run register

# Pause at the end
read -n 1 -s -r -p "Press any key to exit..."
echo
