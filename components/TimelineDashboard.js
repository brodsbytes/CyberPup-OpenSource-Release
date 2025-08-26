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
import CircularProgress from './CircularProgress';
import ProgressiveActionCard from './ProgressiveActionCard';

const TimelineDashboard = ({ 
  userDevices, 
  deviceActions, 
  onActionComplete, 
  onStatusChange,
  variant = 'timeline',
  checkId,
  navigation,
  showUnifiedView = false
}) => {
  // ✅ UPDATED: Timeline-specific state
  const [selectedMilestone, setSelectedMilestone] = useState(0);
  const [milestoneProgress, setMilestoneProgress] = useState({});
  const [showMilestoneDetails, setShowMilestoneDetails] = useState(false);
  
  // Auto-expand first milestone when component loads
  useEffect(() => {
    if (userDevices.length > 0 && Object.keys(deviceActions).length > 0) {
      setShowMilestoneDetails(true);
      setSelectedMilestone(0);
    }
  }, [userDevices, deviceActions]);
  
  // Calculate total milestones across all devices
  const getTotalMilestones = () => {
    if (showUnifiedView) {
      // For unified view, count actions from first device only
      const firstDevice = userDevices[0];
      if (firstDevice) {
        const actions = deviceActions[firstDevice.id] || [];
        return actions.length;
      }
      return 0;
    }
    
    let total = 0;
    userDevices.forEach(device => {
      const actions = deviceActions[device.id] || [];
      total += actions.length;
    });
    return total;
  };
  
  // Calculate current progress
  const calculateProgress = () => {
    if (showUnifiedView) {
      // For unified view, calculate progress from first device only
      const firstDevice = userDevices[0];
      if (firstDevice) {
        const actions = deviceActions[firstDevice.id] || [];
        const total = actions.length;
        const completed = actions.filter(action => action.completed).length;
        return total > 0 ? (completed / total) * 100 : 0;
      }
      return 0;
    }
    
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
  
  // Get all milestones across all devices
  const getAllMilestones = () => {
    const milestones = [];
    
    if (showUnifiedView) {
      // For unified view, show actions from the first device only (they're all the same)
      const firstDevice = userDevices[0];
      if (firstDevice) {
        const actions = deviceActions[firstDevice.id] || [];
        actions.forEach(action => {
          milestones.push({
            id: action.id,
            title: action.title,
            description: action.description,
            completed: action.completed,
            device: firstDevice,
            action: action
          });
        });
      }
    } else {
      // Original device-specific logic
      userDevices.forEach(device => {
        const actions = deviceActions[device.id] || [];
        actions.forEach(action => {
          milestones.push({
            id: action.id,
            title: action.title,
            description: action.description,
            completed: action.completed,
            device: device,
            action: action
          });
        });
      });
    }
    
    return milestones;
  };
  
  // Handle timeline action completion
  const handleTimelineActionComplete = async (deviceId, actionId, completed) => {
    if (showUnifiedView) {
      // For unified view, only call onActionComplete once
      // The screen's handler will take care of marking all devices
      await onActionComplete(deviceId, actionId, completed);
    } else {
      // Original device-specific logic
      await onActionComplete(deviceId, actionId, completed);
    }
    
    // Haptic feedback
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Update milestone progress
    setMilestoneProgress(prev => ({
      ...prev,
      [actionId]: completed
    }));

    // Auto-advance to next milestone if completed
    if (completed) {
      const currentMilestoneIndex = selectedMilestone;
      const nextMilestoneIndex = currentMilestoneIndex + 1;
      
      // If there's a next milestone, advance to it
      if (nextMilestoneIndex < milestones.length) {
        setTimeout(() => {
          setSelectedMilestone(nextMilestoneIndex);
          // Keep the details open for the next milestone
          // The key prop on ProgressiveActionCard will force a re-render
        }, 1000); // Small delay to show completion feedback
      } else {
        // If this was the last milestone, close the details
        setTimeout(() => {
          setShowMilestoneDetails(false);
        }, 1000);
      }
    }
  };


  
  // Handle milestone selection
  const handleMilestoneSelect = (milestoneIndex) => {
    setSelectedMilestone(milestoneIndex);
    setShowMilestoneDetails(true);
    
    // Haptic feedback
    if (Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Calculate overall progress directly
  const totalMilestones = getTotalMilestones();
  const timelineProgress = calculateProgress();
  const milestones = getAllMilestones();
  
  if (userDevices.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="shield-checkmark" size={Responsive.iconSizes.xxlarge} color={CheckVariants.timeline.accent} />
        <Text style={styles.emptyStateTitle}>No Actions Required</Text>
        <Text style={styles.emptyStateText}>
          All security settings are already configured for your accounts.
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.timelineContainer}>
      {/* Overall Progress Header */}
      <View style={[styles.timelineHeader, styles[variant]]}>
        <CircularProgress 
          progress={timelineProgress} 
          size={Responsive.iconSizes.xxlarge} 
          strokeWidth={8}
          color={CheckVariants.timeline.accent}
          showText={false}
        />
        <Text style={styles.overallProgressText}>
          Overall Progress: {Math.round(timelineProgress)}%
        </Text>
        <Text style={styles.milestoneCount}>
          {milestones.filter(m => m.completed).length} of {totalMilestones} milestones completed
          </Text>
        </View>
        
      {/* Timeline Overview */}
      <View style={styles.timelineOverview}>
        <Text style={styles.timelineTitle}>Security Milestones</Text>
        <Text style={styles.timelineSubtitle}>
          {showUnifiedView 
            ? 'Complete each milestone to secure your high-value accounts across all your devices'
            : 'Complete each milestone to secure your high-value accounts'
          }
        </Text>
      </View>
      
      {/* Horizontal Timeline */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.timelineScroll}
        contentContainerStyle={styles.timelineScrollContent}
      >
        {milestones.map((milestone, index) => (
          <TouchableOpacity
            key={milestone.id}
            style={[
              styles.timelineMilestone,
              milestone.completed && styles.timelineMilestoneCompleted,
              selectedMilestone === index && styles.timelineMilestoneSelected
            ]}
            onPress={() => handleMilestoneSelect(index)}
            activeOpacity={0.8}
          >
            {/* Milestone Marker */}
    <View style={[
              styles.milestoneMarker,
              milestone.completed && styles.milestoneMarkerCompleted
            ]}>
              {milestone.completed ? (
                <Ionicons 
                  name="checkmark" 
                  size={Responsive.iconSizes.small} 
                  color={Colors.textPrimary} 
                />
      ) : (
        <Text style={styles.milestoneNumber}>{index + 1}</Text>
      )}
    </View>
            
            {/* Milestone Title */}
            <Text style={[
              styles.milestoneTitle,
              milestone.completed && styles.milestoneTitleCompleted
            ]}>
              {milestone.title}
            </Text>
            
            {/* Connection Line */}
            {index < milestones.length - 1 && (
              <View style={[
                styles.milestoneConnection,
                milestone.completed && styles.milestoneConnectionCompleted
              ]} />
            )}
    </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Milestone Details */}
      {showMilestoneDetails && milestones[selectedMilestone] && (
        <View style={styles.milestoneDetails}>
          <View style={styles.milestoneDetailsHeader}>
      <TouchableOpacity
              style={styles.closeDetailsButton}
              onPress={() => setShowMilestoneDetails(false)}
            >
              <Ionicons name="close" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.milestoneDetailsTitle}>
              {milestones[selectedMilestone].title}
            </Text>
        </View>
        
          <Text style={styles.milestoneDetailsDescription}>
            {milestones[selectedMilestone].description}
          </Text>
          
          {/* Action Card */}
          <View style={styles.actionCard}>
            <ProgressiveActionCard
              key={milestones[selectedMilestone].action.id} // Force re-render when milestone changes
              action={milestones[selectedMilestone].action}
              device={milestones[selectedMilestone].device}
              onComplete={(actionId, completed) => 
                handleTimelineActionComplete(milestones[selectedMilestone].device.id, actionId, completed)
              }
              variant="timeline"
            />
          </View>


          
          {/* Milestone Tips */}
          {milestones[selectedMilestone].action.tips && (
            <View style={styles.milestoneTips}>
              <Text style={styles.tipsTitle}>💡 Tips:</Text>
              {milestones[selectedMilestone].action.tips.map((tip, tipIndex) => (
                <Text key={tipIndex} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = {
  timelineContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  timelineHeader: {
    alignItems: 'center',
    paddingVertical: Responsive.spacing.lg,
    paddingHorizontal: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overallProgressText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.sm,
    textAlign: 'center',
  },
  milestoneCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
    textAlign: 'center',
  },
  timelineOverview: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
  },
  timelineTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  timelineSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
  },
  timelineScroll: {
    maxHeight: 120,
  },
  timelineScrollContent: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
  },
  timelineMilestone: {
    alignItems: 'center',
    marginRight: Responsive.spacing.lg,
    minWidth: 100,
  },
  timelineMilestoneCompleted: {
    opacity: 0.7,
  },
  timelineMilestoneSelected: {
    transform: [{ scale: 1.1 }],
  },
  milestoneMarker: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: CheckVariants.timeline.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  milestoneMarkerCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  milestoneNumber: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: CheckVariants.timeline.accent,
  },
  milestoneTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.3,
  },
  milestoneTitleCompleted: {
    color: Colors.success,
  },
  milestoneConnection: {
    position: 'absolute',
    top: Responsive.iconSizes.xlarge / 2 - 1,
    right: -Responsive.spacing.lg / 2,
    width: Responsive.spacing.lg,
    height: 2,
    backgroundColor: Colors.border,
  },
  milestoneConnectionCompleted: {
    backgroundColor: Colors.success,
  },
  milestoneDetails: {
    backgroundColor: Colors.surface,
    margin: Responsive.padding.screen,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  milestoneDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  closeDetailsButton: {
    marginRight: Responsive.spacing.sm,
  },
  milestoneDetailsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  milestoneDetailsDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
    marginBottom: Responsive.spacing.md,
  },
  actionCard: {
    marginVertical: Responsive.spacing.md,
  },
  milestoneTips: {
    marginTop: Responsive.spacing.md,
    paddingTop: Responsive.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tipsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.xs,
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

};

export default TimelineDashboard;
