import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography } from '../../theme';
import { scale } from '../../utils/responsive';
import * as Haptics from 'expo-haptics';

// Helper function to convert polar coordinates to cartesian
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const CircularProgress = ({
  progress = 0,
  size = 160,
  strokeWidth = 12,
  backgroundColor = Colors.track,
  showPercentage = true,
  interactive = false,
  onPress,
  forceAnimation = false,
  staticMode = false, // New prop to enable static mode
}) => {
  const [animatedProgress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [staticProgress, setStaticProgress] = useState(0);
  
  // Generate unique gradient ID to prevent conflicts
  const gradientId = `progressGradient-${Math.random().toString(36).substr(2, 9)}`;

  const normalized = Math.max(0, Math.min(100, Number(progress) || 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Speedometer style: 200 degrees arc starting from bottom-left
  const arcAngle = 200; // degrees
  const arcLength = (arcAngle / 360) * circumference;
  const gap = circumference - arcLength;
  
  // Background arc - always shows full arc
  const backgroundDasharray = `${arcLength} ${gap}`;
  
  // Progress arc - shows progress portion
  const progressLength = (normalized / 100) * arcLength;
  const progressGap = circumference - progressLength;
  const progressDasharray = `${progressLength} ${progressGap}`;

  // Calculate arc path for progress
  const centerX = size / 2;
  const centerY = size / 2;
  const startAngle = 260; // Starting angle (rotated 90 degrees clockwise from 170)
  
  const AnimatedPath = Animated.createAnimatedComponent(Path);
  
  // Static progress arc that doesn't use animations
  const StaticProgressArc = ({ progressValue }) => {
    const endAngle = startAngle + (progressValue / 100) * arcAngle;
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = (progressValue / 100) * arcAngle > 180 ? 1 : 0;
    const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    
    return progressValue > 0 ? (
      <>
        {/* Primary gradient path */}
        <Path
          d={arcPath}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Fallback solid color path in case gradient fails */}
        <Path
          d={arcPath}
          stroke="#2196F3"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          opacity={0.8}
        />
      </>
    ) : null;
  };

  const AnimatedProgressArc = () => {
    const [currentProgress, setCurrentProgress] = useState(0);
    
    useEffect(() => {
      const listener = animatedProgress.addListener(({ value }) => {
        setCurrentProgress(value);
      });
      
      return () => {
        animatedProgress.removeListener(listener);
      };
    }, []);
    
    const endAngle = startAngle + (currentProgress / 100) * arcAngle;
    const start = polarToCartesian(centerX, centerY, radius, startAngle);
    const end = polarToCartesian(centerX, centerY, radius, endAngle);
    const largeArcFlag = (currentProgress / 100) * arcAngle > 180 ? 1 : 0;
    const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
    
    return currentProgress > 0 ? (
      <Path
        d={arcPath}
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeLinecap="round"
      />
    ) : null;
  };

  // Animate progress when it changes
  useEffect(() => {
    if (staticMode) {
      // In static mode, just set the static progress value
      setStaticProgress(normalized);
    } else {
      // In animated mode, animate to the new value
      Animated.timing(animatedProgress, {
        toValue: normalized,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [normalized, forceAnimation, staticMode]);

  // Handle press with haptic feedback
  const handlePress = () => {
    if (!interactive || !onPress) return;

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

    onPress();
  };

  const CenterContent = () => (
    <View style={styles.centerContent}>
      {showPercentage && (
        <Animated.Text 
          style={[
            styles.scoreText,
            { 
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          {Math.round(normalized)}
        </Animated.Text>
      )}
      {showPercentage && (
        <Text style={styles.scoreLabelText}>
          Secure Score
        </Text>
      )}
    </View>
  );

  const ProgressComponent = () => (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        
        {/* Define the gradient */}
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#2196F3" stopOpacity="1" />
            <Stop offset="50%" stopColor="#42A5F5" stopOpacity="0.7" />
            <Stop offset="100%" stopColor="#64B5F6" stopOpacity="0.2" />
          </LinearGradient>
        </Defs>
        
        <Path
          d={`M ${polarToCartesian(centerX, centerY, radius, startAngle).x} ${polarToCartesian(centerX, centerY, radius, startAngle).y} A ${radius} ${radius} 0 1 1 ${polarToCartesian(centerX, centerY, radius, startAngle + arcAngle).x} ${polarToCartesian(centerX, centerY, radius, startAngle + arcAngle).y}`}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        
        {staticMode ? (
          <StaticProgressArc progressValue={staticProgress} />
        ) : (
          <AnimatedProgressArc />
        )}
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
    top: '20%', // Position content higher to sit within the semi-circle
  },
  scoreText: {
    fontSize: scale(80), // Increased from 72 to 80 for more prominent display
    fontWeight: '300',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  scoreLabelText: {
    fontSize: scale(16),
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: scale(2), // Reduced from 8 to 2 to bring text closer to number
    opacity: 0.8,
  },
});

export default CircularProgress; 