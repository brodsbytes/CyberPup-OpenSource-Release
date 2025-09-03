import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Text,
  Image,
} from 'react-native';
import { Colors, Typography, Responsive } from '../../theme';
import { getStreakStats } from '../../utils/streakStorage';
import { getEarnedBadgesCount, refreshBadges as refreshBadgesFromStorage } from '../../utils/badgeStorage';
import { levels, getAllChecks, getAreasByLevel } from '../../data/courseData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

// Import icons
import { ProgressIcon, FireIcon, TrophyIcon } from './icons';
import AnimatedStatItem from './AnimatedStatItem';

const StickyGamificationBar = ({ 
  onMascotPress, 
  onStreakPress, 
  onBadgesPress,
  showMascot = true,
  showStreak = true,
  showBadges = true,
  showLabels = false,
  activeLevel = null,
  onRefresh
}) => {
  const [streakCount, setStreakCount] = useState(0);
  const [badgesCount, setBadgesCount] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1); // Default to level 1
  const [currentActiveLevel, setCurrentActiveLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Refresh badges and update count
  const refreshBadges = async () => {
    try {
      const newUnlockedBadges = await refreshBadgesFromStorage();
      const earnedBadges = await getEarnedBadgesCount();
      setBadgesCount(earnedBadges || 0);
      
      // Notify parent component if callback provided
      if (onRefresh) {
        onRefresh(newUnlockedBadges);
      }
      
      return newUnlockedBadges;
    } catch (error) {
      console.log('Error refreshing badges:', error);
      return [];
    }
  };

  // Expose refresh function to parent component
  useEffect(() => {
    if (onRefresh) {
      onRefresh(refreshBadges);
    }
  }, []);

  // Animation and press handling now managed by AnimatedStatItem components

  // Don't return null when loading, just show the bar without counts

  return (
    <View style={styles.gamificationBar}>
      <View style={styles.gamificationContent}>
        {/* Progress/Levels */}
        {showMascot && (
          <AnimatedStatItem 
            icon={<ProgressIcon size={24} />}
            count={isLoading ? '-' : ((activeLevel || currentActiveLevel) ? (activeLevel || currentActiveLevel).id : currentLevel)}
            type="progress"
            label={showLabels ? "Level" : null}
            onPress={onMascotPress}
            accessibilityLabel="View level catalogue"
            accessibilityHint="Shows all available security levels"
          />
        )}

        {/* Streak */}
        {showStreak && (
          <AnimatedStatItem 
            icon={<FireIcon size={24} />} 
            count={isLoading ? '-' : streakCount}
            type="fire"
            label={showLabels ? "Streak" : null}
            onPress={onStreakPress}
            accessibilityLabel="View streak details"
            accessibilityHint="Shows your current streak and milestones"
          />
        )}

        {/* Badges */}
        {showBadges && (
          <AnimatedStatItem 
            icon={<TrophyIcon size={24} />} 
            count={isLoading ? '-' : badgesCount}
            type="trophy"
            label={showLabels ? "Awards" : null}
            onPress={onBadgesPress}
            accessibilityLabel="View badges"
            accessibilityHint="Shows your earned badges and achievements"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gamificationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    zIndex: 1000,
  },
  gamificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
});

export default StickyGamificationBar;
