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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { levels, getAllChecks, getChecksByArea, getAreasByLevel } from '../data/courseData';
import CircularProgress from '../components/CircularProgress';
import BottomNavigation from '../components/BottomNavigation';
import { SCREEN_NAMES } from '../constants';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedChecks, setCompletedChecks] = useState(0);
  const [totalChecks, setTotalChecks] = useState(0);
  const [activeLevel, setActiveLevel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingActiveLevel, setIsLoadingActiveLevel] = useState(true);
  const [nextLevel, setNextLevel] = useState(null);

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

  // Load progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      calculateOverallProgress();
      loadActiveLevelView();
    }, [])
  );

  // Filter search results when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      performSearch(searchQuery.trim());
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = (query) => {
    const allChecks = getCheckData();
    const results = [];

    // Search through checks
    allChecks.forEach(check => {
      const matchesTitle = check.title.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = check.levelTitle.toLowerCase().includes(query.toLowerCase());
      
      if (matchesTitle || matchesLevel) {
        const levelInfo = getLevelInfo(check.levelId);
        results.push({
          type: 'check',
          id: check.id,
          title: check.title,
          levelId: check.levelId,
          levelTitle: check.levelTitle,
          levelIcon: levelInfo.icon,
          levelColor: levelInfo.color,
        });
      }
    });

    // Search through levels
    const levelIds = [...new Set(allChecks.map(c => c.levelId))];
    levelIds.forEach(levelId => {
      const levelInfo = getLevelInfo(levelId);
      const matchesLevel = levelInfo.title.toLowerCase().includes(query.toLowerCase());
      
      if (matchesLevel) {
        const levelChecks = allChecks.filter(c => c.levelId === levelId);
        results.push({
          type: 'level',
          id: `level-${levelId}`,
          title: levelInfo.title,
          levelId: levelId,
          levelIcon: levelInfo.icon,
          levelColor: levelInfo.color,
          checkCount: levelChecks.length,
        });
      }
    });

    // Remove duplicates and sort (levels first, then checks)
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    const sortedResults = uniqueResults.sort((a, b) => {
      if (a.type === 'level' && b.type === 'check') return -1;
      if (a.type === 'check' && b.type === 'level') return 1;
      return a.title.localeCompare(b.title);
    });

    setSearchResults(sortedResults);
  };

  const calculateOverallProgress = async () => {
    try {
      const allChecks = getCheckData();
      setTotalChecks(allChecks.length);
      
      let completedCount = 0;

      // Check each check for completion
      for (const check of allChecks) {
        const progressKey = `check_${check.id}_completed`;
        const progressData = await AsyncStorage.getItem(progressKey);
        
        if (progressData === 'completed') {
          completedCount++;
        }
      }

      setCompletedChecks(completedCount);
      
      // Calculate overall progress as percentage of completed checks
      const progress = allChecks.length > 0 ? Math.round((completedCount / allChecks.length) * 100) : 0;
      setOverallProgress(progress);
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
      setIsLoadingActiveLevel(false);
    } catch (error) {
      console.log('Error loading active level view:', error);
      setIsLoadingActiveLevel(false);
    }
  };

  const getWelcomeMessage = () => {
    const nextLabel = activeLevel?.title || 'the next check';
    if (overallProgress === 0) {
      return "Let’s begin your security health check. Start with the first check to set a secure baseline.";
    } else if (overallProgress < 25) {
      return `Good start. Continue your audit with ${nextLabel}.`;
    } else if (overallProgress < 50) {
      return `You're midway through your security audit. Keep reducing risk with ${nextLabel}.`;
    } else if (overallProgress < 75) {
      return `Strong progress. Close the remaining gaps — next: ${nextLabel}.`;
    } else if (overallProgress < 100) {
      return 'Almost done. Finish the last checks to lock in your secure baseline.';
    } else {
      return 'All checks complete. Re-run key checks regularly and when things change.';
    }
  };

  const renderSearchResult = ({ item }) => {
    if (item.type === 'level') {
      return (
        <TouchableOpacity
          style={styles.searchResultCard}
          onPress={() => {
            navigation.navigate('ModuleListScreen', {
              category: {
                id: item.levelId,
                title: item.title,
                icon: item.levelIcon,
                color: item.levelColor,
              }
            });
            setSearchQuery('');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.levelColor }]}>
            <Text style={styles.searchResultIconText}>{item.levelIcon}</Text>
          </View>
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultSubtitle}>{item.checkCount} checks</Text>
          </View>
          <Text style={styles.searchResultType}>Level</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.searchResultCard}
          onPress={() => {
            const levelInfo = getLevelInfo(item.levelId);
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
            
            const routeName = checkRoutes[item.id] || SCREEN_NAMES.WELCOME;
            navigation.navigate(routeName, { 
              level: {
                id: item.levelId,
                title: item.levelTitle,
                icon: item.levelIcon,
                color: item.levelColor,
              }
            });
            setSearchQuery('');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.levelColor }]}>
            <Text style={styles.searchResultIconText}>{item.levelIcon}</Text>
          </View>
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultSubtitle}>{item.levelTitle}</Text>
          </View>
          <Text style={styles.searchResultType}>Check</Text>
        </TouchableOpacity>
      );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
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
                size={140}
                strokeWidth={10}
                color={Colors.accent}
                backgroundColor={Colors.track}
                showIcon={true}
                showPercentage={true}
                showBackground={true}
              />
            </View>
            <Text style={styles.overallProgressSubtitle}>
              {completedChecks} of {totalChecks} checks completed
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for security tips, areas, or levels..."
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          
        </View>

        {/* Search Results */}
        {isSearching && (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.searchResultsTitle}>
              {searchResults.length > 0 ? `Found ${searchResults.length} result${searchResults.length === 1 ? '' : 's'}` : 'No results found'}
            </Text>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.searchResultsList}
            />
          </View>
        )}



        {/* Active Level Check List (replaces Checks in Progress) */}
        {!isSearching && (
          <View style={styles.activeLevelSection}>
            <Text style={[styles.welcomeMessage, styles.welcomeMessageSpacing]}>{getWelcomeMessage()}</Text>
            {activeLevel ? (
              <>
                <View style={[styles.activeLevelHeader, { borderColor: activeLevel.color }] }>
                  <TouchableOpacity
                    onPress={() => navigation.navigate(SCREEN_NAMES.CATEGORY)}
                    style={styles.overflowButton}
                    activeOpacity={0.8}
                    accessibilityLabel="Open levels"
                  >
                    <Ionicons name="reorder-three-outline" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  <View style={styles.activeLevelSeparator} />
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
                </View>

                <View style={styles.checkListContainer}>
                  <View style={styles.verticalConnectorWrap} pointerEvents="none">
                    <View style={[styles.verticalConnector, { backgroundColor: activeLevel.color }]} />
                  </View>
                {(() => {
                  const firstIncompleteIndex = activeLevel.areas.findIndex(area => area.completedChecks < area.totalChecks);
                  return activeLevel.areas.map((area, idx) => {
                    const isCompleted = area.completedChecks === area.totalChecks;
                    const isLocked = !isCompleted && firstIncompleteIndex !== -1 && idx > firstIncompleteIndex;
                    const progressPercentage = area.totalChecks > 0 ? Math.round((area.completedChecks / area.totalChecks) * 100) : 0;
                    const cta = isCompleted ? 'COMPLETED' : (progressPercentage === 0 ? 'START' : 'CONTINUE');
                    const ctaBorderColor = isCompleted || isLocked ? Colors.disabled : activeLevel.color;
                    const ctaTextStyle = isCompleted || isLocked ? styles.checkCtaTextDisabled : styles.checkCtaText;
                    const badgeStyle = [styles.checkBadge, (isCompleted || isLocked) && styles.checkBadgeDisabled];
                    return (
                <React.Fragment key={area.id}>
                  <TouchableOpacity
                    style={[
                      styles.checkCardNew,
                      { borderColor: activeLevel.color }
                    ]}
                    activeOpacity={0.85}
                    onPress={() => navigateToArea(area)}
                  >
                    <View style={styles.checkHeaderNew}>
                          <View style={badgeStyle}> 
                            <Text style={styles.checkBadgeText}>{`Area ${idx + 1}`}</Text>
                          </View>
                          <Text style={[styles.checkTitleNew, styles.checkTitleInline]}>{area.title}</Text>
                          <View style={[styles.checkCtaBubble, { borderColor: ctaBorderColor }]}> 
                            <Text style={ctaTextStyle}>{cta}</Text>
                          </View>
                    </View>
                    <Text style={styles.checkSubtitleNew}>{area.description}</Text>
                        <View style={styles.checkProgressRow}>
                          <View style={styles.checkProgressBar}> 
                            <View style={[styles.checkProgressFill, { width: `${progressPercentage}%`, backgroundColor: activeLevel.color }]} />
                          </View>
                          <Text style={styles.checkProgressPercent}>{area.completedChecks} of {area.totalChecks} checks</Text>
                        </View>
                  </TouchableOpacity>
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
        )}



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
          } else if (screen === 'ProfileScreen') {
            navigation.navigate(SCREEN_NAMES.PROFILE);
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
  verticalConnectorWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  verticalConnector: {
    width: 3,
    flex: 1,
    opacity: 0.35,
    borderRadius: Responsive.borderRadius.small,
  },
  activeLevelHeader: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  activeLevelSeparator: {
    width: 1,
    height: Responsive.iconSizes.xlarge,
    backgroundColor: Colors.accent,
    marginHorizontal: Responsive.spacing.sm,
    opacity: 0.3,
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
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    borderWidth: 1,
    elevation: 6,
  },
  cardSeparator: {
    height: Responsive.spacing.sm,
    backgroundColor: 'transparent',
  },
  timelineDot: {
    display: 'none',
  },
  checkHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  checkTitleInline: {
    flex: 1,
    marginHorizontal: Responsive.spacing.sm,
  },
  checkBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
  },
  checkBadgeDisabled: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  checkBadgeText: {
    color: Colors.textSecondary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  checkCtaBubble: {
    borderRadius: Responsive.borderRadius.large,
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  checkCtaText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  checkCtaTextDisabled: {
    color: Colors.textSecondary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
  checkTitleNew: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  checkSubtitleNew: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.sm,
  },
  checkProgressBar: {
    flex: 1,
    height: Responsive.spacing.xs,
    backgroundColor: Colors.track,
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
  searchContainer: {
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
  },
  searchBar: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    borderWidth: 1,
    borderColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
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
  overflowButton: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)'
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
  searchInput: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
  },
  searchResultsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.md,
  },
  searchResultsList: {
    paddingBottom: Responsive.spacing.lg,
  },
  searchResultCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  searchResultIcon: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.sm,
  },
  searchResultIconText: {
    fontSize: Typography.sizes.md,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  searchResultType: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    fontWeight: Typography.weights.semibold,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.medium,
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