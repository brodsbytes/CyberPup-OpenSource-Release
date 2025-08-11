// Centralized color palette
export const Colors = {
  background: '#2C2C2E',
  surface: '#3A3A3C',
  surfaceAlt: '#2C2C2E',
  border: '#48484A',
  textPrimary: '#F2F2F7',
  textSecondary: '#D1D1D6',
  muted: '#8E8E93',
  accent: '#5BA3F0',
  accentSoft: 'rgba(74, 144, 226, 0.2)',
  track: '#1C1C1E',
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

// Spacing constants for consistent layout
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography constants
export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Common styles for reuse
export const CommonStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
};


