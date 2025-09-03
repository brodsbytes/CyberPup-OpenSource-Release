import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Colors, Typography, Responsive } from '../../theme';
import * as Haptics from 'expo-haptics';

const AnimatedStatItem = ({ icon, count, type, label, onPress, accessibilityLabel, accessibilityHint }) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [bounceAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Special animation for robot dog (more prominent)
    if (type === 'dog' && count > 0) {
      const dogAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      dogAnimation.start();
      return () => dogAnimation.stop();
    } else if (count > 0) {
      // Subtle animation for other icons
      const subtleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );
      subtleAnimation.start();
      return () => subtleAnimation.stop();
    }
  }, [count, type]);

  // Bounce when count changes
  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count]);

  const bounceTransform = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Scale animation on press
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={styles.statItem}>
      <TouchableOpacity
        style={styles.touchableContent}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: pulseAnim },
                { translateY: bounceTransform }
              ],
            }
          ]}
        >
          {React.cloneElement(icon, { animated: count > 0 })}
        </Animated.View>
        <Text style={styles.countText}>
          {count}
        </Text>
        {label && (
          <Text style={styles.labelText}>{label}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  iconContainer: {
    width: 28,
    height: 28,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  
  // Intentionally keeping count text consistent across items (white)
  
  labelText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});

export default AnimatedStatItem;
