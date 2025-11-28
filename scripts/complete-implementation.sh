#!/bin/bash
# Complete Implementation Script
# Does everything that can be automated

set -e

echo "🚀 Complete Implementation"
echo "=========================="
echo ""

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Step 1: Ensure Node.js 18+
echo "1️⃣ Checking Node.js version..."
CURRENT_NODE=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$CURRENT_NODE" -lt 18 ]; then
    echo "   ⚠️  Current: $(node --version), need 18+"
    echo "   📦 Installing Node.js 18..."
    nvm install 18 --latest-npm
    nvm use 18
    echo "   ✅ Node.js 18 installed and activated"
else
    echo "   ✅ Node.js version: $(node --version)"
fi
echo ""

# Step 2: Install dependencies
echo "2️⃣ Installing dependencies..."
npm install
echo "   ✅ Dependencies installed"
echo ""

# Step 3: Install Playwright browsers
echo "3️⃣ Installing Playwright browsers..."
npx playwright install chromium
echo "   ✅ Browsers installed"
echo ""

# Step 4: Create directories
echo "4️⃣ Creating directories..."
mkdir -p test-results/screenshots
echo "   ✅ Directories created"
echo ""

# Step 5: Verify setup
echo "5️⃣ Verifying setup..."
npm run verify 2>&1 | grep -E "(✅|❌|⚠️)" | head -15 || true
echo ""

# Step 6: Check Testmo CLI
echo "6️⃣ Checking Testmo CLI..."
if command -v testmo &> /dev/null; then
    echo "   ✅ Testmo CLI: $(testmo --version)"
else
    echo "   📦 Installing Testmo CLI..."
    npm install -g @testmo/testmo-cli
    echo "   ✅ Testmo CLI installed"
fi
echo ""

# Step 7: Verify Playwright config
echo "7️⃣ Verifying Playwright configuration..."
if grep -q "junit.*test-results/junit.xml" playwright.config.js; then
    echo "   ✅ JUnit XML reporter configured"
else
    echo "   ❌ JUnit XML not configured"
    exit 1
fi
echo ""

# Step 8: Check Testmo configuration
echo "8️⃣ Checking Testmo configuration..."
if [ -f .env ]; then
    source <(grep -v '^#' .env | grep -v '^$' | sed 's/^/export /' 2>/dev/null || true)
fi

MISSING=0
if [ -z "$TESTMO_INSTANCE" ] || [ "$TESTMO_INSTANCE" = "your-instance.testmo.net" ]; then
    echo "   ⚠️  TESTMO_INSTANCE not configured"
    MISSING=1
else
    echo "   ✅ TESTMO_INSTANCE: $TESTMO_INSTANCE"
fi

if [ -z "$TESTMO_PROJECT_ID" ] || [ "$TESTMO_PROJECT_ID" = "your-project-id" ]; then
    echo "   ⚠️  TESTMO_PROJECT_ID not configured"
    MISSING=1
else
    echo "   ✅ TESTMO_PROJECT_ID: $TESTMO_PROJECT_ID"
fi
echo ""

# Step 9: Summary
echo "📊 Implementation Summary"
echo "========================="
echo ""

if [ $MISSING -eq 0 ]; then
    echo "✅ All automated steps complete!"
    echo ""
    echo "Ready to submit tests:"
    echo "  npm run testmo:submit"
else
    echo "✅ Automated setup complete!"
    echo ""
    echo "⚠️  To complete, configure Testmo:"
    echo "  1. Edit .env file with your Testmo credentials"
    echo "  2. Or run: npm run testmo:auto-setup"
    echo ""
    echo "Then run:"
    echo "  npm run testmo:verify"
    echo "  npm run testmo:submit"
fi

echo ""
echo "✅ Implementation complete!"
echo ""

