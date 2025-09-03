import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Responsive } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Animation types
const ANIMATION_TYPES = {
  FIREWORKS: 'fireworks',
  CONFETTI: 'confetti',
};

const CompletionPopup = ({
  isVisible,
  title,
  description,
  nextScreenName,
  navigation,
  onContinue,
  onClose,
  variant = 'modal',
  checkId = null,
  animationType = null // Allow manual override, otherwise random
}) => {
  const [selectedAnimation, setSelectedAnimation] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Animation refs
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(100)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  
  // Modern fireworks animation refs with trailing effects
  const fireworks = useRef(Array.from({ length: 24 }, () => new Animated.Value(0))).current;
  const fireworkOpacities = useRef(Array.from({ length: 24 }, () => new Animated.Value(1))).current;
  const fireworkScales = useRef(Array.from({ length: 24 }, () => new Animated.Value(1))).current;
  const fireworkTrails = useRef(Array.from({ length: 24 }, () => 
    Array.from({ length: 3 }, () => new Animated.Value(0))
  )).current;
  const fireworkTrailOpacities = useRef(Array.from({ length: 24 }, () => 
    Array.from({ length: 3 }, () => new Animated.Value(0.8))
  )).current;
  
  // Modern confetti animation refs with physics
  const confetti = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  const confettiRotationsX = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  const confettiRotationsY = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  const confettiRotationsZ = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  const confettiScales = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  const confettiOpacities = useRef(Array.from({ length: 50 }, () => new Animated.Value(1))).current;
  const confettiGravity = useRef(Array.from({ length: 50 }, () => new Animated.Value(0))).current;
  
  // Trophy/Icon breathing and floating animation refs
  const iconBreathing = useRef(new Animated.Value(1)).current;
  const iconFloating = useRef(new Animated.Value(0)).current;

  // Check if we're on web platform (for haptic feedback only)
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isVisible) {
      // Select random animation if not specified
      let selectedAnim;
      if (!animationType) {
        const animationTypes = Object.values(ANIMATION_TYPES);
        const randomIndex = Math.floor(Math.random() * animationTypes.length);
        selectedAnim = animationTypes[randomIndex];
      } else {
        selectedAnim = animationType;
      }
      
      setSelectedAnimation(selectedAnim);
      setAnimationComplete(false);
      startEntranceAnimation(selectedAnim);
      
      // Haptic feedback (only on native platforms)
      if (!isWeb && Haptics?.notificationAsync) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [isVisible, animationType, isWeb]);

  const startEntranceAnimation = (selectedAnim) => {
    try {
      // Reset all animations
      modalScale.setValue(0);
      modalOpacity.setValue(0);
      modalTranslateY.setValue(100);
      iconScale.setValue(0);
      iconRotation.setValue(0);
      textOpacity.setValue(0);
      buttonScale.setValue(0);
    
    // Reset modern celebration animations
    fireworks.forEach(fw => fw.setValue(0));
    fireworkOpacities.forEach(fo => fo.setValue(1));
    fireworkScales.forEach(fs => fs.setValue(1));
    fireworkTrails.forEach(trail => trail.forEach(t => t.setValue(0)));
    fireworkTrailOpacities.forEach(trailOp => trailOp.forEach(to => to.setValue(0.8)));
    
    confetti.forEach(c => c.setValue(0));
    confettiRotationsX.forEach(cr => cr.setValue(0));
    confettiRotationsY.forEach(cr => cr.setValue(0));
    confettiRotationsZ.forEach(cr => cr.setValue(0));
    confettiScales.forEach(cs => cs.setValue(0));
    confettiOpacities.forEach(co => co.setValue(1));
    confettiGravity.forEach(cg => cg.setValue(0));
    
    // Reset icon animations
    iconBreathing.setValue(1);
    iconFloating.setValue(0);

    // Modern entrance sequence with organic easing
    Animated.sequence([
      // Modal entrance from bottom with custom easing
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
      ]),
      // Icon entrance with sophisticated movement
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 180,
          friction: 6,
          useNativeDriver: false,
        }),
        Animated.timing(iconRotation, {
          toValue: 1,
          duration: 1200,
          easing: Easing.elastic(1),
          useNativeDriver: false,
        }),

      ]),
      // Text entrance with staggered timing
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      // Button entrance with bounce
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 140,
        friction: 7,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setAnimationComplete(true);
      startCelebrationAnimation(selectedAnim);
      startIconContinuousAnimations();
    });
    } catch (error) {
      console.error('Entrance animation error:', error);
      // Fallback: show content without animations
      modalScale.setValue(1);
      modalOpacity.setValue(1);
      modalTranslateY.setValue(0);
      iconScale.setValue(1);
      textOpacity.setValue(1);
      buttonScale.setValue(1);
      setAnimationComplete(true);
    }
  };

  const startIconContinuousAnimations = () => {
    // Only run continuous animations on mobile
    if (Platform.OS === 'web') return;
    
    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBreathing, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
        Animated.timing(iconBreathing, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Floating effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconFloating, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
        Animated.timing(iconFloating, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const startCelebrationAnimation = (animationType) => {
    switch (animationType) {
      case ANIMATION_TYPES.FIREWORKS:
        startFireworksAnimation();
        break;
      case ANIMATION_TYPES.CONFETTI:
        startConfettiAnimation();
        break;
    }
  };

  const startFireworksAnimation = () => {
    try {
      const animations = fireworks.map((firework, index) => {
      const angle = (index / fireworks.length) * 2 * Math.PI;
      const distance = 140 + (index % 5) * 20; // More predictable distances
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const delay = (index * 50) + (index % 3) * 100; // More predictable delays
      const duration = 1200 + (index % 4) * 200; // More predictable durations
      
      // Main firework animation
      const mainAnimation = Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Movement with organic easing
          Animated.timing(firework, {
            toValue: 1,
            duration,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          // Scale starts large and shrinks
          Animated.timing(fireworkScales[index], {
            toValue: 0.2,
            duration,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          // Staggered opacity fade
          Animated.sequence([
            Animated.delay(duration * 0.3),
            Animated.timing(fireworkOpacities[index], {
              toValue: 0,
              duration: duration * 0.7,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ]),
      ]);

      // Trail animations
      const trailAnimations = fireworkTrails[index].map((trail, trailIndex) => {
        const trailDelay = delay + (trailIndex * 50);
        const trailDuration = duration + (trailIndex * 100);
        
        return Animated.sequence([
          Animated.delay(trailDelay),
          Animated.parallel([
            Animated.timing(trail, {
              toValue: 1,
              duration: trailDuration,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
            Animated.timing(fireworkTrailOpacities[index][trailIndex], {
              toValue: 0,
              duration: trailDuration,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ]);
      });

      return Animated.parallel([mainAnimation, ...trailAnimations]);
    });

    Animated.parallel(animations).start();
    } catch (error) {
      console.error('Fireworks animation error:', error);
    }
  };

  const startConfettiAnimation = () => {
    try {
      const animations = confetti.map((confettiPiece, index) => {
      const delay = (index * 100) + (index % 3) * 200; // More predictable delays
      const fallDuration = 3000 + (index % 4) * 500; // More predictable durations
      const horizontalDistance = ((index % 7) - 3) * 50; // More predictable distances
      const verticalDistance = 500 + (index % 5) * 80; // More predictable distances
      const rotationSpeed = 600 + (index % 6) * 100; // More predictable rotation speeds
      const airResistance = 0.7 + (index % 3) * 0.1; // More predictable air resistance
      
      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Horizontal movement with air resistance
          Animated.timing(confettiPiece, {
            toValue: 1,
            duration: fallDuration,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          // Gravity effect - accelerating downward
          Animated.timing(confettiGravity[index], {
            toValue: 1,
            duration: fallDuration,
            easing: Easing.ease,
            useNativeDriver: false,
          }),
          // Scale entrance
          Animated.timing(confettiScales[index], {
            toValue: 1,
            duration: fallDuration * 0.15,
            easing: Easing.elastic(1),
            useNativeDriver: false,
          }),
          // 3D tumbling rotation - X axis
          Animated.loop(
            Animated.timing(confettiRotationsX[index], {
              toValue: 1,
              duration: rotationSpeed,
              easing: Easing.linear,
              useNativeDriver: false,
            })
          ),
          // 3D tumbling rotation - Y axis
          Animated.loop(
            Animated.timing(confettiRotationsY[index], {
              toValue: 1,
              duration: rotationSpeed * 1.3,
              easing: Easing.linear,
              useNativeDriver: false,
            })
          ),
          // 3D tumbling rotation - Z axis
          Animated.loop(
            Animated.timing(confettiRotationsZ[index], {
              toValue: 1,
              duration: rotationSpeed * 0.8,
              easing: Easing.linear,
              useNativeDriver: false,
            })
          ),
          // Fade out with air resistance timing
          Animated.sequence([
            Animated.delay(fallDuration * 0.4),
            Animated.timing(confettiOpacities[index], {
              toValue: 0,
              duration: fallDuration * 0.6,
              easing: Easing.ease,
              useNativeDriver: false,
            }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
    } catch (error) {
      console.error('Confetti animation error:', error);
    }
  };

  const handleContinue = async () => {
    // Haptic feedback (only on native platforms)
    if (!isWeb && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Mark the check as complete in AsyncStorage if checkId is provided
    if (checkId) {
      try {
        await AsyncStorage.setItem(`check_${checkId}_completed`, 'completed');
      } catch (error) {
        console.error('Error marking check as completed:', error);
      }
    }
    
    // Always close the modal first
    if (onClose) {
      onClose();
    }
    
    // Then handle navigation
    if (onContinue) {
      onContinue();
    } else if (nextScreenName && navigation) {
      navigation.navigate(nextScreenName);
    } else {
      navigation.navigate('Welcome');
    }
  };

  const handleClose = () => {
    if (!isWeb && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (onClose) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const renderFireworks = () => {
    if (selectedAnimation !== ANIMATION_TYPES.FIREWORKS) return null;
    
    const fireworkColors = [
      { primary: Colors.success, secondary: '#4ade80' },
      { primary: Colors.accent, secondary: '#60a5fa' },
      { primary: Colors.warning, secondary: '#fbbf24' },
      { primary: Colors.purple, secondary: '#c084fc' },
      { primary: Colors.green, secondary: '#34d399' },
      { primary: '#ff6b6b', secondary: '#ff8e8e' },
    ];
    
    return fireworks.map((firework, index) => {
      const angle = (index / fireworks.length) * 2 * Math.PI;
      const distance = 140 + (index % 5) * 20; // More predictable distances
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      const colorSet = fireworkColors[index % fireworkColors.length];
      
      return (
        <View key={`firework-group-${index}`}>
          {/* Main firework particle with gradient effect */}
          <Animated.View
            style={[
              styles.fireworkParticle,
              {
                backgroundColor: colorSet.primary,
                transform: [
                  {
                    translateX: firework.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, x],
                    }),
                  },
                  {
                    translateY: firework.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, y],
                    }),
                  },
                  {
                    scale: fireworkScales[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [1.8, 0.3],
                    }),
                  },
                ],
                opacity: fireworkOpacities[index],
              },
            ]}
          />
          
          {/* Trailing particles */}
          {fireworkTrails[index].map((trail, trailIndex) => {
            const trailDistance = distance * (0.7 - trailIndex * 0.2);
            const trailX = Math.cos(angle) * trailDistance;
            const trailY = Math.sin(angle) * trailDistance;
            
            return (
              <Animated.View
                key={`trail-${index}-${trailIndex}`}
                style={[
                  styles.fireworkTrail,
                  {
                    backgroundColor: colorSet.secondary,
                    transform: [
                      {
                        translateX: trail.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, trailX],
                        }),
                      },
                      {
                        translateY: trail.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, trailY],
                        }),
                      },
                      {
                        scale: 0.6 - trailIndex * 0.15,
                      },
                    ],
                    opacity: fireworkTrailOpacities[index][trailIndex],
                  },
                ]}
              />
            );
          })}
        </View>
      );
    });
  };

  const renderConfetti = () => {
    if (selectedAnimation !== ANIMATION_TYPES.CONFETTI) return null;
    
    const confettiColors = [
      { primary: Colors.success, gradient: '#4ade80' },
      { primary: Colors.accent, gradient: '#60a5fa' },
      { primary: Colors.warning, gradient: '#fbbf24' },
      { primary: Colors.purple, gradient: '#c084fc' },
      { primary: Colors.green, gradient: '#34d399' },
      { primary: '#ff6b6b', gradient: '#ff8e8e' },
      { primary: '#ff9500', gradient: '#ffb347' },
      { primary: '#ff69b4', gradient: '#ffb6c1' },
    ];
    
    return confetti.map((confettiPiece, index) => {
      const colorSet = confettiColors[index % confettiColors.length];
      const horizontalDistance = (Math.random() - 0.5) * 400;
      const verticalDistance = 500 + Math.random() * 400;
      const width = 8 + Math.random() * 6;
      const height = 4 + Math.random() * 3;
      const isRectangle = index % 3 !== 0;
      
      return (
        <Animated.View
          key={`confetti-${index}`}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: colorSet.primary,
              width: isRectangle ? width : width * 0.8,
              height: isRectangle ? height : width * 0.8,
              borderRadius: isRectangle ? 2 : width * 0.4,
              transform: [
                // Horizontal movement with air resistance
                {
                  translateX: confettiPiece.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, horizontalDistance],
                  }),
                },
                // Vertical movement with gravity
                {
                  translateY: Animated.add(
                    confettiPiece.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, verticalDistance * 0.6],
                    }),
                    confettiGravity[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, verticalDistance * 0.4],
                    })
                  ),
                },
                // 3D tumbling rotations
                {
                  rotateX: confettiRotationsX[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateY: confettiRotationsY[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  rotateZ: confettiRotationsZ[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                {
                  scale: confettiScales[index],
                },
              ],
              opacity: confettiOpacities[index],
            },
          ]}
        />
      );
    });
  };

  if (variant === 'alert') {
    return (
      <Modal visible={isVisible} transparent={true} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertContent}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>🎉 {title}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.alertDescription}>{description}</Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Continue to Next Check</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Default modal variant
  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        {/* Celebration animations */}
        {renderFireworks()}
        {renderConfetti()}
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                { scale: modalScale },
                { translateY: modalTranslateY }
              ],
              opacity: modalOpacity,
            },
          ]}
        >
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <Animated.View
            style={[
              styles.celebrationIcon,
              {
                transform: [
                  { 
                    scale: Platform.OS === 'web' ? iconScale : Animated.multiply(iconScale, iconBreathing)
                  },
                  {
                    translateY: Platform.OS === 'web' ? 0 : iconFloating,
                  },
                  {
                    rotate: iconRotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="medal" size={Responsive.iconSizes.xxlarge} color={Colors.accent} />
          </Animated.View>
          
          <Animated.View style={{ opacity: textOpacity }}>
            <Text style={styles.modalTitle}>🎉 {title}</Text>
            <Text style={styles.modalDescription}>{description}</Text>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Responsive.borderRadius.large,
    borderTopRightRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.screen,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Responsive.spacing.md,
    right: Responsive.spacing.md,
    zIndex: 1,
    padding: Responsive.spacing.sm,
  },
  celebrationIcon: {
    marginTop: Responsive.spacing.lg,
    marginBottom: Responsive.spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  modalDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    gap: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.md,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    minHeight: Responsive.buttonHeight.medium,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
  },
  // Modern fireworks animation styles
  fireworkParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: screenHeight / 2 - 100,
    left: screenWidth / 2 - 5,
  },
  fireworkTrail: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    top: screenHeight / 2 - 100,
    left: screenWidth / 2 - 3,
  },
  // Modern confetti animation styles with physics
  confettiPiece: {
    position: 'absolute',
    top: 0,
    left: screenWidth / 2 - 4,
  },
  // Alert variant styles
  alertContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.padding.screen,
    margin: Responsive.spacing.lg,
    width: '90%',
    maxWidth: 350,
  },
  alertHeader: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
    position: 'relative',
  },
  alertTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  alertDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.lg,
  },
  alertButtons: {
    gap: Responsive.spacing.sm,
  },
  continueButton: {
    backgroundColor: Colors.success,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  continueButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});

export default CompletionPopup;
