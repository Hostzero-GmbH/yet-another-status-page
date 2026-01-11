#!/bin/sh
set -e

echo "🚀 Starting Hostzero Status..."
echo "🌐 Server starting on port ${PORT:-3000}..."

# Set hostname for Next.js
export HOSTNAME=0.0.0.0

# Start the Next.js server
# Payload will run migrations automatically on first request to /admin
exec node server.js
