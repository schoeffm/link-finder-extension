#!/bin/bash

# Create distribution package for Type-Ahead Find extension

# Create dist directory
mkdir -p dist

# Copy essential files
cp manifest.json dist/
cp content.js dist/
cp styles.css dist/
cp popup.html dist/
cp icon*.png dist/
cp README.md dist/

# Create zip for store submission
cd dist
zip -r ../type-ahead-find-extension.zip .
cd ..

echo "Extension packaged as type-ahead-find-extension.zip"
echo "Ready for store submission or distribution"