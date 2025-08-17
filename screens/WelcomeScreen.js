import React, { useState, useEffect, useRef } from 'react';
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
import StickyGamificationBar from '../components/StickyGamificationBar';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [activeLevel, setActiveLevel] = useState(null);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showStreakDetails, setShowStreakDetails] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showCatalogue, setShowCatalogue] = useState(false);
  const [catalogueOpenedFromSkipAhead, setCatalogueOpenedFromSkipAhead] = useState(false);
  const catalogueOpenedFromSkipAheadRef = useRef(false);

  const [isLoadingActiveLevel, setIsLoadingActiveLevel] = useState(true);
  const [nextLevel, setNextLevel] = useState(null);
  const [nextArea, setNextArea] = useState(null);
  
  // Animation states for card interactions
  const [cardAnimations] = useState(new Map());

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
  const getCardState = (area, isNextCard = false) => {
    const isCompleted = area.completedChecks === area.totalChecks;
    const hasProgress = area.completedChecks > 0;
    
    if (isCompleted) return 'completed';
    if (hasProgress || isNextCard) return 'in-progress';
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
      updateStreak(); // Update streak when screen is focused
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
      return "Ready to secure your digital life?\nLet's start with your first security check.";
    } else if (overallProgress < 25) {
      return `Great start!\nKeep the momentum going with ${nextLabel}.`;
    } else if (overallProgress < 50) {
      return `You're building strong defences!\nNext up: ${nextLabel}.`;
    } else if (overallProgress < 75) {
      return `Excellent progress!\nYou're almost fortress-level secure.\nNext: ${nextLabel}.`;
    } else if (overallProgress < 100) {
      return "You're in the final stretch!\nComplete your last checks to achieve full protection.";
    } else {
      return 'Fully protected!\nRun regular check-ups to stay ahead of new threats.';
    }
  };



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
    const [expandedLevels, setExpandedLevels] = useState(new Set());
    const [checkProgress, setCheckProgress] = useState({});

    useEffect(() => {
      if (showCatalogue) {
        loadCheckProgress();
        
        // Determine which level to expand based on how the modal was opened
        if (catalogueOpenedFromSkipAheadRef.current) {
          // Find the next level (first incomplete level)
          const nextLevelId = findNextLevelId();
          setExpandedLevels(new Set([nextLevelId]));
          catalogueOpenedFromSkipAheadRef.current = false; // Reset the ref
        } else {
          // Default behavior: expand current active level
          const defaultLevelId = activeLevel?.id || 1;
          setExpandedLevels(new Set([defaultLevelId]));
        }
      }
    }, [showCatalogue]);

    const findNextLevelId = () => {
      const orderedLevels = getOrderedLevels();
      
      // If no active level, return the first level
      if (!activeLevel) {
        return orderedLevels[0]?.id || 1;
      }
      
      // Find the next level after the current active level
      const currentLevelIndex = orderedLevels.findIndex(level => level.id === activeLevel.id);
      const nextLevel = orderedLevels[currentLevelIndex + 1];
      
      // If there's a next level, return it; otherwise return the current level
      return nextLevel?.id || activeLevel.id;
    };

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
              <View style={styles.catalogueHeaderContent}>
                <Text style={styles.catalogueTitle}>Security Check Catalogue</Text>
                <Text style={styles.catalogueSubtitle}>Revisit finished checks or see what's ahead</Text>
              </View>
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
          </View>
        </View>
      </Modal>
    );
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
                <View style={styles.activeLevelHeader}>
                  {/* Level Badge - Top Row */}
                  <View style={styles.levelChipContainer}>
                    <View style={styles.levelChip}>
                      <Text style={styles.levelChipText}>{`Level ${getDisplayIndexForLevel(activeLevel.id)}`}</Text>
                    </View>
                  </View>
                  
                  {/* Title and Icon - Middle Row */}
                  <View style={styles.titleIconRow}>
                    <Text style={styles.activeLevelTitle}>CyberPup Scout</Text>
                    <View style={styles.activeLevelIconWrap}>
                      <Text style={styles.activeLevelIconText}>{activeLevel.icon}</Text>
                    </View>
                  </View>
                  
                  {/* Security Check Button */}
                  {(() => {
                    const hasStartedAnyChecks = activeLevel.areas.some(area => area.completedChecks > 0);
                    const buttonText = hasStartedAnyChecks ? "Continue My Security Check" : "Start My Security Check";
                    return (
                      <TouchableOpacity
                        style={styles.securityCheckButton}
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
                    const isNextCard = idx === firstIncompleteIndex;
                    const cardState = getCardState(area, isNextCard);
                    const cardAnim = getCardAnimation(area.id);
                    
                    return (
                      <React.Fragment key={area.id}>
                        <Animated.View style={{ transform: [{ scale: cardAnim }] }}>
                          <TouchableOpacity
                            style={[
                              styles.checkCardNew,
                              cardState === 'completed' && styles.checkCardCompleted,
                              cardState === 'not-started' && styles.checkCardNotStarted,
                              // Apply next card style first, then in-progress if not next
                              isNextCard ? styles.checkCardNext : 
                              cardState === 'in-progress' && styles.checkCardInProgress,
                              { 
                                borderColor: isNextCard ? Colors.cardInProgressBorder :
                                           cardState === 'completed' ? Colors.cardCompletedBorder : 
                                           cardState === 'not-started' ? Colors.cardNotStartedBorder : 
                                           cardState === 'in-progress' ? Colors.cardInProgressBorder :
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
                                  color={
                                    cardState === 'completed' ? Colors.cardCompletedIconColor :
                                    cardState === 'in-progress' ? Colors.cardInProgressIconColor :
                                    Colors.cardNotStartedIconColor
                                  } 
                                />
                              </View>
                              <View style={styles.checkCardRight}>
                                <Text style={[
                                  styles.checkTitleNew,
                                  cardState === 'completed' && { 
                                    color: Colors.cardCompletedTitleColor,
                                    fontSize: Typography.sizes[Colors.cardCompletedTitleSize]
                                  },
                                  cardState === 'in-progress' && { 
                                    color: Colors.cardInProgressTitleColor,
                                    fontSize: Typography.sizes[Colors.cardInProgressTitleSize]
                                  },
                                  cardState === 'not-started' && { 
                                    color: Colors.cardNotStartedTitleColor,
                                    fontSize: Typography.sizes[Colors.cardNotStartedTitleSize]
                                  }
                                ]}>
                                  {area.title}
                                </Text>
                                <Text style={[
                                  styles.checkSubtitleNew,
                                  cardState === 'completed' && { color: Colors.cardCompletedSubtitleColor },
                                  cardState === 'in-progress' && { color: Colors.cardInProgressSubtitleColor },
                                  cardState === 'not-started' && { color: Colors.cardNotStartedSubtitleColor }
                                ]}>
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
                      onPress={() => {
                        catalogueOpenedFromSkipAheadRef.current = true;
                        setShowCatalogue(true);
                      }}
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
                <Text style={styles.allDoneSubtitle}>Review checks or explore topics from the Insights tab.</Text>
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

  // Catalogue Modal Styles
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
  welcomeMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
    textAlign: 'center',
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
    backgroundColor: Colors.heroCardBackground,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.spacing.xl, // Increased from lg to xl for more breathing room
    marginBottom: Responsive.spacing.md, // Increased margin for better separation
    marginHorizontal: -Responsive.spacing.xs, // Slightly extend beyond container for hero effect
    borderWidth: Colors.heroCardBorderWidth,
    borderColor: Colors.heroCardBorder,
    shadowColor: Colors.heroCardShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Colors.heroCardShadowOpacity,
    shadowRadius: Colors.heroCardShadowRadius,
    elevation: Colors.heroCardElevation,
  },

  levelChipContainer: {
    marginBottom: Responsive.spacing.md, // Space between badge and title row
  },
  titleIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Responsive.spacing.lg, // Space between title row and button
  },
  activeLevelTitle: {
    fontSize: Typography.sizes.xxxl, // Increased from xxl to xxxl for more prominence
    fontWeight: Typography.weights.bold,
    color: Colors.heroTitleColor,
    lineHeight: Typography.sizes.xxxl * 1.2, // Increased line height for better readability
    flex: 1, // Take up available space
    marginRight: Responsive.spacing.lg, // Space between title and icon
  },
  activeLevelSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  activeLevelIconWrap: {
    width: Responsive.iconSizes.xxlarge + Responsive.spacing.sm, // Increased size
    height: Responsive.iconSizes.xxlarge + Responsive.spacing.sm, // Increased size
    borderRadius: (Responsive.iconSizes.xxlarge + Responsive.spacing.sm) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3, // Increased border width for more prominence
    borderColor: Colors.heroIconBorder,
    backgroundColor: Colors.heroIconBackground,
  },
  activeLevelIconText: {
    fontSize: Typography.sizes.xxxl, // Increased from xxl to xxxl for more prominence
  },
  securityCheckButton: {
    borderRadius: Responsive.borderRadius.large,
    paddingVertical: Responsive.padding.button + Responsive.spacing.xs, // Increased padding
    paddingHorizontal: Responsive.spacing.xl, // Increased horizontal padding
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Responsive.buttonHeight.large, // Increased button height
    backgroundColor: Colors.heroButtonBackground,
    shadowColor: Colors.heroButtonShadowColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: Colors.heroButtonShadowOpacity,
    shadowRadius: Colors.heroButtonShadowRadius,
    elevation: Colors.heroButtonElevation,
  },
  securityCheckButtonText: {
    color: Colors.heroButtonTextColor,
    fontSize: Typography.sizes.lg, // Increased from md to lg for more prominence
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  levelChip: {
    alignSelf: 'flex-start',
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.md, // Increased horizontal padding
    paddingVertical: Responsive.spacing.sm, // Increased vertical padding
    backgroundColor: Colors.heroChipBackground,
  },
  levelChipText: {
    color: Colors.heroChipTextColor,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.md, // Increased from sm to md for more prominence
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
    opacity: Colors.cardCompletedOpacity,
  },
  checkCardInProgress: {
    borderColor: Colors.cardInProgressBorder,
    borderWidth: 2,
    backgroundColor: Colors.cardInProgress,
    opacity: Colors.cardInProgressOpacity,
    // Make in-progress cards slightly larger
    transform: [{ scale: 1.02 }],
    marginHorizontal: -Responsive.spacing.xs, // Compensate for the scale to maintain alignment
  },
  checkCardNotStarted: {
    borderColor: Colors.cardNotStartedBorder,
    backgroundColor: Colors.cardNotStarted,
    opacity: Colors.cardNotStartedOpacity,
    shadowColor: Colors.cardNotStartedBorder,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  checkCardNext: {
    borderWidth: 2,
    backgroundColor: Colors.cardInProgress,
    opacity: Colors.cardInProgressOpacity,
    // Make next card larger like in-progress cards
    transform: [{ scale: 1.02 }],
    marginHorizontal: -Responsive.spacing.xs, // Compensate for the scale to maintain alignment
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
    marginBottom: Responsive.spacing.xs,
    textAlign: 'left',
  },
  checkSubtitleNew: {
    fontSize: Typography.sizes.sm,
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