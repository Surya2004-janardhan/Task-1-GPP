#!/bin/sh

echo "Starting authentication microservice..."

# Start cron daemon as root
crond

# Start Node.js application
echo "Starting Node.js application on port 8080..."
exec node app.js