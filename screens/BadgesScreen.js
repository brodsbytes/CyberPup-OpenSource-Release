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
import { isSmallScreen } from '../utils/responsive';
import { loadUserBadges, getEarnedBadgesCount, refreshBadges } from '../utils/badgeStorage';
import Badge from '../components/ui/Badge';
import * as Haptics from 'expo-haptics';

const { height, width } = Dimensions.get('window');

const BadgesModal = ({ visible, onClose }) => {
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [earnedCount, setEarnedCount] = useState(0);

  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadBadges();
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

  const loadBadges = async () => {
    try {
      // First refresh badges to check for new unlocks
      const newUnlockedBadges = await refreshBadges();
      
      // Then load the updated badge data
      const userBadges = await loadUserBadges();
      const earnedCount = await getEarnedBadgesCount();
      
      setBadges(userBadges);
      setEarnedCount(earnedCount);
      
      // If new badges were unlocked, show a brief celebration
      if (newUnlockedBadges.length > 0) {
        // Haptic feedback for new badges
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log('Error loading badges:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const handleClose = () => {
    // Haptic feedback on close
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const getBadgesByType = (type) => {
    return badges.filter(badge => badge.type === type);
  };

  // Determine grid columns based on screen size
  const getGridColumns = () => {
    if (width <= 375) return 3; // iPhone SE
    if (width <= 414) return 3; // iPhone 12/13/14
    return 4; // Larger devices
  };

  const gridColumns = getGridColumns();
  const badgeWidth = `${100 / gridColumns - 2}%`; // Account for gap

  const BadgeSection = ({ title, badges, type }) => {
    if (badges.length === 0) return null;
    
    return (
    <View style={styles.badgeSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => (
            <View key={badge.id} style={[styles.badgeContainer, { width: badgeWidth }]}>
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

          </View>
        ))}
      </View>
    </View>
  );
  };

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
              <Text style={styles.headerTitle}>Badges</Text>
              <Text style={styles.headerSubtitle}>
                Your achievements and progress milestones
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

          {/* Stats Summary */}
          <View style={styles.statsSummary}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Earned</Text>
              <Text style={styles.statValue}>{earnedCount} / {badges.length}</Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading badges...</Text>
        </View>
            ) : (
              <>
        {/* Badge Sections */}
                {(() => {
                  const areaBadges = getBadgesByType('area');
                  const levelBadges = getBadgesByType('level');
                  const specialBadges = getBadgesByType('special');

                  return (
                    <>
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

                      {/* Minimal bottom spacing */}
                      <View style={{ height: Responsive.spacing.md }} />
                    </>
                  );
                })()}
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
  statsSummary: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.sm, // Compact padding
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
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
  badgeSection: {
    marginBottom: Responsive.spacing.lg, // Reduced from xl
  },
  sectionHeader: {
    marginBottom: Responsive.spacing.sm, // Reduced from lg
    paddingHorizontal: Responsive.spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md, // Reduced from lg
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },

  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Responsive.spacing.sm, // Reduced from md
    paddingHorizontal: Responsive.spacing.xs,
  },
  badgeContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: Responsive.spacing.md, // Reduced from lg
    paddingHorizontal: Responsive.spacing.xs,
  },
  badgeName: {
    fontSize: Typography.sizes.xs, // Reduced size
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Responsive.spacing.xs, // Reduced from sm
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.xs * 1.2,
    maxWidth: '100%',
  },
  badgeNameEarned: {
    color: Colors.textPrimary,
  },

});

export default BadgesModal;
