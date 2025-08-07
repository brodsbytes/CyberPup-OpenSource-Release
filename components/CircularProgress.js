import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

const CircularProgress = ({ 
  progress = 0, 
  size = 120, 
  strokeWidth = 8, 
  color = '#4a90e2',
  backgroundColor = '#2d5a87',
  showIcon = true,
  showPercentage = true 
}) => {
  console.log('CircularProgress received progress:', progress);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  console.log('CircularProgress debug:', {
    progress,
    circumference,
    strokeDashoffset: circumference - (progress / 100) * circumference,
    radius
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      
      {/* Center content */}
      <View style={styles.centerContent}>
        {showIcon && (
          <Ionicons 
            name="lock-closed" 
            size={size * 0.25} 
            color="#ffffff" 
            style={styles.icon}
          />
        )}
        {showPercentage && (
          <Text style={styles.percentageText}>
            {Math.round(progress)}%
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
    fontSize: 12,
    fontWeight: '600',
    color: '#a0aec0',
    textAlign: 'center',
  },
});

export default CircularProgress; 