// App-wide constants
export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    AUDIT_COMPLETED: 'audit_completed',
    USER_PROGRESS: 'user_progress',
    COMPLETED_CHECKS: 'completed_checks',
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
  WELCOME: 'Welcome',
  CATEGORY: 'CategoryScreen',
  MODULE_LIST: 'ModuleListScreen',
  PROFILE: 'ProfileScreen',
  INSIGHTS: 'InsightsScreen',
  // Gamification screens
  STREAK_DETAILS: 'StreakDetailsScreen',
  BADGES: 'BadgesScreen',
  // Level 1 Check screens
  CHECK_1_1_STRONG_PASSWORDS: 'Check1_1_StrongPasswordsScreen',
  CHECK_1_2_HIGH_VALUE_ACCOUNTS: 'Check1_2_HighValueAccountsScreen',
  CHECK_1_3_PASSWORD_MANAGERS: 'Check1_3_PasswordManagersScreen',
  CHECK_1_4_MFA_SETUP: 'Check1_4_MFASetupScreen',
  CHECK_1_5_BREACH_CHECK: 'Check1_5_BreachCheckScreen',
  CHECK_1_2_1_SCREEN_LOCK: 'Check1_2_1_ScreenLockScreen',
  PHISHING_PRACTICE: 'PhishingPracticeScreen',
  // Insights detail screens
  GUIDE_DETAIL: 'GuideDetailScreen',
  TOOL_DETAIL: 'ToolDetailScreen',
};

// Tab navigation constants
export const TAB_NAVIGATION = {
  TABS: [
    {
      id: 'home',
      title: 'Home',
      icon: 'home',
      screen: SCREEN_NAMES.WELCOME,
    },
    {
      id: 'insights',
      title: 'Insights',
      icon: 'bulb-outline',
      screen: SCREEN_NAMES.INSIGHTS,
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person-outline',
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
