import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { getStreakStats, STREAK_MILESTONES } from '../utils/streakStorage';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');

const StreakDetailsModal = ({ visible, onClose }) => {
  const [streakStats, setStreakStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [flickerAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadStreakStats();
      startFlickerAnimation();
      // Haptic feedback on open
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

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

  const handleClose = () => {
    // Haptic feedback on close
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const StatCard = ({ icon, label, value, isHighlighted = false }) => (
    <View style={[styles.statCard, isHighlighted && styles.statCardHighlighted]}>
      <View style={styles.statIconContainer}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, isHighlighted && styles.statValueHighlighted]}>
        {value}
      </Text>
    </View>
  );

  const MilestoneCard = ({ milestone, isAchieved, isNext, index, totalMilestones }) => (
    <View style={styles.milestoneWrapper}>
      <View style={[
        styles.milestoneCard,
        isAchieved && styles.milestoneCardAchieved,
        isNext && styles.milestoneCardNext
      ]}>
        <View style={styles.milestoneHeader}>
          <View style={styles.milestoneIconContainer}>
            <Text style={styles.milestoneIcon}>🔥</Text>
          </View>
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>
              {milestone.title}
            </Text>
            <Text style={styles.milestoneDescription}>
              {milestone.days} day streak
            </Text>
          </View>
          {isAchieved && (
            <Animated.View style={{ opacity: flickerAnim }}>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={Colors.accent} 
                style={styles.achievedIcon}
              />
            </Animated.View>
          )}
        </View>
        
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
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Compact Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Streak Details</Text>
              <Text style={styles.headerSubtitle}>
                Track your learning progress and milestones
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading streak data...</Text>
              </View>
            ) : (
              <>
                {/* Current Stats Row */}
                <View style={styles.statsSection}>
                  <StatCard
                    icon="🔥"
                    label="Current Streak"
                    value={`${streakStats?.currentStreak || 0} days`}
                    isHighlighted={streakStats?.isOnFire}
                  />
                  <StatCard
                    icon="📈"
                    label="Longest Streak"
                    value={`${streakStats?.longestStreak || 0} days`}
                  />
                  <StatCard
                    icon="📅"
                    label="Total Days"
                    value={`${streakStats?.totalDays || 0} days`}
                  />
                </View>

                {/* Milestones Section */}
                <View style={styles.milestonesSection}>
                  <Text style={styles.sectionTitle}>Milestones</Text>
                  <View style={styles.milestonesContainer}>
                    {Object.entries(STREAK_MILESTONES).map(([days, milestone], index) => {
                      const isAchieved = streakStats?.currentStreak >= parseInt(days);
                      const isNext = !isAchieved && streakStats?.nextMilestone?.days === parseInt(days);
                      
                      return (
                        <MilestoneCard
                          key={days}
                          milestone={{ days: parseInt(days), ...milestone }}
                          isAchieved={isAchieved}
                          isNext={isNext}
                          index={index}
                          totalMilestones={Object.keys(STREAK_MILESTONES).length}
                        />
                      );
                    })}
                  </View>
                </View>
                
                {/* Minimal bottom spacing */}
                <View style={{ height: Responsive.spacing.md }} />
              </>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Responsive.borderRadius.xlarge,
    borderTopRightRadius: Responsive.borderRadius.xlarge,
    maxHeight: height * 0.85,
    minHeight: height * 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md, // Reduced from lg
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs, // Reduced from xs
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm, // Reduced from md
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.sm, // Reduced from lg
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Responsive.spacing.xl,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.md,
  },
  statsSection: {
    flexDirection: 'row',
    marginBottom: Responsive.spacing.lg, // Reduced from xl
    gap: Responsive.spacing.sm, // Reduced gap
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium, // Reduced from large
    padding: Responsive.spacing.md, // Reduced from card
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardHighlighted: {
    borderColor: Colors.accent,
    backgroundColor: 'rgba(91, 163, 240, 0.1)',
  },
  statIconContainer: {
    marginBottom: Responsive.spacing.xs, // Reduced from sm
  },
  statIcon: {
    fontSize: Typography.sizes.lg, // Reduced from xl
  },
  statLabel: {
    fontSize: Typography.sizes.xs, // Reduced from sm
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.md, // Reduced from lg
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  statValueHighlighted: {
    color: Colors.accent,
  },
  milestonesSection: {
    marginBottom: Responsive.spacing.lg, // Reduced from xl
  },
  sectionTitle: {
    fontSize: Typography.sizes.md, // Reduced from lg
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm, // Reduced from md
  },
  milestonesContainer: {
    position: 'relative',
  },
  milestoneWrapper: {
    marginBottom: Responsive.spacing.md,
  },
  milestoneCard: {
    backgroundColor: Colors.cardNotStarted,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardNotStartedBorder,
    opacity: 0.7, // Grey out unachieved milestones
    zIndex: 1, // Above the connector line
  },
  milestoneCardAchieved: {
    borderColor: Colors.accent,
    backgroundColor: Colors.cardCompleted,
    opacity: 1, // Full opacity for achieved milestones
  },
  milestoneCardNext: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.cardInProgress,
    opacity: 1,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.xs,
  },
  milestoneIconContainer: {
    marginRight: Responsive.spacing.sm,
  },
  milestoneIcon: {
    fontSize: Typography.sizes.lg,
  },
  milestoneContent: {
    flex: 1,
  },
  achievedIcon: {
    marginLeft: Responsive.spacing.sm,
  },
  milestoneTitle: {
    fontSize: Typography.sizes.sm, // Reduced from md
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  milestoneDescription: {
    fontSize: Typography.sizes.xs, // Reduced from sm
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
    marginTop: Responsive.spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 3, // Reduced from xs
    backgroundColor: Colors.track,
    borderRadius: 2, // Reduced from small
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2, // Reduced from small
  },
  progressText: {
    fontSize: Typography.sizes.xs, // Reduced from sm
    color: Colors.textSecondary,
    minWidth: 35, // Reduced from 40
    textAlign: 'right',
  },
});

export default StreakDetailsModal;
