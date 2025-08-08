import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getModulesByCategory } from '../data/courseData';

const { width } = Dimensions.get('window');

const ModuleListScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [modules, setModules] = useState([]);

  // Get modules for the selected category
  const getModulesForCategory = (categoryId) => {
    return getModulesByCategory(categoryId);
  };

  // Load modules and their progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadModulesWithProgress();
    }, [category])
  );

  const loadModulesWithProgress = async () => {
    try {
      const baseModules = getModulesForCategory(category?.id);
      const modulesWithProgress = [];

      for (const module of baseModules) {
        let progress = 0;
        
        // Special handling for the Creating Strong Passwords module (1-1)
        if (module.id === '1-1') {
          const strongPasswordsProgress = await AsyncStorage.getItem('strong_passwords_progress');
          if (strongPasswordsProgress) {
            const progressData = JSON.parse(strongPasswordsProgress);
            // Check if the lesson is completed
            if (progressData.isCompleted) {
              progress = 100;
            } else {
              // Calculate partial progress based on completed sections
              let completedSections = 0;
              if (progressData.checklistItems) {
                const completedChecklistItems = progressData.checklistItems.filter(item => item.completed).length;
                if (completedChecklistItems > 0) completedSections++;
              }
              if (progressData.quizAnswers) {
                const answeredQuestions = Object.values(progressData.quizAnswers).filter(answer => answer !== null).length;
                if (answeredQuestions > 0) completedSections++;
              }
              // 4 total sections: intro, checklist, quiz, practice
              progress = Math.round((completedSections / 4) * 100);
            }
          }
        } else if (module.id === '1-2') {
          // Password Managers module
          const progressData = await AsyncStorage.getItem('password_managers_progress');
          if (progressData === 'completed') {
            progress = 100;
          } else {
            progress = 0;
          }
        } else if (module.id === '1-3') {
          // Multi-Factor Authentication module
          const progressData = await AsyncStorage.getItem('mfa_progress');
          if (progressData === 'completed') {
            progress = 100;
          } else {
            progress = 0;
          }
        } else if (module.id === '1-4') {
          // Password Recovery module
          const progressData = await AsyncStorage.getItem('password_recovery_progress');
          if (progressData === 'completed') {
            progress = 100;
          } else {
            progress = 0;
          }
        } else {
          // Standard progress calculation for other modules
          const completedStepsData = await AsyncStorage.getItem(`module_${module.id}_completed_steps`);
          const completedSteps = completedStepsData ? JSON.parse(completedStepsData) : [];
          progress = module.lessons > 0 ? Math.round((completedSteps.length / module.lessons) * 100) : 0;
        }
        
        modulesWithProgress.push({
          ...module,
          progress,
        });
      }

      setModules(modulesWithProgress);
    } catch (error) {
      console.log('Error loading modules with progress:', error);
    }
  };

  const renderModuleItem = ({ item }) => {
    const getNavigationTarget = (moduleId) => {
      switch (moduleId) {
        case '1-1': return 'PasswordIntroScreen';
        case '1-2': return 'PasswordManagersIntroScreen';
        case '1-3': return 'MFATutorialScreen';
        case '1-4': return 'PasswordRecoveryIntroScreen';
        case '2-1': return 'PhishingEmailsIntroScreen';
        case '2-2': return 'SocialEngineeringIntroScreen';
        case '2-3': return 'SafeLinkIntroScreen';
        case '2-4': return 'ReportingScamsIntroScreen';
        case '3-1': return 'DeviceUpdatesIntroScreen';
        case '3-2': return 'HomeNetworkIntroScreen';
        case '3-3': return 'AntivirusIntroScreen';
        case '3-4': return 'MobileSecurityIntroScreen';
        case '4-1': return 'SocialMediaIntroScreen';
        case '4-2': return 'DigitalFootprintIntroScreen';
        case '4-3': return 'DataSharingIntroScreen';
        case '4-4': return 'PrivacyToolsIntroScreen';
        case '5-1': return 'SecureBankingIntroScreen';
        case '5-2': return 'CreditMonitoringIntroScreen';
        case '5-3': return 'SafeShoppingIntroScreen';
        case '5-4': return 'IdentityTheftIntroScreen';
          case '6-1': return 'WelcomeAbordIntroScreen';
        default: return 'Welcome'; // Fallback to WelcomeScreen
      }
    };

    return (
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => navigation.navigate(getNavigationTarget(item.id), { category })}
        activeOpacity={0.8}
      >
      <View style={styles.moduleHeader}>
        <View style={styles.moduleInfo}>
          <Text style={styles.moduleTitle}>{item.title}</Text>
          <Text style={styles.moduleDescription}>{item.description}</Text>
        </View>
        <View style={styles.moduleMeta}>
          <Text style={styles.durationText}>{item.duration}</Text>
          <Text style={styles.lessonsText}>{item.lessons} lessons</Text>
        </View>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressText}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.statusContainer}>
          {item.progress === 0 ? (
            <View style={styles.statusNotStarted}>
              <Text style={styles.statusText}>Not Started</Text>
            </View>
          ) : item.progress === 100 ? (
            <View style={styles.statusCompleted}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          ) : (
            <View style={styles.statusInProgress}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.categoryInfo}>
        <View style={[styles.categoryIcon, { backgroundColor: category?.color || '#4a90e2' }]}>
          <Text style={styles.categoryIconText}>{category?.icon || '📚'}</Text>
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryTitle}>{category?.title || 'Category'}</Text>
          <Text style={styles.moduleCount}>{modules.length} modules</Text>
        </View>
      </View>
      <Text style={styles.headerDescription}>
        {category?.headerMessage || 'Complete all modules to master this security topic'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Welcome')}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modules</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={modules}
        renderItem={renderModuleItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a87',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d5a87',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  moduleCount: {
    fontSize: 16,
    color: '#a0aec0',
  },
  headerDescription: {
    fontSize: 16,
    color: '#a0aec0',
    lineHeight: 22,
  },
  moduleCard: {
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
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  moduleInfo: {
    flex: 1,
    marginRight: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    lineHeight: 24,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#a0aec0',
    lineHeight: 20,
  },
  moduleMeta: {
    alignItems: 'flex-end',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
    marginBottom: 4,
  },
  lessonsText: {
    fontSize: 12,
    color: '#a0aec0',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0aec0',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a90e2',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1a365d',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4a90e2',
    borderRadius: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flex: 1,
  },
  statusNotStarted: {
    backgroundColor: '#4a5568',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusInProgress: {
    backgroundColor: '#ed8936',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusCompleted: {
    backgroundColor: '#38a169',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ModuleListScreen; 