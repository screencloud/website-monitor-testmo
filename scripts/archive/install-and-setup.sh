#!/bin/bash
# Complete Installation and Setup Script
# Installs dependencies, browsers, and sets up Testmo

set -e

echo "🚀 Complete Website Monitor Setup"
echo "=================================="
echo ""

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Warning: Node.js 18+ required. Current: $(node --version)"
    echo "   Please upgrade Node.js or use nvm: nvm install 18 && nvm use 18"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium
echo "✅ Browsers installed"
echo ""

# Verify setup
echo "🔍 Verifying setup..."
npm run verify
echo ""

# Install Testmo CLI
echo "📦 Installing Testmo CLI..."
npm install -g @testmo/testmo-cli || {
    echo "⚠️  Failed to install globally, trying local install..."
    npm install @testmo/testmo-cli --save-dev
}
echo "✅ Testmo CLI ready"
echo ""

# Run Testmo setup
echo "🔧 Running Testmo setup..."
npm run testmo:auto-setup || {
    echo "⚠️  Interactive setup skipped. Run manually: npm run testmo:auto-setup"
}

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Quick Commands:"
echo "  npm test              - Run tests"
echo "  npm run testmo:verify - Verify Testmo setup"
echo "  npm run testmo:submit - Submit to Testmo"
echo "  npm run server        - Start API server"
echo ""

