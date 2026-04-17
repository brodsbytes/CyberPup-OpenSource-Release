# Contributing to CyberPup

Thanks for your interest. CyberPup is a dormant-but-working project looking for contributors and potential maintainers. Any help is appreciated - whether that's a small bug fix, a new security check, or taking on something bigger like the web build.

## Getting started

1. Fork the repo and clone your fork
2. Install dependencies: `npm install`
3. Start the dev server: `npm start`
4. Open in Expo Go (scan QR), iOS simulator (`i`), Android emulator (`a`), or browser (`w`)

For analytics testing, create `.env.local` with `EXPO_PUBLIC_POSTHOG_API_KEY=your_key`. This is optional - the app works without it.

See [`docs/development/DEVELOPMENT_WORKFLOW.md`](docs/development/DEVELOPMENT_WORKFLOW.md) for a more detailed development guide.

## What to work on

The [README roadmap](README.md#roadmap) lists ideas that never got built. The web app (`npm run web`) is one of the most impactful things to pursue.

If you're unsure where to start, open an issue and ask - happy to point you in a direction.

## Submitting changes

1. Create a branch from `main`: `git checkout -b your-feature-name`
2. Make your changes and test on at least one platform
3. Open a pull request with a short description of what you changed and why

There's no formal style guide. Just keep things consistent with the existing code and test on a small screen (iPhone SE size) if you're touching UI.

## Adding a new security check

Security checks live in [`screens/lessons/`](screens/lessons/). See [`screens/lessons/README.md`](screens/lessons/README.md) for the pattern to follow, and [`data/`](data/) for how checks are registered in the app structure.

## Reporting bugs

Open a GitHub issue with steps to reproduce and the device/OS you're on.

## Security issues

Please don't report security vulnerabilities in public issues. Email [cyberpupsecurity@proton.me](mailto:cyberpupsecurity@proton.me) instead.
