# 🏗️ Architecture Reference: Core Infrastructure & Patterns

**Created:** August 2025  
**Purpose:** Technical implementation reference for Level 1 development  
**Focus:** Core infrastructure, state management, and component patterns

---

## 📋 Core Infrastructure Overview

### **Architecture Principles**
- **Pattern-Based Development**: Implement by interaction pattern (A, B, C) rather than infrastructure-first
- **Component Reusability**: Build reusable components that scale across multiple checks
- **State Management Consistency**: Use proven state management patterns across all screens
- **Device-Aware Content**: Deliver personalized content based on user's device ecosystem
- **Progressive Enhancement**: Build on solid foundations with incremental improvements

### **Pattern Distribution**
- **Pattern A (Traditional Checklist):** 4 checks - Self-assessment tasks
- **Pattern B (Progressive Action Cards):** 9 checks - External actions required  
- **Pattern C (Interactive Validation Flow):** 2 checks - Guided experiences with real-time feedback

---

## 🔧 Core State Management Patterns

### **Required State Structure (NON-NEGOTIABLE)**
```javascript
// These exact patterns must be maintained across all screens
const [userDevices, setUserDevices] = useState([]);
const [deviceActions, setDeviceActions] = useState({});
const [isCompleted, setIsCompleted] = useState(false);
const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
const [showExitModal, setShowExitModal] = useState(false);
```

### **Device Initialization Pattern (NON-NEGOTIABLE)**
```javascript
// REQUIRED: Copy this exact initialization pattern from working screens
const initializeDeviceContent = async () => {
  try {
    // Get user's registered devices
    const devices = await DeviceCapabilities.getUserDevices();
    const currentDevice = DeviceCapabilities.getCurrentDevice();
    
    // Add current device if not already in the list
    let allDevices = [...devices];
    const hasCurrentDevice = devices.some(d => 
      d.platform === currentDevice.platform && d.type === currentDevice.type
    );
    
    if (!hasCurrentDevice) {
      allDevices.unshift({
        id: 'current-device',
        name: currentDevice.type,
        type: currentDevice.platform === 'ios' || currentDevice.platform === 'android' ? 'mobile' : 'computer',
        platform: currentDevice.platform,
        tier2: currentDevice.platform,
        autoDetected: true,
        supportsDeepLinks: currentDevice.supportsDeepLinks,
        icon: getDeviceIcon(currentDevice)
      });
    }

    setUserDevices(allDevices);

    // Create device-specific actions using SettingsGuide
    const actions = {};
    for (const device of allDevices) {
      actions[device.id] = await createDeviceActions(device);
    }
    setDeviceActions(actions);

  } catch (error) {
    console.error('Error initializing device content:', error);
    // Fallback to current device only
    const currentDevice = DeviceCapabilities.getCurrentDevice();
    const fallbackDevice = {
      id: 'current-device',
      name: currentDevice.type,
      platform: currentDevice.platform,
      autoDetected: true,
      supportsDeepLinks: currentDevice.supportsDeepLinks
    };
    setUserDevices([fallbackDevice]);
    setDeviceActions({
      'current-device': await createDeviceActions(fallbackDevice)
    });
  }
};
```

### **Progress Persistence Pattern (NON-NEGOTIABLE)**
```javascript
// REQUIRED: Copy these exact patterns from working screens
const loadProgress = async () => {
  try {
    const progressData = await AsyncStorage.getItem(`check_${checkId}_progress`);
    const completedData = await AsyncStorage.getItem(`check_${checkId}_completed`);
    
    if (progressData) {
      const data = JSON.parse(progressData);
      setIsCompleted(data.isCompleted || false);
      setDeviceCompletionStatus(data.deviceCompletionStatus || {});
      
      // Restore action completion states
      if (data.deviceActions) {
        setDeviceActions(prev => {
          const updated = { ...prev };
          Object.keys(data.deviceActions).forEach(deviceId => {
            if (updated[deviceId]) {
              updated[deviceId] = updated[deviceId].map(action => {
                const savedAction = data.deviceActions[deviceId].find(a => a.id === action.id);
                return savedAction ? { ...action, completed: savedAction.completed } : action;
              });
            }
          });
          return updated;
        });
      }
    }
    
    if (completedData === 'completed') {
      setIsCompleted(true);
    }
  } catch (error) {
    console.error('Error loading progress:', error);
  }
};

const saveProgress = async () => {
  try {
    const progressData = {
      isCompleted,
      deviceCompletionStatus,
      deviceActions,
      completedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(`check_${checkId}_progress`, JSON.stringify(progressData));
    
    if (isCompleted) {
      await AsyncStorage.setItem(`check_${checkId}_completed`, 'completed');
    } else {
      await AsyncStorage.removeItem(`check_${checkId}_completed`);
    }
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};
```

### **Action Completion Pattern (NON-NEGOTIABLE)**
```javascript
// REQUIRED: Copy this exact completion logic from working screens
const handleActionComplete = async (deviceId, actionId, completed) => {
  // Update action completion status
  const updatedDeviceActions = { ...deviceActions };
  if (updatedDeviceActions[deviceId]) {
    updatedDeviceActions[deviceId] = updatedDeviceActions[deviceId].map(action =>
      action.id === actionId ? { ...action, completed } : action
    );
  }
  setDeviceActions(updatedDeviceActions);

  // Check if all actions for this device are completed
  const deviceCompleted = updatedDeviceActions[deviceId]?.every(action => action.completed) || false;
  
  // Update device completion status
  const updatedDeviceCompletionStatus = {
    ...deviceCompletionStatus,
    [deviceId]: deviceCompleted
  };
  setDeviceCompletionStatus(updatedDeviceCompletionStatus);

  // Check if all devices are completed
  const allDevicesCompleted = userDevices.every(device => {
    return updatedDeviceCompletionStatus[device.id] === true;
  });

  if (allDevicesCompleted && !isCompleted) {
    setIsCompleted(true);
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Save progress immediately with the new completion status
    setTimeout(async () => {
      try {
        const progressData = {
          isCompleted: true,
          deviceCompletionStatus: updatedDeviceCompletionStatus,
          deviceActions: updatedDeviceActions,
          completedAt: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(`check_${checkId}_progress`, JSON.stringify(progressData));
        await AsyncStorage.setItem(`check_${checkId}_completed`, 'completed');
      } catch (error) {
        console.error('Error saving completion progress:', error);
      }
    }, 50);
    
    celebrateCompletion();
  } else {
    // Save progress for partial completion
    setTimeout(saveProgress, 100);
  }
};
```

---

## 🧩 Component Hierarchy & Data Flow

### **Core Component Architecture**
```
screens/lessons/level-1/
├── CheckScreen.js (Base Pattern)
│   ├── Header (Navigation & Exit Modal)
│   ├── Content (Pattern-Specific)
│   │   ├── Pattern A: EnhancedChecklist
│   │   ├── Pattern B: ProgressiveActionCard + CollapsibleDeviceSection
│   │   └── Pattern C: InteractiveValidationFlow
│   └── Completion Card
```

### **Pattern B Component Flow**
```javascript
// Standard Pattern B screen structure
const PatternBScreen = ({ navigation, route }) => {
  // ✅ REQUIRED: Core state management
  const [userDevices, setUserDevices] = useState([]);
  const [deviceActions, setDeviceActions] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [deviceCompletionStatus, setDeviceCompletionStatus] = useState({});
  const [showExitModal, setShowExitModal] = useState(false);

  // ✅ REQUIRED: Lifecycle hooks
  useEffect(() => {
    initializeDeviceContent();
    loadProgress();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProgress();
    }, [])
  );

  // ✅ REQUIRED: Core functions
  const initializeDeviceContent = async () => { /* Copy from working screens */ };
  const loadProgress = async () => { /* Copy from working screens */ };
  const saveProgress = async () => { /* Copy from working screens */ };
  const handleActionComplete = async (deviceId, actionId, completed) => { /* Copy from working screens */ };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ REQUIRED: Header with menu button and exit modal */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit}>
          <Ionicons name="menu" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check {checkId}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ✅ REQUIRED: Exit modal */}
      <Modal visible={showExitModal} transparent={true} animationType="fade">
        {/* Copy exact modal structure from working screens */}
      </Modal>

      {/* 🎨 PATTERN-SPECIFIC: Content area */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Title and description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{checkTitle}</Text>
            <Text style={styles.description}>{checkDescription}</Text>
          </View>

          {/* Device-specific content */}
          {userDevices.length > 0 ? (
            userDevices.map((device) => (
              <CollapsibleDeviceSection
                key={device.id}
                device={device}
                actions={deviceActions[device.id] || []}
                defaultExpanded={device.autoDetected || userDevices.length === 1}
                onActionComplete={handleActionComplete}
                style={styles.deviceSection}
              />
            ))
          ) : (
            <View style={styles.noDevicesContainer}>
              {/* No devices fallback */}
            </View>
          )}

          {/* ✅ REQUIRED: Completion card */}
          {isCompleted && (
            <View style={styles.completionCard}>
              <Ionicons name="shield-checkmark" size={48} color={Colors.success} />
              <Text style={styles.completionTitle}>{completionTitle}</Text>
              <Text style={styles.completionText}>{completionText}</Text>
              
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => navigation.navigate(nextScreen)}
              >
                <Text style={styles.continueButtonText}>{continueButtonText}</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

## 🎨 Theme Integration Patterns

### **Required Theme Integration**
```javascript
// REQUIRED: Import theme components
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';

// REQUIRED: Use theme constants for styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.padding.button,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
  },
  // ... other styles using theme constants
});
```

### **Check Variants Theme Integration**
```javascript
// Add to theme.js for Phase 4 variants
export const CheckVariants = {
  wizard: {
    accent: Colors.green,
    background: Colors.surface,
    progressStyle: 'circular',
    layout: 'fullscreen-flow',
    headerStyle: 'wizard-header',
    navigationStyle: 'wizard-nav'
  },
  timeline: {
    accent: Colors.purple,
    background: Colors.surfaceAlt,
    progressStyle: 'timeline',
    layout: 'dashboard-drilldown',
    headerStyle: 'timeline-header',
    navigationStyle: 'timeline-nav'
  },
  checklist: {
    accent: Colors.orange,
    background: Colors.surface,
    progressStyle: 'animated-bars',
    layout: 'card-list',
    headerStyle: 'checklist-header',
    navigationStyle: 'checklist-nav'
  }
};
```

---

## 🔗 Navigation Integration Patterns

### **Required Navigation Setup**
```javascript
// REQUIRED: Screen registration in App.js
import Check1_X_X_ScreenName from './screens/lessons/level-1/Check1_X_X_ScreenName';

// Add to navigation stack
<Stack.Screen 
  name="Check1_X_X_ScreenName" 
  component={Check1_X_X_ScreenName}
  options={{ headerShown: false }}
/>
```

### **Required Constants Integration**
```javascript
// REQUIRED: Add to constants/index.js
export const SCREEN_NAMES = {
  // ... existing screens
  CHECK_1_X_X: 'Check1_X_X_ScreenName',
};

// REQUIRED: Add to screens/lessons/level-1/index.js
export { default as Check1_X_X_ScreenName } from './Check1_X_X_ScreenName';
```

---

## 🧪 Testing & Validation Patterns

### **Required Testing Checklist**
```javascript
// ✅ REQUIRED: Test these patterns for each new screen
const testPatterns = {
  // State Management
  stateInitialization: 'Device content initializes correctly',
  progressPersistence: 'Progress saves and loads correctly',
  completionTracking: 'Completion status updates properly',
  
  // User Experience
  navigationFlow: 'Navigation between screens works',
  exitModal: 'Exit modal appears and functions correctly',
  completionCelebration: 'Completion celebration triggers properly',
  
  // Device Handling
  multiDeviceSupport: 'Multiple devices display correctly',
  currentDeviceDetection: 'Current device is properly detected',
  deviceSpecificContent: 'Content adapts to device capabilities',
  
  // Error Handling
  fallbackScenarios: 'Fallbacks work when device detection fails',
  deepLinkHandling: 'Deep links work with graceful fallbacks',
  stateRecovery: 'State recovers after app restart'
};
```

### **Required Validation Functions**
```javascript
// REQUIRED: Validate these patterns work correctly
const validateScreenImplementation = () => {
  // ✅ State management validation
  expect(userDevices).toBeDefined();
  expect(deviceActions).toBeDefined();
  expect(isCompleted).toBeDefined();
  
  // ✅ Device initialization validation
  expect(initializeDeviceContent).toBeDefined();
  expect(loadProgress).toBeDefined();
  expect(saveProgress).toBeDefined();
  
  // ✅ Action completion validation
  expect(handleActionComplete).toBeDefined();
  
  // ✅ UI component validation
  expect(header).toBeDefined();
  expect(exitModal).toBeDefined();
  expect(completionCard).toBeDefined();
};
```

---

## 🚨 Critical Implementation Rules

### **NON-NEGOTIABLE Patterns**
1. **State Management**: Use exact same state structure as working screens
2. **Device Initialization**: Copy exact `initializeDeviceContent` function
3. **Progress Persistence**: Use exact `loadProgress` and `saveProgress` patterns
4. **Action Completion**: Use exact `handleActionComplete` logic
5. **Navigation**: Include header with menu button and exit modal
6. **Theme Integration**: Use theme constants for all styling
7. **Error Handling**: Include fallback scenarios for device detection

### **REQUIRED Components**
1. **Header**: Menu button, title, spacer
2. **Exit Modal**: Overlay, content, keep learning/exit buttons
3. **Title Section**: Title, description, progress indicator
4. **Device Content**: Pattern-specific content area
5. **Completion Card**: Success icon, title, text, continue button

### **FORBIDDEN Patterns**
1. **Auto-Advancement**: Never auto-advance after API/validation results
2. **State Timing Issues**: Don't rely on React state that hasn't propagated
3. **Generic Save Functions**: Don't use generic functions that may use stale state
4. **Mixed Imports**: Don't mix default and named imports/exports
5. **Architecture Changes**: Don't modify proven infrastructure patterns

This architecture reference ensures all new implementations maintain consistency with proven patterns while enabling the visual variety needed for Phase 4.
