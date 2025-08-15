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
import { isSmallScreen } from '../utils/responsive';
import { loadUserBadges, getEarnedBadgesCount } from '../utils/badgeStorage';
import Badge from '../components/Badge';

const BadgesScreen = ({ navigation }) => {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earnedCount, setEarnedCount] = useState(0);
  const [shineAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadBadges();
    startShineAnimation();
  }, []);

  const loadBadges = async () => {
    try {
      const userBadges = await loadUserBadges();
      const earnedCount = await getEarnedBadgesCount();
      setBadges(userBadges);
      setEarnedCount(earnedCount);
    } catch (error) {
      console.log('Error loading badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startShineAnimation = () => {
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

  const getBadgesByType = (type) => {
    return badges.filter(badge => badge.type === type);
  };

  const BadgeSection = ({ title, badges, type }) => (
    <View style={styles.badgeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>
          {badges.filter(b => b.isEarned).length} / {badges.length}
        </Text>
      </View>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeContainer}>
            <Badge
              badge={badge}
              size="small"
              showDetails={true}
            />
            <Text style={[
              styles.badgeName,
              badge.isEarned && styles.badgeNameEarned
            ]}>
              {badge.name}
            </Text>
            {badge.isEarned && (
              <Animated.View style={[
                styles.shineOverlay,
                { opacity: shineAnim }
              ]} />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const areaBadges = getBadgesByType('area');
  const levelBadges = getBadgesByType('level');
  const specialBadges = getBadgesByType('special');

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
        <Text style={styles.headerTitle}>Badges</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsCard}>
            <View style={styles.statsIconContainer}>
              <Text style={styles.statsIcon}>🏆</Text>
            </View>
            <Text style={styles.statsTitle}>Badges Earned</Text>
            <Text style={styles.statsValue}>{earnedCount} / {badges.length}</Text>
            <Text style={styles.statsSubtitle}>
              {earnedCount > 0 ? 'Great progress!' : 'Start completing checks to earn badges'}
            </Text>
          </View>
        </View>

        {/* Badge Sections */}
        {areaBadges.length > 0 && (
          <BadgeSection 
            title="Area Badges" 
            badges={areaBadges} 
            type="area" 
          />
        )}

        {levelBadges.length > 0 && (
          <BadgeSection 
            title="Level Badges" 
            badges={levelBadges} 
            type="level" 
          />
        )}

        {specialBadges.length > 0 && (
          <BadgeSection 
            title="Special Badges" 
            badges={specialBadges} 
            type="special" 
          />
        )}

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
  statsSection: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
  },
  statsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  statsIconContainer: {
    marginBottom: Responsive.spacing.sm,
  },
  statsIcon: {
    fontSize: Typography.sizes.xxl * 2,
  },
  statsTitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  statsValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  statsSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  badgeSection: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  sectionCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: isSmallScreen ? Responsive.spacing.xs : Responsive.spacing.sm,
  },
  badgeContainer: {
    width: isSmallScreen ? '48%' : '31%', // 2 columns on small screens, 3 on larger
    alignItems: 'center',
    position: 'relative',
    marginBottom: Responsive.spacing.md,
  },
  badgeName: {
    fontSize: isSmallScreen ? Typography.sizes.xs * 0.9 : Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Responsive.spacing.xs,
    fontWeight: Typography.weights.medium,
    lineHeight: isSmallScreen ? Typography.sizes.xs * 1.1 : Typography.sizes.xs * 1.2,
    maxWidth: '100%',
  },
  badgeNameEarned: {
    color: Colors.textPrimary,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Responsive.borderRadius.large,
  },
  bottomSpacing: {
    height: Responsive.spacing.lg,
  },
});

export default BadgesScreen;
