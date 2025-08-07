import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const CategoryIntroScreen = ({ navigation, route }) => {
  const { category } = route.params || {};

  useEffect(() => {
    checkIfIntroSeen();
  }, []);

  const checkIfIntroSeen = async () => {
    try {
      const introSeen = await AsyncStorage.getItem(`category_intro_seen_${category?.id}`);
      if (introSeen === 'true') {
        // User has already seen this intro, go directly to module list
        navigation.replace('ModuleListScreen', { category });
      }
    } catch (error) {
      console.log('Error checking intro status:', error);
    }
  };

  const handleGetStarted = async () => {
    try {
      // Mark this category intro as seen
      await AsyncStorage.setItem(`category_intro_seen_${category?.id}`, 'true');
    } catch (error) {
      console.log('Error saving intro status:', error);
    }
    navigation.replace('ModuleListScreen', { category });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Why It Matters</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Category Icon and Title */}
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: category?.color || '#4a90e2' }]}>
              <Text style={styles.categoryIconText}>{category?.icon || '📚'}</Text>
            </View>
            <Text style={styles.categoryTitle}>{category?.title || 'Category'}</Text>
          </View>

          {/* Why It Matters Section */}
          <View style={styles.whyItMattersSection}>
            <Text style={styles.sectionTitle}>Why This Matters</Text>
            <Text style={styles.whyItMattersText}>
              {category?.whyItMatters || 'This category covers essential security concepts that will help protect you in the digital world.'}
            </Text>
          </View>

          {/* What You'll Learn Section */}
          <View style={styles.learnSection}>
            <Text style={styles.sectionTitle}>What You'll Learn</Text>
            <Text style={styles.learnText}>
              {category?.whatYoullLearn || 'You\'ll gain practical skills and knowledge to enhance your cybersecurity awareness and protect yourself online.'}
            </Text>
          </View>

          {/* Time Commitment */}
          <View style={styles.timeSection}>
            <Text style={styles.sectionTitle}>Time Commitment</Text>
            <Text style={styles.timeText}>
              Complete all modules in approximately 45-60 minutes
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Get Started Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: category?.color || '#4a90e2' }]}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIconText: {
    fontSize: 36,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 36,
  },
  whyItMattersSection: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  whyItMattersText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  learnSection: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  learnText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  timeSection: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  timeText: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2d5a87',
    backgroundColor: '#1a365d',
  },
  getStartedButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default CategoryIntroScreen; 