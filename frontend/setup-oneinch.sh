#!/bin/bash

# 1inch API Integration Setup Script
echo "🚀 Setting up 1inch API Integration for KATA Protocol"
echo "================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install required dependencies if not already installed
echo "📦 Checking dependencies..."

# Check if recharts is installed (for charts)
if ! npm list recharts &> /dev/null; then
    echo "📊 Installing recharts for charts..."
    npm install recharts
fi

# Check if class-variance-authority is installed (for UI components)
if ! npm list class-variance-authority &> /dev/null; then
    echo "🎨 Installing class-variance-authority..."
    npm install class-variance-authority
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔑 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ Created .env.local file from .env.example"
    echo "⚠️  Please add your 1inch API key to .env.local"
else
    echo "✅ .env.local already exists"
fi

# Check if API key is set
if grep -q "your_1inch_api_key_here" .env.local 2>/dev/null; then
    echo "⚠️  Warning: Please replace 'your_1inch_api_key_here' with your actual 1inch API key"
    echo "   You can get one at: https://portal.1inch.dev/"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get your 1inch API key from https://portal.1inch.dev/"
echo "2. Add it to .env.local:"
echo "   NEXT_PUBLIC_ONEINCH_API_KEY=your_actual_api_key"
echo "   ONEINCH_API_KEY=your_actual_api_key"
echo "3. Start the development server: npm run dev"
echo "4. Visit http://localhost:3000/oneinch to see the integration"
echo ""
echo "📚 Read ONEINCH_INTEGRATION.md for detailed documentation"
