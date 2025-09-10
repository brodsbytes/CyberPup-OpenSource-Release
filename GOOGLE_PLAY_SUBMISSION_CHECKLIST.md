# Google Play Store Submission Checklist for CyberPup

## ✅ COMPLETED ITEMS

### App Configuration
- [x] App name: "CyberPup"
- [x] Package name: `com.cyberpup.security`
- [x] Version: 1.0.0 (versionCode: 1)
- [x] Description: Comprehensive cybersecurity education app
- [x] Privacy policy: Complete and compliant
- [x] Terms of service: Complete and compliant
- [x] Analytics consent: Properly implemented with PostHog
- [x] App permissions: Minimal and appropriate (INTERNET, VIBRATE only)
- [x] Dependencies: Updated to match Expo SDK 53

### Technical Setup
- [x] Release signing configuration: Ready and configured
- [x] Build configuration: Updated for production
- [x] App configuration schema: Fixed invalid properties
- [x] Release AAB generated successfully: `android/app/build/outputs/bundle/release/app-release.aab`

## ❌ CRITICAL ITEMS TO COMPLETE **COMPLETED**

### 1. App Icons (URGENT - Will cause immediate rejection)
- [x] Fix `assets/icon.png` - must be exactly 1024x1024 pixels (currently 1024x1017)
- [x] Fix `assets/adaptive-icon.png` - must be exactly 1024x1024 pixels (currently 1024x1017)

### 2. Release Keystore Generation
- [x] Run: `./scripts/generate-release-keystore.sh`
- [x] Update `android/gradle.properties` with keystore details
- [x] Add keystore to `.gitignore`

### 3. Store Listing Assets (Required for submission)
- [x] App icon: 512x512 PNG (32-bit)
- [x] Feature graphic: 1024x500 PNG/JPEG
- [x] Screenshots: Minimum 2, recommended 5-8
  - Phone screenshots: 16:9 or 9:16 aspect ratio
  - Tablet screenshots (if supporting tablets): 16:10 or 10:16
- [n/a] Promo video (optional): YouTube URL

### 4. Store Listing Information
- [x] Short description: "Learn cybersecurity with interactive lessons and security checks"
- [x] Full description: Ready (see app.json description + expanded content)
- [x] App category: Education
- [ ] Content rating: Complete questionnaire
- [x] Contact details: cyberpupsecurity@proton.me

### 5. Data Safety Form (Required)
- [ ] Complete Data Safety section in Play Console
- [ ] Declare data collection practices
- [ ] Specify data sharing with third parties
- [ ] Detail data security practices

### 6. Testing & Quality Assurance
- [x] Test on multiple Android devices/versions
- [x] Verify all features work correctly
- [x] Test analytics consent flow
- [x] Verify privacy policy accessibility
- [x] Test breach checking functionality
- [x] Verify app doesn't crash on startup

## 📋 SUBMISSION PROCESS

### Step 1: Generate Release Build
```bash
# Generate release keystore first
./scripts/generate-release-keystore.sh

# Build release AAB (Android App Bundle)
npx expo run:android --variant release
```

### Step 2: Upload to Play Console
1. Go to Google Play Console
2. Create new app or select existing
3. Upload AAB file
4. Complete store listing
5. Fill out Data Safety form
6. Set up content rating
7. Configure pricing & distribution

### Step 3: Review & Publish
1. Submit for review
2. Monitor review status
3. Address any policy violations
4. Publish when approved

## 🔒 SECURITY CHECKLIST

- [x] Release keystore generated and secured
- [x] No debug information in release build
- [x] ProGuard/R8 enabled for code obfuscation
- [x] No hardcoded secrets in code
- [x] Analytics properly configured with consent
- [x] Privacy policy accessible in app

## 📱 COMPATIBILITY REQUIREMENTS

- [x] Target API level: 35 (Android 15) - Current requirement ✅
- [x] Minimum API level: 24 (Android 7.0) - Meets requirements ✅
- [x] Test on various screen sizes
- [x] Verify performance on older devices

## 🚨 COMMON REJECTION REASONS TO AVOID

1. **App Icons**: Must be square (1024x1024)
2. **Privacy Policy**: Must be accessible and comprehensive
3. **Data Safety**: Must accurately reflect data practices
4. **Permissions**: Must be justified and minimal
5. **Content**: Must comply with Google Play policies
6. **Functionality**: App must work as described

## 📞 SUPPORT CONTACTS

- **Developer Email**: cyberpupsecurity@proton.me
- **Privacy Policy**: Available in app and docs/reference/privacy-policy.txt
- **Terms of Service**: Available in app and docs/reference/tos.txt

---

**Last Updated**: September 2025
**Status**: Release AAB ready! 95% complete - just need store assets and submission
