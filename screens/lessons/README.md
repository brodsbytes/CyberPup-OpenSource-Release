# Lessons Directory

This directory contains all lesson screens and reusable components for the CyberPup app.

## Structure

```
lessons/
├── level-1/                    # Level 1 (Beginner) check screens
│   ├── Check1_1_StrongPasswordsScreen.js
│   ├── Check1_2_HighValueAccountsScreen.js
│   ├── Check1_3_PasswordManagersScreen.js
│   ├── PhishingPracticeScreen.js
│   └── index.js
├── BaseLessonScreen.js         # Reusable base component for lesson screens
├── lessonStyles.js            # Shared styles for lesson screens
├── index.js                   # Main export file
└── README.md                  # This file
```

## Level 1 Check Screens

### Check 1.1: Strong Passwords & Passphrases
- **File**: `Check1_1_StrongPasswordsScreen.js`
- **Purpose**: Interactive checklist for creating strong passwords
- **Features**: Checklist items, "I did it" buttons, completion tracking

### Check 1.2: High-Value Accounts
- **File**: `Check1_2_HighValueAccountsScreen.js`
- **Purpose**: Prioritizing banking and email security
- **Features**: OS integration, settings navigation

### Check 1.3: Password Managers
- **File**: `Check1_3_PasswordManagersScreen.js`
- **Purpose**: Setting up and using password managers
- **Features**: Installation guidance, biometric setup

## Reusable Components

### BaseLessonScreen
- **File**: `BaseLessonScreen.js`
- **Purpose**: Base component for all lesson screens
- **Features**: Common layout, navigation, progress tracking

### PhishingPracticeScreen
- **File**: `PhishingPracticeScreen.js`
- **Purpose**: Reusable practice screen for phishing scenarios
- **Features**: Interactive scenarios, scoring, feedback

## Progress Tracking

All check screens use AsyncStorage with the following key pattern:
- `check_X-Y-Z_progress`: Stores checklist progress and completion status
- `check_X-Y-Z_completed`: Marks the check as fully completed

## Navigation

Check screens are registered in `App.js` and can be navigated to using:
- `navigation.navigate('Check1_1_StrongPasswordsScreen')`
- `navigation.navigate('Check1_2_HighValueAccountsScreen')`
- `navigation.navigate('Check1_3_PasswordManagersScreen')`

## Future Development

Additional check screens will be added to the `level-1/` directory following the same pattern:
- `Check1_4_MFASetupScreen.js`
- `Check1_5_BreachCheckScreen.js`
- etc. 