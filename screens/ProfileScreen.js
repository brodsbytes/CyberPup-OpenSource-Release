import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import { getStreakStats } from '../utils/streakStorage';
import { SCREEN_NAMES } from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StickyGamificationBar from '../components/gamification/StickyGamificationBar';
import StreakDetailsModal from './StreakDetailsScreen';
import BadgesModal from './BadgesScreen';
import CatalogueModal from '../components/navigation/CatalogueModal';

const ProfileScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [activityData, setActivityData] = useState({
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      totalDays: 0,
      nextMilestone: null
    },
    lastBreachCheck: null,
    lastMonthlyCheckup: null
  });

  const loadActivityData = async () => {
    try {
      // Load streak data
      const streakData = await getStreakStats();
      
      // Load last breach check date
      const breachProgressData = await AsyncStorage.getItem('check_1-1-5_progress');
      let lastBreachCheck = null;
      if (breachProgressData) {
        const breachData = JSON.parse(breachProgressData);
        if (breachData.completedAt) {
          lastBreachCheck = new Date(breachData.completedAt);
        }
      }

      // Load last monthly checkup (simulate - could be enhanced with actual monthly checkup tracking)
      const lastMonthlyCheckupData = await AsyncStorage.getItem('last_monthly_checkup');
      let lastMonthlyCheckup = null;
      if (lastMonthlyCheckupData) {
        lastMonthlyCheckup = new Date(lastMonthlyCheckupData);
      }

      setActivityData({
        streak: streakData || {
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
          nextMilestone: null
        },
        lastBreachCheck,
        lastMonthlyCheckup
      });
    } catch (error) {
      console.log('Error loading activity data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivityData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadActivityData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadActivityData();
    }, [])
  );

  const formatDate = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };



  const renderActivityCard = (title, subtitle, icon, value, color = Colors.accent, onPress = null) => (
    <TouchableOpacity 
      style={[styles.activityCard, onPress && styles.activityCardPressable]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.activityCardHeader}>
        <View style={[styles.activityIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={Responsive.iconSizes.medium} color={color} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{title}</Text>
          <Text style={styles.activitySubtitle}>{subtitle}</Text>
        </View>
        {onPress && (
          <Ionicons 
            name="chevron-forward" 
            size={Responsive.iconSizes.small} 
            color={Colors.textSecondary} 
          />
        )}
      </View>
      <Text style={[styles.activityValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Sticky Gamification Bar */}
      <StickyGamificationBar
        onMascotPress={() => setShowCatalogue(true)}
        onStreakPress={() => setShowStreakDetails(true)}
        onBadgesPress={() => setShowBadges(true)}
      />
      
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
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : (
                          <>
                {/* Activity Tracking Section */}
              <View style={styles.section}>
                {/* Last Breach Check */}
                {renderActivityCard(
                  'Last Breach Audit',
                  'Check for compromised accounts',
                  'shield-checkmark',
                  formatDate(activityData.lastBreachCheck),
                  activityData.lastBreachCheck ? Colors.success : Colors.textSecondary,
                  () => navigation.navigate(SCREEN_NAMES.CHECK_1_5_BREACH_CHECK)
                )}

                {/* Last Monthly Checkup */}
                {renderActivityCard(
                  'Last Monthly Checkup',
                  'Review your security status',
                  'calendar',
                  formatDate(activityData.lastMonthlyCheckup),
                  activityData.lastMonthlyCheckup ? Colors.success : Colors.textSecondary,
                  () => navigation.navigate(SCREEN_NAMES.WELCOME)
                )}

                {/* Device Management Section */}
                {renderActivityCard(
                  'Manage Devices',
                  'Update your device list for personalized recommendations',
                  'phone-portrait',
                  '',
                  Colors.accent,
                  () => navigation.navigate(SCREEN_NAMES.DEVICE_AUDIT, { fromProfile: true })
                )}
              </View>

              {/* Settings Section */}
              <View style={[styles.settingsSection, styles.activityCardPressable]}>
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
      


      {/* Modal Components */}
      <StreakDetailsModal
        visible={showStreakDetails}
        onClose={() => setShowStreakDetails(false)}
      />
      
      <BadgesModal
        visible={showBadges}
        onClose={() => setShowBadges(false)}
      />

      <CatalogueModal
        visible={showCatalogue}
        onClose={() => setShowCatalogue(false)}
        navigation={navigation}
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

  section: {
    marginBottom: Responsive.spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  activityCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.md,
  },
  activityCardPressable: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  activityIcon: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  activitySubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  activityValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    textAlign: 'right',
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.large,
    marginBottom: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Responsive.spacing.md,
  },
  profileSectionContent: {
    flex: 1,
  },
  profileSectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  profileSectionDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.3,
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
