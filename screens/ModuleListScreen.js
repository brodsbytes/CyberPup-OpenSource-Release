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

const { width } = Dimensions.get('window');

const ModuleListScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [modules, setModules] = useState([]);

  // Sample module data - in a real app, this would come from an API or database
  const getModulesForCategory = (categoryId) => {
    const modulesData = {
      1: [ // Password Security & Authentication
        {
          id: '1-1',
          title: 'Creating Strong Passwords',
          description: 'Learn the fundamentals of creating secure, memorable passwords that protect your accounts.',
          duration: '10 min',
          lessons: 4,
        },
        {
          id: '1-2',
          title: 'Password Managers',
          description: 'Discover how password managers can simplify your security while keeping you safe.',
          duration: '15 min',
          lessons: 5,
        },
        {
          id: '1-3',
          title: 'Multi-Factor Authentication',
          description: 'Set up and use 2FA to add an extra layer of protection to your accounts.',
          duration: '12 min',
          lessons: 3,
        },
        {
          id: '1-4',
          title: 'Password Recovery',
          description: 'Learn safe practices for recovering lost passwords without compromising security.',
          duration: '8 min',
          lessons: 2,
        },
      ],
      2: [ // Phishing & Scam Awareness
        {
          id: '2-1',
          title: 'Identifying Phishing Emails',
          description: 'Spot the telltale signs of phishing attempts in your email inbox.',
          duration: '12 min',
          lessons: 4,
        },
        {
          id: '2-2',
          title: 'Social Engineering Tactics',
          description: 'Understand how attackers manipulate human psychology to gain access.',
          duration: '15 min',
          lessons: 5,
        },
        {
          id: '2-3',
          title: 'Safe Link Practices',
          description: 'Learn to verify links and avoid malicious websites.',
          duration: '10 min',
          lessons: 3,
        },
        {
          id: '2-4',
          title: 'Reporting Scams',
          description: 'Know how to report suspicious activity and help protect others.',
          duration: '8 min',
          lessons: 2,
        },
      ],
      3: [ // Device & Network Security
        {
          id: '3-1',
          title: 'Device Updates & Patches',
          description: 'Keep your devices secure by staying up to date with the latest security patches.',
          duration: '10 min',
          lessons: 3,
        },
        {
          id: '3-2',
          title: 'Home Network Security',
          description: 'Secure your Wi-Fi network and protect all connected devices.',
          duration: '18 min',
          lessons: 5,
        },
        {
          id: '3-3',
          title: 'Antivirus & Firewalls',
          description: 'Choose and configure the right security software for your needs.',
          duration: '14 min',
          lessons: 4,
        },
        {
          id: '3-4',
          title: 'Mobile Device Security',
          description: 'Protect your smartphone and tablet from threats.',
          duration: '12 min',
          lessons: 3,
        },
      ],
      4: [ // Online Privacy & Social Media
        {
          id: '4-1',
          title: 'Social Media Privacy Settings',
          description: 'Configure your social media accounts to protect your personal information.',
          duration: '15 min',
          lessons: 4,
        },
        {
          id: '4-2',
          title: 'Digital Footprint Management',
          description: 'Understand and control what information about you is available online.',
          duration: '12 min',
          lessons: 3,
        },
        {
          id: '4-3',
          title: 'Data Sharing Awareness',
          description: 'Learn what data you\'re sharing and how to minimize unnecessary exposure.',
          duration: '10 min',
          lessons: 3,
        },
        {
          id: '4-4',
          title: 'Privacy-Focused Tools',
          description: 'Discover tools and services that prioritize your privacy.',
          duration: '14 min',
          lessons: 4,
        },
      ],
      5: [ // Secure Finances & Identity Protection
        {
          id: '5-1',
          title: 'Secure Online Banking',
          description: 'Protect your financial accounts when banking online.',
          duration: '12 min',
          lessons: 3,
        },
        {
          id: '5-2',
          title: 'Credit Monitoring',
          description: 'Set up credit monitoring to detect potential identity theft early.',
          duration: '10 min',
          lessons: 3,
        },
        {
          id: '5-3',
          title: 'Safe Online Shopping',
          description: 'Shop safely online and protect your payment information.',
          duration: '14 min',
          lessons: 4,
        },
        {
          id: '5-4',
          title: 'Identity Theft Response',
          description: 'Know what to do if your identity is compromised.',
          duration: '16 min',
          lessons: 4,
        },
      ],
    };

    return modulesData[categoryId] || [];
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
        // Get completed steps for this module
        const completedStepsData = await AsyncStorage.getItem(`module_${module.id}_completed_steps`);
        const completedSteps = completedStepsData ? JSON.parse(completedStepsData) : [];
        
        // Calculate progress percentage
        const progress = module.lessons > 0 ? Math.round((completedSteps.length / module.lessons) * 100) : 0;
        
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

  const renderModuleItem = ({ item }) => (
    <TouchableOpacity
      style={styles.moduleCard}
      onPress={() => navigation.navigate('LessonScreen', { module: item, category })}
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
        Complete all modules to master this security topic
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
          onPress={() => navigation.goBack()}
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