import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PasswordPracticeScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [practicePassword, setPracticePassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationScale] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem('strong_passwords_progress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        // Only show celebration if the lesson was just completed (not on initial load)
        // The celebration will be triggered by handleComplete() instead
      }
    } catch (error) {
      console.log('Error loading progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const existingProgress = await AsyncStorage.getItem('strong_passwords_progress');
      const progress = existingProgress ? JSON.parse(existingProgress) : {};
      
      const updatedProgress = {
        ...progress,
        isCompleted: true,
        completedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem('strong_passwords_progress', JSON.stringify(updatedProgress));
    } catch (error) {
      console.log('Error saving progress:', error);
    }
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    let score = 0;
    let feedback = [];

    // Length check
    if (password.length >= 12) {
      score += 2;
      feedback.push('✓ Good length (12+ characters)');
    } else {
      feedback.push('✗ Too short (aim for 12+ characters)');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains lowercase letters');
    } else {
      feedback.push('✗ Missing lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains uppercase letters');
    } else {
      feedback.push('✗ Missing uppercase letters');
    }

    if (/[0-9]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains numbers');
    } else {
      feedback.push('✗ Missing numbers');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
      feedback.push('✓ Contains special characters');
    } else {
      feedback.push('✗ Missing special characters');
    }

    // Common patterns check
    if (password.toLowerCase().includes('password') || 
        password.toLowerCase().includes('123') ||
        password.toLowerCase().includes('qwerty')) {
      score -= 2;
      feedback.push('✗ Contains common patterns');
    }

    let strength;
    if (score >= 5) {
      strength = { level: 'strong', color: '#38a169', emoji: '🛡️' };
    } else if (score >= 3) {
      strength = { level: 'moderate', color: '#ed8936', emoji: '⚠️' };
    } else {
      strength = { level: 'weak', color: '#e53e3e', emoji: '🚨' };
    }

    setPasswordStrength({ score, feedback, strength });
  };

  const handleComplete = () => {
    setShowCelebration(true);
    Animated.spring(celebrationScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
    saveProgress();
  };

  const renderCelebrationModal = () => (
    <Modal
      visible={showCelebration}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowCelebration(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ scale: celebrationScale }]
            }
          ]}
        >
          <View style={styles.celebrationIcon}>
            <Text style={styles.celebrationIconText}>🎉</Text>
          </View>
          
          <Text style={styles.celebrationTitle}>Well done!</Text>
          <Text style={styles.celebrationMessage}>
            You're one step closer to becoming a Password Pro 🛡️
          </Text>
          
          <TouchableOpacity
            style={styles.celebrationButton}
            onPress={() => {
              setShowCelebration(false);
              celebrationScale.setValue(0);
              navigation.navigate('ModuleListScreen', { category });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.celebrationButtonText}>Continue Learning</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
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
        <Text style={styles.headerTitle}>Practice Scenario</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Practice Scenario</Text>
            <Text style={styles.sectionSubtitle}>
              Try creating a strong password and see how it measures up:
            </Text>
            
            <TextInput
              style={styles.passwordInput}
              value={practicePassword}
              onChangeText={(text) => {
                setPracticePassword(text);
                checkPasswordStrength(text);
              }}
              placeholder="Enter a password to test..."
              placeholderTextColor="#a0aec0"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            {passwordStrength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthEmoji}>{passwordStrength.strength.emoji}</Text>
                  <Text style={[styles.strengthText, { color: passwordStrength.strength.color }]}>
                    {passwordStrength.strength.level.toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.feedbackContainer}>
                  {passwordStrength.feedback.map((item, index) => (
                    <Text key={index} style={styles.feedbackItem}>
                      {item}
                    </Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Complete Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
          activeOpacity={0.8}
        >
          <Text style={styles.completeButtonText}>Complete Lesson</Text>
        </TouchableOpacity>
      </View>

      {renderCelebrationModal()}
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
    fontSize: 18,
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
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#2d5a87',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a0aec0',
    marginBottom: 16,
    lineHeight: 20,
  },
  passwordInput: {
    backgroundColor: '#4a5568',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  strengthContainer: {
    backgroundColor: '#4a5568',
    borderRadius: 12,
    padding: 16,
  },
  strengthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  strengthEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  strengthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackContainer: {
    gap: 4,
  },
  feedbackItem: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#2d5a87',
    backgroundColor: '#1a365d',
  },
  completeButton: {
    backgroundColor: '#38a169',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2d5a87',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  celebrationIconText: {
    fontSize: 40,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  celebrationMessage: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  celebrationButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  celebrationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default PasswordPracticeScreen; 