#!/bin/bash

# Official Google Android Keystore Generation Script
# Based on: https://developer.android.com/studio/publish/app-signing#generate-key

echo "🔐 Official Google Android Keystore Generator"
echo "============================================="
echo ""
echo "This script uses the EXACT command from Google's official documentation:"
echo "https://developer.android.com/studio/publish/app-signing#generate-key"
echo ""

# Check if keystore already exists
if [ -f "android/app/cyberpup-release-key.keystore" ]; then
    echo "⚠️  Release keystore already exists!"
    echo "Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Keystore generation cancelled."
        exit 0
    fi
fi

echo "This will generate a keystore using Google's official method."
echo "You'll be prompted for information during the process."
echo ""
echo "Press Enter to continue..."
read

# Official Google command (interactive version)
echo "Generating keystore using Google's official method..."
echo ""

keytool -genkeypair -v -keystore android/app/cyberpup-release-key.keystore \
    -alias cyberpup-key-alias -keyalg RSA -keysize 2048 -validity 10000

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully using Google's official method!"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update android/gradle.properties with your keystore details:"
    echo "   MYAPP_RELEASE_STORE_FILE=cyberpup-release-key.keystore"
    echo "   MYAPP_RELEASE_KEY_ALIAS=cyberpup-key-alias"
    echo "   MYAPP_RELEASE_STORE_PASSWORD=[your_store_password]"
    echo "   MYAPP_RELEASE_KEY_PASSWORD=[your_key_password]"
    echo ""
    echo "2. Add the keystore file to .gitignore to keep it secure"
    echo "3. Build your release APK/AAB with: npx expo run:android --variant release"
    echo ""
    echo "🔒 SECURITY REMINDER:"
    echo "- Keep your keystore file and passwords safe"
    echo "- You'll need them for all future app updates"
    echo "- Consider backing up the keystore to a secure location"
else
    echo ""
    echo "❌ Failed to generate keystore. Please check your input and try again."
    exit 1
fi
