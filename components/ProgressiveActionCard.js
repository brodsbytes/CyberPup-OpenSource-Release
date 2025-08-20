import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import * as Haptics from 'expo-haptics';

/**
 * ProgressiveActionCard - Pattern B Implementation
 * 
 * Handles device-specific external actions with guided workflows.
 * Applies Phase 1 lessons: user-controlled advancement, contextual actions,
 * proper timing, and confirmation-based flows.
 */
const ProgressiveActionCard = ({ 
  action, 
  device, 
  onComplete, 
  onStatusChange,
  style 
}) => {
  const [status, setStatus] = useState(action.completed ? 'completed' : 'pending');
  const [showVerification, setShowVerification] = useState(false);
  const animationValue = useRef(new Animated.Value(1)).current;
  const statusIconAnimation = useRef(new Animated.Value(0)).current;

  // Apply Phase 1 Lesson: User-controlled advancement
  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(action.id, newStatus);
    }
    
    // Animate status change
    Animated.sequence([
      Animated.timing(statusIconAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(statusIconAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Apply Phase 1 Lesson: Contextual actions based on device capabilities
  const handlePrimaryAction = async () => {
    try {
      // Haptic feedback for interaction
      if (Haptics?.impactAsync) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Animate card interaction
      Animated.sequence([
        Animated.timing(animationValue, { 
          toValue: 0.98, 
          duration: 100, 
          useNativeDriver: true 
        }),
        Animated.timing(animationValue, { 
          toValue: 1, 
          duration: 100, 
          useNativeDriver: true 
        })
      ]).start();

      updateStatus('in-progress');

      // Try deep link first if available
      if (action.deepLink && device.supportsDeepLinks) {
        try {
          const canOpen = await Linking.canOpenURL(action.deepLink);
          if (canOpen) {
            await Linking.openURL(action.deepLink);
            // Apply Phase 1 Lesson: Give user time to process before showing verification
            setTimeout(() => {
              setShowVerification(true);
              updateStatus('verification');
            }, 1000);
            return;
          }
        } catch (error) {
          console.log('Deep link failed, falling back to manual guidance:', error);
        }
      }
      
      // Fallback to manual guidance
      updateStatus('guided');
    } catch (error) {
      console.error('Action failed:', error);
      Alert.alert(
        'Action Failed',
        'Unable to open settings. Please follow the manual steps below.',
        [{ text: 'OK' }]
      );
      updateStatus('guided');
    }
  };

  // Apply Phase 1 Lesson: User confirmation system prevents false positives
  const handleVerificationComplete = async () => {
    // Provide immediate haptic feedback
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    
    // Directly mark as completed instead of requiring another step
    updateStatus('completed');
    setShowVerification(false);
    
    if (onComplete) {
      onComplete(action.id, true);
    }
  };

  const handleMarkComplete = async () => {
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    updateStatus('completed');
    if (onComplete) {
      onComplete(action.id, true);
    }
  };

  const getStatusIcon = () => {
    const iconProps = {
      size: Responsive.iconSizes.medium,
      style: { opacity: statusIconAnimation }
    };

    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" color={Colors.success} {...iconProps} />;
      case 'verification':
        return <Ionicons name="time-outline" color={Colors.warning} {...iconProps} />;
      case 'in-progress':
      case 'guided':
        return <Ionicons name="arrow-forward-circle" color={Colors.accent} {...iconProps} />;
      default:
        return <Ionicons name="ellipse-outline" color={Colors.muted} {...iconProps} />;
    }
  };

  // Apply Phase 1 Lesson: Contextual button text adapts to device capabilities
  const getActionButtonText = () => {
    if (action.deepLink && device.supportsDeepLinks) {
      return `Open ${device.platform === 'ios' ? 'Settings' : 'Settings'}`;
    }
    return 'View Instructions';
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'completed':
        return 'Completed successfully';
      case 'verification':
        return 'Return when you\'ve completed the steps';
      case 'in-progress':
        return 'Follow the instructions and return here';
      case 'guided':
        return 'Follow the manual steps below';
      default:
        return action.description;
    }
  };

  return (
    <Animated.View 
      style={[
        styles.card, 
        styles[`status-${status}`], 
        { transform: [{ scale: animationValue }] },
        style
      ]}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.deviceInfo}>
          <View style={styles.deviceIcon}>
            <Ionicons 
              name={device.icon || 'phone-portrait'} 
              size={Responsive.iconSizes.medium} 
              color={Colors.accent} 
            />
          </View>
          <View style={styles.deviceDetails}>
            <Text style={styles.deviceName}>{device.name || device.type}</Text>
            <Text style={styles.devicePlatform}>{device.platform}</Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          {getStatusIcon()}
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.actionTitle}>{action.title}</Text>
        <Text style={styles.actionDescription}>
          {getStatusDescription()}
        </Text>

        {/* Primary Action Button */}
        {status === 'pending' && (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handlePrimaryAction}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {getActionButtonText()}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={Responsive.iconSizes.small} 
              color={Colors.textPrimary} 
            />
          </TouchableOpacity>
        )}

        {/* Manual Steps (shown when deep link fails or not available) */}
        {(status === 'guided' || status === 'in-progress') && action.steps && (
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Manual Steps:</Text>
            {action.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            
            {/* Verification Request */}
            <TouchableOpacity 
              style={[styles.verificationButton, styles.completionButtonGreen]}
              onPress={handleVerificationComplete}
              activeOpacity={0.8}
            >
              <Ionicons 
                name="checkmark-circle" 
                size={Responsive.iconSizes.medium} 
                color={Colors.textPrimary} 
              />
              <Text style={[styles.verificationButtonText, styles.completionButtonText]}>
                I've completed these steps
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verification Section */}
        {showVerification && status === 'verification' && (
          <View style={styles.verificationSection}>
            <View style={styles.verificationHeader}>
              <Ionicons 
                name="return-down-back" 
                size={Responsive.iconSizes.medium} 
                color={Colors.accent} 
              />
              <Text style={styles.verificationTitle}>Welcome back!</Text>
            </View>
            <Text style={styles.verificationText}>
              Did you complete the {action.title.toLowerCase()} setup?
            </Text>
            
            <View style={styles.verificationButtons}>
              <TouchableOpacity 
                style={[styles.verificationButton, styles.verificationButtonSecondary]}
                onPress={() => {
                  setShowVerification(false);
                  updateStatus('guided');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.verificationButtonSecondaryText}>
                  Show steps again
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.verificationButton, styles.verificationButtonPrimary]}
                onPress={handleVerificationComplete}
                activeOpacity={0.8}
              >
                <Text style={styles.verificationButtonText}>
                  Yes, completed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}



        {/* Completed State */}
        {status === 'completed' && (
          <View style={styles.completedSection}>
            <View style={styles.completedIndicator}>
              <Ionicons 
                name="checkmark-circle" 
                size={Responsive.iconSizes.large} 
                color={Colors.success} 
              />
              <Text style={styles.completedText}>Security step completed!</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                updateStatus('pending');
                setShowVerification(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.resetButtonText}>Reset if needed</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginVertical: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  'status-pending': {
    borderColor: Colors.border,
    opacity: 0.9,
  },
  'status-in-progress': {
    borderColor: Colors.accent,
    borderWidth: 2,
  },
  'status-guided': {
    borderColor: Colors.accent,
    backgroundColor: Colors.overlayLight,
  },
  'status-verification': {
    borderColor: Colors.warning,
    backgroundColor: Colors.overlayLight,
  },
  'status-completed': {
    borderColor: Colors.success,
    backgroundColor: Colors.successSoft,
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceIcon: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.overlayLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  devicePlatform: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  actionDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.sm,
  },
  stepsContainer: {
    marginTop: Responsive.spacing.md,
    padding: Responsive.padding.card,
    backgroundColor: Colors.overlayLight,
    borderRadius: Responsive.borderRadius.medium,
  },
  stepsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.md,
  },
  stepNumber: {
    width: Responsive.iconSizes.medium,
    height: Responsive.iconSizes.medium,
    borderRadius: Responsive.iconSizes.medium / 2,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  stepText: {
    flex: 1,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
  },
  verificationSection: {
    marginTop: Responsive.spacing.lg,
    padding: Responsive.padding.card,
    backgroundColor: Colors.overlayMedium,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  verificationTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
  },
  verificationText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.lg,
    lineHeight: Typography.sizes.md * 1.4,
  },
  verificationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Responsive.spacing.md,
  },
  verificationButton: {
    flex: 1,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  verificationButtonPrimary: {
    backgroundColor: Colors.accent,
  },
  verificationButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verificationButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  verificationButtonSecondaryText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  completionSection: {
    marginTop: Responsive.spacing.lg,
    alignItems: 'center',
  },
  completionButton: {
    backgroundColor: Colors.success,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  completionButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
  },
  completionButtonGreen: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
  },
  completedSection: {
    alignItems: 'center',
    padding: Responsive.padding.card,
  },
  completedIndicator: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.lg,
  },
  completedText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    marginTop: Responsive.spacing.sm,
  },
  resetButton: {
    paddingVertical: Responsive.spacing.sm,
    paddingHorizontal: Responsive.spacing.md,
  },
  resetButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});

export default ProgressiveActionCard;