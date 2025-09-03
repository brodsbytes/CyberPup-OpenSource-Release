import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Responsive } from '../../theme';

const BadgeEarnedModal = ({ 
  visible, 
  badge, 
  onClose, 
  onContinue 
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [glowAnim] = useState(new Animated.Value(0));
  const [textAnim] = useState(new Animated.Value(0));
  const [confettiAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible && badge) {
      // Start animations
      Animated.sequence([
        // Badge scales in
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: false,
        }),
        // Glow effect
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        // Text fades in
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        // Confetti animation
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      glowAnim.setValue(0);
      textAnim.setValue(0);
      confettiAnim.setValue(0);
    }
  }, [visible, badge]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.8],
  });

  const confettiOpacity = confettiAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Confetti effect */}
        <Animated.View style={[styles.confetti, { opacity: confettiOpacity }]}>
          {[...Array(20)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiPiece,
                {
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: [
                    {
                      rotate: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', `${360 + Math.random() * 360}deg`],
                      }),
                    },
                    {
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -200 - Math.random() * 200],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>

        <View style={styles.container}>
          {/* Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ scale: scaleAnim }],
                boxShadow: `0px 0px 20px ${badge.color}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')}`,
                elevation: 15,
              },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
            </View>
          </Animated.View>

          {/* Text */}
          <Animated.View style={[styles.textContainer, { opacity: textAnim }]}>
            <Text style={styles.congratulationsText}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.badgeNameText}>{badge.name}</Text>
            <Text style={styles.badgeDescriptionText}>{badge.description}</Text>
          </Animated.View>

          {/* Action buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: textAnim }]}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue Learning</Text>
                              <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    marginHorizontal: 20,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.textPrimary,
  },
  badgeIcon: {
    fontSize: 60,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  congratulationsText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeNameText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescriptionText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default BadgeEarnedModal;
