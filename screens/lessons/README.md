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

### Progress Saving Implementation Pattern

**Critical**: Follow this exact pattern to avoid race conditions and ensure progress is properly saved:

```javascript
// 1. Enhanced saveProgress function that accepts custom parameters
const saveProgress = async (customChecklistItems = null, customIsCompleted = null) => {
  try {
    const itemsToSave = customChecklistItems || checklistItems;
    const completionStatus = customIsCompleted !== null ? customIsCompleted : isCompleted;
    
    const progressData = {
      checklistItems: itemsToSave,
      isCompleted: completionStatus,
      completedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('check_X-Y-Z_progress', JSON.stringify(progressData));
    
    if (completionStatus) {
      await AsyncStorage.setItem('check_X-Y-Z_completed', 'completed');
    } else {
      await AsyncStorage.removeItem('check_X-Y-Z_completed');
    }
  } catch (error) {
    console.log('Error saving progress:', error);
  }
};

// 2. In toggleChecklistItem, save with updated values immediately
const toggleChecklistItem = async (id) => {
  const updatedItems = checklistItems.map(item =>
    item.id === id ? { ...item, completed: !item.completed } : item
  );
  setChecklistItems(updatedItems);

  // Check if all items are completed
  const allCompleted = updatedItems.every(item => item.completed);
  if (allCompleted && !isCompleted) {
    const newIsCompleted = true;
    setIsCompleted(newIsCompleted);
    
    // Save progress with the updated completion status immediately
    await saveProgress(updatedItems, newIsCompleted);
    celebrateCompletion();
  } else {
    // Save progress for partial completion
    await saveProgress(updatedItems, isCompleted);
  }
};

// 3. Load progress on component mount and focus
useFocusEffect(
  React.useCallback(() => {
    loadProgress();
  }, [])
);

const loadProgress = async () => {
  try {
    const progressData = await AsyncStorage.getItem('check_X-Y-Z_progress');
    if (progressData) {
      const data = JSON.parse(progressData);
      setChecklistItems(data.checklistItems || checklistItems);
      setIsCompleted(data.isCompleted || false);
    }
  } catch (error) {
    console.log('Error loading progress:', error);
  }
};
```

### Common Issues to Avoid:
- ❌ Don't call `saveProgress()` immediately after `setIsCompleted()` - use custom parameters instead
- ❌ Don't rely on state values in `saveProgress()` when completion status just changed
- ❌ Don't forget to remove completion status when check becomes incomplete
- ✅ Always test by navigating away and back to verify progress persistence

## Navigation

Check screens are registered in `App.js` and can be navigated to using:
- `navigation.navigate('Check1_1_StrongPasswordsScreen')`
- `navigation.navigate('Check1_2_HighValueAccountsScreen')`
- `navigation.navigate('Check1_3_PasswordManagersScreen')`

## Testing Progress Saving

When creating new check screens, always test progress persistence:

1. **Complete the check** - tick all checklist items
2. **Navigate away** - go to Welcome screen or another check
3. **Return to the check** - verify completion status is preserved
4. **Check Welcome screen** - verify overall progress is updated
5. **Test partial progress** - tick some items, navigate away, return to verify partial progress

### Debug Checklist:
- [ ] Progress saves when all items are completed
- [ ] Progress loads when returning to the screen
- [ ] Welcome screen shows updated progress
- [ ] Active level view updates correctly
- [ ] Navigation to next check works properly

## Future Development

Additional check screens will be added to the `level-1/` directory following the same pattern:
- `Check1_4_MFASetupScreen.js`
- `Check1_5_BreachCheckScreen.js`
- etc.

**Template for new check screens:**
1. Copy `Check1_1_StrongPasswordsScreen.js` as a template
2. Update the check ID in storage keys (e.g., `check_1-1-2_progress`)
3. Update navigation routes in `WelcomeScreen.js`
4. Add the screen to `courseData.js` if needed
5. Test progress saving thoroughly 