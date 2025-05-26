#!/bin/bash

# Cloudflare Pages Deployment Script for K-12 E-Signature Analysis Tool
# This script automates the deployment process to Cloudflare Pages

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}"
echo "================================================"
echo "  K-12 E-Signature Analysis Tool Deployment"
echo "  Cloudflare Pages Deployment Script"
echo "================================================"
echo -e "${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Installing..."
    npm install -g wrangler
    print_success "Wrangler CLI installed successfully"
fi

# Check if user is logged in to Cloudflare
print_status "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    print_warning "Not logged in to Cloudflare. Please log in:"
    wrangler auth login
    print_success "Successfully logged in to Cloudflare"
else
    print_success "Already authenticated with Cloudflare"
fi

# Validate project files
print_status "Validating project files..."

required_files=("index.html" "styles.css" "script.js" "wrangler.toml" "package.json")
missing_files=()

for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    print_error "Missing required files: ${missing_files[*]}"
    exit 1
fi

print_success "All required files found"

# Check for sample data directory
if [[ ! -d "sample-data" ]]; then
    print_status "Creating sample-data directory..."
    mkdir -p sample-data
    
    # Create a sample CSV file if it doesn't exist
    if [[ ! -f "sample-data/sample.csv" ]]; then
        cat > sample-data/sample.csv << EOF
Form Name,Count,Type
Digital Citizenship Agreement,1239,Policy
Faculty Contract,213,Contract
Device Acceptance Form,173,Administrative
Parent Permission Form,89,Consent
Reimbursement Form,156,Administrative
Athletic Code of Conduct,705,Policy
EOF
        print_success "Created sample CSV file"
    fi
fi

# Environment selection
if [[ "$1" == "preview" ]]; then
    ENVIRONMENT="preview"
    print_status "Deploying to PREVIEW environment"
else
    ENVIRONMENT="production"
    print_status "Deploying to PRODUCTION environment"
fi

# Pre-deployment validation
print_status "Running pre-deployment checks..."

# Check HTML syntax (basic check)
if command -v tidy &> /dev/null; then
    if ! tidy -q -e index.html; then
        print_warning "HTML validation warnings found, but continuing deployment"
    else
        print_success "HTML validation passed"
    fi
fi

# Check if CSS and JS files are valid (basic check)
if [[ -s "styles.css" && -s "script.js" ]]; then
    print_success "CSS and JavaScript files are not empty"
else
    print_error "CSS or JavaScript files appear to be empty"
    exit 1
fi

# Deploy to Cloudflare Pages
print_status "Starting deployment to Cloudflare Pages..."

if [[ "$ENVIRONMENT" == "preview" ]]; then
    wrangler pages deploy . --project-name="school-esignature-analysis" --branch="preview"
else
    wrangler pages deploy . --project-name="school-esignature-analysis" --branch="main"
fi

DEPLOY_EXIT_CODE=$?

if [[ $DEPLOY_EXIT_CODE -eq 0 ]]; then
    print_success "Deployment completed successfully!"
    
    # Display deployment info
    echo ""
    echo -e "${GREEN}🚀 Deployment Information:${NC}"
    echo "  Project: school-esignature-analysis"
    echo "  Environment: $ENVIRONMENT"
    echo "  Platform: Cloudflare Pages"
    
    if [[ "$ENVIRONMENT" == "production" ]]; then
        echo "  URL: https://school-esignature-analysis.pages.dev"
        echo "  Custom Domain: (Configure in Cloudflare dashboard if needed)"
    else
        echo "  Preview URL: (Check Cloudflare dashboard for preview link)"
    fi
    
    echo ""
    echo -e "${BLUE}📊 Features Deployed:${NC}"
    echo "  ✅ Interactive analysis dashboard"
    echo "  ✅ CSV upload and analysis"
    echo "  ✅ Smart form classification"
    echo "  ✅ Mobile responsive design"
    echo "  ✅ Security headers and optimizations"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "  1. Test the deployment at the provided URL"
    echo "  2. Configure custom domain in Cloudflare dashboard (optional)"
    echo "  3. Set up analytics in Cloudflare dashboard (optional)"
    echo "  4. Monitor performance and usage metrics"
    echo ""
    
else
    print_error "Deployment failed with exit code: $DEPLOY_EXIT_CODE"
    exit 1
fi

# Optional: Run post-deployment tests
if [[ "$2" == "test" ]]; then
    print_status "Running post-deployment tests..."
    
    # Basic smoke test - check if the site responds
    if [[ "$ENVIRONMENT" == "production" ]]; then
        SITE_URL="https://school-esignature-analysis.pages.dev"
    else
        print_warning "Preview URL testing requires manual verification"
        exit 0
    fi
    
    if command -v curl &> /dev/null; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
        if [[ "$HTTP_STATUS" == "200" ]]; then
            print_success "Site is responding correctly (HTTP $HTTP_STATUS)"
        else
            print_error "Site returned HTTP $HTTP_STATUS"
            exit 1
        fi
    else
        print_warning "curl not available for smoke testing"
    fi
fi

print_success "All deployment tasks completed successfully! 🎉"