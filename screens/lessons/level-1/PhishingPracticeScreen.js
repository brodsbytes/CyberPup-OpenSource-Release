import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import ExitModal from '../../../components/common/ExitModal';

const { width } = Dimensions.get('window');

const PhishingPracticeScreen = ({ navigation, route }) => {

  
  const [showExitModal, setShowExitModal] = useState(false);

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleKeepLearning = () => {
    setShowExitModal(false);
  };

  const handleExitLesson = () => {
    setShowExitModal(false);
    navigation.navigate('Welcome');
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleExit}
          activeOpacity={0.8}
        >
          <Ionicons name="menu" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phishing Practice</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.testContainer}>
        <Text style={styles.testTitle}>
          Phishing Practice
        </Text>
        <Text style={styles.testDescription}>
          This is a test screen to verify the component is loading properly.
        </Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.testButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ STANDARDIZED: Exit Modal using common component */}
      <ExitModal
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onKeepLearning={handleKeepLearning}
        onExit={handleExitLesson}
        icon="😢"
        title="Wait, don't go!"
        message="You're doing well! If you quit now, you'll lose your progress for this lesson."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.padding.button,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuButton: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  headerSpacer: {
    width: Responsive.iconSizes.xlarge,
  },
  content: {
    flex: 1,
    padding: Responsive.padding.screen,
  },
  progressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.lg,
  },
  progressText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  scoreText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
  },

  instructionsSection: {
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardHeaderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  cardSubject: {
    marginBottom: 16,
  },
  cardSubjectText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  cardBody: {
    marginBottom: 16,
  },
  cardBodyText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  choiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  choiceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  legitButton: {
    backgroundColor: '#27ae60',
  },
  phishButton: {
    backgroundColor: '#e74c3c',
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  resultsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  resultsScore: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 16,
  },
  resultsMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  testContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Responsive.padding.screen,
  },
  testTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  testDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
  },
  testButton: {
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    marginTop: Responsive.spacing.lg,
    minHeight: Responsive.buttonHeight.medium,
  },
  testButtonText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
});

export default PhishingPracticeScreen;
