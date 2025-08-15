# CyberPup

A React Native mobile application built with Expo for comprehensive cybersecurity health assessments and education.

## Mission

CyberPup helps users complete a comprehensive cybersecurity health check with an action-first approach. The app is designed for non-technical audiences to understand and complete security improvements immediately, with learning provided only when absolutely required.

## Features

- **Progressive Security Levels**: Three-tier system (Scout 🐾, Watchdog 👁️, Guardian 🛡)
- **Interactive Checklists**: Step-by-step security actions with progress persistence
- **Progress Tracking**: Visual progress indicators and completion celebrations
- **Platform-Specific Guidance**: Tailored instructions for iOS/Android
- **Action-First Design**: Direct integration with device settings where possible
- **Modern UI**: Clean, professional design with smooth animations
- **Responsive Design**: Optimized for all screen sizes including iPhone SE

## Screens

### Welcome Screen
- Overall progress dashboard with circular progress indicator
- Active level display with area-based check lists
- Search functionality for finding specific checks
- Real-time progress updates and completion tracking

### Check Screens
- Interactive checklists with persistent progress saving
- Platform-specific action buttons (e.g., open device settings)
- Completion celebrations with navigation to next checks
- "Learn more" collapsible content for additional education

### Category Screen
- Level-based organization of security checks
- Visual progress indicators for each level
- Badge system for completed areas

## Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Screen navigation with focus effects
- **AsyncStorage**: Persistent progress tracking
- **React Native Screens**: Native screen components
- **React Native Safe Area Context**: Safe area handling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CyberCheck
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# For Android
npm run android

# For iOS (requires macOS)
npm run ios

# For web
npm run web
```

## Project Structure

```
CyberPup/
├── App.js                           # Main app component with navigation setup
├── screens/
│   ├── WelcomeScreen.js            # Main dashboard with progress tracking
│   ├── CategoryScreen.js           # Level-based check organization
│   ├── ModuleListScreen.js         # Area-based check lists
│   ├── ProfileScreen.js            # User profile and achievements
│   └── lessons/
│       ├── level-1/                # Level 1 check screens
│       │   ├── Check1_1_StrongPasswordsScreen.js
│       │   ├── Check1_2_HighValueAccountsScreen.js
│       │   └── ...
│       └── README.md               # Lesson development guide
├── components/                     # Reusable UI components
├── data/                          # Course content and structure
├── utils/                         # Storage utilities
│   └── responsive.js              # Responsive design system
├── theme.js                       # Design system and colors
└── package.json                   # Dependencies and scripts
```

## Responsive Design System

CyberPup implements a comprehensive responsive design system to ensure optimal user experience across all device sizes, particularly optimized for iPhone SE (375x667) and larger screens.

### Key Features

- **Screen Size Detection**: Automatic detection of small, medium, and large screens
- **Responsive Scaling**: Proportional scaling based on device dimensions
- **Conservative Typography**: Text sizes that remain readable on small screens
- **Touch Target Optimization**: Minimum 44px touch targets for accessibility
- **Modal Sizing**: Properly sized modals with adequate margins

### Implementation

#### 1. Import Responsive Utilities
```javascript
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
```

#### 2. Use Responsive Constants
```javascript
const styles = StyleSheet.create({
  container: {
    padding: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  button: {
    minHeight: Responsive.buttonHeight.medium,
    borderRadius: Responsive.borderRadius.medium,
  },
  icon: {
    size: Responsive.iconSizes.large,
  },
});
```

#### 3. Responsive Constants Available

**Typography:**
- `Typography.sizes.xs` (12px) - `Typography.sizes.xxxl` (32px)
- `Typography.weights.normal` - `Typography.weights.bold`

**Spacing:**
- `Responsive.spacing.xs` (4px) - `Responsive.spacing.xxl` (48px)

**Padding:**
- `Responsive.padding.screen` (16-20px)
- `Responsive.padding.card` (12-16px)
- `Responsive.padding.button` (10-12px)
- `Responsive.padding.modal` (16-24px)

**Border Radius:**
- `Responsive.borderRadius.small` (6px) - `Responsive.borderRadius.xxlarge` (20px)

**Icon Sizes:**
- `Responsive.iconSizes.small` (16px) - `Responsive.iconSizes.xxlarge` (48px)

**Button Heights:**
- `Responsive.buttonHeight.small` (36px) - `Responsive.buttonHeight.large` (52px)

**Screen Detection:**
- `Responsive.isSmallScreen` (≤375px width)
- `Responsive.isMediumScreen` (376-414px width)
- `Responsive.isLargeScreen` (>414px width)

### Best Practices

1. **Always use responsive constants** instead of hardcoded pixel values
2. **Test on iPhone SE simulator** to verify small screen compatibility
3. **Use conservative scaling** for typography to maintain readability
4. **Ensure proper touch targets** (minimum 44px height)
5. **Size modals appropriately** with adequate margins
6. **Use line height multipliers** for better text readability

### Files Using Responsive Design

All screens have been updated with responsive design:
- ✅ WelcomeScreen.js
- ✅ Check1_1_StrongPasswordsScreen.js
- ✅ Check1_2_HighValueAccountsScreen.js
- ✅ Check1_3_PasswordManagersScreen.js
- ✅ Check1_4_MFASetupScreen.js
- ✅ Check1_2_1_ScreenLockScreen.js
- ✅ Check1_5_BreachCheckScreen.js
- ✅ PhishingPracticeScreen.js

## Progress Saving

The app uses AsyncStorage for persistent progress tracking with the following pattern:

- **Storage Keys**: `check_X-Y-Z_progress` (JSON data) and `check_X-Y-Z_completed` (completion status)
- **Race Condition Prevention**: Custom parameters in save functions to avoid state update timing issues
- **Focus Effects**: Automatic progress refresh when returning to screens
- **Testing**: Comprehensive testing checklist for progress persistence

See `screens/lessons/README.md` for detailed implementation patterns.

## Design System

### Colors
- Primary Blue: `#3498db`
- Dark Text: `#2c3e50`
- Medium Text: `#34495e`
- Light Text: `#7f8c8d`
- Background: `#f8f9fa`
- White: `#ffffff`

### Typography
- Title: 42px, Bold (700)
- Header: 20px, Semi-bold (600)
- Body: 16-20px, Medium (500-600)
- Subtitle: 14-16px, Regular (400)

### Spacing
- Consistent padding and margins throughout
- Proper safe area handling for different devices
- Responsive design considerations

## Future Enhancements

- Implement actual cybersecurity assessment questions
- Add progress tracking and scoring
- Include security recommendations and tips
- Add user authentication and profile management
- Implement data persistence for assessment results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple screen sizes
5. Submit a pull request

## License

This project is licensed under the MIT License. 