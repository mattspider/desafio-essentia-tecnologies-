#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting TechX Todo API..."
exec node dist/server.js
