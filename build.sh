#!/bin/bash

# Silver Price Blur Build Script
echo "🔨 Building Silver Price Blur System..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Build production version
echo "🏗️  Building production version..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo ""
    echo "📁 Generated files in dist/:"
    ls -la dist/
    echo ""
    echo "🚀 You can now use the minified version:"
    echo "   dist/silver-blur.min.js"
    echo "   dist/silver-blur.css"
    echo "   dist/config/holidays.json"
else
    echo "❌ Build failed!"
    exit 1
fi