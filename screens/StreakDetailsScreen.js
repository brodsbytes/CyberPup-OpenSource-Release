import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { getStreakStats, STREAK_MILESTONES } from '../utils/streakStorage';

const StreakDetailsScreen = ({ navigation }) => {
  const [streakStats, setStreakStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flickerAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadStreakStats();
    startFlickerAnimation();
  }, []);

  const loadStreakStats = async () => {
    try {
      const stats = await getStreakStats();
      setStreakStats(stats);
    } catch (error) {
      console.log('Error loading streak stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startFlickerAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(flickerAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(flickerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const MilestoneCard = ({ milestone, isAchieved, isNext }) => (
    <View style={[
      styles.milestoneCard,
      isAchieved && styles.milestoneCardAchieved,
      isNext && styles.milestoneCardNext
    ]}>
      <View style={styles.milestoneHeader}>
        <Text style={styles.milestoneDays}>{milestone.days} days</Text>
        {isAchieved && (
          <Animated.View style={{ opacity: flickerAnim }}>
            <Text style={styles.milestoneIcon}>🔥</Text>
          </Animated.View>
        )}
      </View>
      <Text style={[
        styles.milestoneTitle,
        isAchieved && styles.milestoneTitleAchieved
      ]}>
        {milestone.title}
      </Text>
      <Text style={[
        styles.milestoneDescription,
        isAchieved && styles.milestoneDescriptionAchieved
      ]}>
        {milestone.description}
      </Text>
      {isNext && streakStats && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${streakStats.streakPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {streakStats.currentStreak} / {milestone.days}
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading streak data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Streak Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Streak Section */}
        <View style={styles.currentStreakSection}>
          <View style={styles.streakCard}>
            <Animated.View style={[styles.streakIconContainer, { opacity: flickerAnim }]}>
              <Text style={styles.streakIcon}>🔥</Text>
            </Animated.View>
            <Text style={styles.currentStreakTitle}>Current Streak</Text>
            <Text style={styles.currentStreakCount}>
              {streakStats?.currentStreak || 0} days
            </Text>
            {streakStats?.isOnFire && (
              <Text style={styles.onFireText}>You're on fire! 🔥</Text>
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streakStats?.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streakStats?.totalDays || 0}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
        </View>

        {/* Milestones Section */}
        <View style={styles.milestonesSection}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          {Object.entries(STREAK_MILESTONES).map(([days, milestone]) => {
            const isAchieved = streakStats?.currentStreak >= parseInt(days);
            const isNext = !isAchieved && streakStats?.nextMilestone?.days === parseInt(days);
            
            return (
              <MilestoneCard
                key={days}
                milestone={{ days: parseInt(days), ...milestone }}
                isAchieved={isAchieved}
                isNext={isNext}
              />
            );
          })}
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: Responsive.iconSizes.large,
  },
  scrollView: {
    flex: 1,
  },
  currentStreakSection: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
  },
  streakCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  streakIconContainer: {
    marginBottom: Responsive.spacing.sm,
  },
  streakIcon: {
    fontSize: Typography.sizes.xxl * 2,
  },
  currentStreakTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  currentStreakCount: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  onFireText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
    gap: Responsive.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  milestonesSection: {
    paddingHorizontal: Responsive.padding.screen,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  milestoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  milestoneCardAchieved: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(91, 163, 240, 0.1)',
  },
  milestoneCardNext: {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.xs,
  },
  milestoneDays: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  milestoneIcon: {
    fontSize: Typography.sizes.lg,
  },
  milestoneTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  milestoneTitleAchieved: {
    color: Colors.accent,
  },
  milestoneDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.sm,
  },
  milestoneDescriptionAchieved: {
    color: Colors.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: Responsive.spacing.xs,
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.small,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.small,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: Responsive.spacing.lg,
  },
});

export default StreakDetailsScreen;
