#!/bin/bash
# Automated Testmo Setup Script
# This script automates as much of the Testmo setup as possible

set -e

echo "🚀 Automated Testmo Setup"
echo "========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Testmo CLI is installed
echo "📦 Checking Testmo CLI installation..."
if command -v testmo &> /dev/null; then
    TESTMO_VERSION=$(testmo --version 2>/dev/null || echo "installed")
    echo -e "${GREEN}✅ Testmo CLI found: ${TESTMO_VERSION}${NC}"
else
    echo -e "${YELLOW}⚠️  Testmo CLI not found. Installing...${NC}"
    npm install -g @testmo/testmo-cli
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Testmo CLI installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install Testmo CLI${NC}"
        exit 1
    fi
fi

echo ""

# Check for .env file
ENV_FILE=".env"
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

echo ""

# Prompt for Testmo configuration
echo "🔧 Testmo Configuration"
echo "----------------------"

# Check if TESTMO_INSTANCE is already set
if grep -q "TESTMO_INSTANCE=" .env 2>/dev/null && ! grep -q "TESTMO_INSTANCE=your-instance" .env; then
    EXISTING_INSTANCE=$(grep "TESTMO_INSTANCE=" .env | cut -d '=' -f2)
    echo -e "${GREEN}✅ TESTMO_INSTANCE already configured: ${EXISTING_INSTANCE}${NC}"
else
    read -p "Enter your Testmo instance URL (e.g., your-company.testmo.net): " TESTMO_INSTANCE
    if [ -z "$TESTMO_INSTANCE" ]; then
        echo -e "${YELLOW}⚠️  Skipping Testmo instance configuration${NC}"
    else
        # Remove existing TESTMO_INSTANCE line if present
        sed -i.bak '/^TESTMO_INSTANCE=/d' .env 2>/dev/null || true
        echo "TESTMO_INSTANCE=${TESTMO_INSTANCE}" >> .env
        echo -e "${GREEN}✅ TESTMO_INSTANCE configured${NC}"
    fi
fi

echo ""

# Check if TESTMO_PROJECT_ID is already set
if grep -q "TESTMO_PROJECT_ID=" .env 2>/dev/null && ! grep -q "TESTMO_PROJECT_ID=your-project" .env; then
    EXISTING_PROJECT=$(grep "TESTMO_PROJECT_ID=" .env | cut -d '=' -f2)
    echo -e "${GREEN}✅ TESTMO_PROJECT_ID already configured: ${EXISTING_PROJECT}${NC}"
else
    read -p "Enter your Testmo Project ID: " TESTMO_PROJECT_ID
    if [ -z "$TESTMO_PROJECT_ID" ]; then
        echo -e "${YELLOW}⚠️  Skipping Testmo project ID configuration${NC}"
    else
        # Remove existing TESTMO_PROJECT_ID line if present
        sed -i.bak '/^TESTMO_PROJECT_ID=/d' .env 2>/dev/null || true
        echo "TESTMO_PROJECT_ID=${TESTMO_PROJECT_ID}" >> .env
        echo -e "${GREEN}✅ TESTMO_PROJECT_ID configured${NC}"
    fi
fi

echo ""

# Optional API key
read -p "Enter Testmo API Key (optional, press Enter to skip): " TESTMO_API_KEY
if [ ! -z "$TESTMO_API_KEY" ]; then
    sed -i.bak '/^TESTMO_API_KEY=/d' .env 2>/dev/null || true
    echo "TESTMO_API_KEY=${TESTMO_API_KEY}" >> .env
    echo -e "${GREEN}✅ TESTMO_API_KEY configured${NC}"
fi

# Clean up backup files
rm -f .env.bak 2>/dev/null || true

echo ""
echo "🔐 Setting up authentication..."

# Load environment variables
export $(grep -v '^#' .env | xargs)

if [ ! -z "$TESTMO_INSTANCE" ]; then
    echo "Attempting to authenticate with Testmo..."
    testmo auth:login --instance "$TESTMO_INSTANCE" || {
        echo -e "${YELLOW}⚠️  Authentication requires interactive login${NC}"
        echo "Please run manually: testmo auth:login --instance ${TESTMO_INSTANCE}"
    }
else
    echo -e "${YELLOW}⚠️  Skipping authentication (no instance configured)${NC}"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Verify setup: npm run testmo:verify"
echo "2. Test submission: npm run testmo:submit"
echo "3. Set up scheduling in Testmo UI"
echo ""

