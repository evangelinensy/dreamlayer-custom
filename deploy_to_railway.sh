#!/bin/bash

echo "🚀 Deploying DreamLayer to Railway..."

# Install Railway CLI if not already installed
if ! command -v railway &> /dev/null; then
    echo "Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway (will open browser)
echo "Please login to Railway in the browser that opens..."
railway login

# Create new project
echo "Creating Railway project..."
railway init

# Set environment variables
echo "Setting up environment variables..."
railway variables set PYTHON_VERSION=3.11
railway variables set PORT=5002

# Deploy
echo "Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "Your API will be available at: https://your-project-name.railway.app"
echo "Update your frontend with this URL!"
