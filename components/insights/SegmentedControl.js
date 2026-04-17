import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Responsive } from '../../theme';

const SegmentedControl = ({ segments, value, onChange }) => {
  const animatedValues = useRef(segments.map(() => new Animated.Value(0))).current;

  // Animate the active segment
  useEffect(() => {
    animatedValues.forEach((animValue, index) => {
      Animated.timing(animValue, {
        toValue: value === index ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
  }, [value, animatedValues]);

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        {segments.map((segment, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.segment,
              value === index && styles.segmentActive,
              pressed && styles.segmentPressed, // Hover/press effect
            ]}
            onPress={() => onChange(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: value === index }}
            accessibilityLabel={segment}
          >
            <Animated.View
              style={[
                styles.segmentBackground,
                {
                  opacity: animatedValues[index],
                  transform: [{
                    scale: animatedValues[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  }],
                },
              ]}
            />
            <Text
              style={[
                styles.segmentText,
                value === index && styles.segmentTextActive,
              ]}
            >
              {segment}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
  },
  track: {
    flexDirection: 'row',
    backgroundColor: Colors.surface, // Match search bar background color
    borderRadius: Responsive.borderRadius.xlarge, // Keep rounded corners
    padding: Responsive.spacing.sm, // Reduced padding for more compact look
    minHeight: Responsive.buttonHeight.large, // Reduced height for more compact feel
    // Remove glass morphism effects - solid background
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.padding.button * 1.2, // Reduced padding for more compact look
    paddingHorizontal: Responsive.spacing.lg, // Reduced horizontal padding
    minHeight: Responsive.buttonHeight.large,
    borderRadius: Responsive.borderRadius.large, // Slightly less rounded for more compact feel
    marginHorizontal: Responsive.spacing.xs, // Keep small gap between container edge and buttons
    // Inactive button styling - completely transparent with subtle text
    backgroundColor: 'transparent',
    position: 'relative', // For absolute positioned background
  },
  segmentBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Active button styling - strong blue background
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.large,
    // Removed glow effect - no shadow or elevation
  },
  segmentActive: {
    // Active state is handled by the animated background
  },
  segmentPressed: {
    // Subtle hover/press effect
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Slight background tint
  },
  segmentText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium, // Medium weight for inactive
    color: Colors.textSecondary, // Subtle text color for inactive
  },
  segmentTextActive: {
    color: Colors.textPrimary, // White text for active
    fontWeight: Typography.weights.bold, // Bold weight for active
  },
});

export default SegmentedControl;
