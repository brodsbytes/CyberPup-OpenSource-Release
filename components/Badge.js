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
import { Colors } from '../theme';

const Badge = ({ 
  badge, 
  size = 'medium', 
  showDetails = false, 
  onPress = null,
  style = {} 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  const isEarned = badge.isEarned || badge.unlockedAt;

  // Animate glow effect for earned badges
  useEffect(() => {
    if (isEarned) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isEarned]);

  const handlePress = () => {
    if (onPress) {
      onPress(badge);
    } else if (showDetails) {
      setShowModal(true);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 60, height: 60 },
          icon: { fontSize: 24 },
          text: { fontSize: 10 }
        };
      case 'large':
        return {
          container: { width: 120, height: 120 },
          icon: { fontSize: 48 },
          text: { fontSize: 14 }
        };
      default: // medium
        return {
          container: { width: 80, height: 80 },
          icon: { fontSize: 32 },
          text: { fontSize: 12 }
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={handlePress}
        onPressIn={animatePress}
        activeOpacity={0.8}
        disabled={!isEarned && !showDetails}
      >
        <Animated.View
          style={[
            styles.badgeContainer,
            sizeStyles.container,
            {
              backgroundColor: isEarned ? badge.color : Colors.surface,
              borderColor: isEarned ? badge.color : Colors.border,
              transform: [{ scale: scaleAnim }],
              opacity: isEarned ? 1 : 0.5,
            },
            isEarned && {
              shadowColor: badge.color,
              shadowOpacity: glowOpacity,
              shadowRadius: 10,
              elevation: 8,
            }
          ]}
        >
          <Text style={[styles.badgeIcon, sizeStyles.icon]}>
            {badge.icon}
          </Text>
          {size !== 'small' && (
            <Text 
              style={[
                styles.badgeName, 
                sizeStyles.text,
                { color: isEarned ? Colors.textPrimary : Colors.textSecondary }
              ]}
              numberOfLines={2}
            >
              {badge.name}
            </Text>
          )}
          {isEarned && (
            <View style={styles.earnedIndicator}>
                              <Ionicons name="checkmark-circle" size={Responsive.iconSizes.small} color={Colors.textPrimary} />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Badge Details Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.badgeDetails}>
              <View style={[
                styles.badgeIconLarge,
                { backgroundColor: isEarned ? badge.color : Colors.surface }
              ]}>
                <Text style={styles.badgeIconText}>{badge.icon}</Text>
              </View>
              
              <Text style={styles.badgeTitle}>{badge.name}</Text>
              <Text style={styles.badgeDescription}>{badge.description}</Text>
              
              {isEarned ? (
                <View style={styles.earnedInfo}>
                  <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <Text style={styles.earnedText}>Earned</Text>
                  {badge.unlockedAt && (
                    <Text style={styles.earnedDate}>
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.lockedInfo}>
                  <Ionicons name="lock-closed" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
                  <Text style={styles.lockedText}>Not yet earned</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative',
  },
  badgeIcon: {
    marginBottom: 4,
  },
  badgeName: {
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  earnedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    minWidth: 300,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDetails: {
    alignItems: 'center',
    marginTop: 20,
  },
  badgeIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeIconText: {
    fontSize: 40,
  },
  badgeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  earnedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  earnedText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  earnedDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 'auto',
  },
  lockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lockedText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default Badge;
