import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { getStreakStats } from '../utils/streakStorage';
import { getEarnedBadgesCount } from '../utils/badgeStorage';
import { levels, getAllChecks, getAreasByLevel } from '../data/courseData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const StickyGamificationBar = ({ 
  onMascotPress, 
  onStreakPress, 
  onBadgesPress,
  showMascot = true,
  showStreak = true,
  showBadges = true,
  activeLevel = null
}) => {
  const [streakCount, setStreakCount] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);
  const [currentActiveLevel, setCurrentActiveLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation values
  const [mascotAnim] = useState(new Animated.Value(1));
  const [streakAnim] = useState(new Animated.Value(1));
  const [badgesAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadData();
  }, []);

  const loadActiveLevel = async () => {
    try {
      // Helper to compute if a check is completed
      const getCheckStatus = async (check) => {
        const progressKey = `check_${check.id}_completed`;
        const progressData = await AsyncStorage.getItem(progressKey);
        return progressData === 'completed';
      };

      // Load all levels with progress
      const levelsWithProgress = await Promise.all(
        levels.map(async (level) => {
          const areas = getAreasByLevel(level.id);
          const areasWithProgress = await Promise.all(
            areas.map(async (area) => {
              const checks = area.checks || [];
              let completedChecks = 0;
              
              for (const check of checks) {
                const isCompleted = await getCheckStatus(check);
                if (isCompleted) {
                  completedChecks++;
                }
              }
              
              return {
                ...area,
                completedChecks,
                totalChecks: checks.length
              };
            })
          );
          
          return {
            ...level,
            areas: areasWithProgress
          };
        })
      );

      // Find the first level that is not fully complete
      let activeLevel = null;
      for (const level of levelsWithProgress) {
        const totalChecks = level.areas.reduce((sum, area) => sum + area.totalChecks, 0);
        const completedChecks = level.areas.reduce((sum, area) => sum + area.completedChecks, 0);
        
        if (completedChecks < totalChecks) {
          activeLevel = level;
          break;
        }
      }

      // If all levels are complete, use the last level
      if (!activeLevel && levelsWithProgress.length > 0) {
        activeLevel = levelsWithProgress[levelsWithProgress.length - 1];
      }

      setCurrentActiveLevel(activeLevel);
    } catch (error) {
      console.log('Error loading active level:', error);
    }
  };

  const loadData = async () => {
    try {
      const [streakStats, earnedBadges] = await Promise.all([
        getStreakStats(),
        getEarnedBadgesCount(),
        loadActiveLevel()
      ]);
      
      setStreakCount(streakStats?.currentStreak || 0);
      setBadgesCount(earnedBadges || 0);
    } catch (error) {
      console.log('Error loading gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animatePress = (animValue) => {
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMascotPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animatePress(mascotAnim);
    if (onMascotPress) {
      onMascotPress();
    }
  };

  const handleStreakPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animatePress(streakAnim);
    if (onStreakPress) {
      onStreakPress();
    }
  };

  const handleBadgesPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animatePress(badgesAnim);
    if (onBadgesPress) {
      onBadgesPress();
    }
  };

  // Don't return null when loading, just show the bar without counts

  return (
    <View style={styles.gamificationBar}>
      <View style={styles.gamificationContent}>
        {/* CyberPup Mascot */}
        {showMascot && (
          <Animated.View style={{ transform: [{ scale: mascotAnim }] }}>
            <TouchableOpacity
              style={styles.gamificationIcon}
              onPress={handleMascotPress}
              activeOpacity={0.8}
              accessibilityLabel="View level catalogue"
              accessibilityHint="Shows all available security levels"
            >
              <Ionicons name="paw-outline" size={24} color={Colors.textSecondary} />
              {(activeLevel || currentActiveLevel) && (
                <Text style={styles.gamificationText}>
                  {(activeLevel || currentActiveLevel).id}
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Streak */}
        {showStreak && (
          <Animated.View style={{ transform: [{ scale: streakAnim }] }}>
            <TouchableOpacity
              style={styles.gamificationIcon}
              onPress={handleStreakPress}
              activeOpacity={0.8}
              accessibilityLabel="View streak details"
              accessibilityHint="Shows your current streak and milestones"
            >
              <Ionicons name="flame-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.gamificationText}>{isLoading ? '-' : streakCount}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Badges */}
        {showBadges && (
          <Animated.View style={{ transform: [{ scale: badgesAnim }] }}>
            <TouchableOpacity
              style={styles.gamificationIcon}
              onPress={handleBadgesPress}
              activeOpacity={0.8}
              accessibilityLabel="View badges"
              accessibilityHint="Shows your earned badges and achievements"
            >
              <Ionicons name="ribbon-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.gamificationText}>{isLoading ? '-' : badgesCount}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gamificationBar: {
    backgroundColor: 'transparent',
    paddingVertical: Responsive.spacing.xs,
    paddingHorizontal: Responsive.padding.screen,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1000,
  },
  gamificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  gamificationIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Responsive.spacing.xs,
  },
  gamificationText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.xs,
  },
});

export default StickyGamificationBar;
