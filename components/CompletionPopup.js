import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Responsive } from '../theme';

const CompletionPopup = ({
  isVisible,
  title,
  description,
  nextScreenName,
  navigation,
  onContinue,
  onClose,
  variant = 'modal',
  checkId = null
}) => {
  if (!isVisible) return null;

  const handleContinue = async () => {
    // Mark the check as complete in AsyncStorage if checkId is provided
    if (checkId) {
      try {
        await AsyncStorage.setItem(`check_${checkId}_completed`, 'completed');
        console.log(`✅ Marked check ${checkId} as completed`);
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
    if (onClose) {
      onClose();
    }
  };

  if (variant === 'alert') {
    // For now, we'll use a simple modal instead of Alert.alert
    // since Alert.alert doesn't work well with custom styling
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
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
          </TouchableOpacity>
          
          <View style={styles.celebrationIcon}>
            <Ionicons name="trophy" size={Responsive.iconSizes.xxlarge} color={Colors.success} />
          </View>
          
          <Text style={styles.modalTitle}>🎉 {title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={Responsive.iconSizes.medium} color={Colors.textPrimary} />
            </TouchableOpacity>
            

          </View>
        </View>
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
  secondaryButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: Responsive.buttonHeight.medium,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
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
  goBackButton: {
    backgroundColor: Colors.surface,
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: Responsive.buttonHeight.medium,
  },
  goBackButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
});

export default CompletionPopup;
