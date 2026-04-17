# CyberPup

**A free, open-source cybersecurity app for everyday people.**

CyberPup helps non-technical users lock down their digital lives through guided checklists, bite-sized lessons, and tools like breach checking. All guidance is grounded in well-known frameworks from ACSC, CISA, and NIST - translated into plain language that anyone can actually follow through on.

Most personal cybersecurity tools are either too technical, only solve one piece of the puzzle, or a complete scam. CyberPup tries to guide someone through the whole picture: passwords, email security, device hygiene, social media, and breach checking.

The app is live on the [iOS App Store](https://apps.apple.com/au/app/cyberpup-secure/id6752377981) with ~500 installs. It works, but it's not actively maintained. This repo is an open invitation - to contributors, maintainers, or anyone who wants to take it somewhere.

---

## What it does

- **Progressive security levels** - Scout, Watchdog, and Guardian tiers that guide users from basics to advanced
- **Interactive checklists** - step-by-step security actions with persistent progress tracking
- **Platform-specific guidance** - tailored instructions for iOS, Android, macOS, and Windows
- **Breach checking** - integration with HaveIBeenPwned-style APIs to check if accounts are compromised
- **Gamification** - streaks, badges, and achievement milestones to keep users engaged
- **Bite-sized lessons** - optional "learn more" content that doesn't get in the way of action

---

## Tech stack

- **React Native** + **Expo** - cross-platform mobile (iOS & Android)
- **React Navigation** - screen navigation
- **AsyncStorage** - local progress persistence
- **PostHog** - privacy-conscious analytics (with user consent and opt-out)

---

## The web app opportunity

Because this is built in React Native with Expo, running it as a **web app is a very real possibility** - `npm run web` already works in development. A proper web build would make CyberPup accessible to anyone without needing an App Store install, which dramatically widens the audience for a tool aimed at non-technical people.

This is one of the most impactful things a contributor could take on.

---

## Roadmap

These are ideas and things left on the to-do list that never got built. They're here to give you a sense of where the project could go - not a spec, just a starting point.

**Polish & fixes**
- Make privacy policy readable inline instead of opening a link
- Device updates section: fix bluetooth/wifi retry setup
- App loading/onboarding screen (first startup experience)
- Light mode support

**Engagement**
- Share progress when completing a security level
- Badge achievement popup on completion
- Monthly security reminder push notifications
- Expand content in the Insights tab

**New tools**
- Password strength checker with real-time feedback
- Phishing link checker - analyze suspicious URLs
- Scam message detection for texts and emails
- HIBP paid API integration for richer breach data (pending pricing viability)
- Scam call/SMS detection guidance based on mobile OS

**Bigger ideas**
- Web app (see above)
- CyberPup as a more prominent character/guide within the app (subtle animations, personality)
- Privacy settings scanner

---

## Getting started

### Prerequisites

- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/go) on your phone for quick testing, or a simulator/emulator

### Run it locally

```bash
git clone https://github.com/brodsbytes/cyberpup.git
cd cyberpup
npm install
npm start
```

Then scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator / `w` for web.

### Environment variables

Create a `.env.local` file in the project root:

```
EXPO_PUBLIC_POSTHOG_API_KEY=your_key_here
```

Analytics will silently no-op if the key is absent, so this is optional for local development.

---

## Project structure

```
CyberPup/
├── App.js                    # Root component, navigation setup
├── screens/
│   ├── WelcomeScreen.js      # Main dashboard
│   ├── CategoryScreen.js     # Level-based check organisation
│   ├── ModuleListScreen.js   # Area-based check lists
│   ├── ProfileScreen.js      # User profile and achievements
│   ├── StreakDetailsScreen.js
│   ├── BadgesScreen.js
│   └── lessons/              # All individual check screens
│       ├── level-1/
│       ├── level-2/
│       └── level-3/
├── components/               # Reusable UI components
├── data/                     # Content and app structure data
├── utils/                    # Storage, analytics, badge logic
├── theme.js                  # Design system (colours, typography, spacing)
├── docs/                     # Architecture and development guides
└── assets/                   # Images and animations
```

See [`docs/`](docs/) for architecture references, development guides, and implementation notes.

---

## Contributing

Contributions are welcome - bug fixes, new checks, UI improvements, the web build, or anything from the roadmap above.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get set up and submit changes.

If you're interested in taking on a larger role (maintainer, taking the project in a new direction), feel free to open an issue or reach out directly.

---

## Website

[cyberpupsecurity.com](https://cyberpupsecurity.com)

---

## License

[MIT](LICENSE)
