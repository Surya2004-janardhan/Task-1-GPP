#!/bin/sh

echo "Starting authentication microservice..."

crond

echo "Starting Node.js application on port 8080..."
exec node app.js