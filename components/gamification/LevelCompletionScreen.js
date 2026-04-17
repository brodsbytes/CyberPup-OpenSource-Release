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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Responsive } from '../../theme';
import { 
  responsiveSpacing, 
  responsiveTypography, 
  responsivePadding, 
  responsiveBorderRadius,
  responsiveIconSizes,
  responsiveButtonHeight,
  isSmallScreen,
  scale,
  scaleVertical
} from '../../utils/responsive';
import { levels, getAreasByLevel } from '../../data/courseData';
import { SCREEN_NAMES } from '../../constants';
import { CopywritingService } from '../../utils/copywritingService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * LevelCompletionScreen - Production-ready level completion animations
 * 
 * Enhanced Features for Level Completion:
 * - Doubled particle and star systems for extra celebration
 * - CyberPup Scout badge achievement
 * - Enhanced animations with more dynamic effects
 * - Special level completion messaging
 * 
 * Performance Optimizations:
 * - Uses native drivers (useNativeDriver: true) for all supported properties
 * - Smooth easing curves (cubic, back, sine) for natural motion
 * - Optimized particle and star systems with predictable timing
 * 
 * Future Upgrade Path:
 * - TODO: Replace particle systems with Lottie animations for richer effects
 * - TODO: Consider React Native Reanimated 3 for complex physics
 * - TODO: Add level-specific celebration themes
 */

const LevelCompletionScreen = ({
  route,
  navigation,
  onContinue,
}) => {
  const { completedLevelId } = route?.params || {}; // e.g., 1 for Level 1
  
  console.log('🏆 LevelCompletionScreen mounted with params:', route?.params);
  console.log('🏆 completedLevelId:', completedLevelId);
  
  const [levelData, setLevelData] = useState(null);
  const [completedAreas, setCompletedAreas] = useState(0);
  const [totalAreas, setTotalAreas] = useState(0);
  const [completedChecks, setCompletedChecks] = useState(0);
  const [totalChecks, setTotalChecks] = useState(0);
  
  // Animation refs
  const backgroundGlow = useRef(new Animated.Value(0)).current;
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotation = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgeRotation = useRef(new Animated.Value(0)).current;
  const progressScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const scoutBadgeOpacity = useRef(new Animated.Value(0)).current;
  
  // Enhanced particle animations (doubled for level completion)
  const particles = useRef(Array.from({ length: 60 }, () => new Animated.Value(0))).current;
  const particleOpacities = useRef(Array.from({ length: 60 }, () => new Animated.Value(1))).current;
  
  // Enhanced star animations (doubled for level completion)
  const stars = useRef(Array.from({ length: 16 }, () => new Animated.Value(0))).current;
  const starScales = useRef(Array.from({ length: 16 }, () => new Animated.Value(0))).current;
  
  // Particle configurations (pre-calculated to avoid Math.random() during animation)
  const [particleConfigs, setParticleConfigs] = useState([]);

  // Load level data and calculate progress
  useEffect(() => {
    loadLevelData();
  }, [completedLevelId]);

  useEffect(() => {
    if (levelData) {
      startEntranceAnimation();
      
      // Enhanced haptic feedback for level completion
      if (Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Additional haptic feedback after a delay
        setTimeout(() => {
          if (Haptics?.impactAsync) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        }, 500);
      }
    }
  }, [levelData]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      // Stop any running animations
      backgroundGlow.stopAnimation();
      trophyScale.stopAnimation();
      trophyRotation.stopAnimation();
      badgeScale.stopAnimation();
      badgeRotation.stopAnimation();
      progressScale.stopAnimation();
      textOpacity.stopAnimation();
      buttonScale.stopAnimation();
      scoutBadgeOpacity.stopAnimation();
      particles.forEach(p => p.stopAnimation());
      particleOpacities.forEach(po => po.stopAnimation());
      stars.forEach(s => s.stopAnimation());
      starScales.forEach(ss => ss.stopAnimation());
    };
  }, []);

  const loadLevelData = () => {
    try {
      console.log('🔍 LevelCompletionScreen - Loading data for levelId:', completedLevelId);
      console.log('🔍 Available levels:', levels.map(l => ({ id: l.id, title: l.title })));
      
      // Get the completed level
      const level = levels.find(l => l.id === completedLevelId);
      console.log('🔍 Found completed level:', level);
      
      if (!level) {
        console.error('❌ Could not find level with ID:', completedLevelId);
        console.error('❌ Available level IDs:', levels.map(l => l.id));
        return;
      }
      
      setLevelData(level);
      
      // Calculate progress
      const levelAreas = getAreasByLevel(completedLevelId);
      setTotalAreas(levelAreas.length);
      
      // For now, assume all areas and checks are completed since this screen shows after level completion
      setCompletedAreas(levelAreas.length);
      
      // Count total checks (excluding "Coming Soon" checks)
      let totalCheckCount = 0;
      levelAreas.forEach(area => {
        area.checks.forEach(check => {
          if (check.title !== 'Coming Soon!' && !check.title.includes('Coming Soon!')) {
            totalCheckCount++;
          }
        });
      });
      setTotalChecks(totalCheckCount);
      setCompletedChecks(totalCheckCount);
      
    } catch (error) {
      console.error('Error loading level data:', error);
    }
  };

  const startEntranceAnimation = () => {
    try {
      // Reset animations
      backgroundGlow.setValue(0);
      trophyScale.setValue(0);
      trophyRotation.setValue(0);
      badgeScale.setValue(0);
      badgeRotation.setValue(0);
      progressScale.setValue(0);
      textOpacity.setValue(0);
      buttonScale.setValue(0);
      scoutBadgeOpacity.setValue(0);
      particles.forEach(p => p.setValue(0));
      particleOpacities.forEach(po => po.setValue(1));
      stars.forEach(s => s.setValue(0));
      starScales.forEach(ss => ss.setValue(0));

      // Enhanced entrance sequence with native performance
      Animated.sequence([
        // Background glow - cannot use native driver (opacity interpolation)
        Animated.timing(backgroundGlow, {
          toValue: 1,
          duration: 1500, // Longer for level completion
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        // Trophy entrance
        Animated.parallel([
          Animated.spring(trophyScale, {
            toValue: 1,
            tension: 80, // Slightly less tension for more dramatic effect
            friction: 6,
            useNativeDriver: true,
          }),
          Animated.timing(trophyRotation, {
            toValue: 1,
            duration: 1200, // Longer rotation for level completion
            easing: Easing.out(Easing.back(1.5)), // More dramatic easing
            useNativeDriver: true,
          }),
        ]),
        // Badge entrance (new for level completion)
        Animated.parallel([
          Animated.spring(badgeScale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(badgeRotation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.back(1.3)),
            useNativeDriver: true,
          }),
        ]),
        // Progress circle
        Animated.spring(progressScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Text entrance
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600, // Longer for level completion
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Scout badge entrance
        Animated.timing(scoutBadgeOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Button entrance
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
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
      badgeScale.setValue(1);
      progressScale.setValue(1);
      textOpacity.setValue(1);
      buttonScale.setValue(1);
      scoutBadgeOpacity.setValue(1);
    }
  };

  const startParticleAnimation = () => {
    try {
      // Pre-calculate random values to avoid Math.random() calls during animation
      const configs = particles.map((_, index) => {
        const delay = (index * 30) + (index % 4) * 150; // More frequent particles
        const duration = 2500 + (index % 6) * 400; // Longer duration for level completion
        const angle = (index / particles.length) * 2 * Math.PI;
        const distance = 200 + (index % 8) * 25; // Larger spread for level completion
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
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particleOpacities[index], {
            toValue: 0,
            duration: config.duration,
            delay: config.delay,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
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
        const delay = index * 150; // More frequent stars
        
        return Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(star, {
              toValue: 1,
              duration: 800, // Longer duration for level completion
              easing: Easing.out(Easing.back(1.2)), // More dramatic bounce
              useNativeDriver: true,
            }),
            Animated.spring(starScales[index], {
              toValue: 1,
              tension: 80, // Less tension for more dramatic effect
              friction: 6,
              useNativeDriver: true,
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
    } else {
      // Navigate back to welcome screen
      navigation.navigate(SCREEN_NAMES.WELCOME);
    }
  };

  const getLevelCompletionMessage = () => {
    if (!levelData) return { 
      title: 'Level Complete!', 
      subtitle: 'Congratulations!',
      message: 'You\'ve completed this level!'
    };
    
    // Special messaging for Level 1 completion
    if (completedLevelId === 1) {
      return {
        title: 'Level 1 Complete! 🏆',
        subtitle: 'You\'re now a CyberPup Scout! 🐾',
        message: 'Congratulations! You\'ve mastered all the fundamentals of cybersecurity. You\'ve built strong passwords, secured your devices, protected your data, learned to spot scams, and taken control of your privacy. You\'re now a certified CyberPup Scout with a solid foundation in digital security!',
        scoutMessage: 'Welcome to the CyberPup Scout family! You\'ve earned your first cybersecurity badge and are ready to protect your digital life.'
      };
    }
    
    return {
      title: `${levelData.title} Complete!`,
      subtitle: 'Excellent work!',
      message: `You've successfully completed ${levelData.title}. Your cybersecurity skills are growing stronger!`
    };
  };

  const renderParticles = () => {
    if (particleConfigs.length === 0) return null;
    
    return particles.map((particle, index) => {
      const config = particleConfigs[index];
      const colors = [Colors.success, Colors.accent, Colors.warning, Colors.purple, Colors.primary, Colors.secondary];
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
      { top: scale(80), left: scale(40) },
      { top: scale(60), left: screenWidth - scale(90) },
      { top: scale(150), left: scale(20) },
      { top: scale(130), left: screenWidth - scale(70) },
      { top: scale(220), left: scale(30) },
      { top: scale(200), left: screenWidth - scale(80) },
      { top: scale(290), left: scale(50) },
      { top: scale(270), left: screenWidth - scale(60) },
      { top: scale(360), left: scale(40) },
      { top: scale(340), left: screenWidth - scale(70) },
      { top: scale(430), left: scale(60) },
      { top: scale(410), left: screenWidth - scale(50) },
      { top: scale(500), left: scale(30) },
      { top: scale(480), left: screenWidth - scale(80) },
      { top: scale(570), left: scale(50) },
      { top: scale(550), left: screenWidth - scale(60) },
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
        <Ionicons name="star" size={responsiveIconSizes.large} color={Colors.warningLight} />
      </Animated.View>
    ));
  };

  if (!levelData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completionMessage = getLevelCompletionMessage();

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Enhanced Particles */}
        {renderParticles()}
        
        {/* Enhanced Stars */}
        {renderStars()}
        
        {/* Main content */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
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
            <Ionicons name="trophy" size={responsiveIconSizes.xxlarge * 2.5} color={Colors.accent} />
          </Animated.View>
          
          {/* CyberPup Scout Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: badgeScale },
                  {
                    rotate: badgeRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.scoutBadge}>
              <Text style={styles.badgeEmoji}>🐾</Text>
              <Text style={styles.badgeText}>Scout</Text>
            </View>
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
              <Text style={styles.progressSubtext}>Checks</Text>
            </View>
          </Animated.View>
          
          {/* Text content */}
          <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
            <Text style={styles.congratulationsText}>{completionMessage.title}</Text>
            <Text style={styles.levelNameText}>{completionMessage.subtitle}</Text>
            <Text style={styles.levelDescriptionText}>{completionMessage.message}</Text>
            <Text style={styles.completionText}>
              You've completed {completedAreas} areas with {completedChecks} total security checks!
            </Text>
          </Animated.View>
          
          {/* Scout Badge Achievement */}
          <Animated.View style={[styles.scoutAchievementContainer, { opacity: scoutBadgeOpacity }]}>
            <View style={styles.scoutAchievementCard}>
              <Text style={styles.scoutAchievementTitle}>🎉 CyberPup Scout Achievement Unlocked! 🎉</Text>
              <Text style={styles.scoutAchievementMessage}>{completionMessage.scoutMessage}</Text>
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
                Back to Home
              </Text>
              <Ionicons name="home" size={responsiveIconSizes.medium} color={Colors.textPrimary} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
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
    fontSize: responsiveTypography.sizes.lg,
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
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    padding: responsivePadding.screen,
    minHeight: screenHeight,
    justifyContent: 'center',
    width: '100%',
  },
  trophyContainer: {
    marginBottom: responsiveSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    marginBottom: responsiveSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoutBadge: {
    backgroundColor: Colors.accent + '20',
    borderRadius: scale(50),
    width: scale(100),
    height: scale(100),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  badgeEmoji: {
    fontSize: scale(32),
    marginBottom: scale(4),
  },
  badgeText: {
    fontSize: responsiveTypography.sizes.sm,
    fontWeight: responsiveTypography.weights.bold,
    color: Colors.accent,
  },
  progressContainer: {
    marginBottom: responsiveSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: scale(140),
    height: scale(140),
    borderRadius: scale(70),
    backgroundColor: Colors.accent + '20',
    borderWidth: 4,
    borderColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: responsiveTypography.sizes.xl,
    fontWeight: responsiveTypography.weights.bold,
    color: Colors.accent,
  },
  progressSubtext: {
    fontSize: responsiveTypography.sizes.sm,
    color: Colors.accent,
    marginTop: scale(2),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: responsiveSpacing.xl,
    paddingHorizontal: responsiveSpacing.md,
    maxWidth: screenWidth - (responsivePadding.screen * 2),
  },
  congratulationsText: {
    fontSize: responsiveTypography.sizes.xxxl,
    fontWeight: responsiveTypography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: responsiveSpacing.md,
  },
  levelNameText: {
    fontSize: responsiveTypography.sizes.xxl,
    fontWeight: responsiveTypography.weights.bold,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: responsiveSpacing.sm,
  },
  levelDescriptionText: {
    fontSize: responsiveTypography.sizes.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: responsiveTypography.sizes.lg * 1.5,
    marginBottom: responsiveSpacing.md,
  },
  completionText: {
    fontSize: responsiveTypography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scoutAchievementContainer: {
    width: '100%',
    marginBottom: responsiveSpacing.xl,
    paddingHorizontal: responsiveSpacing.md,
    maxWidth: screenWidth - (responsivePadding.screen * 2),
  },
  scoutAchievementCard: {
    backgroundColor: Colors.accent + '10',
    borderRadius: responsiveBorderRadius.medium,
    padding: responsiveSpacing.lg,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
  },
  scoutAchievementTitle: {
    fontSize: responsiveTypography.sizes.lg,
    fontWeight: responsiveTypography.weights.bold,
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: responsiveSpacing.sm,
  },
  scoutAchievementMessage: {
    fontSize: responsiveTypography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: responsiveTypography.sizes.md * 1.4,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: responsiveSpacing.md,
    maxWidth: screenWidth - (responsivePadding.screen * 2),
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: responsivePadding.button,
    paddingHorizontal: responsiveSpacing.lg,
    borderRadius: responsiveBorderRadius.medium,
    minHeight: responsiveButtonHeight.medium,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    elevation: 3,
  },
  continueButtonText: {
    fontSize: responsiveTypography.sizes.md,
    fontWeight: responsiveTypography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: responsiveSpacing.sm,
  },
  particle: {
    position: 'absolute',
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    top: screenHeight / 2,
    left: screenWidth / 2 - scale(4),
  },
  star: {
    position: 'absolute',
  },
});

export default LevelCompletionScreen;
