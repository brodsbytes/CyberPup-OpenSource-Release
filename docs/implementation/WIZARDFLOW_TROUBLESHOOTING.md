# 🧙‍♂️ WizardFlow Component Troubleshooting Guide

**Created:** August 2025  
**Purpose:** Quick reference for fixing common WizardFlow issues in Phase 4 screens

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: Progress Not Updating**
**Symptoms:** Progress bars stay at 0%, counters don't increment
**Root Cause:** Stale state or incorrect progress calculation
**Solution:**
```javascript
// ❌ WRONG - Using state for progress
const [wizardProgress, setWizardProgress] = useState(0);

// ✅ CORRECT - Calculate directly in render
const wizardProgress = calculateProgress();
```

### **Issue 2: Variable Name Conflicts**
**Symptoms:** `can't access lexical declaration 'deviceActions' before initialization`
**Root Cause:** Variable shadowing in map functions
**Solution:**
```javascript
// ❌ WRONG - Variable shadowing
{userDevices.map((device, index) => {
  const deviceActions = deviceActions[device.id]; // Conflict!
})}

// ✅ CORRECT - Unique variable names
{userDevices.map((device, index) => {
  const deviceActionsList = deviceActions[device.id];
})}
```

### **Issue 3: Missing "Complete Task!" Button**
**Symptoms:** No button on final step, users can't complete device setup
**Root Cause:** Navigation logic doesn't handle final step
**Solution:**
```javascript
{/* Next Button or Complete Task Button */}
{currentStep < deviceActions.length - 1 ? (
  <TouchableOpacity style={styles.nextButton}>
    <Text>Next Step</Text>
  </TouchableOpacity>
) : (
  <TouchableOpacity style={[styles.nextButton, styles.completeTaskButton]}>
    <Text>Complete Task!</Text>
  </TouchableOpacity>
)}
```

### **Issue 4: Navigation Errors**
**Symptoms:** `You need to specify a name when calling navigate`
**Root Cause:** Using non-existent screen names
**Solution:**
```javascript
// ❌ WRONG - Non-existent screen
navigation.navigate(SCREEN_NAMES.CATEGORY);

// ✅ CORRECT - Use exact screen names
navigation.navigate('Welcome');
navigation.navigate('Check1_2_3_DeviceUpdatesScreen');
```

### **Issue 5: Invalid Icon Names**
**Symptoms:** `"device-desktop" is not a valid icon name for family "ionicons"`
**Root Cause:** Using invalid Ionicons names
**Solution:**
```javascript
// ❌ WRONG - Invalid icon name
return 'device-desktop';

// ✅ CORRECT - Valid Ionicons names
return 'desktop';  // or 'laptop', 'phone-portrait', etc.
```

### **Issue 6: Device Status in Wrong Position**
**Symptoms:** "Device Complete!" appears next to navigation buttons
**Root Cause:** Status indicator placed in navigation container
**Solution:**
```javascript
// ❌ WRONG - Inside navigation container
<View style={styles.deviceNavigation}>
  <BackButton />
  <NextButton />
  <DeviceStatus /> {/* Wrong position */}
</View>

// ✅ CORRECT - Below navigation container
<View style={styles.deviceNavigation}>
  <BackButton />
  <NextButton />
</View>
{/* Device status below navigation */}
<DeviceStatus />
```

---

## 🔧 **Quick Fix Reference**

### **Progress Calculation Fix**
```javascript
// Add this to render function
const wizardProgress = calculateProgress();
```

### **Device Step Tracking Fix**
```javascript
// Replace single currentStep with deviceSteps object
const [deviceSteps, setDeviceSteps] = useState({});

const getCurrentStep = (deviceIndex) => {
  return deviceSteps[deviceIndex] || 0;
};
```

### **Completion Modal Fix**
```javascript
const celebrateCompletion = () => {
  Alert.alert(
    '🎉 [Check Name] Complete!',
    '[Description]',
    [
      {
        text: 'Continue to Next Check',
        onPress: () => navigation.navigate('NextCheckScreenName'),
      },
      {
        text: 'Go Back',
        style: 'cancel',
        onPress: () => navigation.navigate('Welcome'),
      },
    ]
  );
};
```

### **Icon Name Fix**
```javascript
const getDeviceIcon = (device) => {
  const platform = device.platform || device.tier2;
  const type = device.type;
  
  if (type === 'mobile') {
    return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
  } else if (type === 'computer') {
    return platform === 'macos' ? 'laptop' : 'desktop';
  }
  
  return 'desktop'; // ✅ Valid Ionicons name
};
```

---

## 📋 **Pre-Implementation Checklist**

Before implementing any WizardFlow screen, verify:

- [ ] ✅ AsyncStorage imported correctly
- [ ] ✅ useFocusEffect imported from @react-navigation/native
- [ ] ✅ Device step tracking uses separate state object
- [ ] ✅ Progress calculated directly in render function
- [ ] ✅ Navigation uses exact screen names from constants
- [ ] ✅ Icon names are valid Ionicons
- [ ] ✅ Completion modal has proper navigation options
- [ ] ✅ Device status indicators positioned below navigation
- [ ] ✅ "Complete Task!" button logic implemented
- [ ] ✅ Error handling for all async operations

---

## 🎯 **Testing Checklist**

After implementation, test:

- [ ] ✅ Progress updates when completing steps
- [ ] ✅ "Complete Task!" appears on final step
- [ ] ✅ Device status shows below navigation
- [ ] ✅ Completion modal navigates correctly
- [ ] ✅ No console errors for icons or navigation
- [ ] ✅ Each device tracks progress independently
- [ ] ✅ Fallback UI shows when device detection fails
- [ ] ✅ Progress persists across app restarts

---

## 📞 **Emergency Fixes**

**If progress is completely broken:**
1. Remove all progress state
2. Calculate progress directly in render
3. Use `useEffect` to trigger re-renders when needed

**If navigation is broken:**
1. Check screen names in constants/index.js
2. Use exact string names, not constants
3. Test with 'Welcome' screen first

**If icons are broken:**
1. Replace all custom icon names with standard Ionicons
2. Use 'desktop', 'laptop', 'phone-portrait' only
3. Check Ionicons documentation for valid names

---

**Last Updated:** August 2025  
**Based on:** Check1_2_2_RemoteLockScreen implementation lessons
