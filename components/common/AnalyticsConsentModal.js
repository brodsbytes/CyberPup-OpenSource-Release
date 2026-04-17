/**
 * Analytics Consent Modal
 * Privacy-first consent mechanism for analytics tracking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

const AnalyticsConsentModal = ({ 
  visible, 
  onAccept, 
  onDecline, 
  onClose 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleAccept = () => {
    onAccept();
    onClose();
  };

  const handleDecline = () => {
    onDecline();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="analytics-outline" 
                  size={32} 
                  color={Colors.accent} 
                />
              </View>
              <Text style={styles.title}>Help Improve CyberPup</Text>
              <Text style={styles.subtitle}>
                We'd like to collect anonymous usage data to make CyberPup better for everyone.
              </Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.description}>
                We collect anonymous data about how people use CyberPup to help us improve the app and create a positive cybersecurity experience.
              </Text>

              {/* What we collect */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What we collect:</Text>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.bulletText}>App performance and crashes</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.bulletText}>What features you use most</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.bulletText}>Learning progress and completion rates</Text>
                </View>
              </View>

              {/* What we don't collect */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>What we DON'T collect:</Text>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={16} color={Colors.error} />
                  <Text style={styles.bulletText}>Personal information or email addresses</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={16} color={Colors.error} />
                  <Text style={styles.bulletText}>Device information you enter</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={16} color={Colors.error} />
                  <Text style={styles.bulletText}>Your location or personal files</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={16} color={Colors.error} />
                  <Text style={styles.bulletText}>Any sensitive information</Text>
                </View>
              </View>

              {/* Privacy guarantees */}
              <View style={styles.privacyBox}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.accent} />
                <View style={styles.privacyContent}>
                  <Text style={styles.privacyTitle}>Privacy First</Text>
                  <Text style={styles.privacyText}>
                    All data is anonymous and encrypted. You can opt out anytime in Settings.
                  </Text>
                </View>
              </View>

              {/* Toggle for more details */}
              <TouchableOpacity 
                style={styles.detailsToggle}
                onPress={() => setShowDetails(!showDetails)}
              >
                <Text style={styles.detailsToggleText}>
                  {showDetails ? 'Hide' : 'Show'} technical details
                </Text>
                <Ionicons 
                  name={showDetails ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={Colors.accent} 
                />
              </TouchableOpacity>

              {/* Technical details */}
              {showDetails && (
                <View style={styles.technicalDetails}>
                  <Text style={styles.technicalTitle}>Technical Details:</Text>
                  <Text style={styles.technicalText}>
                    • Data is processed by PostHog, a privacy-focused analytics platform{'\n'}
                    • Anonymous user IDs are generated locally on your device{'\n'}
                    • No personal data is transmitted or stored{'\n'}
                    • Data is used solely for app improvement{'\n'}
                    • You maintain full control over your data
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
            >
              <Text style={styles.declineButtonText}>No Thanks</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>Help Improve CyberPup</Text>
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <Text style={styles.footerNote}>
            You can change this preference anytime in Settings
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Responsive.spacing.lg,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    maxWidth: screenWidth * 0.9,
    maxHeight: '80%',
    width: '100%',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.25)',
    } : {
      elevation: 8,
      shadowColor: Colors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    }),
  },
  scrollView: {
    maxHeight: '85%',
  },
  header: {
    alignItems: 'center',
    paddingTop: Responsive.spacing.lg,
    paddingHorizontal: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
  },
  iconContainer: {
    width: Responsive.iconSizes.xxlarge + 16,
    height: Responsive.iconSizes.xxlarge + 16,
    borderRadius: (Responsive.iconSizes.xxlarge + 16) / 2,
    backgroundColor: Colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
  },
  content: {
    paddingHorizontal: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.lg,
  },
  section: {
    marginBottom: Responsive.spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  bulletText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    marginLeft: Responsive.spacing.sm,
    flex: 1,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  privacyBox: {
    flexDirection: 'row',
    backgroundColor: Colors.accentSoft,
    padding: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.large,
    marginBottom: Responsive.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  privacyContent: {
    marginLeft: Responsive.spacing.sm,
    flex: 1,
  },
  privacyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    marginBottom: Responsive.spacing.xs,
  },
  privacyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.sm,
  },
  detailsToggleText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accent,
    marginRight: Responsive.spacing.xs,
  },
  technicalDetails: {
    backgroundColor: Colors.background,
    padding: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    marginBottom: Responsive.spacing.sm,
  },
  technicalTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  technicalText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.xs * 1.4,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Responsive.spacing.lg,
    paddingVertical: Responsive.spacing.md,
    gap: Responsive.spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: Responsive.spacing.sm,
    borderRadius: Responsive.borderRadius.large,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  declineButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  acceptButton: {
    backgroundColor: Colors.accent,
  },
  declineButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  acceptButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  footerNote: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
  },
});

export default AnalyticsConsentModal;
