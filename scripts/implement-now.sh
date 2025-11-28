#!/bin/bash
# Actual Implementation Script
# Runs everything that can be automated

set -e

echo "🚀 Starting Actual Implementation"
echo "=================================="
echo ""

# Load .env if it exists (skip comments and empty lines)
if [ -f .env ]; then
    set -a
    source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /')
    set +a
fi

# Step 1: Verify Testmo CLI
echo "1️⃣ Checking Testmo CLI..."
if command -v testmo &> /dev/null; then
    echo "   ✅ Testmo CLI: $(testmo --version)"
else
    echo "   📦 Installing Testmo CLI..."
    npm install -g @testmo/testmo-cli
    echo "   ✅ Installed"
fi
echo ""

# Step 2: Verify Playwright config
echo "2️⃣ Verifying Playwright configuration..."
if grep -q "junit.*test-results/junit.xml" playwright.config.js; then
    echo "   ✅ JUnit XML reporter configured"
else
    echo "   ❌ JUnit XML not configured"
    exit 1
fi
echo ""

# Step 3: Check environment variables
echo "3️⃣ Checking environment variables..."
MISSING_VARS=()

if [ -z "$TESTMO_INSTANCE" ] || [ "$TESTMO_INSTANCE" = "your-instance.testmo.net" ]; then
    MISSING_VARS+=("TESTMO_INSTANCE")
    echo "   ⚠️  TESTMO_INSTANCE not configured"
else
    echo "   ✅ TESTMO_INSTANCE: $TESTMO_INSTANCE"
fi

if [ -z "$TESTMO_PROJECT_ID" ] || [ "$TESTMO_PROJECT_ID" = "your-project-id" ]; then
    MISSING_VARS+=("TESTMO_PROJECT_ID")
    echo "   ⚠️  TESTMO_PROJECT_ID not configured"
else
    echo "   ✅ TESTMO_PROJECT_ID: $TESTMO_PROJECT_ID"
fi
echo ""

# Step 4: Check authentication
if [ ! -z "$TESTMO_INSTANCE" ] && [ "$TESTMO_INSTANCE" != "your-instance.testmo.net" ]; then
    echo "4️⃣ Checking Testmo authentication..."
    if testmo auth:status --instance "$TESTMO_INSTANCE" 2>/dev/null | grep -q "authenticated\|Logged in"; then
        echo "   ✅ Authenticated with Testmo"
    else
        echo "   ⚠️  Not authenticated. Run: testmo auth:login --instance $TESTMO_INSTANCE"
    fi
    echo ""
fi

# Step 5: Create test-results directory
echo "5️⃣ Setting up directories..."
mkdir -p test-results/screenshots
echo "   ✅ Directories created"
echo ""

# Step 6: Summary
echo "📊 Implementation Summary"
echo "========================="
echo ""

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "✅ All configuration complete!"
    echo ""
    echo "Ready to submit tests:"
    echo "  npm run testmo:submit"
else
    echo "⚠️  Missing configuration:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "To configure, edit .env file or run:"
    echo "  npm run testmo:auto-setup"
    echo ""
fi

echo "✅ Implementation check complete!"
echo ""

