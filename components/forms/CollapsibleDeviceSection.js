import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';
import ProgressiveActionCard from '../../components/ui/ProgressiveActionCard';
import * as Haptics from 'expo-haptics';

// Note: setLayoutAnimationEnabledExperimental is deprecated in New Architecture
// Layout animations are now handled automatically by the New Architecture

/**
 * CollapsibleDeviceSection - Multi-device content container
 * 
 * Handles device-specific content with smooth animations.
 * Automatically manages expansion state and provides visual feedback.
 * Optimized for responsive design and accessibility.
 */
const CollapsibleDeviceSection = ({ 
  device, 
  actions, 
  onActionComplete, 
  defaultExpanded = false,
  style,
  variant = 'pattern-b' // Default to pattern-b for backward compatibility
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const rotationValue = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  const pressAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate chevron rotation when expanded state changes
    Animated.timing(rotationValue, {
      toValue: expanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [expanded]);

  const toggleExpanded = async () => {
    // Haptic feedback for interaction
    if (Haptics?.impactAsync) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Press animation
    Animated.sequence([
      Animated.timing(pressAnimation, { 
        toValue: 0.98, 
        duration: 100, 
        useNativeDriver: true 
      }),
      Animated.timing(pressAnimation, { 
        toValue: 1, 
        duration: 100, 
        useNativeDriver: true 
      })
    ]).start();

    // Layout animation for smooth expansion/collapse
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    const newExpanded = !expanded;
    setExpanded(newExpanded);
    
    if (onToggle) {
      onToggle(device.id, newExpanded);
    }
  };

  const getDeviceIcon = () => {
    if (device.icon) {
      return device.icon;
    }

    // Map device types to appropriate icons
    const iconMap = {
      'iPhone': 'phone-portrait',
      'iPad': 'tablet-portrait',
      'Android Phone': 'phone-portrait',
      'Android Tablet': 'tablet-portrait',
      'MacBook': 'laptop',
      'iMac': 'desktop',
      'Windows': 'laptop',
      'Computer': 'desktop',
    };

    return iconMap[device.type] || iconMap[device.name] || 'phone-portrait';
  };

  const getCompletionStatus = () => {
    if (!actions || actions.length === 0) return 'none';
    
    const completed = actions.filter(action => action.completed).length;
    const total = actions.length;
    
    if (completed === 0) return 'none';
    if (completed === total) return 'complete';
    return 'partial';
  };

  const getStatusColor = () => {
    const status = getCompletionStatus();
    switch (status) {
      case 'complete':
        return Colors.success;
      case 'partial':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = () => {
    const status = getCompletionStatus();
    switch (status) {
      case 'complete':
        return 'checkmark-circle';
      case 'partial':
        return 'time-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const handleActionComplete = (actionId, completed) => {
    if (onActionComplete) {
      onActionComplete(device.id, actionId, completed);
    }
  };

  const chevronRotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const renderProgressIndicator = () => {
    if (!actions || actions.length === 0) return null;
    
    const completed = actions.filter(action => action.completed).length;
    const total = actions.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: getStatusColor() }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {completed}/{total}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Device Header - Always Visible */}
      <Animated.View style={[styles.header, { transform: [{ scale: pressAnimation }] }]}>
        <TouchableOpacity 
          style={styles.headerContent} 
          onPress={toggleExpanded}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${device.name || device.type} settings`}
          accessibilityHint="Tap to toggle device-specific security settings"
        >
          {/* Device Icon */}
          <View style={[styles.deviceIconContainer, { borderColor: getStatusColor() }]}>
            <Ionicons 
              name={getDeviceIcon()} 
              size={Responsive.iconSizes.large} 
              color={getStatusColor()} 
            />
          </View>

          {/* Device Info */}
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceName}>
              {device.name || device.type}
            </Text>
            <Text style={styles.devicePlatform}>
              {device.platform === 'ios' ? 'iOS' : device.platform === 'android' ? 'Android' : device.platform} {device.version ? ` • ${device.version}` : ''}
            </Text>
            {device.autoDetected && (
              <View style={styles.autoDetectedBadge}>
                <Text style={styles.autoDetectedText}>Current Device</Text>
              </View>
            )}
          </View>

          {/* Progress & Status */}
          <View style={styles.statusContainer}>
            {actions && actions.length > 0 && renderProgressIndicator()}
            <View style={styles.statusIcon}>
              <Ionicons 
                name={getStatusIcon()} 
                size={Responsive.iconSizes.medium} 
                color={getStatusColor()} 
              />
            </View>
          </View>

          {/* Chevron Icon */}
          <Animated.View 
            style={[
              styles.chevronContainer,
              { transform: [{ rotate: chevronRotation }] }
            ]}
          >
            <Ionicons 
              name="chevron-down" 
              size={Responsive.iconSizes.medium} 
              color={Colors.textSecondary} 
            />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {/* Expandable Content */}
      {expanded && (
        <View style={styles.content}>
          {/* Device-specific messaging */}
          {device.autoDetected && (
            <View style={styles.currentDeviceNotice}>
              <Ionicons 
                name="information-circle" 
                size={Responsive.iconSizes.medium} 
                color={Colors.accent} 
              />
              <Text style={styles.currentDeviceText}>
                This is your current device. Settings will open directly.
              </Text>
            </View>
          )}

          {/* Actions List */}
          {actions && actions.length > 0 ? (
            <View style={styles.actionsContainer}>
              {actions.map((action, index) => (
                <ProgressiveActionCard
                  key={action.id || index}
                  action={action}
                  device={device}
                  onComplete={handleActionComplete}
                  style={styles.actionCard}
                  variant={variant}
                />
              ))}
            </View>
          ) : (
            <View style={styles.noActionsContainer}>
              <Ionicons 
                name="checkmark-circle" 
                size={Responsive.iconSizes.xlarge} 
                color={Colors.success} 
              />
              <Text style={styles.noActionsTitle}>All Set!</Text>
              <Text style={styles.noActionsText}>
                No additional security actions needed for this device.
              </Text>
            </View>
          )}

          {/* Device-specific tips or warnings */}
          {device.securityTips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Security Tips</Text>
              {device.securityTips.map((tip, index) => (
                <Text key={index} style={styles.tipText}>
                  • {tip}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    marginVertical: Responsive.spacing.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    backgroundColor: Colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Responsive.padding.card,
  },
  deviceIconContainer: {
    width: Responsive.iconSizes.xxlarge,
    height: Responsive.iconSizes.xxlarge,
    borderRadius: Responsive.iconSizes.xxlarge / 2,
    backgroundColor: Colors.overlayLight,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
  },
  deviceInfo: {
    flex: 1,
    marginRight: Responsive.spacing.md,
  },
  deviceName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  devicePlatform: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: Responsive.spacing.xs,
  },
  autoDetectedBadge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
    alignSelf: 'flex-start',
  },
  autoDetectedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  statusContainer: {
    alignItems: 'flex-end',
    marginRight: Responsive.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.xs,
  },
  progressBackground: {
    width: 40,
    height: 4,
    backgroundColor: Colors.overlayLight,
    borderRadius: 2,
    marginRight: Responsive.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  statusIcon: {
    alignItems: 'center',
  },
  chevronContainer: {
    padding: Responsive.spacing.xs,
  },
  content: {
    backgroundColor: Colors.overlayLight,
    paddingHorizontal: Responsive.padding.card,
    paddingBottom: Responsive.padding.card,
  },
  currentDeviceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    padding: Responsive.padding.card,
    borderRadius: Responsive.borderRadius.medium,
    marginBottom: Responsive.spacing.md,
  },
  currentDeviceText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Responsive.spacing.sm,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  actionsContainer: {
    gap: Responsive.spacing.sm,
  },
  actionCard: {
    marginVertical: 0,
  },
  noActionsContainer: {
    alignItems: 'center',
    padding: Responsive.padding.modal,
  },
  noActionsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    marginTop: Responsive.spacing.md,
    marginBottom: Responsive.spacing.sm,
  },
  noActionsText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
  },
  tipsContainer: {
    backgroundColor: Colors.overlayMedium,
    padding: Responsive.padding.card,
    borderRadius: Responsive.borderRadius.medium,
    marginTop: Responsive.spacing.md,
  },
  tipsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.5,
    marginBottom: Responsive.spacing.xs,
  },
});

export default CollapsibleDeviceSection;