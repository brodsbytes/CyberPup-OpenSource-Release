import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 12 Pro - 390x844)
const baseWidth = 390;
const baseHeight = 844;

// iPhone SE dimensions (375x667)
const seWidth = 375;
const seHeight = 667;

// Scale factors
const widthScale = screenWidth / baseWidth;
const heightScale = screenHeight / baseHeight;

// Responsive scaling function
export const scale = (size) => {
  const newSize = size * widthScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive scaling for height
export const scaleVertical = (size) => {
  const newSize = size * heightScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive scaling for moderate scaling (less aggressive)
export const scaleModerate = (size) => {
  const newSize = size * Math.min(widthScale, 0.9); // Cap at 90% of original size
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive scaling for conservative scaling (more aggressive for small screens)
export const scaleConservative = (size) => {
  const newSize = size * Math.min(widthScale, 0.8); // Cap at 80% of original size
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Screen size detection
export const isSmallScreen = screenWidth <= 375; // iPhone SE and smaller
export const isMediumScreen = screenWidth > 375 && screenWidth <= 414; // iPhone 12/13/14
export const isLargeScreen = screenWidth > 414; // iPhone Plus, Pro Max, etc.

// Responsive spacing
export const responsiveSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive typography
export const responsiveTypography = {
  sizes: {
    xs: scaleConservative(12),
    sm: scaleConservative(14),
    md: scaleConservative(16),
    lg: scaleConservative(18),
    xl: scaleConservative(20),
    xxl: scaleConservative(24),
    xxxl: scaleConservative(32),
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Responsive padding/margins
export const responsivePadding = {
  screen: isSmallScreen ? scale(16) : scale(20),
  card: isSmallScreen ? scale(12) : scale(16),
  button: isSmallScreen ? scale(10) : scale(12),
  modal: isSmallScreen ? scale(16) : scale(24),
};

// Responsive border radius
export const responsiveBorderRadius = {
  small: scale(6),
  medium: scale(8),
  large: scale(12),
  xlarge: scale(16),
  xxlarge: scale(20),
};

// Responsive icon sizes
export const responsiveIconSizes = {
  small: scale(16),
  medium: scale(20),
  large: scale(24),
  xlarge: scale(32),
  xxlarge: scale(48),
};

// Responsive button heights
export const responsiveButtonHeight = {
  small: scale(36),
  medium: scale(44),
  large: scale(52),
};

// Responsive input heights
export const responsiveInputHeight = {
  small: scale(36),
  medium: scale(44),
  large: scale(52),
};

// Screen dimensions
export const screenDimensions = {
  width: screenWidth,
  height: screenHeight,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
};

// Modal dimensions
export const modalDimensions = {
  width: isSmallScreen ? screenWidth - scale(32) : screenWidth - scale(40),
  maxHeight: screenHeight * 0.8,
  borderRadius: responsiveBorderRadius.xlarge,
};

// Card dimensions
export const cardDimensions = {
  padding: responsivePadding.card,
  borderRadius: responsiveBorderRadius.large,
  marginHorizontal: responsivePadding.screen,
};
