# Apple App Store Submission Plan (Phase-Based) — CyberPup

This timeline groups everything you need into clear phases. Follow them in order. Each task is a checkbox you can tick off.

## Phase 0 — Prerequisites (Completed)
- [x] App name: "CyberPup"
- [x] Bundle identifier: `com.cyberpup.security`
- [x] Version: 1.0.0 (build: 1)
- [x] App description, privacy policy, terms of service
- [x] Expo SDK 53 dependencies, iOS config in `app.json`, release build config
- [x] Analytics consent (PostHog) implemented
- [x] Minimal permissions; encryption: `usesNonExemptEncryption: false`

## Phase 1 — Accounts & Access
- [x] Enroll in Apple Developer Program ($99/year) — individual or organization
- [x] Complete identity verification and payment
- [x] App Store Connect access set up; configure bank and tax info
- [x] Register bundle identifier `com.cyberpup.security` (Apple Developer Portal)

## Phase 2 — Build System (Linux + EAS)
- [x] Install and authenticate EAS
  ```bash
  npm install -g @expo/eas-cli
  eas login
  ```
- [x] Configure EAS and enable automatic iOS credentials
  ```bash
  eas build:configure
  eas credentials
  ```

## Phase 3 — Assets & Store Metadata
- [ ] App icon: 1024×1024 PNG (no transparency)
- [ ] App icon set: all sizes (20×20 → 1024×1024)
- [~] Launch screen / splash configured (should be, need to test)
- [ ] Screenshots prepared (min 3 per device size)
  - iPhone: 6.7", 6.5", 5.5"
  - iPad: 12.9", 11" (if supporting)
- [ ] App Information (App Store Connect): name, subtitle, category, age rating
- [ ] Pricing & Availability: Free (recommended), territories, release option
- [ ] App Review Information: review notes, contact email `cyberpupsecurity@proton.me`

## Phase 4 — Privacy & Legal
- [ ] Privacy Policy accessible in app and on listing
- [ ] Terms of Service accessible in app and on listing
- [ ] App Privacy (Data Collection) questionnaire completed truthfully
- [ ] Data sharing and security practices declared

## Phase 5 — Quality Assurance
- [x] Expo Go testing (development): core flows, consent, stability
- [x] Analytics and tracking: PostHog consent and events verified
- [x] Performance: startup, memory, animations smooth on mid‑range devices
- [ ] Accessibility: basic a11y checks
- [ ] Compatibility: iOS 13+ (recommended), key screen sizes verified

## Phase 6 — TestFlight (Native iOS Testing)
- [ ] Build preview binary in the cloud
  ```bash
  eas build --platform ios --profile preview
  ```
- [ ] Upload latest build to TestFlight
  ```bash
  eas submit --platform ios --latest
  ```
- [ ] Add internal testers; optionally enable external testing
- [ ] Install TestFlight on iPhone 16 and test native performance & features

## Phase 7 — App Store Submission
- [ ] Build production binary
  ```bash
  eas build --platform ios --profile production
  ```
- [ ] Submit to App Store Connect
  ```bash
  eas submit --platform ios
  ```
- [ ] Complete App Store Connect metadata, screenshots, privacy details
- [ ] Submit for Review

## Phase 8 — Post‑Submission
- [ ] Monitor review status and resolution center messages
- [ ] Address feedback/rejections and resubmit if needed
- [ ] Release when approved

## Key Compliance Checks (quick reference)
- [ ] Code signing/profiles (handled by EAS) are valid for the build
- [ ] No debug info; release build only; no hardcoded secrets
- [ ] Icons and screenshots meet Apple specs; content matches app behavior
- [ ] App Privacy answers match the app’s actual data practices
- [ ] Features are stable, not misleading; follows HIG and policies

## Common Rejection Risks (avoid)
1. Missing/incorrect app icon sizes or transparent 1024×1024 icon
2. Inaccurate App Privacy details vs. real data collection
3. Crashes, slow startup, or broken core flows
4. Misleading metadata or screenshots not reflecting actual UI
5. Requesting unnecessary permissions

## Support
- Developer Email: `cyberpupsecurity@proton.me`
- Privacy Policy: `docs/reference/privacy-policy.txt`
- Terms of Service: `docs/reference/tos.txt`
- Apple Developer Support: via Apple Developer Portal

---

Last Updated: September 2025
Status: Ready to execute Phase 1 → Phase 8
