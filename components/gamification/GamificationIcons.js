import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Responsive, Typography } from '../../theme';
import { getStreakStats } from '../../utils/streakStorage';
import { getEarnedBadgesCount } from '../../utils/badgeStorage';

const GamificationIcons = ({ onStreakPress, onBadgesPress }) => {
  const [streakCount, setStreakCount] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const [flickerAnim] = useState(new Animated.Value(1));
  const [shineAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [badgeScaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const loadData = async () => {
    try {
      const [streakStats, earnedBadges] = await Promise.all([
        getStreakStats(),
        getEarnedBadgesCount()
      ]);
      
      setStreakCount(streakStats?.currentStreak || 0);
      setBadgesCount(earnedBadges || 0);
    } catch (error) {
      console.log('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startAnimations = () => {
    // Flame flicker animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Medal shine animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleStreakPress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onStreakPress) {
      onStreakPress();
    }
  };

  const handleBadgesPress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(badgeScaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(badgeScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onBadgesPress) {
      onBadgesPress();
    }
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  return (
    <View style={styles.container}>
      {/* Streak Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleStreakPress}
          activeOpacity={0.8}
          accessibilityLabel="View streak details"
          accessibilityHint="Shows your current streak and milestones"
        >
          <Animated.View style={[styles.iconBackground, { opacity: flickerAnim }]}>
            <Text style={styles.streakIcon}>🔥</Text>
          </Animated.View>
          <Text style={styles.countText}>{streakCount}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Badges Icon */}
      <Animated.View style={[styles.iconContainer, { transform: [{ scale: badgeScaleAnim }] }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleBadgesPress}
          activeOpacity={0.8}
          accessibilityLabel="View badges"
          accessibilityHint="Shows your earned badges and achievements"
        >
          <View style={styles.iconBackground}>
            <Ionicons 
              name="medal" 
              size={Responsive.iconSizes.medium} 
              color={Colors.accent} 
            />
            {badgesCount > 0 && (
              <Animated.View style={[
                styles.shineOverlay,
                { opacity: shineAnim }
              ]} />
            )}
          </View>
          <Text style={styles.countText}>{badgesCount}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Responsive.spacing.md,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'transparent',
    paddingHorizontal: Responsive.spacing.xs,
    paddingVertical: Responsive.spacing.xs,
  },
  iconBackground: {
    width: Responsive.iconSizes.medium,
    height: Responsive.iconSizes.medium,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  streakIcon: {
    fontSize: Responsive.iconSizes.medium,
    lineHeight: Responsive.iconSizes.medium,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
  },
  countText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
});

export default GamificationIcons;
