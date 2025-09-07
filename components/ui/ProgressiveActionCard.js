import React, { useState, useRef, useEffect } from 'react';
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
import { Colors, Typography, Responsive, CommonStyles } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

/**
 * ProgressiveActionCard - Pattern B Implementation
 * 
 * Handles device-specific external actions with guided workflows.
 * Applies Phase 1 lessons: user-controlled advancement, contextual actions,
 * proper timing, and confirmation-based flows.
 */
const ProgressiveActionCard = (props) => {
  // State for expandable instructions
  const [showAllSteps, setShowAllSteps] = useState(false);
  
  // Destructure props with validation
  const { 
  action, 
  device, 
  onComplete, 
  onStatusChange,
  style,
    variant 
  } = props || {};
  
  // Validate props early
  if (!action || !device) {
    return (
      <View style={{ padding: 20, backgroundColor: Colors.error, borderRadius: 8, margin: 8 }}>
        <Text style={{ color: Colors.textPrimary, textAlign: 'center' }}>Error: Missing required data</Text>
      </View>
    );
  }


  const [status, setStatus] = useState(action?.completed ? 'completed' : 'pending');
  const [showVerification, setShowVerification] = useState(false);
  const animationValue = useRef(new Animated.Value(1)).current;
  const statusIconAnimation = useRef(new Animated.Value(0)).current;

  // Update status when action.completed changes
  useEffect(() => {
    setStatus(action?.completed ? 'completed' : 'pending');
  }, [action?.completed]);

  // Apply Phase 1 Lesson: User-controlled advancement
  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    if (onStatusChange && typeof onStatusChange === 'function' && action?.id) {
      try {
      onStatusChange(action.id, newStatus);
      } catch (error) {
        console.error('❌ ProgressiveActionCard - Error in onStatusChange:', error);
      }
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
    console.log('🔘 Complete Step button pressed!', { 
      actionTitle: action?.title, 
      hasDeepLink: !!action?.deepLink,
      deepLink: action?.deepLink 
    });
    
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

      // Check if this is a password manager action with non-native recommendation
      const isPasswordManagerAction = action?.id?.includes('choose-manager');
      const isNonNativeRecommendation = action?.recommendation?.primary?.type && 
        action.recommendation.primary.type !== 'built-in';
      
      if (isPasswordManagerAction && isNonNativeRecommendation) {
        // Redirect to app store for non-native password manager
        const recommendedApp = action.recommendation.primary.name;
        let appStoreUrl;
        
        // Create more specific app store URLs based on the recommended app
        if (recommendedApp.toLowerCase().includes('bitwarden')) {
          appStoreUrl = Platform.OS === 'ios' 
            ? 'https://apps.apple.com/app/bitwarden-password-manager/id1137397744'
            : 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden';
        } else if (recommendedApp.toLowerCase().includes('1password')) {
          appStoreUrl = Platform.OS === 'ios' 
            ? 'https://apps.apple.com/app/1password-password-manager/id568903335'
            : 'https://play.google.com/store/apps/details?id=com.agilebits.onepassword';
        } else if (recommendedApp.toLowerCase().includes('proton')) {
          appStoreUrl = Platform.OS === 'ios' 
            ? 'https://apps.apple.com/app/proton-pass/id6443490629'
            : 'https://play.google.com/store/apps/details?id=proton.android.pass';
        } else {
          // Fallback to general password manager search
          appStoreUrl = Platform.OS === 'ios' 
            ? 'https://apps.apple.com/search?term=password%20manager'
            : 'https://play.google.com/store/search?q=password%20manager';
        }
        
        console.log('📱 Redirecting to app store for', recommendedApp, ':', appStoreUrl);
        
        try {
          const canOpen = await Linking.canOpenURL(appStoreUrl);
          if (canOpen) {
            await Linking.openURL(appStoreUrl);
            console.log('📱 App store opened successfully');
            // Give user time to install before showing verification
            setTimeout(() => {
              setShowVerification(true);
              updateStatus('verification');
            }, 2000);
            return;
          }
        } catch (error) {
          console.log('App store redirect failed:', error);
        }
      }

      // Try deep link first if available
      console.log('🔗 ProgressiveActionCard Debug:', { 
        hasDeepLink: !!action?.deepLink, 
        deepLink: action?.deepLink, 
        supportsDeepLinks: device?.supportsDeepLinks,
        deviceName: device?.name 
      });
      
      if (action?.deepLink && device?.supportsDeepLinks) {
        try {
          // Special handling for Android Password Manager
          if (action.deepLink === 'android-password-manager' && Platform.OS === 'android') {
            console.log('🔗 Android Password Manager detected, using special handler');
            
            // Import SettingsGuide dynamically to avoid circular imports
            const { SettingsGuide } = await import('../../utils/settingsGuide');
            const result = await SettingsGuide.openAndroidPasswordManager(device);
            
            if (result.success) {
              console.log(`✅ Android Password Manager opened via ${result.method}`);
              // Apply Phase 1 Lesson: Give user time to process before showing verification
              setTimeout(() => {
                setShowVerification(true);
                updateStatus('verification');
              }, 1000);
              return;
            } else {
              console.log('❌ Android Password Manager failed:', result.error);
            }
          }
          // For Android settings, use Linking.sendIntent() instead of openURL()
          else if (action.deepLink.startsWith('android.settings.') && Platform.OS === 'android') {
            console.log('🔗 Android settings detected, using sendIntent:', action.deepLink);
            // Use the proper React Native method for Android intents
            await Linking.sendIntent(action.deepLink);
            console.log('🔗 Settings opened successfully with sendIntent');
            // Apply Phase 1 Lesson: Give user time to process before showing verification
            setTimeout(() => {
              setShowVerification(true);
              updateStatus('verification');
            }, 1000);
            return;
          } else {
            // For non-Android settings URLs, use the traditional openURL approach
            const canOpen = await Linking.canOpenURL(action.deepLink);
            console.log('🔗 Can open deep link:', canOpen, action.deepLink);
            if (canOpen) {
              await Linking.openURL(action.deepLink);
              console.log('🔗 Settings opened successfully with openURL');
              // Apply Phase 1 Lesson: Give user time to process before showing verification
              setTimeout(() => {
                setShowVerification(true);
                updateStatus('verification');
              }, 1000);
              return;
            }
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
    
    if (onComplete && typeof onComplete === 'function' && action?.id) {
      try {
      onComplete(action.id, true);
      } catch (error) {
        console.error('❌ ProgressiveActionCard - Error in onComplete:', error);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    updateStatus('completed');
    if (onComplete && typeof onComplete === 'function' && action?.id) {
      try {
      onComplete(action.id, true);
      } catch (error) {
        console.error('❌ ProgressiveActionCard - Error in onComplete:', error);
      }
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
    // Check if this is a password manager action with non-native recommendation
    const isPasswordManagerAction = action?.id?.includes('choose-manager');
    const isNonNativeRecommendation = action?.recommendation?.primary?.type && 
      action.recommendation.primary.type !== 'built-in';
    
    if (isPasswordManagerAction && isNonNativeRecommendation) {
      return 'Install Password Manager';
    }
    
    if (action?.deepLink && device?.supportsDeepLinks) {
      return `Open ${device.platform === 'ios' ? 'Settings' : 'Settings'}`;
    }
    return 'View Instructions';
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'completed':
        return action?.description || '';
      case 'verification':
        return 'Return when you\'ve completed the steps';
      case 'in-progress':
        return 'Follow the instructions and return here';
      case 'guided':
        return 'Follow the manual steps below';
      default:
        return action?.description || '';
    }
  };

  // Safe step-by-step rendering
  try {
    
    // Theme-based card styling
    const cardStyle = {
      backgroundColor: Colors.surface,
      borderRadius: Responsive.borderRadius.large,
      padding: Responsive.padding.card,
      margin: Responsive.spacing.sm,
      borderWidth: action?.completed ? 2 : 1,
      borderColor: action?.completed ? Colors.success : Colors.border,
      opacity: action?.completed ? Colors.cardCompletedOpacity : Colors.cardInProgressOpacity
    };

    // Theme-based button styling (matching other check screens)
    const primaryButtonStyle = {
      backgroundColor: Colors.accent,
      borderRadius: Responsive.borderRadius.medium,
      paddingVertical: Responsive.padding.button,
      paddingHorizontal: Responsive.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Responsive.buttonHeight.medium,
      opacity: action?.completed ? 0.7 : 1
    };

    const secondaryButtonStyle = {
      backgroundColor: Colors.surface,
      borderRadius: Responsive.borderRadius.medium,
      paddingVertical: Responsive.padding.button,
      paddingHorizontal: Responsive.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Responsive.buttonHeight.medium,
      borderWidth: 1,
      borderColor: Colors.accent
    };

    return (
      <View style={cardStyle}>
        <View style={{ flex: 1 }}>
          {/* Device Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: Responsive.spacing.md,
            paddingBottom: Responsive.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: Colors.border
          }}>
            <Ionicons name="phone-portrait-outline" size={16} color={Colors.accent} />
            <Text style={{
              fontSize: Typography.sizes.sm,
              color: Colors.textSecondary,
              marginLeft: Responsive.spacing.sm,
              flex: 1
            }}>
              {String(device?.name || 'Device')} • {String(device?.platform || 'Unknown')}
            </Text>
          </View>

          {/* Title with completion indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Responsive.spacing.sm }}>
            <Text style={{
              fontSize: Typography.sizes.lg,
              fontWeight: Typography.weights.bold,
              color: action?.completed ? Colors.cardCompletedTitleColor : Colors.cardInProgressTitleColor,
              flex: 1
            }}>
              {String(action?.title || 'Loading...')}
            </Text>
            {action?.completed && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            )}
          </View>

          <Text style={{
            fontSize: Typography.sizes.md,
            color: Colors.textSecondary,
            marginBottom: Responsive.spacing.md,
            lineHeight: Typography.sizes.md * 1.4
          }}>
            {String(action?.description || 'Loading description...')}
          </Text>

          {/* Manual Steps Section */}
          {action?.steps && Array.isArray(action.steps) && action.steps.length > 0 && (
            <View style={{ marginBottom: Responsive.spacing.md }}>
              <Text style={{
                fontSize: Typography.sizes.md,
                fontWeight: Typography.weights.semibold,
                color: Colors.textPrimary,
                marginBottom: Responsive.spacing.sm
              }}>
                Steps to Complete:
              </Text>
              
              {(showAllSteps ? action.steps : action.steps.slice(0, 3)).map((step, index) => (
                <View key={index} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'flex-start', 
                  marginBottom: Responsive.spacing.xs 
                }}>
                  <Text style={{ 
                    fontSize: Typography.sizes.sm, 
                    color: Colors.accent, 
                    marginRight: Responsive.spacing.sm,
                    marginTop: 2,
                    fontWeight: Typography.weights.semibold
                  }}>
                    {index + 1}.
                  </Text>
                  <Text style={{
                    fontSize: Typography.sizes.sm,
                    color: Colors.textSecondary,
                    flex: 1,
                    lineHeight: Typography.sizes.sm * 1.4
                  }}>
                    {String(step)}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Action Buttons - Instructions above Complete */}
          <View style={{ gap: Responsive.spacing.sm }}>
            {/* Instructions Button (always visible if steps exist) */}
            {action?.steps && Array.isArray(action.steps) && action.steps.length > 0 && (
              <TouchableOpacity 
                style={secondaryButtonStyle}
                onPress={() => {
                  setShowAllSteps(!showAllSteps);
                }}
              >
                <Text style={{
                  fontSize: Typography.sizes.md,
                  fontWeight: Typography.weights.semibold,
                  color: Colors.accent
                }}>
                  {showAllSteps ? '📋 Hide Instructions' : '📋 View Instructions'}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Open Settings/Install Password Manager Button (if deep link available or non-native recommendation) */}
            {((action?.deepLink && device?.supportsDeepLinks) || 
              (action?.id?.includes('choose-manager') && action?.recommendation?.primary?.type !== 'built-in')) && 
              !action?.completed && (
              <TouchableOpacity 
                style={{
                  backgroundColor: Colors.accent,
                  borderRadius: Responsive.borderRadius.medium,
                  paddingVertical: Responsive.padding.button,
                  paddingHorizontal: Responsive.spacing.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: Responsive.spacing.sm,
                  marginBottom: Responsive.spacing.sm,
                }}
                onPress={handlePrimaryAction}
              >
                <Ionicons 
                  name={action?.id?.includes('choose-manager') && action?.recommendation?.primary?.type !== 'built-in' 
                    ? "download-outline" 
                    : "settings-outline"} 
                  size={Responsive.iconSizes.medium} 
                  color={Colors.textPrimary} 
                />
                <Text style={{
                  fontSize: Typography.sizes.md,
                  fontWeight: Typography.weights.semibold,
                  color: Colors.textPrimary
                }}>
                  {getActionButtonText()}
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Complete/Reset Button */}
            <TouchableOpacity 
              style={action?.completed ? primaryButtonStyle : primaryButtonStyle}
              onPress={() => {
                if (typeof onComplete === 'function') {
                  onComplete(action?.id, !action?.completed);
                }
              }}
            >
              <Text style={{
                fontSize: Typography.sizes.md,
                fontWeight: Typography.weights.semibold,
                color: Colors.textPrimary
              }}>
                {action?.completed ? 'Reset Step' : 'Complete Step'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  } catch (error) {
    return (
      <View style={{ padding: 20, backgroundColor: Colors.error, borderRadius: 8, margin: 8 }}>
        <Text style={{ color: Colors.textPrimary, textAlign: 'center' }}>Error loading action card</Text>
      </View>
    );
  }
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
  'status-completed-wizard': {
    borderColor: Colors.success,
    borderWidth: 2,
    backgroundColor: Colors.successSoft,
    opacity: 0.9,
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
    padding: Responsive.padding.xs,
  },
  completedIndicator: {
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  completedText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    marginTop: Responsive.spacing.xs,
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
  completeStepContainer: {
    marginTop: Responsive.spacing.sm,
    alignItems: 'center',
  },
  completeStepButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.green,
    borderRadius: Responsive.borderRadius.medium,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    minHeight: Responsive.buttonHeight.medium,
    width: '100%',
  },
  completeStepButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
  },
});

export default ProgressiveActionCard;