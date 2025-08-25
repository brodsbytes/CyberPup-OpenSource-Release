import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import { SCREEN_NAMES } from '../constants';

const { width } = Dimensions.get('window');

const InitialWelcomeScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ])
    );
    
    pulseAnimation.start();
    
    return () => pulseAnimation.stop();
  }, [pulseAnim]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Reset scroll position to top when advancing to next step
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
      // Navigate to device audit screen
      navigation.replace(SCREEN_NAMES.DEVICE_AUDIT);
    } catch (error) {
      console.log('Error completing welcome:', error);
      navigation.replace(SCREEN_NAMES.DEVICE_AUDIT);
    }
  };

  const renderSection1 = () => (
    <View style={styles.sectionContainer}>
      {/* CyberPup Mascot */}
      <View style={styles.mascotContainer}>
        <View style={styles.mascotWrapper}>
          <Image
            source={require('../assets/images/cyberpup-sitting.png')}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </View>
      
      <Text style={styles.mainTitle}>Welcome to CyberPup - Your Personal Cybersecurity Guide</Text>
      
      <Text style={styles.mainDescription}>
        CyberPup is your step-by-step guide to securing your entire cybersecurity footprint, without the jargon. <br /> We'll take you from 'at risk' to 'resilient' in just a few minutes a day.
      </Text>

      <View style={styles.keyPointsContainer}>
        <View style={styles.keyPoint}>
          <Ionicons name="shield-checkmark" size={Responsive.iconSizes.medium} color={Colors.accent} />
          <Text style={styles.keyPointText}>Unbiased expert advice that is passionately independent, no upsells</Text>
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
            CyberPup compares your cyber habits against expert-recommended best practices.
          </Text>
        </View>

        <View style={styles.helpCard}>
          <View style={[styles.helpCardIcon, { backgroundColor: Colors.success }]}>
            <Ionicons name="construct" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </View>
          <Text style={styles.helpCardTitle}>Fix Them Fast</Text>
          <Text style={styles.helpCardDescription}>
            Interactive checks guide you through actions, step-by-step.
          </Text>
        </View>

        <View style={styles.helpCard}>
          <View style={[styles.helpCardIcon, { backgroundColor: Colors.warning }]}>
            <Ionicons name="analytics" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </View>
          <Text style={styles.helpCardTitle}>Stay Informed</Text>
          <Text style={styles.helpCardDescription}>
            Get real-time security alerts, expert tools, detailed playbooks, and educational articles to keep you ahead of evolving threats.
          </Text>
        </View>
      </View>
    </View>
  );



  const renderSection4 = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Why CyberPup Does More Than Individual Tools</Text>
      
      {/* Problem Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="close-circle" size={Responsive.iconSizes.medium} color={Colors.error} />
        <Text style={styles.sectionHeaderText}>Why Paid Tools Alone Aren't Enough</Text>
      </View>

      <Text style={styles.sectionDescription}>
        Many apps claim to "keep you safe" but only cover a small slice of the problem.
      </Text>

      {/* Problem Section Card */}
      <View style={styles.problemSection}>
        <View style={styles.toolsList}>
          <View style={styles.toolItem}>
            <Text style={styles.toolTitle}>VPN</Text>
            <View style={styles.toolPoint}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.success} />
              <Text style={styles.toolPointText}>Encrypts browsing traffic</Text>
            </View>
            <View style={styles.toolPoint}>
              <Ionicons name="close-circle" size={Responsive.iconSizes.small} color={Colors.error} />
              <Text style={styles.toolPointText}>Doesn't protect accounts, stop scams, or secure devices</Text>
            </View>
          </View>

          <View style={styles.toolItem}>
            <Text style={styles.toolTitle}>Paid Antivirus Packages</Text>
            <View style={styles.toolPoint}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.success} />
              <Text style={styles.toolPointText}>Blocks known malware</Text>
            </View>
            <View style={styles.toolPoint}>
              <Ionicons name="close-circle" size={Responsive.iconSizes.small} color={Colors.error} />
              <Text style={styles.toolPointText}>Won't stop phishing, weak passwords, or unsafe settings</Text>
            </View>
          </View>

          <View style={styles.toolItem}>
            <Text style={styles.toolTitle}>One-click "Cleanup" apps</Text>
            <View style={styles.toolPoint}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.success} />
              <Text style={styles.toolPointText}>Clears junk files</Text>
            </View>
            <View style={styles.toolPoint}>
              <Ionicons name="close-circle" size={Responsive.iconSizes.small} color={Colors.error} />
              <Text style={styles.toolPointText}>No real impact on security</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Solution Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.success} />
        <Text style={styles.sectionHeaderText}>Why CyberPup Is Different</Text>
      </View>
      
      <Text style={styles.sectionDescription}>
        CyberPup helps you protect ALL areas of your digital life:
      </Text>

      {/* Solution Section Card */}
      <View style={styles.solutionSection}>
        <View style={styles.toolsList}>
          <View style={styles.toolItem}>
            <Text style={styles.toolTitle}>Accounts</Text>
            <View style={styles.toolPoint}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.success} />
              <Text style={styles.toolPointText}>Passwords, MFA, breaches</Text>
            </View>
          </View>

          <View style={styles.toolItem}>
            <Text style={styles.toolTitle}>Devices & Wi-Fi</Text>
            <View style={styles.toolPoint}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.success} />
              <Text style={styles.toolPointText}>Updates, backups, router security</Text>
            </View>
          </View>

          <View style={styles.toolItem}>
            <Text style={styles.toolTitle}>Privacy & Scams</Text>
            <View style={styles.toolPoint}>
              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.success} />
              <Text style={styles.toolPointText}>Phishing, social media, fraud</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Line Text */}
      <Text style={styles.bottomLine}>
        No misleading marketing or sales tactics. Just industry standard best pracitses that actually make you safer.
      </Text>

    </View>
  );

  const renderSection5 = () => (
    <View style={styles.sectionContainer}>
      {/* CyberPup Mascot */}
      <View style={styles.finalMascotContainer}>
        <View style={styles.finalMascotWrapper}>
          {/* Multi-layer Pulsing Glow Effect */}
          <Animated.View
            style={[
              styles.pulseGlowOuter,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.4],
                }),
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.1, 1.4],
                  }),
                }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseGlowInner,
              {
                opacity: pulseAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                }),
                transform: [{
                  scale: pulseAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1.05, 1.25],
                  }),
                }],
              },
            ]}
          />
          <Image
            source={require('../assets/images/cyberpup-mascot.png')}
            style={styles.finalMascotImage}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.finalSectionTitle}>Ready?</Text>
        
        <Text style={styles.encouragingText}>
          Let's transform your digital security, one simple step at a time.
        </Text>
      </View>
    </View>
  );

  const sections = [
    renderSection1,
    renderSection2,
    renderSection4,
    renderSection5,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        {currentStep > 0 ? (
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerBackSpacer} />
        )}
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentStep + 1) / 4) * 100}%` }
            ]} 
          />
        </View>
        
        <View style={styles.stepIndicator}>
          <Text style={styles.stepIndicatorText}>{currentStep + 1} of 4</Text>
        </View>
      </View>

      <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {sections[currentStep]()}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 3 ? 'Get Started' : 'Next'}
          </Text>
          {currentStep < 3 && (
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
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Responsive.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: Responsive.spacing.xs,
    backgroundColor: Colors.track,
    borderRadius: Responsive.borderRadius.small,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.small,
  },
  headerBackButton: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.sm,
    minWidth: 40,
  },
  headerBackSpacer: {
    minWidth: 40,
  },
  stepIndicator: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  stepIndicatorText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
    fontFamily: Typography.fontFamily,
    textAlign: 'center',
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
    marginBottom: Responsive.spacing.md,
    marginTop: Responsive.spacing.xs,
  },
  mascotWrapper: {
    width: Responsive.isSmallScreen ? 200 : 250,
    height: Responsive.isSmallScreen ? 200 : 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: Responsive.isSmallScreen ? 200 : 250,
    height: Responsive.isSmallScreen ? 200 : 250,
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

  problemSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.modal,
    marginBottom: Responsive.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  solutionSection: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.modal,
    marginBottom: Responsive.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.md,
  },
  sectionHeaderText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  toolsList: {
    gap: Responsive.spacing.lg,
  },
  toolItem: {
    gap: Responsive.spacing.sm,
  },
  toolTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  toolPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Responsive.spacing.sm,
  },
  toolPointText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
    flex: 1,
  },

  bottomLine: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginVertical: Responsive.spacing.xl,
  },

  finalMascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: Responsive.spacing.xl,
  },
  finalMascotWrapper: {
    width: Responsive.isSmallScreen ? 300 : 400,
    height: Responsive.isSmallScreen ? 300 : 400,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pulseGlowOuter: {
    position: 'absolute',
    width: Responsive.isSmallScreen ? 204 : 264,
    height: Responsive.isSmallScreen ? 204 : 264,
    borderRadius: Responsive.isSmallScreen ? 102 : 132,
    backgroundColor: Colors.accent,
    opacity: 0.1,
    zIndex: -2,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  pulseGlowInner: {
    position: 'absolute',
    width: Responsive.isSmallScreen ? 198 : 258,
    height: Responsive.isSmallScreen ? 198 : 258,
    borderRadius: Responsive.isSmallScreen ? 99 : 129,
    backgroundColor: Colors.accent,
    opacity: 0.2,
    zIndex: -1,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  finalMascotImage: {
    width: '100%',
    height: '100%',
    maxWidth: Responsive.isSmallScreen ? 300 : 400,
    maxHeight: Responsive.isSmallScreen ? 300 : 400,
  },
  finalSectionTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: Responsive.spacing.lg,
    marginBottom: Responsive.spacing.sm,
  },
  encouragingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
    fontWeight: Typography.weights.medium,
    lineHeight: Typography.sizes.lg * 1.3,
  },
  footer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },

  nextButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.padding.button,
    borderRadius: Responsive.borderRadius.large,
    justifyContent: 'center',
    gap: Responsive.spacing.sm,
    width: '100%',
  },
  nextButtonText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },


});

export default InitialWelcomeScreen;

