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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getAllModules, getLessonsByModule } from '../data/courseData';
import CircularProgress from '../components/CircularProgress';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState(0);
  const [totalModules, setTotalModules] = useState(0);
  const [categoriesInProgress, setCategoriesInProgress] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Load progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      calculateOverallProgress();
      loadCategoriesInProgress();
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



  const loadCategoriesInProgress = async () => {
    try {
      const allModules = getModuleData();
      const categoryProgress = {};

      // Group modules by category and calculate progress
      for (const module of allModules) {
        const categoryId = module.categoryId;
        if (!categoryProgress[categoryId]) {
          categoryProgress[categoryId] = {
            totalModules: 0,
            completedModules: 0,
            totalSteps: 0,
            completedSteps: 0,
          };
        }

        categoryProgress[categoryId].totalModules++;

        let moduleProgress = 0;
        let moduleCompleted = false;

        if (module.id === '1-1') {
          // Special handling for Creating Strong Passwords module
          const strongPasswordsProgress = await AsyncStorage.getItem('strong_passwords_progress');
          if (strongPasswordsProgress) {
            const progressData = JSON.parse(strongPasswordsProgress);
            if (progressData.isCompleted) {
              moduleCompleted = true;
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
            moduleCompleted = true;
            moduleProgress = 5; // 5 sections completed
          } else {
            moduleProgress = 0;
          }
        } else if (module.id === '1-3') {
          // Multi-Factor Authentication module
          const progressData = await AsyncStorage.getItem('mfa_progress');
          if (progressData === 'completed') {
            moduleCompleted = true;
            moduleProgress = 3; // 3 sections completed
          } else {
            moduleProgress = 0;
          }
        } else if (module.id === '1-4') {
          // Password Recovery module
          const progressData = await AsyncStorage.getItem('password_recovery_progress');
          if (progressData === 'completed') {
            moduleCompleted = true;
            moduleProgress = 2; // 2 sections completed
          } else {
            moduleProgress = 0;
          }
        } else {
          // Standard module handling
          const moduleCompletedData = await AsyncStorage.getItem(`module_${module.id}_completed`);
          if (moduleCompletedData === 'true') {
            moduleCompleted = true;
          }

          // Get step completion for this module
          const completedStepsData = await AsyncStorage.getItem(`module_${module.id}_completed_steps`);
          if (completedStepsData) {
            const steps = JSON.parse(completedStepsData);
            moduleProgress = steps.length;
          }
        }

        if (moduleCompleted) {
          categoryProgress[categoryId].completedModules++;
        }
        categoryProgress[categoryId].completedSteps += moduleProgress;

        // Get actual lesson count for this module
        const lessons = getLessonsByModule(module.id);
        categoryProgress[categoryId].totalSteps += lessons.length;
      }

      // Create categories in progress (only show categories with some progress but not 100% complete)
      const categoriesInProgressData = [];
      for (const [categoryId, progress] of Object.entries(categoryProgress)) {
        const categoryPercentage = progress.totalSteps > 0 ? Math.round((progress.completedSteps / progress.totalSteps) * 100) : 0;
        
        // Only show categories with some progress but not fully completed
        if (categoryPercentage > 0 && categoryPercentage < 100) {
          const categoryInfo = getCategoryInfo(parseInt(categoryId));
          categoriesInProgressData.push({
            id: categoryId,
            icon: categoryInfo.icon,
            title: categoryInfo.title,
            color: categoryInfo.color,
            progress: categoryPercentage,
            completedModules: progress.completedModules,
            totalModules: progress.totalModules,
          });
        }
      }

      // Sort by progress (highest first) and limit to 3 categories
      categoriesInProgressData.sort((a, b) => b.progress - a.progress);
      setCategoriesInProgress(categoriesInProgressData.slice(0, 3));
    } catch (error) {
      console.log('Error loading categories in progress:', error);
    }
  };

  const getWelcomeMessage = () => {
    if (overallProgress === 0) {
      return "Let's start your cybersecurity journey.";
    } else if (overallProgress < 25) {
      return "Great start! You're building a strong foundation.";
    } else if (overallProgress < 50) {
      return "Excellent progress! You're becoming more security-aware.";
    } else if (overallProgress < 75) {
      return "Impressive! You're well on your way to cybersecurity mastery.";
    } else {
      return "Outstanding! You're a cybersecurity champion!";
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
                backgroundColor="#1a365d"
                showIcon={true}
                showPercentage={true}
              />
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
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



        {/* Checks in Progress Section */}
        {!isSearching && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Checks in Progress</Text>
            
            {categoriesInProgress.length > 0 ? (
              categoriesInProgress.map((category) => (
                <ProgressCard
                  key={category.id}
                  icon={category.icon}
                  title={category.title}
                  subtitle={`${category.completedModules} checks done, ${category.totalModules - category.completedModules} remaining`}
                  progress={category.progress}
                  categoryId={parseInt(category.id)}
                />
              ))
            ) : (
              <View style={styles.emptyProgressCard}>
                <Text style={styles.emptyProgressTitle}>No categories in progress</Text>
                <Text style={styles.emptyProgressSubtitle}>
                  Start learning to see your progress here
                </Text>
                <TouchableOpacity
                  style={styles.startLearningButton}
                  onPress={() => navigation.navigate('CategoryScreen')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startLearningButtonText}>Start Learning</Text>
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
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
  },
  circularProgressContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  overallProgressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a90e2',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    backgroundColor: '#2d5a87',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  searchInput: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
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