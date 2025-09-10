#!/bin/bash

# CyberPup Release Build Script
# This script builds the app for Google Play Store submission

echo "🚀 CyberPup Release Build Script"
echo "================================"
echo ""

# Check if release keystore exists
if [ ! -f "android/app/cyberpup-release-key.keystore" ]; then
    echo "❌ Release keystore not found!"
    echo "Please run ./scripts/generate-release-keystore.sh first"
    exit 1
fi

# Check if gradle.properties has keystore configuration
if ! grep -q "MYAPP_RELEASE_STORE_FILE" android/gradle.properties; then
    echo "❌ Release keystore not configured in gradle.properties!"
    echo "Please update android/gradle.properties with your keystore details"
    exit 1
fi

echo "📱 Building CyberPup for Google Play Store..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

# Build release AAB (Android App Bundle)
echo "🔨 Building release AAB..."
cd android
./gradlew bundleRelease
cd ..

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Release build completed successfully!"
    echo ""
    echo "📦 Your AAB file is located at:"
    echo "   android/app/build/outputs/bundle/release/app-release.aab"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload the AAB file to Google Play Console"
    echo "2. Complete the store listing information"
    echo "3. Fill out the Data Safety form"
    echo "4. Submit for review"
    echo ""
    echo "🎉 Good luck with your submission!"
else
    echo ""
    echo "❌ Build failed. Please check the error messages above."
    echo "Common issues:"
    echo "- Missing release keystore configuration"
    echo "- Invalid app icons (must be square)"
    echo "- Dependency version mismatches"
    exit 1
fi
