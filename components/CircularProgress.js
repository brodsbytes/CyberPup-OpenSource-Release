import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../theme';
import { APP_CONSTANTS } from '../constants';

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
}) => {
  const normalized = Math.max(
    APP_CONSTANTS.PROGRESS.MIN_PROGRESS, 
    Math.min(APP_CONSTANTS.PROGRESS.MAX_PROGRESS, Number(progress) || 0)
  );
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
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
        {/* Optional glow ring */}
        {glow && (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth + 8}
            strokeOpacity={0.25}
            fill="transparent"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (normalized / 100) * circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {showPercentage && (
          <Text style={styles.percentageText}>
            {Math.round(normalized)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
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
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default CircularProgress; 