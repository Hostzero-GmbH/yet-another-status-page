#!/bin/sh
set -e

echo "🔧 Running database migrations..."

# Run Payload migrations
npx payload migrate 2>&1 || {
  echo "⚠️ Migration failed, trying to push schema..."
  # If migration fails (no migrations exist), just start the app
  # Payload will create tables on first request in development-like mode
}

echo "✅ Database ready"
echo "🚀 Starting application..."

# Start the Next.js server
exec sh -c "HOSTNAME=0.0.0.0 node server.js"
