import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Responsive } from '../../theme';
import { levels, getAreasByLevel } from '../../data/courseData';
import { SCREEN_NAMES } from '../../constants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AreaCompletionScreen = ({
  route,
  navigation,
  onContinue,
}) => {
  const { completedAreaId } = route?.params || {}; // e.g., '1-1', '1-2', etc.
  
  console.log('🎉 AreaCompletionScreen mounted with params:', route?.params);
  console.log('🎉 completedAreaId:', completedAreaId);
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [areaData, setAreaData] = useState(null);
  const [nextAreaData, setNextAreaData] = useState(null);
  const [completedChecks, setCompletedChecks] = useState(0);
  const [totalChecks, setTotalChecks] = useState(0);
  
  // Animation refs
  const backgroundGlow = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotation = useRef(new Animated.Value(0)).current;
  const progressScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const nextAreaOpacity = useRef(new Animated.Value(0)).current;
  
  // Particle animations
  const particles = useRef(Array.from({ length: 30 }, () => new Animated.Value(0))).current;
  const particleOpacities = useRef(Array.from({ length: 30 }, () => new Animated.Value(1))).current;
  
  // Star animations
  const stars = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  const starScales = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  
  // Particle configurations (pre-calculated to avoid Math.random() during animation)
  const [particleConfigs, setParticleConfigs] = useState([]);

  // Load area data and calculate progress
  useEffect(() => {
    loadAreaData();
  }, [completedAreaId]);

  useEffect(() => {
    if (areaData) {
      startEntranceAnimation();
      
      // Haptic feedback
      if (Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [areaData]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Stop any running animations
      backgroundGlow.stopAnimation();
      trophyScale.stopAnimation();
      trophyRotation.stopAnimation();
      progressScale.stopAnimation();
      textOpacity.stopAnimation();
      buttonScale.stopAnimation();
      nextAreaOpacity.stopAnimation();
      particles.forEach(p => p.stopAnimation());
      particleOpacities.forEach(po => po.stopAnimation());
      stars.forEach(s => s.stopAnimation());
      starScales.forEach(ss => ss.stopAnimation());
    };
  }, []);

  const loadAreaData = () => {
    try {
      console.log('🔍 AreaCompletionScreen - Loading data for areaId:', completedAreaId);
      
      // Get Level 1 areas
      const level1Areas = getAreasByLevel(1);
      console.log('🔍 Available areas:', level1Areas.map(a => a.id));
      
      // Find the completed area
      const completedArea = level1Areas.find(area => area.id === completedAreaId);
      console.log('🔍 Found completed area:', completedArea);
      
      if (!completedArea) {
        console.error('❌ Could not find area with ID:', completedAreaId);
        return;
      }
      
      setAreaData(completedArea);
      setTotalChecks(completedArea.checks.length);
      
      // Find the next area
      const currentAreaIndex = level1Areas.findIndex(area => area.id === completedAreaId);
      const nextArea = level1Areas[currentAreaIndex + 1];
      console.log('🔍 Next area:', nextArea);
      setNextAreaData(nextArea);
      
      // Calculate completed checks (for now, assume all are completed since this screen shows after area completion)
      setCompletedChecks(completedArea.checks.length);
    } catch (error) {
      console.error('Error loading area data:', error);
    }
  };

  const startEntranceAnimation = () => {
    try {
      // Reset animations
      backgroundGlow.setValue(0);
      trophyScale.setValue(0);
      trophyRotation.setValue(0);
      progressScale.setValue(0);
      textOpacity.setValue(0);
      buttonScale.setValue(0);
      nextAreaOpacity.setValue(0);
      particles.forEach(p => p.setValue(0));
      particleOpacities.forEach(po => po.setValue(1));
      stars.forEach(s => s.setValue(0));
      starScales.forEach(ss => ss.setValue(0));

    // Entrance sequence
    Animated.sequence([
      // Background glow
      Animated.timing(backgroundGlow, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      // Trophy entrance
      Animated.parallel([
        Animated.spring(trophyScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(trophyRotation, {
          toValue: 1,
          duration: 800,
          easing: Easing.elastic(1),
          useNativeDriver: false,
        }),
      ]),
      // Progress circle
      Animated.spring(progressScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
      // Text entrance
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      // Next area preview
      Animated.timing(nextAreaOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      // Button entrance
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start(() => {
      startParticleAnimation();
      startStarAnimation();
    });
    } catch (error) {
      console.error('Animation error:', error);
      // Fallback: show content without animations
      backgroundGlow.setValue(1);
      trophyScale.setValue(1);
      progressScale.setValue(1);
      textOpacity.setValue(1);
      buttonScale.setValue(1);
      nextAreaOpacity.setValue(1);
    }
  };

  const startParticleAnimation = () => {
    try {
      // Pre-calculate random values to avoid Math.random() calls during animation
      const configs = particles.map((_, index) => {
        const delay = (index * 50) + (index % 3) * 200; // More predictable delays
        const duration = 2000 + (index % 4) * 500; // More predictable durations
        const angle = (index / particles.length) * 2 * Math.PI;
        const distance = 150 + (index % 5) * 20; // More predictable distances
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        return { delay, duration, x, y };
      });

      setParticleConfigs(configs);

      const animations = particles.map((particle, index) => {
        const config = configs[index];
        
        return Animated.parallel([
          Animated.timing(particle, {
            toValue: 1,
            duration: config.duration,
            delay: config.delay,
            useNativeDriver: false,
          }),
          Animated.timing(particleOpacities[index], {
            toValue: 0,
            duration: config.duration,
            delay: config.delay,
            useNativeDriver: false,
          }),
        ]);
      });

      Animated.parallel(animations).start();
    } catch (error) {
      console.error('Particle animation error:', error);
    }
  };

  const startStarAnimation = () => {
    try {
      const animations = stars.map((star, index) => {
        const delay = index * 200;
        
        return Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(star, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.spring(starScales[index], {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: false,
            }),
          ]),
        ]);
      });

      Animated.parallel(animations).start();
    } catch (error) {
      console.error('Star animation error:', error);
    }
  };

  const handleContinue = () => {
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (onContinue) {
      onContinue();
    } else if (nextAreaData) {
      // Navigate to the first check of the next area
      const firstCheck = nextAreaData.checks[0];
      if (firstCheck) {
        const checkRoutes = {
          '1-1-1': SCREEN_NAMES.CHECK_1_1_1_STRONG_PASSWORDS,
          '1-1-2': SCREEN_NAMES.CHECK_1_1_2_HIGH_VALUE_ACCOUNTS,
          '1-1-3': SCREEN_NAMES.CHECK_1_1_3_PASSWORD_MANAGERS,
          '1-1-4': SCREEN_NAMES.CHECK_1_1_4_MFA_SETUP,
          '1-1-5': SCREEN_NAMES.CHECK_1_1_5_BREACH_CHECK,
          '1-2-1': SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK,
          '1-2-2': SCREEN_NAMES.CHECK_1_2_2_REMOTE_LOCK,
          '1-2-3': SCREEN_NAMES.CHECK_1_2_3_DEVICE_UPDATES,
          '1-2-4': SCREEN_NAMES.CHECK_1_2_4_BLUETOOTH_WIFI,
          '1-2-5': SCREEN_NAMES.CHECK_1_2_5_PUBLIC_CHARGING,
          '1-3-1': SCREEN_NAMES.CHECK_1_3_1_CLOUD_BACKUP,
          '1-3-2': SCREEN_NAMES.CHECK_1_3_2_LOCAL_BACKUP,
          '1-4-1': SCREEN_NAMES.CHECK_1_4_1_SCAM_RECOGNITION,
          '1-4-2': SCREEN_NAMES.CHECK_1_4_2_SCAM_REPORTING,
          '1-5-1': SCREEN_NAMES.CHECK_1_5_1_SHARING_AWARENESS,
          '1-5-2': SCREEN_NAMES.CHECK_1_5_2_PRIVACY_SETTINGS,
        };
        
        const routeName = checkRoutes[firstCheck.id] || SCREEN_NAMES.WELCOME;
        navigation.navigate(routeName);
      }
    } else {
      navigation.navigate(SCREEN_NAMES.WELCOME);
    }
  };

  const getAreaCompletionMessage = () => {
    if (!areaData) return { title: 'Area Complete!', subtitle: 'Great job!' };
    
    const areaMessages = {
      '1-1': {
        title: 'Account Security Mastered! 🛡️',
        subtitle: 'Your accounts are now fortress-strong!',
        message: 'You\'ve built a solid foundation of account security with strong passwords, password managers, and multi-factor authentication. Your digital life is now much more secure!'
      },
      '1-2': {
        title: 'Device Security Complete! 📱',
        subtitle: 'Your devices are locked down tight!',
        message: 'From screen locks to remote wiping, you\'ve secured every aspect of your devices. Your personal information stays private, even if your device is lost or stolen.'
      },
      '1-3': {
        title: 'Data Protection Achieved! 💾',
        subtitle: 'Your data is safe and backed up!',
        message: 'With both cloud and local backups in place, your important files are protected against any disaster. You\'ve implemented the gold standard of data protection!'
      },
      '1-4': {
        title: 'Scam Defense Complete! 🚫',
        subtitle: 'You can spot scams from a mile away!',
        message: 'Your scam detection skills are now razor-sharp. You can identify and avoid fraudulent attempts, and you know how to help others stay safe too.'
      },
      '1-5': {
        title: 'Privacy Protection Mastered! 🔒',
        subtitle: 'Your privacy is now under your control!',
        message: 'You\'ve taken control of your digital footprint and configured your privacy settings across all platforms. Your personal information stays private!'
      }
    };
    
    return areaMessages[completedAreaId] || {
      title: 'Area Complete! 🎉',
      subtitle: 'Excellent work!',
      message: 'You\'ve successfully completed this security area. Your digital life is now more secure!'
    };
  };

  const getNextAreaPreview = () => {
    if (!nextAreaData) {
      return {
        title: 'Level Complete! 🏆',
        subtitle: 'You\'ve mastered Level 1!',
        message: 'Congratulations! You\'ve completed all areas of Level 1. You\'re now a CyberPup Scout with a strong foundation in cybersecurity!',
        showButton: false
      };
    }
    
    return {
      title: `Next: ${nextAreaData.title}`,
      subtitle: nextAreaData.description,
      message: `Ready to continue your security journey? The next area focuses on ${nextAreaData.title.toLowerCase()}.`,
      showButton: true
    };
  };

  const renderParticles = () => {
    if (particleConfigs.length === 0) return null;
    
    return particles.map((particle, index) => {
      const config = particleConfigs[index];
      const colors = [Colors.success, Colors.accent, Colors.warning, Colors.purple];
      const color = colors[index % colors.length];
      
      return (
        <Animated.View
          key={`particle-${index}`}
          style={[
            styles.particle,
            {
              backgroundColor: color,
              transform: [
                {
                  translateX: particle.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, config.x],
                  }),
                },
                {
                  translateY: particle.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, config.y],
                  }),
                },
              ],
              opacity: particleOpacities[index],
            },
          ]}
        />
      );
    });
  };

  const renderStars = () => {
    const starPositions = [
      { top: 100, left: 50 },
      { top: 80, left: screenWidth - 80 },
      { top: 200, left: 30 },
      { top: 180, left: screenWidth - 60 },
      { top: 300, left: 40 },
      { top: 280, left: screenWidth - 70 },
      { top: 400, left: 60 },
      { top: 380, left: screenWidth - 50 },
    ];

    return stars.map((star, index) => (
      <Animated.View
        key={`star-${index}`}
        style={[
          styles.star,
          starPositions[index],
          {
            transform: [
              { scale: starScales[index] },
              {
                rotate: star.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
            opacity: star,
          },
        ]}
      >
        <Ionicons name="star" size={24} color={Colors.warningLight} />
      </Animated.View>
    ));
  };

  if (!areaData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionMessage = getAreaCompletionMessage();
  const nextAreaPreview = getNextAreaPreview();

    return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.background,
          {
            backgroundColor: backgroundGlow.interpolate({
              inputRange: [0, 1],
              outputRange: [Colors.background, Colors.background],
            }),
          },
        ]}
      >
        {/* Particles */}
        {renderParticles()}
        
        {/* Stars */}
        {renderStars()}
        
        {/* Main content */}
        <View style={styles.content}>
          {/* Trophy */}
          <Animated.View
            style={[
              styles.trophyContainer,
              {
                transform: [
                  { scale: trophyScale },
                  {
                    rotate: trophyRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="trophy" size={Responsive.iconSizes.xxlarge * 2} color={Colors.accent} />
          </Animated.View>
          
          {/* Progress circle */}
          <Animated.View
            style={[
              styles.progressContainer,
              {
                transform: [{ scale: progressScale }],
              },
            ]}
          >
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>
                {completedChecks}/{totalChecks}
              </Text>
            </View>
          </Animated.View>
          
          {/* Text content */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.congratulationsText}>{completionMessage.title}</Text>
            <Text style={styles.areaNameText}>{completionMessage.subtitle}</Text>
            <Text style={styles.areaDescriptionText}>{completionMessage.message}</Text>
            <Text style={styles.completionText}>
              You've completed {completedChecks} out of {totalChecks} checks in this area!
            </Text>
          </Animated.View>
          
          {/* Next area preview */}
          <Animated.View style={[styles.nextAreaContainer, { opacity: nextAreaOpacity }]}>
            <View style={styles.nextAreaCard}>
              <Text style={styles.nextAreaTitle}>{nextAreaPreview.title}</Text>
              <Text style={styles.nextAreaSubtitle}>{nextAreaPreview.subtitle}</Text>
              <Text style={styles.nextAreaMessage}>{nextAreaPreview.message}</Text>
            </View>
          </Animated.View>
          
          {/* Continue button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {nextAreaPreview.showButton ? 'Continue to Next Area' : 'Back to Welcome'}
              </Text>
              <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    padding: Responsive.padding.screen,
    flex: 1,
    justifyContent: 'center',
  },
  trophyContainer: {
    marginBottom: Responsive.spacing.xl,
  },
  progressContainer: {
    marginBottom: Responsive.spacing.lg,
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accent + '20',
    borderWidth: 4,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.xl,
  },
  congratulationsText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.md,
  },
  areaNameText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  areaDescriptionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.md,
  },
  completionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nextAreaContainer: {
    width: '100%',
    marginBottom: Responsive.spacing.xl,
  },
  nextAreaCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  nextAreaTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  nextAreaSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  nextAreaMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.4,
  },
  buttonContainer: {
    width: '100%',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    minHeight: Responsive.buttonHeight.medium,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: screenHeight / 2,
    left: screenWidth / 2 - 3,
  },
  star: {
    position: 'absolute',
  },
});

export default AreaCompletionScreen;
