import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import { levels, getAllChecks, getAreasByLevel } from '../../data/courseData';
import { SCREEN_NAMES } from '../../constants';
import { CopywritingService } from '../../utils/copywritingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const CatalogueModal = ({ visible, onClose, navigation, activeLevel = null }) => {
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [checkProgress, setCheckProgress] = useState({});
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadCheckProgress();
      
      // Default behavior: expand current active level
      const defaultLevelId = activeLevel?.id || 1;
      setExpandedLevels(new Set([defaultLevelId]));
      
      // Start slide animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset slide animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, activeLevel]);

  const toggleLevel = (levelId) => {
    // Accordion behavior: only one level can be expanded at a time
    if (expandedLevels.has(levelId)) {
      setExpandedLevels(new Set()); // Collapse all
    } else {
      setExpandedLevels(new Set([levelId])); // Expand only this level
    }
  };

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

  const navigateToCheck = (checkId) => {
    // Don't navigate for placeholder checks
    if (checkId === '2-1-1' || checkId === '3-1-1') {
      return; // These are "Coming Soon!" placeholder checks
    }
    
    onClose();
    // Map check id to its screen
    const checkRoutes = {
      '1-0-1': SCREEN_NAMES.INITIAL_WELCOME,
      '1-1-3': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
          '1-1-4': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
    '1-1-5': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
      '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
      '1-3-1': SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP,
      '1-4-1': SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION,
      
      // 🎯 Phase 4 Wizard Variant Routes
      '1-2-2': SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK,
      '1-2-3': SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES,
      '1-2-4': SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI,
      
      // 🎯 Phase 4 Timeline Variant Routes
      '1-1-2': SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS,
      '1-5-2': SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS,
      
      // 🎯 Phase 4 Checklist Variant Routes
      '1-3-2': SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP,
      '1-4-2': SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING,
      
      // 🎯 Phase 4 Pattern A Enhanced Routes
      '1-1-1': SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS,
      '1-2-5': SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING,
      '1-5-1': SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS,
    };
    
    const routeName = checkRoutes[checkId] || SCREEN_NAMES.WELCOME;
    navigation.navigate(routeName);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.catalogueOverlay}>
        <TouchableOpacity
          style={styles.catalogueBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.catalogueContent,
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
          <View style={styles.catalogueHeader}>
            <View style={styles.catalogueHeaderContent}>
              <Text style={styles.catalogueTitle}>Security Check Catalogue</Text>
              <Text style={styles.catalogueSubtitle}>Revisit finished checks or see what's ahead</Text>
            </View>
            <TouchableOpacity
              style={styles.catalogueCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.catalogueScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.catalogueScrollContent}
          >
            {levels.map((level) => {
              const levelAreas = getAreasByLevel(level.id);
              const isExpanded = expandedLevels.has(level.id);
              
              return (
                <View key={level.id} style={styles.catalogueLevel}>
                  <TouchableOpacity
                    style={styles.catalogueLevelHeader}
                    onPress={() => toggleLevel(level.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.catalogueLevelInfo}>
                      <Text style={styles.catalogueLevelIcon}>{level.icon}</Text>
                      <View style={styles.catalogueLevelText}>
                        <Text style={styles.catalogueLevelTitle}>{level.title}</Text>
                        <Text style={styles.catalogueLevelDescription}>{level.description}</Text>
                      </View>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={Colors.textSecondary} 
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.catalogueLevelContent}>
                      {levelAreas.map((area) => (
                        <View key={area.id} style={styles.catalogueArea}>
                          <Text style={styles.catalogueAreaTitle}>{area.title}</Text>
                          {area.checks.map((check) => {
                            const isPlaceholder = check.id === '2-1-1' || check.id === '3-1-1';
                            return (
                              <TouchableOpacity
                                key={check.id}
                                style={[
                                  styles.catalogueCheck,
                                  isPlaceholder && styles.catalogueCheckPlaceholder,
                                  !isPlaceholder && checkProgress[check.id] === 'completed' && styles.catalogueCheckCompleted,
                                  !isPlaceholder && checkProgress[check.id] === 'in-progress' && styles.catalogueCheckInProgress,
                                  !isPlaceholder && checkProgress[check.id] === 'not-started' && styles.catalogueCheckNotStarted
                                ]}
                                onPress={() => navigateToCheck(check.id)}
                                activeOpacity={isPlaceholder ? 1 : 0.8}
                              >
                                <View style={styles.catalogueCheckInfo}>
                                  <Ionicons 
                                    name={
                                      checkProgress[check.id] === 'completed' ? "checkmark-circle" : 
                                      checkProgress[check.id] === 'in-progress' ? "ellipse" : 
                                      "ellipse-outline"
                                    } 
                                    size={16} 
                                    color={
                                      checkProgress[check.id] === 'completed' ? Colors.cardCompletedIconColor :
                                      checkProgress[check.id] === 'in-progress' ? Colors.cardInProgressIconColor :
                                      Colors.cardNotStartedIconColor
                                    } 
                                  />
                                  <Text style={[
                                    styles.catalogueCheckTitle,
                                    checkProgress[check.id] === 'completed' && styles.catalogueCheckTitleCompleted,
                                    checkProgress[check.id] === 'in-progress' && styles.catalogueCheckTitleInProgress,
                                    checkProgress[check.id] === 'not-started' && styles.catalogueCheckTitleNotStarted
                                  ]}>
                                    {check.title}
                                  </Text>
                                </View>
                                <Text style={[
                                  styles.catalogueCheckDuration,
                                  checkProgress[check.id] === 'completed' && styles.catalogueCheckDurationCompleted,
                                  checkProgress[check.id] === 'in-progress' && styles.catalogueCheckDurationInProgress,
                                  checkProgress[check.id] === 'not-started' && styles.catalogueCheckDurationNotStarted
                                ]}>
                                  {check.duration}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  catalogueOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  catalogueBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  catalogueContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Responsive.borderRadius.xlarge,
    borderTopRightRadius: Responsive.borderRadius.xlarge,
    maxHeight: height * 0.85,
    minHeight: height * 0.5,
  },
  catalogueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.modal,
    paddingVertical: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catalogueHeaderContent: {
    flex: 1,
    marginRight: Responsive.spacing.md,
  },
  catalogueTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  catalogueSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  catalogueCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogueScrollView: {
    flex: 1,
  },
  catalogueScrollContent: {
    paddingHorizontal: Responsive.padding.modal,
    paddingVertical: Responsive.spacing.md,
  },
  catalogueLevel: {
    marginBottom: Responsive.spacing.md,
  },
  catalogueLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium,
  },
  catalogueLevelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catalogueLevelIcon: {
    fontSize: Typography.sizes.lg,
    marginRight: Responsive.spacing.sm,
  },
  catalogueLevelText: {
    flex: 1,
  },
  catalogueLevelTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  catalogueLevelDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  catalogueLevelContent: {
    marginTop: Responsive.spacing.sm,
    paddingLeft: Responsive.spacing.md,
  },
  catalogueArea: {
    marginBottom: Responsive.spacing.md,
  },
  catalogueAreaTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
    marginLeft: Responsive.spacing.sm,
  },
  catalogueCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.sm,
    backgroundColor: Colors.cardNotStarted,
    borderRadius: Responsive.borderRadius.small,
    marginBottom: Responsive.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardNotStartedBorder,
    opacity: Colors.cardNotStartedOpacity,
  },
  catalogueCheckCompleted: {
    backgroundColor: Colors.cardCompleted,
    borderColor: Colors.cardCompletedBorder,
    borderWidth: 1,
    opacity: Colors.cardCompletedOpacity,
  },
  catalogueCheckInProgress: {
    backgroundColor: Colors.cardInProgress,
    borderColor: Colors.cardInProgressBorder,
    borderWidth: 2,
    opacity: Colors.cardInProgressOpacity,
  },
  catalogueCheckNotStarted: {
    backgroundColor: Colors.cardNotStarted,
    borderColor: Colors.cardNotStartedBorder,
    borderWidth: 1,
    opacity: Colors.cardNotStartedOpacity,
  },
  catalogueCheckPlaceholder: {
    backgroundColor: Colors.muted,
    borderColor: Colors.border,
    borderWidth: 1,
    opacity: 0.5,
  },
  catalogueCheckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catalogueCheckTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.cardNotStartedTitleColor,
    marginLeft: Responsive.spacing.sm,
  },
  catalogueCheckTitleCompleted: {
    color: Colors.cardCompletedTitleColor,
    fontWeight: Typography.weights.semibold,
  },
  catalogueCheckTitleInProgress: {
    color: Colors.cardInProgressTitleColor,
    fontWeight: Typography.weights.semibold,
  },
  catalogueCheckTitleNotStarted: {
    color: Colors.cardNotStartedTitleColor,
  },
  catalogueCheckDuration: {
    fontSize: Typography.sizes.xs,
    color: Colors.cardNotStartedSubtitleColor,
  },
  catalogueCheckDurationCompleted: {
    color: Colors.cardCompletedSubtitleColor,
  },
  catalogueCheckDurationInProgress: {
    color: Colors.cardInProgressSubtitleColor,
  },
  catalogueCheckDurationNotStarted: {
    color: Colors.cardNotStartedSubtitleColor,
  },
});

export default CatalogueModal;
