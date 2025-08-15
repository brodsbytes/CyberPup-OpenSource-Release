import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import Badge from '../components/Badge';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';

import { 
  loadUserBadges, 
  getEarnedBadgesCount, 
  BADGE_TYPES 
} from '../utils/badgeStorage';
import { SCREEN_NAMES } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllChecks } from '../data/courseData';

const ProfileScreen = ({ navigation }) => {

  const [userBadges, setUserBadges] = useState([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBadges: 0,
    areaBadges: 0,
    levelBadges: 0,
    specialBadges: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [checksProgress, setChecksProgress] = useState({
    completedChecks: 0,
    totalChecks: 0,
    progressPercentage: 0
  });

  const calculateChecksProgress = async () => {
    try {
      const allChecks = getAllChecks();
      setChecksProgress(prev => ({ ...prev, totalChecks: allChecks.length }));
      
      let completedCount = 0;

      // Check each check for completion
      for (const check of allChecks) {
        const progressKey = `check_${check.id}_completed`;
        const progressData = await AsyncStorage.getItem(progressKey);
        
        if (progressData === 'completed') {
          completedCount++;
        }
      }

      const progressPercentage = allChecks.length > 0 ? Math.round((completedCount / allChecks.length) * 100) : 0;
      
      setChecksProgress({
        completedChecks: completedCount,
        totalChecks: allChecks.length,
        progressPercentage
      });
    } catch (error) {
      console.log('Error calculating checks progress:', error);
    }
  };

  const loadBadges = async () => {
    try {
      console.log('Loading badges...');
      const badges = await loadUserBadges();
      const earned = await getEarnedBadgesCount();
      
      console.log('Badges loaded:', badges.length, 'Earned:', earned);
      
      setUserBadges(badges);
      setEarnedCount(earned);
      
      // Calculate stats
      const areaBadges = badges.filter(b => b.type === BADGE_TYPES.AREA && b.isEarned).length;
      const levelBadges = badges.filter(b => b.type === BADGE_TYPES.LEVEL && b.isEarned).length;
      const specialBadges = badges.filter(b => b.type === BADGE_TYPES.SPECIAL && b.isEarned).length;
      
      setStats({
        totalBadges: badges.length,
        areaBadges,
        levelBadges,
        specialBadges,
      });
      
      console.log('Stats calculated:', { totalBadges: badges.length, areaBadges, levelBadges, specialBadges });
      
      // Calculate checks progress
      await calculateChecksProgress();
    } catch (error) {
      console.log('Error loading badges:', error);
      // Set default values to prevent rendering issues
      setUserBadges([]);
      setEarnedCount(0);
      setStats({
        totalBadges: 0,
        areaBadges: 0,
        levelBadges: 0,
        specialBadges: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  };

  useEffect(() => {
    loadBadges();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBadges();
    }, [])
  );

  const getBadgesByType = (type) => {
    return userBadges.filter(badge => badge.type === type);
  };

  const renderBadgeSection = (title, badges, type) => {
    if (!badges || badges.length === 0) {
      return null;
    }
    
    const earnedBadges = badges.filter(b => b.isEarned);
    const unearnedBadges = badges.filter(b => !b.isEarned);
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>
            {earnedBadges.length} of {badges.length} earned
          </Text>
        </View>
        
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <Badge
              key={badge.id}
              badge={badge}
              size="medium"
              showDetails={true}
              style={styles.badgeItem}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Your Cyber Security Journey</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading badges...</Text>
            </View>
          ) : (
            <>
              {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trophy" size={Responsive.iconSizes.large} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{earnedCount}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="shield-checkmark" size={Responsive.iconSizes.large} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{stats.areaBadges}</Text>
              <Text style={styles.statLabel}>Areas Mastered</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={Responsive.iconSizes.large} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{stats.specialBadges}</Text>
              <Text style={styles.statLabel}>Special Achievements</Text>
            </View>
          </View>

          {/* Checks Progress Overview */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Security Checks Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${checksProgress.progressPercentage}%`
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {checksProgress.completedChecks} of {checksProgress.totalChecks} checks completed
            </Text>
          </View>

          {/* Area Badges */}
          {renderBadgeSection(
            'Area Badges', 
            getBadgesByType(BADGE_TYPES.AREA),
            BADGE_TYPES.AREA
          )}

          {/* Level Badges */}
          {renderBadgeSection(
            'Level Badges', 
            getBadgesByType(BADGE_TYPES.LEVEL),
            BADGE_TYPES.LEVEL
          )}

          {/* Special Badges */}
          {renderBadgeSection(
            'Special Achievements', 
            getBadgesByType(BADGE_TYPES.SPECIAL),
            BADGE_TYPES.SPECIAL
          )}

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>Settings</Text>
            

            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
              <Text style={styles.settingText}>Notification Preferences</Text>
              <Ionicons name="chevron-forward" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="help-circle" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
              <Text style={styles.settingText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="information-circle" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
              <Text style={styles.settingText}>About CyberPup</Text>
              <Ionicons name="chevron-forward" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
            </>
          )}
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="profile"
        onTabPress={(screen) => {
          console.log('ProfileScreen - Tab pressed:', screen);
          if (screen === SCREEN_NAMES.WELCOME) {
            navigation.navigate(SCREEN_NAMES.WELCOME);
          } else if (screen === SCREEN_NAMES.INSIGHTS) {
            navigation.navigate(SCREEN_NAMES.INSIGHTS);
          } else if (screen === SCREEN_NAMES.PROFILE) {
            // Already on profile screen
            console.log('Already on profile screen');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Responsive.padding.screen,
  },
  header: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Responsive.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    alignItems: 'center',
    marginHorizontal: Responsive.spacing.xs,
  },
  statIcon: {
    marginBottom: Responsive.spacing.sm,
  },
  statNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  progressTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  progressBar: {
    height: Responsive.spacing.sm,
    backgroundColor: Colors.border,
    borderRadius: Responsive.borderRadius.small,
    marginBottom: Responsive.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.small,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: Responsive.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    marginBottom: Responsive.spacing.md,
    width: '30%',
  },
  settingsSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
  },
  settingsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Responsive.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Responsive.iconSizes.xlarge,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;
