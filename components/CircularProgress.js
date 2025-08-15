import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../theme';
import { APP_CONSTANTS } from '../constants';
import * as Haptics from 'expo-haptics';

const CircularProgress = ({
  progress = APP_CONSTANTS.PROGRESS.MIN_PROGRESS,
  size = 120,
  strokeWidth = 8,
  color = Colors.accent,
  backgroundColor = Colors.track,
  showIcon = true,
  showPercentage = true,
  showBackground = true,
  glow = false,
  onPress,
  interactive = false,
}) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0.7));
  const pulseTimeoutRef = useRef(null);

  const normalized = Math.max(
    APP_CONSTANTS.PROGRESS.MIN_PROGRESS, 
    Math.min(APP_CONSTANTS.PROGRESS.MAX_PROGRESS, Number(progress) || 0)
  );
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Dynamic color based on score
  const getScoreColor = (score) => {
    // Dark mode color mapping (slightly desaturated for accessibility)
    const colors = {
      0: '#FF6666',    // Red
      25: '#FF8C66',   // Orange-red
      50: '#FFDD66',   // Yellow
      75: '#99CC66',   // Yellow-green
      100: '#66BB6A',  // Green
    };

    // Interpolate between colors based on score
    if (score <= 25) {
      const ratio = score / 25;
      return interpolateColor(colors[0], colors[25], ratio);
    } else if (score <= 50) {
      const ratio = (score - 25) / 25;
      return interpolateColor(colors[25], colors[50], ratio);
    } else if (score <= 75) {
      const ratio = (score - 50) / 25;
      return interpolateColor(colors[50], colors[75], ratio);
    } else {
      const ratio = (score - 75) / 25;
      return interpolateColor(colors[75], colors[100], ratio);
    }
  };

  // Helper function to interpolate between two hex colors
  const interpolateColor = (color1, color2, ratio) => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const scoreColor = getScoreColor(normalized);
  const dynamicColor = interactive ? scoreColor : color;

  // Pulse animation for tap feedback
  const handlePress = () => {
    if (!interactive || !onPress) return;

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Call the onPress handler
    onPress();
  };

  // Glow animation (subtle pulsing)
  useEffect(() => {
    if (!interactive) return;

    const startGlowAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.0,
            duration: 1500, // 1.5 seconds
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 1500, // 1.5 seconds
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startGlowAnimation();

    return () => {
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
    };
  }, [interactive, glowAnim]);

  const CenterContent = () => (
    <View style={styles.centerContent}>
      {showPercentage && (
        <Animated.Text 
          style={[
            styles.percentageText,
            { 
              color: dynamicColor,
              transform: [{ scale: pulseAnim }],
              opacity: interactive ? glowAnim : 1,
            }
          ]}
        >
          {Math.round(normalized)}
        </Animated.Text>
      )}
    </View>
  );

  const ProgressComponent = () => (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Optional background circle */}
        {showBackground && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        )}
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={dynamicColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (normalized / 100) * circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <CenterContent />
    </View>
  );

  if (interactive) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.touchableContainer}
      >
        <ProgressComponent />
      </TouchableOpacity>
    );
  }

  return <ProgressComponent />;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 4,
  },
  percentageText: {
    fontSize: Typography.sizes.xxl * 2,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
});

export default CircularProgress; 