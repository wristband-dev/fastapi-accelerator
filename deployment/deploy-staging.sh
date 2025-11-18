#!/bin/bash
set -e

echo "🚀 Deploying Full Stack to STAGING..."
echo "======================================"

# Get the root directory of the project
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Deploy Backend
echo ""
echo "📦 Step 1/2: Deploying Backend..."
echo "--------------------------------"
chmod +x backend/deployment/deploy-backend-staging.sh
./backend/deployment/deploy-backend-staging.sh

# Deploy Frontend
echo ""
echo "🎨 Step 2/2: Deploying Frontend..."
echo "---------------------------------"
chmod +x frontend/deployment/deploy-frontend-staging.sh
./frontend/deployment/deploy-frontend-staging.sh

echo ""
echo "✅ Full Stack Deployment to STAGING Complete!"
echo "=============================================="




