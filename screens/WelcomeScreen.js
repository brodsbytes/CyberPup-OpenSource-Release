import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
  FlatList,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { levels, getAllChecks, getChecksByArea, getAreasByLevel } from '../data/courseData';
import CircularProgress from '../components/CircularProgress';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';
import StreakDetailsModal from './StreakDetailsScreen';
import BadgesModal from './BadgesScreen';
import BottomNavigation from '../components/BottomNavigation';
import { SCREEN_NAMES } from '../constants';
import { updateStreak, getCurrentStreak } from '../utils/streakStorage';
import { getEarnedBadges } from '../utils/badgeStorage';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeLevel, setActiveLevel] = useState(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);

  const [isLoadingActiveLevel, setIsLoadingActiveLevel] = useState(true);
  const [nextLevel, setNextLevel] = useState(null);
  const [nextArea, setNextArea] = useState(null);
  
  // Gamification data
  const [currentStreak, setCurrentStreak] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  
  // Animation states for card interactions
  const [cardAnimations] = useState(new Map());
  const [gamificationAnimations] = useState(new Map());

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

  // Legacy function for backward compatibility - maps to getLevelInfo
  const getCategoryInfo = (levelId) => {
    return getLevelInfo(levelId);
  };

  // Helper functions for determining card states (reused from StreakDetailsModal)
  const getCardState = (area) => {
    const isCompleted = area.completedChecks === area.totalChecks;
    const hasProgress = area.completedChecks > 0;
    
    if (isCompleted) return 'completed';
    if (hasProgress) return 'in-progress';
    return 'not-started';
  };

  const getCardAnimation = (areaId) => {
    if (!cardAnimations.has(areaId)) {
      cardAnimations.set(areaId, new Animated.Value(1));
    }
    return cardAnimations.get(areaId);
  };

  const animateCardPress = (areaId) => {
    const anim = getCardAnimation(areaId);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Load progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      calculateOverallProgress();
      loadActiveLevelView();
      loadGamificationData();
      updateStreak(); // Update streak when screen is focused
    }, [])
  );

  // Load gamification data
  const loadGamificationData = async () => {
    try {
      // Load streak data
      const streakData = await getCurrentStreak();
      setCurrentStreak(streakData.currentStreak || 0);
      
      // Load badge count
      const earnedBadges = await getEarnedBadges();
      setBadgeCount(earnedBadges.length || 0);
    } catch (error) {
      console.log('Error loading gamification data:', error);
    }
  };

  // Gamification bar animation functions
  const getGamificationAnimation = (iconId) => {
    if (!gamificationAnimations.has(iconId)) {
      gamificationAnimations.set(iconId, new Animated.Value(1));
    }
    return gamificationAnimations.get(iconId);
  };

  const animateGamificationPress = (iconId) => {
    const anim = getGamificationAnimation(iconId);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };





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
      
      // Find and set the next incomplete area
      const nextIncompleteArea = await getNextIncompleteArea();
      setNextArea(nextIncompleteArea);
    } catch (error) {
      console.log('Error calculating progress:', error);
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

        // Check for completion using new check keys
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
              console.log('Error parsing progress data:', error);
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
      console.log('Error loading active level view:', error);
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
      console.log('Error finding next incomplete area:', error);
      return null;
    }
  };

  const getAreaIcon = (areaId) => {
    // Map area IDs to appropriate Ionicons
    const iconMap = {
      '1-0': 'happy', // Welcome to CyberPup
      '1-1': 'lock-closed', // Protect Your Accounts
      '1-2': 'shield-checkmark', // Secure Your Devices
      '1-3': 'cloud-upload', // Keep Your Data Safe
      '1-4': 'warning', // Avoid Scams & Fraud
      '1-5': 'eye-off', // Protect Your Privacy
    };
    return iconMap[areaId] || 'document'; // Default icon
  };

  const getWelcomeMessage = () => {
    const nextLabel = nextArea?.displayName || 'the next check';
    if (overallProgress === 0) {
      return "Let’s begin your security health check. Start with the first check to set a secure baseline.";
    } else if (overallProgress < 25) {
      return `Nice start! You're on your way - next stop: ${nextLabel}.`;
    } else if (overallProgress < 50) {
      return `You're midway through your security audit. Keep reducing risk with ${nextLabel}.`;
    } else if (overallProgress < 75) {
      return `Strong progress. Close the remaining gaps - next: ${nextLabel}.`;
    } else if (overallProgress < 100) {
      return 'Almost done. Finish the last checks to lock in your secure baseline.';
    } else {
      return 'All checks complete. Re-run key checks regularly and when things change.';
    }
  };

  // Gamification Bar Component
  const GamificationBar = () => (
    <View style={styles.gamificationBar}>
      <View style={styles.gamificationContent}>
        {/* CyberPup Mascot */}
        <Animated.View style={{ transform: [{ scale: getGamificationAnimation('mascot') }] }}>
          <TouchableOpacity
            style={styles.gamificationIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              animateGamificationPress('mascot');
              setShowCatalogue(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.mascotIcon}>🐾</Text>
            {activeLevel && (
              <Text style={styles.gamificationText}>{activeLevel.id}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Streak */}
        <Animated.View style={{ transform: [{ scale: getGamificationAnimation('streak') }] }}>
          <TouchableOpacity
            style={styles.gamificationIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              animateGamificationPress('streak');
              setShowStreakDetails(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.gamificationText}>{currentStreak}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Badges */}
        <Animated.View style={{ transform: [{ scale: getGamificationAnimation('badges') }] }}>
          <TouchableOpacity
            style={styles.gamificationIcon}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              animateGamificationPress('badges');
              setShowBadges(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.badgeIcon}>🏅</Text>
            <Text style={styles.gamificationText}>{badgeCount}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );

  const ProgressCard = ({ icon, title, subtitle, progress, levelId }) => (
    <TouchableOpacity
      style={styles.progressCard}
      onPress={() => {
        const levelInfo = getLevelInfo(levelId);
        navigation.navigate('ModuleListScreen', {
          category: {
            id: levelId,
            title: levelInfo.title,
            icon: levelInfo.icon,
            color: levelInfo.color,
          }
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{progress}%</Text>
      </View>
    </TouchableOpacity>
  );

  // Navigate to first incomplete check within an area
  const navigateToArea = async (area) => {
    // Haptic feedback on card tap
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Map check id to its screen
    const checkRoutes = {
      '1-0-1': SCREEN_NAMES.INITIAL_WELCOME,
      '1-1-1': SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS,
      '1-1-2': SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS,
      '1-1-3': SCREEN_NAMES.CHECK_1_3_PASSWORD_MANAGERS,
      '1-1-4': SCREEN_NAMES.CHECK_1_4_MFA_SETUP,
      '1-1-5': SCREEN_NAMES.CHECK_1_5_BREACH_CHECK,
      '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
      // TODO: Add more check screens as they are created
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

  // Catalogue Modal Component
  const CatalogueModal = () => {
    const [expandedLevels, setExpandedLevels] = useState(new Set([activeLevel?.id || 1]));
    const [checkProgress, setCheckProgress] = useState({});

    useEffect(() => {
      if (showCatalogue) {
        loadCheckProgress();
      }
    }, [showCatalogue]);

    const loadCheckProgress = async () => {
      try {
        const allChecks = getAllChecks();
        const progress = {};
        
        for (const check of allChecks) {
          const progressKey = `check_${check.id}_completed`;
          const progressData = await AsyncStorage.getItem(progressKey);
          progress[check.id] = progressData === 'completed';
        }
        
        setCheckProgress(progress);
      } catch (error) {
        console.log('Error loading check progress:', error);
      }
    };

    const toggleLevel = (levelId) => {
      const newExpanded = new Set(expandedLevels);
      if (newExpanded.has(levelId)) {
        newExpanded.delete(levelId);
      } else {
        newExpanded.add(levelId);
      }
      setExpandedLevels(newExpanded);
    };

    const navigateToCheck = (checkId) => {
      setShowCatalogue(false);
      // Map check id to its screen
      const checkRoutes = {
        '1-0-1': SCREEN_NAMES.INITIAL_WELCOME,
        '1-1-1': SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS,
        '1-1-2': SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS,
        '1-1-3': SCREEN_NAMES.CHECK_1_3_PASSWORD_MANAGERS,
        '1-1-4': SCREEN_NAMES.CHECK_1_4_MFA_SETUP,
        '1-1-5': SCREEN_NAMES.CHECK_1_5_BREACH_CHECK,
        '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
        // TODO: Add more check screens as they are created
      };
      
      const routeName = checkRoutes[checkId] || SCREEN_NAMES.WELCOME;
      navigation.navigate(routeName);
    };

    return (
      <Modal
        visible={showCatalogue}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCatalogue(false)}
      >
        <View style={styles.catalogueOverlay}>
          <TouchableOpacity
            style={styles.catalogueBackdrop}
            activeOpacity={1}
            onPress={() => setShowCatalogue(false)}
          />
          
          <View style={styles.catalogueContent}>
            <View style={styles.catalogueHeader}>
              <Text style={styles.catalogueTitle}>Security Check Catalogue</Text>
              <TouchableOpacity
                style={styles.catalogueCloseButton}
                onPress={() => setShowCatalogue(false)}
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
                            {area.checks.map((check) => (
                              <TouchableOpacity
                                key={check.id}
                                style={[
                                  styles.catalogueCheck,
                                  checkProgress[check.id] && styles.catalogueCheckCompleted
                                ]}
                                onPress={() => navigateToCheck(check.id)}
                                activeOpacity={0.8}
                              >
                                <View style={styles.catalogueCheckInfo}>
                                  <Ionicons 
                                    name={checkProgress[check.id] ? "checkmark-circle" : "ellipse-outline"} 
                                    size={16} 
                                    color={checkProgress[check.id] ? Colors.accent : Colors.textSecondary} 
                                  />
                                  <Text style={[
                                    styles.catalogueCheckTitle,
                                    checkProgress[check.id] && styles.catalogueCheckTitleCompleted
                                  ]}>
                                    {check.title}
                                  </Text>
                                </View>
                                <Text style={styles.catalogueCheckDuration}>{check.duration}</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Sticky Gamification Bar */}
      <GamificationBar />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header removed as requested */}

        {/* Overall Progress Section */}
        <View style={styles.overallProgressSection}>
          <View style={styles.overallProgressHeader}>
            <Text style={styles.overallProgressTitle}>Your Secure Score</Text>
          </View>
          
          <View style={styles.overallProgressCard}>
            <View style={styles.circularProgressContainer}>
              <CircularProgress 
                key={`overall-${overallProgress}`}
                progress={overallProgress}
                size={175}
                strokeWidth={10}
                color={Colors.accent}
                backgroundColor={Colors.track}
                showIcon={false}
                showPercentage={true}
                showBackground={true}
                interactive={true}
                onPress={() => setShowScoreBreakdown(true)}
              />
            </View>

          </View>
        </View>

        {/* Active Level Check List (replaces Checks in Progress) */}
          <View style={styles.activeLevelSection}>
            <Text style={[styles.welcomeMessage, styles.welcomeMessageSpacing]}>{getWelcomeMessage()}</Text>
            {activeLevel ? (
              <>
                <View style={[styles.activeLevelHeader, { borderColor: activeLevel.color }] }>
                  <View style={styles.activeLevelContent}>
                    <View style={styles.activeLevelHeaderLeft}>
                      <View style={styles.activeLevelLeftRow}>
                        <View style={[styles.levelChip, { backgroundColor: activeLevel.color }]}>
                          <Text style={styles.levelChipText}>{`Level ${getDisplayIndexForLevel(activeLevel.id)}`}</Text>
                        </View>
                        <Text style={styles.activeLevelTitle}>CyberPup Scout 🐾</Text>
                      </View>
                    </View>
                    <View style={styles.activeLevelRight}>
                      <View style={[styles.activeLevelIconWrap, { borderColor: activeLevel.color }]}>
                        <Text style={styles.activeLevelIconText}>{activeLevel.icon}</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Security Check Button */}
                  {(() => {
                    const hasStartedAnyChecks = activeLevel.areas.some(area => area.completedChecks > 0);
                    const buttonText = hasStartedAnyChecks ? "Continue My Security Check" : "Start My Security Check";
                    return (
                      <TouchableOpacity
                        style={[styles.securityCheckButton, { backgroundColor: activeLevel.color }]}
                        onPress={() => {
                          // Navigate to the first incomplete area, or the first area if all are complete
                          const firstIncompleteArea = activeLevel.areas.find(area => area.completedChecks < area.totalChecks);
                          const targetArea = firstIncompleteArea || activeLevel.areas[0];
                          if (targetArea) {
                            navigateToArea(targetArea);
                          }
                        }}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.securityCheckButtonText}>{buttonText}</Text>
                      </TouchableOpacity>
                    );
                  })()}
                </View>

                <View style={styles.checkListContainer}>
                {(() => {
                  const firstIncompleteIndex = activeLevel.areas.findIndex(area => area.completedChecks < area.totalChecks);
                  return activeLevel.areas.map((area, idx) => {
                    const isCompleted = area.completedChecks === area.totalChecks;
                    const progressPercentage = area.totalChecks > 0 ? Math.round((area.completedChecks / area.totalChecks) * 100) : 0;
                    const cardState = getCardState(area);
                    const cardAnim = getCardAnimation(area.id);
                    
                    return (
                      <React.Fragment key={area.id}>
                        <Animated.View style={{ transform: [{ scale: cardAnim }] }}>
                          <TouchableOpacity
                            style={[
                              styles.checkCardNew,
                              cardState === 'completed' && styles.checkCardCompleted,
                              cardState === 'in-progress' && styles.checkCardInProgress,
                              cardState === 'not-started' && styles.checkCardNotStarted,
                              { 
                                borderColor: cardState === 'completed' ? Colors.cardCompletedBorder : 
                                           cardState === 'not-started' ? Colors.cardNotStartedBorder : 
                                           undefined
                              }
                            ]}
                            activeOpacity={0.85}
                            onPress={() => {
                              animateCardPress(area.id);
                              navigateToArea(area);
                            }}
                          >
                            <View style={styles.checkCardContent}>
                              <View style={styles.checkCardLeft}>
                                <Ionicons 
                                  name={getAreaIcon(area.id)} 
                                  size={Responsive.iconSizes.large} 
                                  color={Colors.textSecondary} 
                                />
                              </View>
                              <View style={styles.checkCardRight}>
                                <Text style={styles.checkTitleNew}>
                                  {area.title}
                                </Text>
                                <Text style={styles.checkSubtitleNew}>
                                  {area.description}
                                </Text>
                                <View style={styles.checkProgressRow}>
                                  <View style={styles.checkProgressBar}> 
                                    <View style={[
                                      styles.checkProgressFill, 
                                      { 
                                        width: `${progressPercentage}%`, 
                                        backgroundColor: cardState === 'completed' ? Colors.accent : activeLevel.color 
                                      }
                                    ]} />
                                  </View>
                                  <Text style={[
                                    styles.checkProgressPercent,
                                    cardState === 'completed' && styles.checkProgressPercentCompleted
                                  ]}>
                                    {area.completedChecks} of {area.totalChecks} checks
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </Animated.View>
                        {idx < activeLevel.areas.length - 1 && (
                          <View style={styles.cardSeparator} />
                        )}
                      </React.Fragment>
                    );
                  });
                })()}
                </View>

                {nextLevel && (
                  <View style={styles.nextLevelCard}>
                    <View style={styles.nextDividerRow}>
                      <View style={styles.nextDivider} />
                      <Text style={styles.nextTinyText}>{`Next in Level ${getDisplayIndexForLevel(nextLevel.id)}`}</Text>
                      <View style={styles.nextDivider} />
                    </View>

                    <View style={styles.nextIconRow}>
                      <View style={[styles.nextIconRing, { borderColor: Colors.accent }]}>
                        <Text style={styles.nextLevelIconText}>{getLevelInfo(nextLevel.id).icon}</Text>
                      </View>
                    </View>

                    <Text style={styles.nextTitle}>{nextLevel.title}</Text>
                    <Text style={styles.nextSubtitle}>{nextLevel.description}</Text>

                    <TouchableOpacity
                      style={[styles.skipAheadButton, { borderColor: Colors.accent }]}
                      onPress={() => navigation.navigate(SCREEN_NAMES.CATEGORY)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.skipAheadText}>Skip Ahead</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.allDoneCard}>
                <Text style={styles.allDoneTitle}>All levels complete 🎉</Text>
                <Text style={styles.allDoneSubtitle}>Review checks or explore topics from the Toolkit tab.</Text>
                <TouchableOpacity style={styles.startLearningButton} onPress={() => navigation.navigate(SCREEN_NAMES.CATEGORY)}>
                  <Text style={styles.startLearningButtonText}>View All Categories</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>



        {/* Bottom spacing for tab navigation */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="home"
        onTabPress={(screen) => {
          console.log('WelcomeScreen - Tab pressed:', screen);
          if (screen === 'CategoryScreen') {
            navigation.navigate(SCREEN_NAMES.CATEGORY);
          } else if (screen === 'InsightsScreen') {
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
      <CatalogueModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Gamification Bar Styles
  gamificationBar: {
    backgroundColor: 'transparent',
    paddingVertical: Responsive.spacing.xs,
    paddingHorizontal: Responsive.padding.screen,
    shadowColor: Colors.background,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1000,
  },
  gamificationContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  gamificationIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Responsive.spacing.xs,
  },
  mascotIcon: {
    fontSize: Typography.sizes.xxl,
  },
  streakIcon: {
    fontSize: Typography.sizes.xxl,
  },
  badgeIcon: {
    fontSize: Typography.sizes.xxl,
  },
  gamificationText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.xs,
  },
  // Catalogue Modal Styles
  catalogueOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogueBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  catalogueContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    marginHorizontal: Responsive.padding.screen,
    width: width - (Responsive.padding.screen * 2),
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  catalogueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.modal,
    paddingVertical: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  catalogueTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.small,
    marginBottom: Responsive.spacing.xs,
  },
  catalogueCheckCompleted: {
    backgroundColor: Colors.cardCompleted,
    borderColor: Colors.cardCompletedBorder,
    borderWidth: 1,
  },
  catalogueCheckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  catalogueCheckTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
  },
  catalogueCheckTitleCompleted: {
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
  },
  catalogueCheckDuration: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  welcomeMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
  },
  welcomeMessageSpacing: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.sm,
  },

  overallProgressSection: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
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
    marginBottom: 0,
    alignItems: 'center',
  },
  overallProgressText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    textAlign: 'center',
  },
  activeLevelSection: {
    paddingHorizontal: Responsive.padding.screen,
  },
  checkListContainer: {
    position: 'relative',
    paddingVertical: Responsive.spacing.xs,
    alignItems: 'stretch',
  },

  activeLevelHeader: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.sm,
    borderWidth: 1,
  },

  activeLevelContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeLevelHeaderLeft: {
    flex: 1,
    paddingRight: Responsive.spacing.sm,
  },
  activeLevelLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
  },
  activeLevelTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.xxl,
    marginTop: -2,
  },
  activeLevelSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  activeLevelIconWrap: {
    width: Responsive.iconSizes.xxlarge,
    height: Responsive.iconSizes.xxlarge,
    borderRadius: Responsive.iconSizes.xxlarge / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  activeLevelIconText: {
    fontSize: Typography.sizes.xxl,
  },
  securityCheckButton: {
    marginTop: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.large,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  securityCheckButtonText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  levelChip: {
    alignSelf: 'flex-start',
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
  },
  levelChipText: {
    color: '#0b1b2b',
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  checkCardNew: {
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.md, // Reduced from lg to md for closer spacing
    borderWidth: 1,
    elevation: 6,
  },
  checkCardCompleted: {
    borderColor: Colors.cardCompletedBorder,
    backgroundColor: Colors.cardCompleted,
    opacity: 1,
  },
  checkCardInProgress: {
    borderColor: Colors.accent,
    borderWidth: 2,
    backgroundColor: Colors.cardInProgress,
    opacity: 1,
    // Make in-progress cards slightly larger
    transform: [{ scale: 1.02 }],
    marginHorizontal: -Responsive.spacing.xs, // Compensate for the scale to maintain alignment
  },
  checkCardNotStarted: {
    borderColor: Colors.cardNotStartedBorder,
    backgroundColor: Colors.cardNotStarted,
    opacity: 0.7,
    shadowColor: Colors.cardNotStartedBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  cardSeparator: {
    height: Responsive.spacing.xs, // Reduced from sm to xs for closer spacing
    backgroundColor: 'transparent',
  },
  timelineDot: {
    display: 'none',
  },
  checkCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Responsive.spacing.sm,
  },
  checkCardLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'relative',
  },
  checkCardRight: {
    flex: 1,
  },

  checkTitleNew: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
    textAlign: 'left',
  },
  checkSubtitleNew: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.xs,
  },
  checkProgressBar: {
    flex: 1,
    height: Responsive.spacing.xs,
    backgroundColor: Colors.border,
    borderRadius: Responsive.borderRadius.small,
    overflow: 'hidden',
    marginRight: Responsive.spacing.sm,
  },
  checkProgressRow: {
    marginTop: Responsive.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkProgressFill: {
    height: '100%',
    borderRadius: Responsive.borderRadius.small,
  },
  checkProgressPercent: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'right',
    minWidth: 28,
  },
  checkProgressPercentCompleted: {
    color: Colors.accent,
  },


  activeLevelMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeLevelRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
  },

  viewAllLink: {
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
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
    marginTop: Responsive.spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
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

  progressSection: {
    paddingHorizontal: Responsive.padding.screen,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.lg,
    letterSpacing: 0.5,
  },
  progressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    marginBottom: Responsive.spacing.md,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  iconPlaceholder: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    backgroundColor: Colors.accent,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
  },
  iconText: {
    fontSize: Typography.sizes.lg,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: Responsive.spacing.xs,
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.small,
    marginRight: Responsive.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.small,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    minWidth: 35,
  },
  emptyProgressCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.modal,
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  emptyProgressTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  emptyProgressSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.md,
    lineHeight: Typography.sizes.sm * 1.4,
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
  nextLevelIconText: {
    fontSize: Typography.sizes.xxl,
  },
});

export default WelcomeScreen; 