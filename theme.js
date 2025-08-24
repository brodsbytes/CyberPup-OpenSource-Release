import { 
  responsiveSpacing, 
  responsiveTypography, 
  responsivePadding, 
  responsiveBorderRadius,
  responsiveIconSizes,
  responsiveButtonHeight,
  responsiveInputHeight,
  isSmallScreen,
  modalDimensions,
  cardDimensions
} from './utils/responsive';

/**
 * CyberPup Theme System
 * 
 * This theme follows iOS/macOS design system principles with a dark mode focus.
 * All colors are standardized to hex format for consistency.
 * 
 * Color Categories:
 * - Base colors: Background, surface, and structural elements
 * - Text colors: Primary, secondary, and muted text
 * - Accent colors: Primary brand colors and their variations
 * - Status colors: Success, warning, error states
 * - Overlay colors: Modal backgrounds and overlays
 * - Card colors: Progression state styling
 * 
 * Opacity values are encoded in hex (e.g., #FFFFFF80 = 50% opacity white)
 */
export const Colors = {
  // Base colors
  background: '#2C2C2E',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  dropdownBackground: '#3A3A3C',
  border: '#48484A',
  track: '#1C1C1E',
  
  // Text colors
  textPrimary: '#F2F2F7',
  textSecondary: '#D1D1D6',
  muted: '#8E8E93',
  
  // Accent colors
  accent: '#4A7CBE',
  accentSoft: '#4A90E233', // 20% opacity version of accent
  accentLighter: '#5B9BE233', // 10% opacity version of accent
  
  // New accent colors for future use
  green: '#66c98a',
  orange: '#F57C00',
  red: '#FF5252',
  purple: '#7e3eee',
  
  // Status colors
  success: '#27AE60',
  warning: '#FF6B6B',
  error: '#E74C3C',
  disabled: '#A0AEC0',
  
  // Additional status colors (used in components)
  successLight: '#4ECDC4', // Light green variant
  warningLight: '#FFD700', // Gold/yellow variant
  
  // Status backgrounds (with opacity)
  successSoft: '#27AE6026', // 15% opacity version of success
  warningSoft: '#FF6B6B26', // 15% opacity version of warning
  errorSoft: '#E74C3C26', // 15% opacity version of error
  
  // Overlay colors (commonly used throughout the app)
  overlayDark: '#00000080', // 50% opacity black
  overlayDarker: '#000000CC', // 80% opacity black
  overlayLight: '#FFFFFF0A', // 4% opacity white
  overlayLighter: '#FFFFFF14', // 8% opacity white
  overlayMedium: '#FFFFFF33', // 20% opacity white
  
  // Shadow colors
  shadowColor: '#000000',
  shadowColorLight: '#00000040', // 25% opacity black
  
  // Card background colors
  cardCompleted: '#1C1C1E',
  cardInProgress: '#1C1C1E', 
  cardNotStarted: '#1C1C1E', 
  
  // Card border colors
  cardCompletedBorder: '#48484A',
  cardInProgressBorder: '#4A7CBE',
  cardNotStartedBorder: '#48484A',
  
  // Card opacity values
  cardCompletedOpacity: 0.7,
  cardInProgressOpacity: 1,
  cardNotStartedOpacity: 0.7,
  
  // Card text colors
  cardCompletedTitleColor: '#D1D1D6',
  cardInProgressTitleColor: '#F2F2F7',
  cardNotStartedTitleColor: '#D1D1D6',
  cardCompletedSubtitleColor: '#D1D1D6',
  cardInProgressSubtitleColor: '#D1D1D6',
  cardNotStartedSubtitleColor: '#D1D1D6',
  
  // Card icon colors
  cardCompletedIconColor: '#D1D1D6',
  cardInProgressIconColor: '#F2F2F7',
  cardNotStartedIconColor: '#D1D1D6',
  
  // Card text sizes
  cardCompletedTitleSize: 'xl',
  cardInProgressTitleSize: 'xxl',
  cardNotStartedTitleSize: 'xl',
  
  // Hero card colors (for primary level cards)
  heroCardBackground: '#1C1C1E',
  heroCardBorder: '#4A7CBE',
  heroCardBorderWidth: 2,
  heroCardShadowColor: '#4A7CBE',
  heroCardShadowOpacity: 0.3,
  heroCardShadowRadius: 8,
  heroCardElevation: 12,
  
  // Hero card button colors
  heroButtonBackground: '#4A7CBE',
  heroButtonTextColor: '#F2F2F7',
  heroButtonShadowColor: '#4A7CBE',
  heroButtonShadowOpacity: 0.4,
  heroButtonShadowRadius: 6,
  heroButtonElevation: 8,
  
  // Hero card icon colors
  heroIconBackground: 'rgba(74, 124, 190, 0.15)', // 15% opacity accent
  heroIconBorder: '#4A7CBE',
  
  // Hero card text colors
  heroTitleColor: '#F2F2F7',
  heroSubtitleColor: '#D1D1D6',
  heroChipBackground: '#4A7CBE',
  heroChipTextColor: '#0b1b2b',
};

// Responsive spacing constants for consistent layout
export const Spacing = responsiveSpacing;

// Responsive typography constants
export const Typography = responsiveTypography;

// Responsive design constants
export const Responsive = {
  spacing: responsiveSpacing,
  typography: responsiveTypography,
  padding: responsivePadding,
  borderRadius: responsiveBorderRadius,
  iconSizes: responsiveIconSizes,
  buttonHeight: responsiveButtonHeight,
  inputHeight: responsiveInputHeight,
  isSmallScreen,
  modal: modalDimensions,
  card: cardDimensions,
};

// Common styles for reuse
export const CommonStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: responsiveBorderRadius.large,
    padding: responsivePadding.card,
    marginVertical: responsiveSpacing.sm,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: responsiveBorderRadius.medium,
    paddingVertical: responsivePadding.button,
    paddingHorizontal: responsiveSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: responsiveButtonHeight.medium,
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: responsiveTypography.sizes.md,
    fontWeight: responsiveTypography.weights.medium,
  },
  dropdown: {
    backgroundColor: Colors.dropdownBackground,
    borderRadius: responsiveBorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownOption: {
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.accentSoft,
    borderLeftWidth: 3,
    borderLeftColor: Colors.accent,
  },
  // Responsive modal styles
  modal: {
    overlay: {
      flex: 1,
      backgroundColor: Colors.overlayDark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      backgroundColor: Colors.surface,
      borderRadius: responsiveBorderRadius.xlarge,
      padding: responsivePadding.modal,
      marginHorizontal: responsivePadding.screen,
      width: modalDimensions.width,
      maxHeight: modalDimensions.maxHeight,
    },
  },
  // Responsive input styles
  input: {
    backgroundColor: Colors.background,
    borderRadius: responsiveBorderRadius.medium,
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsivePadding.button,
    color: Colors.textPrimary,
    fontSize: responsiveTypography.sizes.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: responsiveInputHeight.medium,
  },
  // Premium card styles for insights
  premiumCard: {
    backgroundColor: Colors.surface,
    borderRadius: responsiveBorderRadius.xlarge,
    padding: responsivePadding.card * 1.5,
    marginVertical: responsiveSpacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
};

// 🎯 Phase 4 Check Variants Theme System
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
    navigationStyle: 'timeline-nav',
    milestoneStyle: 'timeline-milestone',
    deviceCardStyle: 'timeline-device-card'
  },
  checklist: {
    accent: Colors.orange,
    background: Colors.surface,
    progressStyle: 'animated-bars',
    layout: 'card-list',
    headerStyle: 'checklist-header',
    navigationStyle: 'checklist-nav',
    itemStyle: 'checklist-item',
    categoryStyle: 'checklist-category'
  }
};


