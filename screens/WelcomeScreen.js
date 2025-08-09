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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { categories, getAllModules, getLessonsByModule, getModulesByCategory } from '../data/courseData';
import CircularProgress from '../components/CircularProgress';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeCategoryModules, setActiveCategoryModules] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingActiveCategory, setIsLoadingActiveCategory] = useState(true);
  const [nextCategory, setNextCategory] = useState(null);

  // Get module data from our course data
  const getModuleData = () => {
    return getAllModules();
  };

  const getCategoryInfo = (categoryId) => {
    const categoryData = {
      1: { icon: '🔐', color: '#4a90e2', title: 'Password Security & Authentication' },
      2: { icon: '🎣', color: '#e74c3c', title: 'Phishing & Scam Awareness' },
      3: { icon: '🛡️', color: '#27ae60', title: 'Device & Network Security' },
      4: { icon: '🔒', color: '#9b59b6', title: 'Online Privacy & Social Media' },
      5: { icon: '💰', color: '#f39c12', title: 'Secure Finances & Identity Protection' },
    };
    return categoryData[categoryId] || { icon: '📚', color: '#4a90e2', title: 'Unknown Category' };
  };

  const getDisplayIndexForCategory = (categoryId) => {
    const ordered = [
      6,
      ...categories
        .filter((c) => c.id !== 6)
        .map((c) => c.id)
        .sort((a, b) => a - b),
    ];
    const index = ordered.indexOf(categoryId);
    return index >= 0 ? index + 1 : 1;
  };

  const getOrderedCategories = () => {
    return [
      ...categories.filter((c) => c.id === 6),
      ...categories.filter((c) => c.id !== 6).sort((a, b) => a.id - b.id),
    ];
  };

  // Load progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      calculateOverallProgress();
      loadActiveCategoryView();
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
    const allModules = getModuleData();
    const results = [];

    // Search through modules
    allModules.forEach(module => {
      const matchesTitle = module.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = module.categoryName.toLowerCase().includes(query.toLowerCase());
      
      if (matchesTitle || matchesCategory) {
        const categoryInfo = getCategoryInfo(module.categoryId);
        results.push({
          type: 'module',
          id: module.id,
          title: module.title,
          categoryId: module.categoryId,
          categoryName: module.categoryName,
          categoryIcon: categoryInfo.icon,
          categoryColor: categoryInfo.color,
        });
      }
    });

    // Search through categories
    const categoryIds = [...new Set(allModules.map(m => m.categoryId))];
    categoryIds.forEach(categoryId => {
      const categoryInfo = getCategoryInfo(categoryId);
      const matchesCategory = categoryInfo.title.toLowerCase().includes(query.toLowerCase());
      
      if (matchesCategory) {
        const categoryModules = allModules.filter(m => m.categoryId === categoryId);
        results.push({
          type: 'category',
          id: `category-${categoryId}`,
          title: categoryInfo.title,
          categoryId: categoryId,
          categoryIcon: categoryInfo.icon,
          categoryColor: categoryInfo.color,
          moduleCount: categoryModules.length,
        });
      }
    });

    // Remove duplicates and sort (categories first, then modules)
    const uniqueResults = results.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
    
    const sortedResults = uniqueResults.sort((a, b) => {
      if (a.type === 'category' && b.type === 'module') return -1;
      if (a.type === 'module' && b.type === 'category') return 1;
      return a.title.localeCompare(b.title);
    });

    setSearchResults(sortedResults);
  };

  const calculateOverallProgress = async () => {
    try {
      const allModules = getModuleData();
      setTotalModules(allModules.length);
      
      let completedCount = 0;
      let totalSteps = 0;
      let completedSteps = 0;

      // Check each module for completion
      for (const module of allModules) {
        let moduleProgress = 0;
        
        if (module.id === '1-1') {
          // Special handling for Creating Strong Passwords module
          const strongPasswordsProgress = await AsyncStorage.getItem('strong_passwords_progress');
          if (strongPasswordsProgress) {
            const progressData = JSON.parse(strongPasswordsProgress);
            if (progressData.isCompleted) {
              completedCount++;
              moduleProgress = 4; // 4 sections completed
            } else {
              let completedSections = 0;
              if (progressData.checklistItems) {
                const completedChecklistItems = progressData.checklistItems.filter(item => item.completed).length;
                if (completedChecklistItems > 0) completedSections++;
              }
              if (progressData.quizAnswers) {
                const answeredQuestions = Object.values(progressData.quizAnswers).filter(answer => answer !== null).length;
                if (answeredQuestions > 0) completedSections++;
              }
              moduleProgress = completedSections;
            }
          }
        } else if (module.id === '1-2') {
          // Password Managers module
          const progressData = await AsyncStorage.getItem('password_managers_progress');
          if (progressData === 'completed') {
            completedCount++;
            moduleProgress = 5; // 5 sections completed
          } else {
            moduleProgress = 0;
          }
        } else if (module.id === '1-3') {
          // Multi-Factor Authentication module
          const progressData = await AsyncStorage.getItem('mfa_progress');
          if (progressData === 'completed') {
            completedCount++;
            moduleProgress = 3; // 3 sections completed
          } else {
            moduleProgress = 0;
          }
        } else if (module.id === '1-4') {
          // Password Recovery module
          const progressData = await AsyncStorage.getItem('password_recovery_progress');
          if (progressData === 'completed') {
            completedCount++;
            moduleProgress = 2; // 2 sections completed
          } else {
            moduleProgress = 0;
          }
        } else {
          // Standard module handling
          const moduleCompleted = await AsyncStorage.getItem(`module_${module.id}_completed`);
          if (moduleCompleted === 'true') {
            completedCount++;
          }

          // Get step completion for this module
          const completedStepsData = await AsyncStorage.getItem(`module_${module.id}_completed_steps`);
          if (completedStepsData) {
            const steps = JSON.parse(completedStepsData);
            moduleProgress = steps.length;
          }
        }

        completedSteps += moduleProgress;

        // Get actual lesson count for this module
        const lessons = getLessonsByModule(module.id);
        totalSteps += lessons.length;
      }

      setCompletedModules(completedCount);
      
      // Calculate overall progress as percentage of completed steps
      const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      console.log('Progress calculation:', {
        completedSteps,
        totalSteps,
        progress,
        completedCount,
        totalModules: allModules.length
      });
      setOverallProgress(progress);
    } catch (error) {
      console.log('Error calculating progress:', error);
    }
  };

  // Determine active category (first by id that is not fully complete) and load its modules with progress
  const loadActiveCategoryView = async () => {
    try {
      setIsLoadingActiveCategory(true);
      // Helper to compute if a module is completed and steps completed count
      const getModuleStatus = async (module) => {
        const totalLessons = getLessonsByModule(module.id).length;
        let completedStepsCount = 0;
        let isCompleted = false;

        if (module.id === '1-1') {
          const strong = await AsyncStorage.getItem('strong_passwords_progress');
          if (strong) {
            const data = JSON.parse(strong);
            if (data.isCompleted) {
              isCompleted = true;
              completedStepsCount = totalLessons;
            } else {
              let sections = 0;
              if (data.checklistItems) {
                const completedChecklistItems = data.checklistItems.filter(item => item.completed).length;
                if (completedChecklistItems > 0) sections++;
              }
              if (data.quizAnswers) {
                const answeredQuestions = Object.values(data.quizAnswers).filter(answer => answer !== null).length;
                if (answeredQuestions > 0) sections++;
              }
              completedStepsCount = Math.min(sections, totalLessons);
            }
          }
        } else if (module.id === '1-2') {
          const pd = await AsyncStorage.getItem('password_managers_progress');
          if (pd === 'completed') {
            isCompleted = true;
            completedStepsCount = totalLessons;
          }
        } else if (module.id === '1-3') {
          const pd = await AsyncStorage.getItem('mfa_progress');
          if (pd === 'completed') {
            isCompleted = true;
            completedStepsCount = totalLessons;
          }
        } else if (module.id === '1-4') {
          const pd = await AsyncStorage.getItem('password_recovery_progress');
          if (pd === 'completed') {
            isCompleted = true;
            completedStepsCount = totalLessons;
          }
        } else if (module.id === '6-1') {
          const pd = await AsyncStorage.getItem('welcome_abord_progress');
          if (pd === 'completed') {
            isCompleted = true;
            completedStepsCount = totalLessons;
          }
        } else {
          const completedStepsData = await AsyncStorage.getItem(`module_${module.id}_completed_steps`);
          const steps = completedStepsData ? JSON.parse(completedStepsData) : [];
          completedStepsCount = Math.min(steps.length, totalLessons);
          isCompleted = completedStepsCount >= totalLessons && totalLessons > 0;
        }

        const percentage = totalLessons > 0 ? Math.round((completedStepsCount / totalLessons) * 100) : 0;
        return { completedStepsCount, totalLessons, percentage, isCompleted };
      };

      // Find first incomplete category by display order
      let selectedCategory = null;
      const orderedCategories = getOrderedCategories();
      for (const cat of orderedCategories) {
        const catModules = getModulesByCategory(cat.id);
        let allComplete = true;
        for (const m of catModules) {
          const status = await getModuleStatus(m);
          if (!status.isCompleted) {
            allComplete = false;
            break;
          }
        }
        if (!allComplete) {
          selectedCategory = cat;
          break;
        }
      }

      if (!selectedCategory) {
        setActiveCategory(null);
        setActiveCategoryModules([]);
        return;
      }

      const catModules = getModulesByCategory(selectedCategory.id);
      const enriched = [];
      for (const m of catModules) {
        const status = await getModuleStatus(m);
        enriched.push({ ...m, ...status });
      }

      setActiveCategory(selectedCategory);
      setActiveCategoryModules(enriched);

      // Determine next category preview
      const currentIndex = orderedCategories.findIndex((c) => c.id === selectedCategory.id);
      let preview = null;
      for (let i = currentIndex + 1; i < orderedCategories.length; i++) {
        const cand = orderedCategories[i];
        const candMods = getModulesByCategory(cand.id);
        let allDone = true;
        for (const mm of candMods) {
          const st = await getModuleStatus(mm);
          if (!st.isCompleted) { allDone = false; break; }
        }
        if (!allDone) { preview = cand; break; }
      }
      setNextCategory(preview);
    } catch (error) {
      console.log('Error loading active category view:', error);
    }
    finally {
      setIsLoadingActiveCategory(false);
    }
  };

  const getWelcomeMessage = () => {
    const nextLabel = activeCategory?.title || 'the next check';
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
    if (item.type === 'category') {
      return (
        <TouchableOpacity
          style={styles.searchResultCard}
          onPress={() => {
            navigation.navigate('ModuleListScreen', {
              category: {
                id: item.categoryId,
                title: item.title,
                icon: item.categoryIcon,
                color: item.categoryColor,
              }
            });
            setSearchQuery('');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.categoryColor }]}>
            <Text style={styles.searchResultIconText}>{item.categoryIcon}</Text>
          </View>
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultSubtitle}>{item.moduleCount} modules</Text>
          </View>
          <Text style={styles.searchResultType}>Category</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity
          style={styles.searchResultCard}
          onPress={() => {
            const categoryInfo = getCategoryInfo(item.categoryId);
            navigation.navigate('LessonScreen', {
              module: {
                id: item.id,
                title: item.title,
              },
              category: {
                id: item.categoryId,
                title: item.categoryName,
                icon: item.categoryIcon,
                color: item.categoryColor,
              }
            });
            setSearchQuery('');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.searchResultIcon, { backgroundColor: item.categoryColor }]}>
            <Text style={styles.searchResultIconText}>{item.categoryIcon}</Text>
          </View>
          <View style={styles.searchResultContent}>
            <Text style={styles.searchResultTitle}>{item.title}</Text>
            <Text style={styles.searchResultSubtitle}>{item.categoryName}</Text>
          </View>
          <Text style={styles.searchResultType}>Module</Text>
        </TouchableOpacity>
      );
    }
  };

  const ProgressCard = ({ icon, title, subtitle, progress, categoryId }) => (
    <TouchableOpacity
      style={styles.progressCard}
      onPress={() => {
        const categoryInfo = getCategoryInfo(categoryId);
        navigation.navigate('ModuleListScreen', {
          category: {
            id: categoryId,
            title: categoryInfo.title,
            icon: categoryInfo.icon,
            color: categoryInfo.color,
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

  // Navigate to next incomplete lesson inside a module
  const navigateToNextLesson = async (module) => {
    // Map module id to its intro/lesson screen sequence
    const moduleIntroRoutes = {
      '1-1': 'PasswordIntroScreen',
      '1-2': 'PasswordManagersIntroScreen',
      '1-3': 'MFATutorialScreen',
      '1-4': 'PasswordRecoveryIntroScreen',
      '2-1': 'PhishingEmailsIntroScreen',
      '2-2': 'SocialEngineeringIntroScreen',
      '2-3': 'SafeLinkIntroScreen',
      '2-4': 'ReportingScamsIntroScreen',
      '3-1': 'DeviceUpdatesIntroScreen',
      '3-2': 'HomeNetworkIntroScreen',
      '3-3': 'AntivirusIntroScreen',
      '3-4': 'MobileSecurityIntroScreen',
      '4-1': 'SocialMediaIntroScreen',
      '4-2': 'DigitalFootprintIntroScreen',
      '4-3': 'DataSharingIntroScreen',
      '4-4': 'PrivacyToolsIntroScreen',
      '5-1': 'SecureBankingIntroScreen',
      '5-2': 'CreditMonitoringIntroScreen',
      '5-3': 'SafeShoppingIntroScreen',
      '5-4': 'IdentityTheftIntroScreen',
      '6-1': 'WelcomeAbordIntroScreen',
    };

    const lessons = getLessonsByModule(module.id);
    const totalLessons = lessons.length;

    // Storage key scheme for "standard" modules already used elsewhere
    let completedSteps = [];
    try {
      const completedStepsData = await AsyncStorage.getItem(`module_${module.id}_completed_steps`);
      completedSteps = completedStepsData ? JSON.parse(completedStepsData) : [];
    } catch (e) {
      completedSteps = [];
    }

    // Determine if module is complete
    const isModuleComplete = completedSteps.length >= totalLessons && totalLessons > 0;

    // If not complete, navigate to the module intro screen
    const routeName = moduleIntroRoutes[module.id] || 'Welcome';
    navigation.navigate(routeName, { category: activeCategory });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to CyberPup!</Text>
          <Text style={styles.welcomeMessage}>{getWelcomeMessage()}</Text>
        </View>

        {/* Overall Progress Section */}
        <View style={styles.overallProgressSection}>
          <View style={styles.overallProgressHeader}>
            <Text style={styles.overallProgressTitle}>Your Secure Score</Text>
            <Text style={styles.overallProgressSubtitle}>
              {completedModules} of {totalModules} modules completed
            </Text>
          </View>
          
          <View style={styles.overallProgressCard}>
            <View style={styles.circularProgressContainer}>
              <CircularProgress 
                key={`overall-${overallProgress}`}
                progress={overallProgress}
                size={140}
                strokeWidth={10}
                color="#4a90e2"
                backgroundColor="#2d5a87"
                showIcon={true}
                showPercentage={true}
                showBackground={true}
              />
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#a0aec0" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for security tips, modules, or categories..."
              placeholderTextColor="#a0aec0"
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



        {/* Active Category Module List (replaces Checks in Progress) */}
        {!isSearching && (
          <View style={styles.activeCategorySection}>
            {activeCategory ? (
              <>
                <View style={[styles.activeCategoryHeader, { borderColor: activeCategory.color }] }>
                  <View style={styles.activeCategoryHeaderLeft}>
                    <View style={[styles.categoryChip, { backgroundColor: activeCategory.color }]}>
                      <Text style={styles.categoryChipText}>{`Category ${getDisplayIndexForCategory(activeCategory.id)}`}</Text>
                    </View>
                    <Text style={styles.activeCategoryTitle}>{activeCategory.title}</Text>
                    <View style={styles.activeCategoryMetaRow}>
                      <Text style={styles.activeCategorySubtitle}>modules</Text>
                    </View>
                  </View>
                  <View style={styles.activeCategoryRight}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('CategoryScreen')}
                      style={styles.overflowButton}
                      activeOpacity={0.8}
                      accessibilityLabel="Open categories"
                    >
                      <Ionicons name="reorder-three-outline" size={24} color="#ffffff" />
                    </TouchableOpacity>
                    <View style={[styles.activeCategoryIconWrap, { borderColor: activeCategory.color }]}>
                      <Text style={styles.activeCategoryIconText}>{activeCategory.icon}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.moduleListContainer}>
                  <View style={styles.verticalConnectorWrap} pointerEvents="none">
                    <View style={[styles.verticalConnector, { backgroundColor: activeCategory.color }]} />
                  </View>
                {activeCategoryModules.map((m, idx) => {
              const isStart = m.percentage === 0;
              const cta = isStart ? 'START' : 'CONTINUE';
              return (
                <>
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.moduleCardNew,
                      { borderColor: activeCategory.color, shadowColor: activeCategory.color }
                    ]}
                    activeOpacity={0.85}
                    onPress={() => navigateToNextLesson(m)}
                  >
                    <View style={styles.moduleHeaderNew}>
                      <View style={styles.moduleBadge}> 
                        <Text style={styles.moduleBadgeText}>{`Module ${idx + 1}`}</Text>
                      </View>
                      <View style={[styles.moduleCtaBubble, { borderColor: activeCategory.color }]}> 
                        <Text style={styles.moduleCtaText}>{cta}</Text>
                      </View>
                    </View>
                    <View style={[styles.timelineDot, { backgroundColor: activeCategory.color }]} />
                    <Text style={[styles.moduleTitleNew, { marginLeft: 8 }]}>{m.title}</Text>
                    <Text style={styles.moduleSubtitleNew}>{`${m.completedStepsCount} of ${m.totalLessons} lessons completed`}</Text>
                    <View style={styles.moduleProgressBar}> 
                      <View style={[styles.moduleProgressFill, { width: `${m.percentage}%`, backgroundColor: activeCategory.color }]} />
                    </View>
                    <Text style={styles.moduleProgressPercent}>{m.percentage}%</Text>
                  </TouchableOpacity>
                  {idx < activeCategoryModules.length - 1 && (
                    <View style={styles.cardSeparator} />
                  )}
                </>
              );
                })}
                </View>

                {nextCategory && (
                  <View style={styles.nextCategoryCard}>
                    <View style={styles.nextDividerRow}>
                      <View style={styles.nextDivider} />
                      <Text style={styles.nextTinyText}>{`Next in Category ${getDisplayIndexForCategory(nextCategory.id)}`}</Text>
                      <View style={styles.nextDivider} />
                    </View>

                    <View style={styles.nextIconRow}>
                      <View style={[styles.nextIconRing, { borderColor: nextCategory.color }]}>
                        <Text style={styles.activeCategoryIconText}>{getCategoryInfo(nextCategory.id).icon}</Text>
                      </View>
                    </View>

                    <Text style={styles.nextTitle}>{nextCategory.title}</Text>
                    <Text style={styles.nextSubtitle}>Preview the upcoming checks in this category.</Text>

                    <TouchableOpacity
                      style={[styles.skipAheadButton, { borderColor: nextCategory.color }]}
                      onPress={() => navigation.navigate('ModuleListScreen', { category: { id: nextCategory.id, title: nextCategory.title, icon: getCategoryInfo(nextCategory.id).icon, color: nextCategory.color } })}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.skipAheadText}>Skip Ahead</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.allDoneCard}>
                <Text style={styles.allDoneTitle}>All categories complete 🎉</Text>
                <Text style={styles.allDoneSubtitle}>Review modules or explore topics from the Learn tab.</Text>
                <TouchableOpacity style={styles.startLearningButton} onPress={() => navigation.navigate('CategoryScreen')}>
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
          if (screen === 'Category') {
            navigation.navigate('CategoryScreen');
          } else if (screen === 'Profile') {
            navigation.navigate('ProfileScreen');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a365d',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#a0aec0',
    lineHeight: 22,
  },

  overallProgressSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  overallProgressHeader: {
    marginBottom: 16,
  },
  overallProgressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  overallProgressSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
  },
  overallProgressCard: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 0,
    alignItems: 'center',
  },
  circularProgressContainer: {
    marginBottom: 0,
    alignItems: 'center',
  },
  overallProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
    textAlign: 'center',
  },
  activeCategorySection: {
    paddingHorizontal: 24,
  },
  moduleListContainer: {
    position: 'relative',
    paddingVertical: 6,
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
    borderRadius: 2,
  },
  activeCategoryHeader: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  activeCategoryHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  activeCategoryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 6,
    marginBottom: 4,
  },
  activeCategorySubtitle: {
    fontSize: 16,
    color: '#a0aec0',
  },
  activeCategoryIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
  activeCategoryIconText: {
    fontSize: 26,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipText: {
    color: '#0b1b2b',
    fontWeight: '700',
    fontSize: 12,
  },
  moduleCardNew: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardSeparator: {
    height: 10,
    backgroundColor: 'transparent',
  },
  timelineDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    left: '50%',
    marginLeft: -5,
    top: 22,
    opacity: 0.7,
  },
  moduleHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  moduleBadgeText: {
    color: '#a0aec0',
    fontWeight: '700',
    fontSize: 12,
  },
  moduleCtaBubble: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.1)'
  },
  moduleCtaText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  moduleTitleNew: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  moduleSubtitleNew: {
    fontSize: 14,
    color: '#a0aec0',
    marginBottom: 10,
  },
  moduleProgressBar: {
    height: 6,
    backgroundColor: '#1a365d',
    borderRadius: 4,
    overflow: 'hidden',
  },
  moduleProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  moduleProgressPercent: {
    marginTop: 6,
    fontSize: 12,
    color: '#a0aec0',
    textAlign: 'right',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    backgroundColor: '#2d5a87',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4a90e2',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  activeCategoryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeCategoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overflowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  viewAllLink: {
    color: '#4a90e2',
    fontWeight: '700',
  },
  allDoneCard: {
    backgroundColor: '#2d5a87',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  allDoneTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 6,
  },
  allDoneSubtitle: {
    color: '#a0aec0',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  nextCategoryCard: {
    marginTop: 12,
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  nextDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  nextDivider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  nextTinyText: {
    color: '#a0aec0',
    fontSize: 12,
    marginHorizontal: 8,
  },
  nextIconRow: {
    marginBottom: 12,
  },
  nextIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  nextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  nextSubtitle: {
    color: '#a0aec0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  skipAheadButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipAheadText: {
    color: '#ffffff',
    fontWeight: '700',
    textAlign: 'center',
  },
  searchInput: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a0aec0',
    marginBottom: 16,
  },
  searchResultsList: {
    paddingBottom: 20,
  },
  searchResultCard: {
    backgroundColor: '#2d5a87',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultIconText: {
    fontSize: 16,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
  },
  searchResultType: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '600',
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  progressSection: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  progressCard: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: '#4a90e2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 18,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#1a365d',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
    minWidth: 35,
  },
  emptyProgressCard: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyProgressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyProgressSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  startLearningButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  startLearningButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default WelcomeScreen; 