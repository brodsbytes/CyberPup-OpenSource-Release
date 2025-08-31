import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { scale } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { levels, getAllChecks, getAreasByLevel } from '../data/courseData';
import CircularProgress from '../components/ui/CircularProgress';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import StreakDetailsModal from './StreakDetailsScreen';
import BadgesModal from './BadgesScreen';
import BottomNavigation from '../components/BottomNavigation';
import CatalogueModal from '../components/CatalogueModal';
import CategoryDetailModal from '../components/CategoryDetailModal';
import { SCREEN_NAMES } from '../constants';
import { updateStreak } from '../utils/streakStorage';
import * as Haptics from 'expo-haptics';
import StickyGamificationBar from '../components/StickyGamificationBar';



const WelcomeScreen = ({ navigation }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeLevel, setActiveLevel] = useState(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [showCategoryDetail, setShowCategoryDetail] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);


  const [isLoadingActiveLevel, setIsLoadingActiveLevel] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [nextLevel, setNextLevel] = useState(null);
  const [nextArea, setNextArea] = useState(null);
  const [forceAnimation, setForceAnimation] = useState(0);
  
  // Get check data from our course data
  const getCheckData = () => {
    return getAllChecks();
  };

  const getLevelInfo = (levelId) => {
    return levels.find(level => level.id === levelId) || { icon: '📚', color: Colors.accent, title: 'Unknown Level' };
  };

  const getDisplayIndexForLevel = (levelId) => {
    return levelId;
  };

  const getOrderedLevels = () => {
    return levels.sort((a, b) => a.id - b.id);
  };

  const handleCategoryPress = (categoryId, categoryTitle) => {
    const category = {
      id: categoryId,
      title: categoryTitle,
    };
    setSelectedCategory(category);
    setShowCategoryDetail(true);
  };

  // Load progress on component mount
  useEffect(() => {
    setIsLoadingProgress(true);
    calculateOverallProgress();
    loadActiveLevelView();
    updateStreak();
  }, []);

  // Load progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setIsLoadingProgress(true);
      calculateOverallProgress();
      loadActiveLevelView();
      updateStreak();
      setForceAnimation(prev => prev + 1);
    }, [])
  );







  const calculateOverallProgress = async () => {
    try {
      const allChecks = getCheckData();
      
      let completedCount = 0;

      // Check each check for completion
      for (const check of allChecks) {
        const progressKey = `check_${check.id}_completed`;
        const progressData = await AsyncStorage.getItem(progressKey);
        
        if (progressData === 'completed') {
          completedCount++;
        }
      }
      
      // Calculate overall progress as percentage of completed checks
      const progress = allChecks.length > 0 ? Math.round((completedCount / allChecks.length) * 100) : 0;
      setOverallProgress(progress);
      setIsLoadingProgress(false);
      
      const nextIncompleteArea = await getNextIncompleteArea();
      setNextArea(nextIncompleteArea);
    } catch (error) {
      console.error('Error calculating progress:', error);
      setIsLoadingProgress(false);
    }
  };

  // Determine active level (first by id that is not fully complete) and load its checks with progress
  const loadActiveLevelView = async () => {
    try {
      setIsLoadingActiveLevel(true);
      
      // Helper to compute if a check is completed
      const getCheckStatus = async (check) => {
        let isCompleted = false;
        let progressPercentage = 0;

        // Check for completion using check keys with dash format
        const progressKey = `check_${check.id}_completed`;
        const progressData = await AsyncStorage.getItem(progressKey);
        

        
        if (progressData === 'completed') {
          isCompleted = true;
          progressPercentage = 100;
        } else {
          // Check for partial progress
          const partialProgressKey = `check_${check.id}_progress`;
          const partialProgressData = await AsyncStorage.getItem(partialProgressKey);
          
          if (partialProgressData) {
            try {
              const data = JSON.parse(partialProgressData);
              if (data.checklistItems) {
                const completedItems = data.checklistItems.filter(item => item.completed).length;
                const totalItems = data.checklistItems.length;
                progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
              }
            } catch (error) {
              console.error('Error parsing progress data:', error);
            }
          }
        }

        return { isCompleted, progressPercentage };
      };

      // Helper to compute area progress
      const getAreaProgress = async (area) => {
        let completedChecks = 0;
        let totalChecks = area.checks.length;
        
        for (const check of area.checks) {
          const status = await getCheckStatus(check);
          if (status.isCompleted) {
            completedChecks++;
          }
        }
        
        return { completedChecks, totalChecks };
      };

      // Find first incomplete level by display order
      let selectedLevel = null;
      let nextLevelInfo = null;
      const orderedLevels = getOrderedLevels();
      
      for (let i = 0; i < orderedLevels.length; i++) {
        const level = orderedLevels[i];
        const levelAreas = getAreasByLevel(level.id);
        let allComplete = true;
        
        for (const area of levelAreas) {
          const areaProgress = await getAreaProgress(area);
          if (areaProgress.completedChecks < areaProgress.totalChecks) {
            allComplete = false;
            break;
          }
        }
        
        if (!allComplete) {
          selectedLevel = level;
          // Check if there's a next level
          if (i + 1 < orderedLevels.length) {
            nextLevelInfo = orderedLevels[i + 1];
          }
          break;
        }
      }

      // If all levels are complete, show completion message
      if (!selectedLevel) {
        setActiveLevel(null);
        setNextLevel(null);
        setIsLoadingActiveLevel(false);
        return;
      }

      // Load areas for the selected level with their progress
      const levelAreas = getAreasByLevel(selectedLevel.id);
      const areasWithProgress = [];

      for (const area of levelAreas) {
        const areaProgress = await getAreaProgress(area);
        areasWithProgress.push({
          ...area,
          completedChecks: areaProgress.completedChecks,
          totalChecks: areaProgress.totalChecks,
        });
      }

      setActiveLevel({
        ...selectedLevel,
        areas: areasWithProgress,
      });
      
      setNextLevel(nextLevelInfo);
      
      // Find and set the next incomplete area
      const nextIncompleteArea = await getNextIncompleteArea();
      setNextArea(nextIncompleteArea);
      
      setIsLoadingActiveLevel(false);
    } catch (error) {
      console.error('Error loading active level view:', error);
      setIsLoadingActiveLevel(false);
    }
  };

  // Find the next incomplete area across all levels
  const getNextIncompleteArea = async () => {
    try {
      const allLevels = levels;
      
      for (const level of allLevels) {
        for (const area of level.areas) {
          // Check if any check in this area is incomplete
          let hasIncompleteCheck = false;
          
          for (const check of area.checks) {
            const progressKey = `check_${check.id}_completed`;
            const progressData = await AsyncStorage.getItem(progressKey);
            
            if (progressData !== 'completed') {
              hasIncompleteCheck = true;
              break;
            }
          }
          
          if (hasIncompleteCheck) {
            return {
              levelId: level.id,
              levelTitle: level.title,
              areaId: area.id,
              areaTitle: area.title,
              displayName: area.id === '1-0' ? 'Welcome to CyberPup' : `${area.title}`
            };
          }
        }
      }
      
      return null; // All areas are complete
    } catch (error) {
      console.error('Error finding next incomplete area:', error);
      return null;
    }
  };









  // Navigate to first incomplete check within an area
  const navigateToArea = async (area) => {
    // Haptic feedback on card tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Map check id to its screen
    const checkRoutes = {
      '1-0-1': SCREEN_NAMES.INITIAL_WELCOME,
      '1-1-1': SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS,
      '1-1-2': SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS,
      '1-1-3': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
          '1-1-4': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
    '1-1-5': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
      '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
    };

    // Find the first incomplete check in the area
    for (const check of area.checks) {
      const progressKey = `check_${check.id}_completed`;
      const progressData = await AsyncStorage.getItem(progressKey);
      
      
      
      if (progressData !== 'completed') {
        // Navigate to the first incomplete check
        const routeName = checkRoutes[check.id] || SCREEN_NAMES.WELCOME;
        navigation.navigate(routeName, { level: activeLevel });
        return;
      }
    }

    // If all checks are complete, navigate to the first check
    if (area.checks.length > 0) {
      const routeName = checkRoutes[area.checks[0].id] || SCREEN_NAMES.WELCOME;
      navigation.navigate(routeName, { level: activeLevel });
    }
  };

  const handleContinueSecurityCheck = () => {
    // Navigate to the first incomplete area, or the first area if all are complete
    const firstIncompleteArea = activeLevel.areas.find(area => area.completedChecks < area.totalChecks);
    const targetArea = firstIncompleteArea || activeLevel.areas[0];
    if (targetArea) {
      navigateToArea(targetArea);
    }
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Sticky Gamification Bar */}
      <StickyGamificationBar
        onMascotPress={() => setShowCatalogue(true)}
        onStreakPress={() => setShowStreakDetails(true)}
        onBadgesPress={() => setShowBadges(true)}
        activeLevel={activeLevel}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header removed as requested */}

        {/* Overall Progress Section */}
        <View style={styles.overallProgressSection}>
          
          <View style={styles.overallProgressCard}>
            <View style={styles.circularProgressContainer}>
              {isLoadingProgress ? (
                <View style={[styles.loadingContainer, { width: scale(200), height: scale(200) }]}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : (
                <CircularProgress 
                  key={`overall-${overallProgress}-${forceAnimation}`}
                  progress={overallProgress}
                  size={scale(200)} // Increased from 160 to 200 for larger size
                  strokeWidth={scale(12)}
                  backgroundColor={Colors.track}
                  showPercentage={true}
                  interactive={true}
                  onPress={() => setShowScoreBreakdown(true)}
                  forceAnimation={forceAnimation}
                />
              )}
            </View>
          </View>
        </View>

                  {/* Level Progress Card */}
          {activeLevel && (
            <View style={styles.levelProgressCard}>
              <View style={styles.pawPrintIcon}>
                <Ionicons name="paw" size={24} color={Colors.accent} />
              </View>
              
              <View style={styles.titleRow}>
                <Text style={styles.activeLevelTitle}>
                  Level {activeLevel.id}: CyberPup Scout
                </Text>
              </View>
              
              <View style={styles.activeLevelMetaRow}>
                <Text style={styles.activeLevelSubtitle}>
                  {activeLevel.areas ? 
                    `${Math.round((activeLevel.areas.reduce((sum, area) => sum + area.completedChecks, 0) / activeLevel.areas.reduce((sum, area) => sum + area.totalChecks, 0)) * 100)}% complete` :
                    '0% complete'
                  }
                </Text>
              </View>

              <View style={styles.levelProgressBar}>
                <View style={styles.levelProgressTrack}>
                  <View 
                    style={[
                      styles.levelProgressFill, 
                      { 
                        width: activeLevel.areas ? 
                          `${Math.round((activeLevel.areas.reduce((sum, area) => sum + area.completedChecks, 0) / activeLevel.areas.reduce((sum, area) => sum + area.totalChecks, 0)) * 100)}%` :
                          '0%'
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          )}

          {/* CTA Button Card */}
          {activeLevel && (
            <TouchableOpacity
              style={styles.ctaButtonCard}
              onPress={handleContinueSecurityCheck}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>
                Continue My Security Check
              </Text>
            </TouchableOpacity>
          )}

        {/* Category Sections */}
        <View style={styles.categorySection}>
          
          {/* Protect Your Account */}
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('1.1', 'Protect Your Account')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryCardContent}>
              <View style={styles.categoryIcon}>
                <Ionicons name="shield-checkmark-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>Protect Your Account</Text>
                <Text style={styles.categoryProgress}>3 of 5 Complete</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Secure Your Devices */}
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('1.2', 'Secure Your Devices')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryCardContent}>
              <View style={styles.categoryIcon}>
                <Ionicons name="phone-portrait-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>Secure Your Devices</Text>
                <Text style={styles.categoryProgress}>2 of 4 Complete</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Keep Your Data Safe */}
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('1.3', 'Keep Your Data Safe')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryCardContent}>
              <View style={styles.categoryIcon}>
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>Keep Your Data Safe</Text>
                <Text style={styles.categoryProgress}>2 of 4 Complete</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Avoid Scams & Fraud */}
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('1.4', 'Avoid Scams & Fraud')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryCardContent}>
              <View style={styles.categoryIcon}>
                <Ionicons name="warning-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>Avoid Scams & Fraud</Text>
                <Text style={styles.categoryProgress}>1 of 2 Complete</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Protect Your Privacy */}
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress('1.5', 'Protect Your Privacy')}
            activeOpacity={0.8}
          >
            <View style={styles.categoryCardContent}>
              <View style={styles.categoryIcon}>
                <Ionicons name="eye-off-outline" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>Protect Your Privacy</Text>
                <Text style={styles.categoryProgress}>0 of 3 Complete</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Next Level Card */}
          {nextLevel && (
            <View style={styles.nextLevelCard}>
              <View style={styles.nextDividerRow}>
                <View style={styles.nextDivider} />
                <Text style={styles.nextTinyText}>{`Next in Level ${getDisplayIndexForLevel(nextLevel.id)}`}</Text>
                <View style={styles.nextDivider} />
              </View>

              <View style={styles.nextIconRow}>
                <View style={[styles.nextIconRing, { borderColor: Colors.accent }]}>
                  <Ionicons name="eye-outline" size={32} color={Colors.textSecondary} />
                </View>
              </View>

              <Text style={styles.nextTitle}>{nextLevel.title.replace(' 👁️', '')}</Text>
              <Text style={styles.nextSubtitle}>{nextLevel.description}</Text>

              <TouchableOpacity
                style={[styles.skipAheadButton, { borderColor: Colors.accent }]}
                onPress={() => {
                  setShowCatalogue(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.skipAheadText}>Skip Ahead</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!activeLevel && (
          <View style={styles.allDoneCard}>
            <Text style={styles.allDoneTitle}>All levels complete 🎉</Text>
            <Text style={styles.allDoneSubtitle}>Review checks or explore topics from the Insights tab.</Text>
            <TouchableOpacity style={styles.startLearningButton} onPress={() => navigation.navigate(SCREEN_NAMES.CATEGORY)}>
              <Text style={styles.startLearningButtonText}>View All Categories</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing for tab navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="home"
        onTabPress={(screen) => {
          // Tab navigation handled
          if (screen === 'InsightsScreen') {
            navigation.navigate(SCREEN_NAMES.INSIGHTS);
          } else if (screen === 'ProfileScreen') {
            navigation.navigate(SCREEN_NAMES.PROFILE);
          }
        }}
      />

      {/* Score Breakdown Modal */}
      <ScoreBreakdownModal
        visible={showScoreBreakdown}
        onClose={() => setShowScoreBreakdown(false)}
        overallProgress={overallProgress}
      />

      {/* Streak Details Modal */}
      <StreakDetailsModal
        visible={showStreakDetails}
        onClose={() => setShowStreakDetails(false)}
      />

      {/* Badges Modal */}
      <BadgesModal
        visible={showBadges}
        onClose={() => setShowBadges(false)}
      />

      {/* Catalogue Modal */}
      <CatalogueModal
        visible={showCatalogue}
        onClose={() => setShowCatalogue(false)}
        navigation={navigation}
        activeLevel={activeLevel}
      />

      {/* Category Detail Modal */}
      <CategoryDetailModal
        visible={showCategoryDetail}
        onClose={() => setShowCategoryDetail(false)}
        category={selectedCategory}
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






  overallProgressSection: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.sm, // Reduced from lg to sm to reduce padding between components
  },
  overallProgressHeader: {
    marginBottom: Responsive.spacing.sm,
    alignItems: 'center',
    position: 'relative',
  },
  overallProgressTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    paddingTop: Responsive.spacing.sm,
    textAlign: 'center',
  },

  overallProgressSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Responsive.spacing.sm,
  },
  overallProgressCard: {
    backgroundColor: 'transparent',
    borderRadius: Responsive.borderRadius.xlarge,
    padding: 0,
    alignItems: 'center',
  },
  circularProgressContainer: {
    alignItems: 'center',
    marginVertical: scale(20), // Reduced from 40 to 20 to bring components closer
    paddingTop: Responsive.spacing.md, // Added responsive top padding
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: scale(16),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  overallProgressText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    textAlign: 'center',
  },



  activeLevelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  pawPrintIcon: {
    marginLeft: Responsive.spacing.sm,
  },
  pawPrintText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  viewRoadmapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.overlayLight,
    borderRadius: Responsive.borderRadius.small,
    paddingVertical: Responsive.spacing.xs,
    paddingHorizontal: Responsive.spacing.sm,
  },
  viewRoadmapText: {
    color: Colors.accent,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginRight: Responsive.spacing.xs,
  },
  levelProgressBar: {
    height: Responsive.spacing.xs,
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.small,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.lg,
    overflow: 'hidden',
  },
  levelProgressTrack: {
    height: '100%',
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.small,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.small,
  },
  categorySection: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
    marginTop: Responsive.spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.spacing.md, // Reduced from lg back to md (25% reduction)
    marginBottom: Responsive.spacing.sm, // Reduced from md back to sm for tighter spacing
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  categoryProgress: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },



  allDoneCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xxlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
  },
  allDoneTitle: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.lg,
    marginBottom: Responsive.spacing.xs,
  },
  allDoneSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  nextLevelCard: {
    backgroundColor: Colors.surface,
    marginTop: Responsive.spacing.xl,
    borderRadius: Responsive.borderRadius.xlarge,
    paddingTop: Responsive.spacing.sm,
    paddingBottom: Responsive.padding.card,
    paddingHorizontal: Responsive.padding.card,
    alignItems: 'center',
  },
  nextDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Responsive.spacing.sm,
  },
  nextDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  nextTinyText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    marginHorizontal: Responsive.spacing.sm,
  },
  nextIconRow: {
    marginBottom: Responsive.spacing.sm,
  },
  nextIconRing: {
    width: Responsive.iconSizes.xxlarge,
    height: Responsive.iconSizes.xxlarge,
    borderRadius: Responsive.iconSizes.xxlarge / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  nextTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
    textAlign: 'center',
  },
  nextSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  skipAheadButton: {
    borderWidth: 1,
    borderRadius: Responsive.borderRadius.large,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    minHeight: Responsive.buttonHeight.medium,
  },
  skipAheadText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },


  startLearningButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.xxlarge,
    minHeight: Responsive.buttonHeight.medium,
  },
  startLearningButtonText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: Responsive.iconSizes.xlarge,
  },

  
  // Level Progress Card Styles
  levelProgressCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16, // Reduced from 24 to 16 to reduce padding between components
    position: 'relative', // Added to enable absolute positioning of paw icon
  },
  titleRow: {
    marginBottom: Responsive.spacing.sm,
  },
  activeLevelTitle: {
    fontSize: Typography.sizes.xl, // Increased from lg to xl for larger text
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  activeLevelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  activeLevelSubtitle: {
    fontSize: Typography.sizes.md, // Increased from sm to md for larger text
    color: Colors.textSecondary,
  },
  pawPrintIcon: {
    position: 'absolute',
    right: 20,
    top: '45%',
    transform: [{ translateY: -12 }], // Half of icon height to center vertically
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelProgressBar: {
    width: '100%',
    marginTop: 12,
  },
  levelProgressTrack: {
    height: 8, // Increased from 6 to 8 for slightly taller progress bar
    backgroundColor: Colors.track,
    borderRadius: 4, // Adjusted from 3 to 4 to match new height
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4, // Adjusted from 3 to 4 to match new height
  },
  
  // CTA Button Card Styles
  ctaButtonCard: {
    backgroundColor: Colors.accent,
    marginHorizontal: 16,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default WelcomeScreen; 