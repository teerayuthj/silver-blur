# Silver Price Blur System Makefile

.PHONY: help install build build-dev watch clean test release

# Default target
help:
	@echo "Silver Price Blur System - Build Commands"
	@echo "========================================="
	@echo "make install     - Install dependencies"
	@echo "make build       - Build production version"
	@echo "make build-dev   - Build development version"
	@echo "make watch       - Watch and rebuild on changes"
	@echo "make clean       - Clean build artifacts"
	@echo "make test        - Test the built version"
	@echo "make release     - Release new version (patch)"
	@echo "make release-minor - Release minor version"
	@echo "make release-major - Release major version"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install

# Build production version
build: install
	@echo "🔨 Building production version..."
	npm run build
	@echo "✅ Build completed! Files in dist/"

# Build development version
build-dev: install
	@echo "🔨 Building development version..."
	npm run build:dev
	@echo "✅ Development build completed!"

# Watch for changes and rebuild
watch: install
	@echo "👀 Watching for changes..."
	npm run watch

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	npm run clean

# Test built version
test: build
	@echo "🧪 Testing built version..."
	@if [ -f "dist/silver-blur.min.js" ]; then \
		echo "✅ silver-blur.min.js exists"; \
	else \
		echo "❌ silver-blur.min.js not found"; \
		exit 1; \
	fi
	@if [ -f "dist/silver-blur.css" ]; then \
		echo "✅ silver-blur.css exists"; \
	else \
		echo "❌ silver-blur.css not found"; \
		exit 1; \
	fi
	@if [ -f "dist/config/holidays.json" ]; then \
		echo "✅ holidays.json exists"; \
	else \
		echo "❌ holidays.json not found"; \
		exit 1; \
	fi
	@echo "✅ All files present and ready to use!"

# Release new version
release:
	@echo "🚀 Creating new patch release..."
	./release.sh patch

release-minor:
	@echo "🚀 Creating new minor release..."
	./release.sh minor

release-major:
	@echo "🚀 Creating new major release..."
	./release.sh major