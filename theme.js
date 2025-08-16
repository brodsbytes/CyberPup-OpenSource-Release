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

// Dark mode color palette (following iOS/macOS design system)
export const Colors = {
  background: '#2C2C2E',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  dropdownBackground: '#3A3A3C',
  border: '#48484A',
  textPrimary: '#F2F2F7',
  textSecondary: '#D1D1D6',
  muted: '#8E8E93',
  accent: '#4A7CBE',
  accentSoft: 'rgba(74, 144, 226, 0.2)',
  track: '#1C1C1E', //#1C1C1E
  // Card-specific colors for progression states
  cardCompleted: 'rgba(91, 163, 240, 0.1)',
  cardInProgress: '#1C1C1E', 
  cardNotStarted: '#1C1C1E', 
  cardCompletedBorder: '#4A7CBE',
  cardInProgressBorder: '#48484A',
  cardNotStartedBorder: '#48484A',
  // Status colors
  success: '#27ae60',
  warning: '#ff6b6b',
  error: '#e74c3c',
  disabled: '#a0aec0',
  // Status backgrounds
  successSoft: 'rgba(39, 174, 96, 0.15)',
  warningSoft: 'rgba(255, 107, 107, 0.15)',
  errorSoft: 'rgba(231, 76, 60, 0.15)',
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
    shadowColor: '#000',
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
};


