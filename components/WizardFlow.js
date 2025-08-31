import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Linking } from 'react-native';

import { Colors, Typography, Responsive, CommonStyles, CheckVariants } from '../theme';
import CircularProgress from './ui/CircularProgress';
import ProgressiveActionCard from './ProgressiveActionCard';

const WizardFlow = ({ 
  userDevices, 
  deviceActions, 
  onActionComplete, 
  onStatusChange,
  variant = 'wizard',
  checkId,
  navigation 
}) => {
  // ✅ UPDATED: Separate step tracking for each device
  const [deviceSteps, setDeviceSteps] = useState({});
  const [stepStatus, setStepStatus] = useState({});
  
  // 🎨 NEW: Wizard-specific state
  const [showStepDetails, setShowStepDetails] = useState(false);
  
  // Calculate total steps across all devices
  const getTotalSteps = () => {
    let total = 0;
    userDevices.forEach(device => {
      const actions = deviceActions[device.id] || [];
      total += actions.length;
    });
    return total;
  };
  
  // Calculate current progress
  const calculateProgress = () => {
    let completed = 0;
    let total = 0;
    
    userDevices.forEach(device => {
      const actions = deviceActions[device.id] || [];
      total += actions.length;
      completed += actions.filter(action => action.completed).length;
    });
    
    return total > 0 ? (completed / total) * 100 : 0;
  };
  
  // Get device data and actions for any device
  const getDeviceData = (deviceIndex) => {
    if (userDevices.length === 0 || deviceIndex >= userDevices.length) return null;
    return userDevices[deviceIndex];
  };
  
  const getDeviceActions = (deviceIndex) => {
    const device = getDeviceData(deviceIndex);
    if (!device) return [];
    return deviceActions[device.id] || [];
  };
  
  const getCurrentStep = (deviceIndex) => {
    return deviceSteps[deviceIndex] || 0;
  };
  
  const setCurrentStep = (deviceIndex, step) => {
    setDeviceSteps(prev => ({
      ...prev,
      [deviceIndex]: step
    }));
  };
  
  // Handle wizard action completion for specific device
  const handleWizardActionComplete = async (deviceId, actionId, completed) => {
    await onActionComplete(deviceId, actionId, completed);
    
    // Haptic feedback
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Auto-advance to next step if action completed
    if (completed) {
      // Find which device this action belongs to
      const deviceIndex = userDevices.findIndex(device => device.id === deviceId);
      if (deviceIndex !== -1) {
        const deviceActions = getDeviceActions(deviceIndex);
        const currentActionIndex = deviceActions.findIndex(action => action.id === actionId);
        
        if (currentActionIndex < deviceActions.length - 1) {
          // Next action in same device
          setTimeout(() => {
            setCurrentStep(deviceIndex, currentActionIndex + 1);
          }, 500);
        }
      }
    }
  };
  
  // Navigation handlers for specific device
  const handleNextStep = async (deviceIndex) => {
    const deviceActions = getDeviceActions(deviceIndex);
    const currentStep = getCurrentStep(deviceIndex);
    const currentAction = deviceActions[currentStep];
    
    // First, mark the current action as completed
    if (currentAction && !currentAction.completed) {
      const device = userDevices[deviceIndex];
      await handleWizardActionComplete(device.id, currentAction.id, true);
    }
    
    // Then advance to next step if available
    if (currentStep < deviceActions.length - 1) {
      setCurrentStep(deviceIndex, currentStep + 1);
    }
  };
  
  const handlePreviousStep = (deviceIndex) => {
    const currentStep = getCurrentStep(deviceIndex);
    
    if (currentStep > 0) {
      setCurrentStep(deviceIndex, currentStep - 1);
    }
  };
  
  const handleWizardComplete = () => {
    if (onStatusChange) {
      onStatusChange({ completed: true });
    }
  };
  

  
  // Calculate overall progress directly
  const totalSteps = getTotalSteps();
  const wizardProgress = calculateProgress();
  
  if (userDevices.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="shield-checkmark" size={Responsive.iconSizes.xxlarge} color={CheckVariants.wizard.accent} />
        <Text style={styles.emptyStateTitle}>No Actions Required</Text>
        <Text style={styles.emptyStateText}>
          All security settings are already configured for your devices.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.wizardContainer}>
      {/* Overall Progress Header */}
      <View style={[styles.wizardHeader, styles[variant]]}>
        <CircularProgress 
          progress={wizardProgress} 
          size={Responsive.iconSizes.xxlarge} 
          strokeWidth={8}
          color={CheckVariants.wizard.accent}
          showText={false}
        />
        <Text style={styles.overallProgressText}>
          Overall Progress: {Math.round(wizardProgress)}%
        </Text>
      </View>
      
      {/* Individual Device Cards */}
      <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
        {userDevices.map((device, deviceIndex) => {
          const deviceActions = getDeviceActions(deviceIndex);
          const currentStep = getCurrentStep(deviceIndex);
          const currentAction = deviceActions[currentStep];
          const completedActions = deviceActions.filter(action => action.completed).length;
          const deviceProgress = deviceActions.length > 0 ? (completedActions / deviceActions.length) * 100 : 0;
          
          return (
            <View key={device.id} style={styles.deviceCard}>
              {/* Device Header */}
              <View style={styles.deviceCardHeader}>
                <View style={styles.deviceInfo}>
                  <Ionicons 
                    name={getDeviceIcon(device)} 
                    size={Responsive.iconSizes.medium} 
                    color={CheckVariants.wizard.accent} 
                  />
                  <Text style={styles.deviceName}>{device.name}</Text>
                </View>
                <View style={styles.deviceProgress}>
                  <Text style={styles.deviceProgressText}>
                    {completedActions}/{deviceActions.length} completed
                  </Text>
                </View>
              </View>
              
              {/* Device Progress Bar */}
              <View style={styles.deviceProgressBar}>
                <View style={[styles.deviceProgressFill, { width: `${deviceProgress}%` }]} />
              </View>
              
              {/* Current Action */}
              {currentAction && (
                <View style={styles.actionSection}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepCounter}>
                      Step {currentStep + 1} of {deviceActions.length}
                    </Text>
                    <Text style={styles.stepTitle}>
                      {currentAction.title}
                    </Text>
                  </View>
                  
                  {/* Action Card */}
                  <View style={styles.actionCard}>
                    <ProgressiveActionCard
                      key={`${device.id}-${currentAction.id}-${currentStep}`} // Force re-render when step changes
                      action={currentAction}
                      device={device}
                      onComplete={(actionId, completed) => 
                        handleWizardActionComplete(device.id, actionId, completed)
                      }
                      variant="wizard"
                    />
                  </View>
                  

                  
                  {/* Device-Specific Navigation */}
                  <View style={styles.deviceNavigation}>
                    {/* Back Button */}
                    {currentStep > 0 && (
                      <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => handlePreviousStep(deviceIndex)}
                      >
                        <Ionicons 
                          name="chevron-back" 
                          size={Responsive.iconSizes.medium} 
                          color={CheckVariants.wizard.accent} 
                        />
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* Next Button or Device Complete Status */}
                    {deviceProgress === 100 ? (
                      <View style={styles.deviceCompleteButton}>
                        <Ionicons 
                          name="checkmark-circle" 
                          size={Responsive.iconSizes.medium} 
                          color={Colors.textPrimary} 
                        />
                        <Text style={styles.deviceCompleteButtonText}>Device Complete!</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.nextButton}
                        onPress={() => handleNextStep(deviceIndex)}
                      >
                        <Text style={styles.nextButtonText}>Next Step</Text>
                        <Ionicons 
                          name="chevron-forward" 
                          size={Responsive.iconSizes.medium} 
                          color={Colors.textPrimary} 
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

// Helper function to get device icon
const getDeviceIcon = (device) => {
  const platform = device.platform || device.tier2;
  const type = device.type;
  
  if (type === 'mobile') {
    return platform === 'ios' ? 'phone-portrait' : 'phone-portrait';
  } else if (type === 'computer') {
    return platform === 'macos' ? 'laptop' : 'desktop';
  }
  
  return 'desktop';
};

const styles = {
  wizardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wizardHeader: {
    alignItems: 'center',
    paddingVertical: Responsive.spacing.lg,
    paddingHorizontal: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepCounter: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.xs,
  },
  stepTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Responsive.spacing.sm,
  },
  deviceName: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginLeft: Responsive.spacing.xs,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: Responsive.padding.screen,
  },
  deviceSelector: {
    marginVertical: Responsive.spacing.md,
  },
  deviceSelectorTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  deviceSelectorScroll: {
    paddingHorizontal: Responsive.spacing.xs,
  },
  deviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.padding.button,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.medium,
    marginRight: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceChipActive: {
    backgroundColor: CheckVariants.wizard.accent,
    borderColor: CheckVariants.wizard.accent,
  },
  deviceChipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Responsive.spacing.xs,
  },
  deviceChipTextActive: {
    color: Colors.textPrimary,
  },
  deviceChipProgress: {
    marginLeft: Responsive.spacing.sm,
  },
  deviceChipProgressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  actionCard: {
    marginVertical: Responsive.spacing.md,
  },
  stepInstructions: {
    marginVertical: Responsive.spacing.lg,
    padding: Responsive.padding.card,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
  },
  instructionsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  instructionsText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.md,
  },
  actionSteps: {
    marginTop: Responsive.spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: Responsive.spacing.sm,
  },
  stepNumber: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: CheckVariants.wizard.accent,
    marginRight: Responsive.spacing.sm,
    minWidth: 20,
  },
  stepText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: Typography.sizes.md * 1.4,
  },
  wizardNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    backgroundColor: 'transparent',
    minHeight: Responsive.buttonHeight.medium,
  },
  backButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: CheckVariants.wizard.accent,
    marginLeft: Responsive.spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    backgroundColor: Colors.success,
    minHeight: Responsive.buttonHeight.medium,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  nextButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.md,
    marginBottom: Responsive.spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.5,
  },
  // New device card styles
  overallProgressText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.sm,
    textAlign: 'center',
  },
  deviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  deviceProgress: {
    alignItems: 'flex-end',
  },
  deviceProgressText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  deviceProgressBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Responsive.spacing.md,
  },
  deviceProgressFill: {
    height: '100%',
    backgroundColor: CheckVariants.wizard.accent,
    borderRadius: 2,
  },
  actionSection: {
    marginTop: Responsive.spacing.md,
  },
  stepHeader: {
    marginBottom: Responsive.spacing.md,
  },
  deviceNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Responsive.spacing.md,
    paddingTop: Responsive.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  completeButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginRight: Responsive.spacing.xs,
  },

  deviceCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.md,
    backgroundColor: Colors.success,
    borderRadius: Responsive.borderRadius.medium,
    minHeight: Responsive.buttonHeight.medium,
  },
  deviceCompleteButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.xs,
  },
};

export default WizardFlow;
