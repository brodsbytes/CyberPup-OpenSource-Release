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
import { Colors, Typography, Responsive } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { levels, getAllChecks, getAreasByLevel } from '../../data/courseData';
import { SCREEN_NAMES } from '../../constants';

const { width, height } = Dimensions.get('window');

const CategoryDetailModal = ({ 
  visible, 
  onClose, 
  category, 
  navigation 
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [checkProgress, setCheckProgress] = useState({});
  const [categoryChecks, setCategoryChecks] = useState([]);

  useEffect(() => {
    if (visible) {
      loadCheckProgress();
      loadCategoryChecks();
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
  }, [visible, category]);

  const loadCheckProgress = async () => {
    try {
      const allChecks = getAllChecks();
      const progress = {};
      
      for (const check of allChecks) {
        const progressKey = `check_${check.id}_completed`;
        const progressData = await AsyncStorage.getItem(progressKey);
        
        if (progressData === 'completed') {
          progress[check.id] = 'completed';
        } else {
          // Check for partial progress
          const partialProgressKey = `check_${check.id}_progress`;
          const partialProgressData = await AsyncStorage.getItem(partialProgressKey);
          
          if (partialProgressData) {
            try {
              const data = JSON.parse(partialProgressData);
              if (data.checklistItems && data.checklistItems.some(item => item.completed)) {
                progress[check.id] = 'in-progress';
              } else {
                progress[check.id] = 'not-started';
              }
            } catch (error) {
              progress[check.id] = 'not-started';
            }
          } else {
            progress[check.id] = 'not-started';
          }
        }
      }
      
      setCheckProgress(progress);
    } catch (error) {
      console.log('Error loading check progress:', error);
    }
  };

  const loadCategoryChecks = () => {
    if (!category) return;

    // Map category IDs to their corresponding checks
    const categoryToChecksMap = {
      '1.1': ['1-1-1', '1-1-2', '1-1-3', '1-1-4', '1-1-5'], // Protect Your Account
      '1.2': ['1-2-1', '1-2-2', '1-2-3', '1-2-4', '1-2-5'], // Secure Your Devices
      '1.3': ['1-3-1', '1-3-2'], // Keep Your Data Safe
      '1.4': ['1-4-1', '1-4-2'], // Avoid Scams & Fraud
      '1.5': ['1-5-1', '1-5-2'], // Protect Your Privacy
    };

    const checkIds = categoryToChecksMap[category.id] || [];
    const allChecks = getAllChecks();
    const checks = allChecks.filter(check => checkIds.includes(check.id));
    
    setCategoryChecks(checks);
  };

  const navigateToCheck = (checkId) => {
    onClose();
    
    // Map check id to its screen (same as CatalogueModal)
    const checkRoutes = {
      '1-0-1': SCREEN_NAMES.INITIAL_WELCOME,
      '1-1-1': SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS,
      '1-1-2': SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS,
      '1-1-3': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
      '1-1-4': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
      '1-1-5': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
      '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
      '1-2-2': SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK,
      '1-2-3': SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES,
      '1-2-4': SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI,
      '1-2-5': SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING,
      '1-3-1': SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP,
      '1-3-2': SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP,
      '1-4-1': SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION,
      '1-4-2': SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING,
      '1-5-1': SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS,
      '1-5-2': SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS,
    };
    
    const routeName = checkRoutes[checkId] || SCREEN_NAMES.WELCOME;
    navigation.navigate(routeName);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'checkmark-circle';
      case 'in-progress':
        return 'ellipse';
      default:
        return 'ellipse-outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return Colors.cardCompletedIconColor || Colors.success;
      case 'in-progress':
        return Colors.cardInProgressIconColor || Colors.accent;
      default:
        return Colors.cardNotStartedIconColor || Colors.textSecondary;
    }
  };

  const completedCount = categoryChecks.filter(check => checkProgress[check.id] === 'completed').length;
  const totalCount = categoryChecks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [width, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{category?.title || 'Category'}</Text>
              <Text style={styles.headerSubtitle}>
                {completedCount} of {totalCount} checks completed
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{progressPercentage}%</Text>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {categoryChecks.map((check) => {
              const status = checkProgress[check.id] || 'not-started';
              return (
                <TouchableOpacity
                  key={check.id}
                  style={[
                    styles.checkCard,
                    status === 'completed' && styles.checkCardCompleted,
                    status === 'in-progress' && styles.checkCardInProgress,
                    status === 'not-started' && styles.checkCardNotStarted
                  ]}
                  onPress={() => navigateToCheck(check.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.checkHeader}>
                    <View style={styles.checkInfo}>
                      <View style={styles.checkTitleRow}>
                        <Ionicons 
                          name={getStatusIcon(status)} 
                          size={16} 
                          color={getStatusColor(status)} 
                          style={styles.checkStatusIcon}
                        />
                        <Text style={[
                          styles.checkTitle,
                          status === 'completed' && styles.checkTitleCompleted,
                          status === 'in-progress' && styles.checkTitleInProgress,
                          status === 'not-started' && styles.checkTitleNotStarted
                        ]}>
                          {check.title}
                        </Text>
                      </View>
                      <Text style={[
                        styles.checkDescription,
                        status === 'completed' && styles.checkDescriptionCompleted,
                        status === 'in-progress' && styles.checkDescriptionInProgress,
                        status === 'not-started' && styles.checkDescriptionNotStarted
                      ]}>
                        {check.description}
                      </Text>
                    </View>
                    <View style={styles.checkMeta}>
                      <Text style={[
                        styles.checkDuration,
                        status === 'completed' && styles.checkDurationCompleted,
                        status === 'in-progress' && styles.checkDurationInProgress,
                        status === 'not-started' && styles.checkDurationNotStarted
                      ]}>
                        {check.duration}
                      </Text>
                      <Ionicons 
                        name="chevron-forward" 
                        size={16} 
                        color={Colors.textSecondary} 
                        style={styles.checkArrow}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: Responsive.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.track || Colors.surface,
    borderRadius: 4,
    marginRight: Responsive.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    minWidth: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
  },
  checkCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.spacing.md,
    marginBottom: Responsive.spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkCardCompleted: {
    borderColor: Colors.cardCompletedIconColor || Colors.success,
    backgroundColor: Colors.surface,
  },
  checkCardInProgress: {
    borderColor: Colors.cardInProgressIconColor || Colors.accent,
    backgroundColor: Colors.surface,
  },
  checkCardNotStarted: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkInfo: {
    flex: 1,
    marginRight: Responsive.spacing.md,
  },
  checkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.xs,
  },
  checkStatusIcon: {
    marginRight: Responsive.spacing.sm,
  },
  checkTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    flex: 1,
  },
  checkTitleCompleted: {
    color: Colors.cardCompletedIconColor || Colors.success,
  },
  checkTitleInProgress: {
    color: Colors.cardInProgressIconColor || Colors.accent,
  },
  checkTitleNotStarted: {
    color: Colors.textPrimary,
  },
  checkDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  checkDescriptionCompleted: {
    color: Colors.textSecondary,
  },
  checkDescriptionInProgress: {
    color: Colors.textSecondary,
  },
  checkDescriptionNotStarted: {
    color: Colors.textSecondary,
  },
  checkMeta: {
    alignItems: 'flex-end',
  },
  checkDuration: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  checkDurationCompleted: {
    color: Colors.cardCompletedIconColor || Colors.success,
  },
  checkDurationInProgress: {
    color: Colors.cardInProgressIconColor || Colors.accent,
  },
  checkDurationNotStarted: {
    color: Colors.textSecondary,
  },
  checkArrow: {
    marginTop: Responsive.spacing.xs,
  },
});

export default CategoryDetailModal;
