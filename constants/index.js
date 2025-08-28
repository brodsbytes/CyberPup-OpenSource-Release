// App-wide constants
export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    AUDIT_COMPLETED: 'audit_completed',
    USER_PROGRESS: 'user_progress',
    COMPLETED_CHECKS: 'completed_checks',
    DEVICE_AUDIT_COMPLETED: 'device_audit_completed',
    USER_DEVICES: 'user_devices',
  },
  NAVIGATION: {
    INITIAL_ROUTES: {
      AUDIT: 'InitialWelcomeScreen',
      WELCOME: 'Welcome',
    },
  },
  UI: {
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    SEARCH_DELAY: 500,
  },
  PROGRESS: {
    MIN_PROGRESS: 0,
    MAX_PROGRESS: 100,
  },
};

// Screen names for navigation
export const SCREEN_NAMES = {
  INITIAL_WELCOME: 'InitialWelcomeScreen',
  DEVICE_AUDIT: 'DeviceAuditScreen',
  WELCOME: 'Welcome',
  PROFILE: 'ProfileScreen',
  INSIGHTS: 'InsightsScreen',
  // Gamification screens
  STREAK_DETAILS: 'StreakDetailsScreen',
  BADGES: 'BadgesScreen',
  // Level 1 Check screens
  CHECK_1_1_1_STRONG_PASSWORDS: 'Check1_1_1_StrongPasswordsScreen',
  CHECK_1_1_2_HIGH_VALUE_ACCOUNTS: 'Check1_1_2_HighValueAccountsScreen',
  CHECK_1_1_3_PASSWORD_MANAGERS: 'Check1_1_3_PasswordManagersScreen',
  CHECK_1_1_4_MFA_SETUP: 'Check1_1_4_MFASetupScreen',
  CHECK_1_4_1_SCAM_RECOGNITION: 'Check1_4_1_ScamRecognitionScreen',
  CHECK_1_1_5_BREACH_CHECK: 'Check1_1_5_BreachCheckScreen',
  CHECK_1_2_1_SCREEN_LOCK: 'Check1_2_1_ScreenLockScreen',
  CHECK_1_3_1_CLOUD_BACKUP: 'Check1_3_1_CloudBackupScreen',
  PHISHING_PRACTICE: 'PhishingPracticeScreen',
  
  // 🎯 Phase 4 Wizard Variant Screens
  CHECK_1_2_2_REMOTE_LOCK: 'Check1_2_2_RemoteLockScreen',
  CHECK_1_2_3_DEVICE_UPDATES: 'Check1_2_3_DeviceUpdatesScreen',
  CHECK_1_2_4_BLUETOOTH_WIFI: 'Check1_2_4_BluetoothWifiScreen',
  
  // 🎯 Phase 4 Timeline Variant Screens
  CHECK_1_5_2_PRIVACY_SETTINGS: 'Check1_5_2_PrivacySettingsScreen',
  
  // 🎯 Phase 4 Checklist Variant Screens
  CHECK_1_3_2_LOCAL_BACKUP: 'Check1_3_2_LocalBackupScreen',
  CHECK_1_4_2_SCAM_REPORTING: 'Check1_4_2_ScamReportingScreen',
  
  // 🎯 Phase 4 Pattern A Enhanced Screens
  CHECK_1_2_5_PUBLIC_CHARGING: 'Check1_2_5_PublicChargingScreen',
  CHECK_1_5_1_SHARING_AWARENESS: 'Check1_5_1_SharingAwarenessScreen',
  
  // Insights detail screens
  GUIDE_DETAIL: 'GuideDetailScreen',
  TOOL_DETAIL: 'ToolDetailScreen',
  ALERT_DETAIL: 'AlertDetailScreen',
};

// Tab navigation constants
export const TAB_NAVIGATION = {
  TABS: [
    {
      id: 'home',
      title: 'Home',
      icon: 'home-outline',
      iconActive: 'home',
      screen: SCREEN_NAMES.WELCOME,
    },
    {
      id: 'insights',
      title: 'Insights',
      icon: 'book-outline',
      iconActive: 'book',
      screen: SCREEN_NAMES.INSIGHTS,
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
      iconActive: 'person',
      screen: SCREEN_NAMES.PROFILE,
    },
  ],
};

// Error messages
export const ERROR_MESSAGES = {
  STORAGE_ERROR: 'Error accessing storage',
  NETWORK_ERROR: 'Network connection error',
  GENERAL_ERROR: 'Something went wrong',
  AUDIT_STATUS_ERROR: 'Error checking audit status',
};
