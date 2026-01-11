#!/bin/bash
#
# Run E2E tests in an isolated Docker environment
#
# Usage:
#   ./scripts/run-e2e-tests.sh              # Run all tests
#   ./scripts/run-e2e-tests.sh --headed     # Run with browser visible
#   ./scripts/run-e2e-tests.sh <test-file>  # Run specific test file
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.test.yml"
TEST_URL="http://localhost:3001"
PROJECT="hostzero-status-test"

echo -e "${YELLOW}🧪 Hostzero Status E2E Test Runner${NC}"
echo ""

# Parse arguments
PLAYWRIGHT_ARGS="--project=chromium"
while [[ $# -gt 0 ]]; do
  case $1 in
    --headed)
      PLAYWRIGHT_ARGS="$PLAYWRIGHT_ARGS --headed"
      shift
      ;;
    --debug)
      PLAYWRIGHT_ARGS="$PLAYWRIGHT_ARGS --debug"
      shift
      ;;
    --ui)
      PLAYWRIGHT_ARGS="$PLAYWRIGHT_ARGS --ui"
      shift
      ;;
    *)
      PLAYWRIGHT_ARGS="$PLAYWRIGHT_ARGS $1"
      shift
      ;;
  esac
done

# Cleanup function
cleanup() {
  echo ""
  echo -e "${YELLOW}🧹 Cleaning up test environment...${NC}"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Step 1: Clean up any existing test containers
echo -e "${YELLOW}📦 Setting up test environment...${NC}"
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true

# Step 2: Build and start test containers
echo -e "${YELLOW}🐳 Starting test containers...${NC}"
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build

# Step 3: Wait for the app to be healthy
echo -e "${YELLOW}⏳ Waiting for application to start (this may take a minute)...${NC}"

# Wait a bit for npm install to complete
sleep 30

MAX_RETRIES=60
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RESPONSE=$(curl -s "$TEST_URL/api/health" 2>&1 || true)
  if echo "$RESPONSE" | grep -q '"ok"'; then
    echo -e "${GREEN}✓ Application is ready${NC}"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}❌ Application failed to start after $MAX_RETRIES attempts${NC}"
    echo ""
    echo "Last response: $RESPONSE"
    echo ""
    echo "Container logs:"
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=100
    exit 1
  fi
  
  echo "  Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

# Step 4: Seed test data
echo ""
echo -e "${YELLOW}📦 Seeding test data...${NC}"
API_BASE="$TEST_URL" node tests/seed/seed-test-data.mjs

# Step 5: Run Playwright tests
echo ""
echo -e "${YELLOW}🎭 Running Playwright tests...${NC}"
echo ""

# Run tests with the test URL
PLAYWRIGHT_BASE_URL="$TEST_URL" CI= npx playwright test $PLAYWRIGHT_ARGS

TEST_EXIT_CODE=$?

# Step 6: Report results
echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "View the test report with: npm run test:e2e:report"
fi

exit $TEST_EXIT_CODE
