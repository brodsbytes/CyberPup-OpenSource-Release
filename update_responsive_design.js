// Script to apply responsive design updates to all check screens
// This script contains the patterns to replace in each file

const responsiveUpdates = {
  // Import statement updates
  imports: {
    from: "import { Colors } from '../../../theme';",
    to: "import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';"
  },

  // Header styles
  header: {
    from: `  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },`,
    to: `  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.padding.button,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },`
  },

  menuButton: {
    from: `  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },`,
    to: `  menuButton: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },`
  },

  headerTitle: {
    from: `  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },`,
    to: `  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },`
  },

  headerSpacer: {
    from: `  headerSpacer: {
    width: 40,
  },`,
    to: `  headerSpacer: {
    width: Responsive.iconSizes.xlarge,
  },`
  },

  content: {
    from: `  content: {
    padding: 20,
  },`,
    to: `  content: {
    padding: Responsive.padding.screen,
  },`
  },

  titleSection: {
    from: `  titleSection: {
    marginBottom: 24,
  },`,
    to: `  titleSection: {
    marginBottom: Responsive.spacing.lg,
  },`
  },

  title: {
    from: `  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    lineHeight: 32,
  },`,
    to: `  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    lineHeight: Typography.sizes.xxl * 1.3,
  },`
  },

  description: {
    from: `  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },`,
    to: `  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
  },`
  },

  // Icon size updates
  iconSizes: {
    'size={24}': 'size={Responsive.iconSizes.large}',
    'size={48}': 'size={Responsive.iconSizes.xxlarge}',
    'size={20}': 'size={Responsive.iconSizes.medium}',
    'size={16}': 'size={Responsive.iconSizes.small}',
  }
};

// Files to update
const filesToUpdate = [
  'screens/lessons/level-1/Check1_2_HighValueAccountsScreen.js',
  'screens/lessons/level-1/Check1_3_PasswordManagersScreen.js',
  'screens/lessons/level-1/Check1_4_MFASetupScreen.js',
  'screens/lessons/level-1/Check1_2_1_ScreenLockScreen.js',
  'screens/lessons/level-1/PhishingPracticeScreen.js'
];

console.log('Responsive design update patterns ready for application');
console.log('Files to update:', filesToUpdate);
console.log('Update patterns:', Object.keys(responsiveUpdates));
