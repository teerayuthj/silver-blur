#!/bin/bash

# Silver Price Blur Release Script
# Usage: ./release.sh [patch|minor|major]

VERSION_TYPE=${1:-patch}

echo "🚀 Starting release process..."
echo "📝 Version type: $VERSION_TYPE"

# Update version
echo "📈 Updating version..."
npm run version:$VERSION_TYPE

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✨ New version: v$NEW_VERSION"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Git operations
    echo "📦 Committing changes..."
    git add .
    git commit -m "Release v$NEW_VERSION - Update holidays and build"
    
    echo "🏷️  Creating git tag..."
    git tag "v$NEW_VERSION"
    
    echo "📤 Pushing to repository..."
    git push origin main
    git push origin "v$NEW_VERSION"
    
    echo ""
    echo "🎉 Release v$NEW_VERSION completed!"
    echo ""
    echo "📋 CDN URLs:"
    echo "   JS:  https://cdn.jsdelivr.net/gh/teerayuthj/silver-blur@v$NEW_VERSION/dist/silver-blur.min.js"
    echo "   CSS: https://cdn.jsdelivr.net/gh/teerayuthj/silver-blur@v$NEW_VERSION/dist/silver-blur.css"
    echo ""
    echo "💡 CDN Usage:"
    echo "   <script src=\"https://cdn.jsdelivr.net/gh/teerayuthj/silver-blur@v$NEW_VERSION/dist/silver-blur.min.js\"></script>"
    echo "   <link rel=\"stylesheet\" href=\"https://cdn.jsdelivr.net/gh/teerayuthj/silver-blur@v$NEW_VERSION/dist/silver-blur.css\">"
    echo "   <script>initSilverBlurCDN('https://cdn.jsdelivr.net/gh/teerayuthj/silver-blur@v$NEW_VERSION/dist');</script>"
    
else
    echo "❌ Build failed!"
    exit 1
fi