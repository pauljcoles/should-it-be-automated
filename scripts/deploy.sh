#!/bin/bash

# Deployment script for Test Prioritisation Tool
# This script helps automate the deployment process

set -e  # Exit on error

echo "🚀 Test Prioritisation Tool - Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20.19+ or 22.12+"
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_warning "Node.js version is $NODE_VERSION. Recommended version is 20.19+ or 22.12+"
fi

# Step 1: Install dependencies
echo ""
print_info "Step 1: Installing dependencies..."
if npm ci; then
    print_success "Dependencies installed"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Run linter
echo ""
print_info "Step 2: Running linter..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed. Please fix errors before deploying."
    exit 1
fi

# Step 3: Run tests
echo ""
print_info "Step 3: Running tests..."
if npm test; then
    print_success "All tests passed"
else
    print_error "Tests failed. Please fix failing tests before deploying."
    exit 1
fi

# Step 4: Build for production
echo ""
print_info "Step 4: Building for production..."
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 5: Check bundle size
echo ""
print_info "Step 5: Checking bundle size..."
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    print_success "Build output size: $DIST_SIZE"
    
    # Check if assets directory exists
    if [ -d "dist/assets" ]; then
        echo ""
        echo "Asset sizes:"
        ls -lh dist/assets/ | grep -E '\.(js|css)$' | awk '{print "  " $9 ": " $5}'
    fi
else
    print_error "dist directory not found"
    exit 1
fi

# Step 6: Deployment options
echo ""
echo "================================================"
print_success "Pre-deployment checks complete!"
echo ""
echo "Choose deployment method:"
echo "  1) Netlify CLI"
echo "  2) Vercel CLI"
echo "  3) Manual (files ready in dist/)"
echo "  4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        print_info "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod
        else
            print_warning "Netlify CLI not installed"
            print_info "Install with: npm install -g netlify-cli"
            print_info "Then run: netlify login && netlify deploy --prod"
        fi
        ;;
    2)
        echo ""
        print_info "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            print_warning "Vercel CLI not installed"
            print_info "Install with: npm install -g vercel"
            print_info "Then run: vercel --prod"
        fi
        ;;
    3)
        echo ""
        print_success "Build files are ready in the dist/ directory"
        print_info "You can now manually upload these files to your hosting provider"
        ;;
    4)
        echo ""
        print_info "Exiting without deployment"
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "================================================"
print_success "Deployment process complete!"
echo ""
print_info "Next steps:"
echo "  1. Visit your deployment URL"
echo "  2. Verify all features work correctly"
echo "  3. Test on multiple browsers"
echo "  4. Share the URL with your team"
echo ""
print_info "See DEPLOYMENT_CHECKLIST.md for post-deployment verification"
