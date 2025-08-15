import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import { SCREEN_NAMES } from '../constants';

const { width } = Dimensions.get('window');

const InitialWelcomeScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('welcome_completed', 'true');
      await AsyncStorage.setItem('welcome_skipped', 'true');
      // Award the CyberPup Scout badge even when skipped
      await AsyncStorage.setItem('badge_cyberpup_scout_earned', 'true');
      await AsyncStorage.setItem('badge_cyberpup_scout_earned_date', new Date().toISOString());
      // Mark the welcome check as completed for progress tracking
      await AsyncStorage.setItem('check_1-0-1_completed', 'completed');
      // Navigate directly to first check
      navigation.replace(SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS);
    } catch (error) {
      console.log('Error saving skip status:', error);
      navigation.replace(SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS);
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('welcome_completed', 'true');
      // Award the CyberPup Scout badge
      await AsyncStorage.setItem('badge_cyberpup_scout_earned', 'true');
      await AsyncStorage.setItem('badge_cyberpup_scout_earned_date', new Date().toISOString());
      // Mark the welcome check as completed for progress tracking
      await AsyncStorage.setItem('check_1-0-1_completed', 'completed');
      // Navigate to first check
      navigation.replace(SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS);
    } catch (error) {
      console.log('Error completing welcome:', error);
      navigation.replace(SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS);
    }
  };

  const renderSection1 = () => (
    <View style={styles.sectionContainer}>
      {/* CyberPup Mascot */}
      <View style={styles.mascotContainer}>
        <View style={styles.mascotWrapper}>
          <Image
            source={require('../assets/images/cyberpup-mascot.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </View>
      
      <Text style={styles.mainTitle}>Welcome to CyberPup - Your Personal Cybersecurity Health Check</Text>
      
      <Text style={styles.mainDescription}>
        CyberPup is your step-by-step guide to protecting your accounts, devices, and privacy - without the jargon. We'll help you go from 'at risk' to 'resilient' in just a few minutes a day.
      </Text>

      <View style={styles.keyPointsContainer}>
        <View style={styles.keyPoint}>
          <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
          <Text style={styles.keyPointText}>Unbiased, expert advice - no upselling, no gimmicks</Text>
        </View>
        <View style={styles.keyPoint}>
          <Ionicons name="flash" size={Responsive.iconSizes.medium} color={Colors.accent} />
          <Text style={styles.keyPointText}>Action-first steps you can do right now</Text>
        </View>
        <View style={styles.keyPoint}>
          <Ionicons name="person" size={Responsive.iconSizes.medium} color={Colors.accent} />
          <Text style={styles.keyPointText}>Tailored to your device and needs</Text>
        </View>
      </View>
    </View>
  );

  const renderSection2 = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>How CyberPup Helps You</Text>
      
      <View style={styles.helpCardsContainer}>
        <View style={styles.helpCard}>
          <View style={[styles.helpCardIcon, { backgroundColor: Colors.accent }]}>
            <Ionicons name="search" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </View>
          <Text style={styles.helpCardTitle}>Find Your Gaps</Text>
          <Text style={styles.helpCardDescription}>
            CyberPup scans your cyber habits against expert-recommended best practices.
          </Text>
        </View>

        <View style={styles.helpCard}>
          <View style={[styles.helpCardIcon, { backgroundColor: Colors.success }]}>
            <Ionicons name="construct" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </View>
          <Text style={styles.helpCardTitle}>Fix Them Fast</Text>
          <Text style={styles.helpCardDescription}>
            Interactive checklists guide you through actions, step-by-step.
          </Text>
        </View>

        <View style={styles.helpCard}>
          <View style={[styles.helpCardIcon, { backgroundColor: Colors.warning }]}>
            <Ionicons name="shield" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </View>
          <Text style={styles.helpCardTitle}>Stay Secure</Text>
          <Text style={styles.helpCardDescription}>
            Monthly refreshers help keep you protected as threats evolve.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSection3 = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>How to Get the Most Out of CyberPup</Text>
      
      <View style={styles.tipsContainer}>
        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>1</Text>
          </View>
          <Text style={styles.tipText}>
            Complete Level 1 checks as soon as possible - they give the biggest boost to your security.
          </Text>
        </View>

        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>2</Text>
          </View>
          <Text style={styles.tipText}>
            Use the interactive checklists - we've made them quick, simple, and tailored to your device.
          </Text>
        </View>

        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>3</Text>
          </View>
          <Text style={styles.tipText}>
            Watch for progress celebrations - your work is paying off!
          </Text>
        </View>

        <View style={styles.tipItem}>
          <View style={styles.tipNumber}>
            <Text style={styles.tipNumberText}>4</Text>
          </View>
          <Text style={styles.tipText}>
            Revisit the app monthly - cybersecurity is a habit, not a one-time job.
          </Text>
        </View>
      </View>

      {/* Added design element: Progress visualization */}
      <View style={styles.progressVisualization}>
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.progressLabel}>Start</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, { backgroundColor: Colors.accent }]} />
          <Text style={styles.progressLabel}>Secure</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <View style={[styles.progressDot, { backgroundColor: Colors.track }]} />
          <Text style={styles.progressLabel}>Thrive</Text>
        </View>
      </View>
    </View>
  );

  const renderSection4 = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Why CyberPup is Better Than Buying Individual Tools</Text>
      
      <View style={styles.comparisonTable}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Tool</Text>
          <Text style={styles.tableHeaderText}>Does</Text>
          <Text style={styles.tableHeaderText}>Misses</Text>
          <Text style={styles.tableHeaderText}>CyberPup</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>VPN</Text>
          <Text style={styles.tableCell}>Hides IP, encrypts traffic</Text>
          <Text style={styles.tableCell}>Accounts, scams, device security</Text>
          <Text style={styles.tableCell}>Covers everything</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Antivirus</Text>
          <Text style={styles.tableCell}>Detects malware</Text>
          <Text style={styles.tableCell}>Phishing, passwords, settings</Text>
          <Text style={styles.tableCell}>Prevents attacks</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>Cleanup Apps</Text>
          <Text style={styles.tableCell}>Deletes temp files</Text>
          <Text style={styles.tableCell}>Real security</Text>
          <Text style={styles.tableCell}>Real improvements</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          CyberPup works across every part of your digital life - accounts, devices, privacy, and scams - so nothing falls through the cracks.
        </Text>
      </View>
    </View>
  );

  const renderSection5 = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Getting Started</Text>
      
      <View style={styles.trustElements}>
        <View style={styles.trustItem}>
          <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.success} />
          <Text style={styles.trustText}>Powered by accredited cybersecurity professionals</Text>
        </View>
        <View style={styles.trustItem}>
          <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.success} />
          <Text style={styles.trustText}>Industry best practices</Text>
        </View>
      </View>

      <Text style={styles.reassuranceText}>
        You don't need to be a tech expert - we'll guide you.
      </Text>

      {/* Added design element: Security level indicator */}
      <View style={styles.securityLevelCard}>
        <View style={styles.securityLevelHeader}>
          <Ionicons name="shield" size={Responsive.iconSizes.large} color={Colors.accent} />
          <Text style={styles.securityLevelTitle}>Your Security Journey</Text>
        </View>
        <View style={styles.securityLevelProgress}>
          <View style={styles.securityLevelStep}>
            <View style={[styles.securityLevelDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.securityLevelText}>At Risk</Text>
          </View>
          <View style={styles.securityLevelArrow} />
          <View style={styles.securityLevelStep}>
            <View style={[styles.securityLevelDot, { backgroundColor: Colors.track }]} />
            <Text style={styles.securityLevelText}>Resilient</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaButtonText}>Start My First Health Check</Text>
        <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );

  const sections = [
    renderSection1,
    renderSection2,
    renderSection3,
    renderSection4,
    renderSection5,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentStep + 1) / 5) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {currentStep + 1} of 5
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {sections[currentStep]()}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === 4 && styles.ctaButtonStyle
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 4 ? 'Get Started' : 'Next'}
          </Text>
          {currentStep < 4 && (
            <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressContainer: {
    flex: 1,
    marginRight: Responsive.spacing.md,
  },
  progressBar: {
    height: Responsive.spacing.xs,
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.small,
    overflow: 'hidden',
    marginBottom: Responsive.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.small,
  },
  progressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  skipButton: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.sm,
  },
  skipButtonText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.lg,
  },
  sectionContainer: {
    minHeight: Responsive.isSmallScreen ? 300 : 400,
    justifyContent: 'center',
  },
  mascotContainer: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.lg,
    marginTop: Responsive.spacing.md,
  },
  mascotWrapper: {
    width: Responsive.isSmallScreen ? 150 : 200,
    height: Responsive.isSmallScreen ? 150 : 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: Responsive.isSmallScreen ? 150 : 200,
    height: Responsive.isSmallScreen ? 150 : 200,
  },
  mainTitle: {
    fontSize: Responsive.isSmallScreen ? Typography.sizes.xxl : Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
    lineHeight: (Responsive.isSmallScreen ? Typography.sizes.xxl : Typography.sizes.xxxl) * 1.2,
  },
  mainDescription: {
    fontSize: Responsive.isSmallScreen ? Typography.sizes.md : Typography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.lg,
    lineHeight: (Responsive.isSmallScreen ? Typography.sizes.md : Typography.sizes.lg) * 1.4,
  },
  keyPointsContainer: {
    gap: Responsive.isSmallScreen ? Responsive.spacing.sm : Responsive.spacing.md,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Responsive.isSmallScreen ? Responsive.spacing.md : Responsive.padding.card,
    borderRadius: Responsive.borderRadius.large,
    gap: Responsive.spacing.sm,
  },
  keyPointText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: Typography.sizes.md * 1.3,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xl,
    textAlign: 'center',
  },
  helpCardsContainer: {
    gap: Responsive.spacing.lg,
  },
  helpCard: {
    backgroundColor: Colors.surface,
    padding: Responsive.padding.modal,
    borderRadius: Responsive.borderRadius.xlarge,
    alignItems: 'center',
    textAlign: 'center',
  },
  helpCardIcon: {
    width: Responsive.iconSizes.xxlarge,
    height: Responsive.iconSizes.xxlarge,
    borderRadius: Responsive.iconSizes.xxlarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  helpCardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  helpCardDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
  },
  tipsContainer: {
    gap: Responsive.spacing.lg,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Responsive.spacing.md,
  },
  tipNumber: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  tipNumberText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  tipText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: Typography.sizes.md * 1.4,
  },
  comparisonTable: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    overflow: 'hidden',
    marginBottom: Responsive.spacing.lg,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.accent,
    padding: Responsive.spacing.md,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: Responsive.spacing.xs,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    padding: Responsive.spacing.sm,
    textAlign: 'center',
    lineHeight: Typography.sizes.xs * 1.4,
    paddingHorizontal: Responsive.spacing.xs,
  },
  summaryCard: {
    backgroundColor: Colors.accentSoft,
    padding: Responsive.padding.modal,
    borderRadius: Responsive.borderRadius.large,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  summaryText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
  },
  trustElements: {
    gap: Responsive.spacing.md,
    marginBottom: Responsive.spacing.xl,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
  },
  trustText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    flex: 1,
  },
  reassuranceText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.xl,
    fontStyle: 'italic',
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Responsive.padding.modal,
    borderRadius: Responsive.borderRadius.xlarge,
    gap: Responsive.spacing.sm,
  },
  ctaButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backButton: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.large,
    minWidth: 80,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  nextButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.large,
    minWidth: 120,
    justifyContent: 'center',
    gap: Responsive.spacing.sm,
  },
  ctaButtonStyle: {
    flex: 1,
  },
  nextButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
     progressVisualization: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-around',
     marginTop: Responsive.spacing.lg,
     paddingHorizontal: Responsive.spacing.md,
   },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    marginBottom: Responsive.spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  progressLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Responsive.spacing.sm,
  },
  securityLevelCard: {
    backgroundColor: Colors.surface,
    padding: Responsive.padding.modal,
    borderRadius: Responsive.borderRadius.large,
    marginTop: Responsive.spacing.xl,
    marginBottom: Responsive.spacing.lg,
  },
  securityLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  securityLevelTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
  },
  securityLevelProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityLevelStep: {
    alignItems: 'center',
  },
  securityLevelDot: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    marginBottom: Responsive.spacing.sm,
  },
     securityLevelArrow: {
     flex: 1,
     height: 2,
     backgroundColor: Colors.border,
     marginHorizontal: Responsive.spacing.md,
   },
  securityLevelText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});

export default InitialWelcomeScreen;
