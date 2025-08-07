# Lesson Screens Organization

This directory contains all lesson-related screens organized by category for better maintainability and scalability.

## Structure

```
screens/lessons/
├── BaseLessonScreen.js          # Reusable base component for lesson screens
├── lessonStyles.js              # Shared styles for lesson components
├── index.js                     # Main export file for all lesson screens
├── README.md                    # This documentation file
└── password-security/           # Password Security & Authentication lessons
    ├── index.js                 # Category-specific exports
    ├── PasswordIntroScreen.js
    ├── PasswordChecklistScreen.js
    ├── PasswordQuizScreen.js
    └── PasswordPracticeScreen.js
```

## Adding New Lesson Categories

When adding new lesson categories (e.g., Phishing Awareness, Device Security):

1. Create a new folder: `screens/lessons/phishing-awareness/`
2. Add your lesson screens to that folder
3. Create an `index.js` file in the new folder to export the screens
4. Update `screens/lessons/index.js` to export from the new category
5. Update `App.js` to import the new screens

## Example for New Category

```javascript
// screens/lessons/phishing-awareness/index.js
export { default as PhishingIntroScreen } from './PhishingIntroScreen';
export { default as PhishingQuizScreen } from './PhishingQuizScreen';

// screens/lessons/index.js
export * from './password-security';
export * from './phishing-awareness'; // Add this line

// App.js
import {
  PasswordIntroScreen,
  PasswordChecklistScreen,
  // ... other password screens
  PhishingIntroScreen,
  PhishingQuizScreen,
} from './screens/lessons';
```

## Benefits

- **Scalable**: Easy to add new lesson categories without cluttering the main screens folder
- **Organized**: Related screens are grouped together
- **Maintainable**: Clear structure makes it easy to find and update specific lessons
- **Reusable**: BaseLessonScreen and shared styles reduce code duplication
- **Clean Imports**: Single import statement for all lesson screens 