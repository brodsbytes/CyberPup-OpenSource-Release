import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { SecurityAlertsService } from '../../../utils/securityAlerts';
import { LocationUtils } from '../../../utils/locationUtils';

const AlertDetailScreen = ({ navigation, route }) => {
  const { alertId } = route.params || {};
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAlertDetail();
  }, [alertId]);

  const loadAlertDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!alertId) {
        throw new Error('No alert ID provided');
      }

      // Get user's country for context
      const userCountry = await LocationUtils.getUserCountry();
      const alertDetail = await SecurityAlertsService.getAlertById(alertId, userCountry);
      
      setAlert(alertDetail);
    } catch (err) {
      console.log('Error loading alert detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOriginalUrl = async () => {
    if (!alert?.originalUrl) return;

    Alert.alert(
      'Open Original Alert',
      `This will open the official ${alert.source} alert in your browser. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: async () => {
            try {
              await Linking.openURL(alert.originalUrl);
            } catch (error) {
              Alert.alert('Error', 'Unable to open the link. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleNavigateToCheck = () => {
    if (!alert?.relatedCheckId) return;

    const checkRoutes = {
      '1-1-1': 'Check1_1_StrongPasswordsScreen',
      '1-1-3': 'Check1_3_PasswordManagersScreen',
      '1-1-4': 'Check1_4_MFASetupScreen',
      '1-1-5': 'Check1_5_BreachCheckScreen',
    };

    const routeName = checkRoutes[alert.relatedCheckId];
    if (routeName) {
      navigation.navigate(routeName);
    }
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'NEW THREAT':
        return Colors.error;
      case 'BREACH':
        return Colors.warning;
      case 'VULNERABILITY':
        return Colors.orange;
      case 'SCAM':
        return Colors.red;
      default:
        return Colors.error;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const renderHTMLContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Simple HTML to React Native Text conversion
    // This is a basic implementation - in production you might want to use a library like react-native-render-html
    const cleanContent = htmlContent
      .replace(/<h[1-6][^>]*>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<em[^>]*>/gi, '')
      .replace(/<\/em>/gi, '')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>|<\/ol>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple newlines
      .trim();

    return (
      <Text style={styles.contentText}>
        {cleanContent}
      </Text>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alert Detail</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading alert...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !alert) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alert Detail</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Error */}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={Responsive.iconSizes.xxlarge} color={Colors.error} />
          <Text style={styles.errorTitle}>Alert Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || 'The requested alert could not be loaded.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadAlertDetail}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Alert</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Alert Header */}
        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <Text style={styles.alertTitle} numberOfLines={3}>
              {alert.title}
            </Text>
            <View style={[styles.alertTag, { backgroundColor: getTagColor(alert.tag) }]}>
              <Text style={styles.alertTagText}>{alert.tag}</Text>
            </View>
          </View>
          
          <View style={styles.alertMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{alert.source}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(alert.publishedDate)}</Text>
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>{alert.summary}</Text>
        </View>

        {/* Full Content */}
        {alert.fullContent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Information</Text>
            <View style={styles.contentCard}>
              {renderHTMLContent(alert.fullContent)}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {alert.originalUrl && (
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleOpenOriginalUrl}
            >
              <Ionicons name="open-outline" size={20} color={Colors.textPrimary} />
              <Text style={styles.actionButtonText}>View Original Alert</Text>
            </TouchableOpacity>
          )}

          {alert.relatedCheckId && (
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryAction]}
              onPress={handleNavigateToCheck}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.accent} />
              <Text style={[styles.actionButtonText, styles.secondaryActionText]}>Related Security Check</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This alert is provided by {alert.source} for your security awareness.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Responsive.spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: Responsive.iconSizes.large + Responsive.spacing.sm * 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Responsive.padding.screen,
  },
  errorTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginTop: Responsive.spacing.lg,
    marginBottom: Responsive.spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * 1.4,
    marginBottom: Responsive.spacing.xl,
  },
  retryButton: {
    ...CommonStyles.button,
    backgroundColor: Colors.accent,
  },
  retryButtonText: {
    ...CommonStyles.buttonText,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Responsive.spacing.xxl,
  },
  alertHeader: {
    padding: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.md,
  },
  alertTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Responsive.spacing.md,
    lineHeight: Typography.sizes.xl * 1.3,
  },
  alertTag: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.sm,
    borderRadius: Responsive.borderRadius.medium,
  },
  alertTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  alertMeta: {
    flexDirection: 'row',
    gap: Responsive.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.xs,
  },
  metaText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  section: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  summaryText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
  },
  contentCard: {
    ...CommonStyles.premiumCard,
    backgroundColor: Colors.surface,
    marginVertical: 0,
  },
  contentText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.6,
  },
  actionsSection: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    gap: Responsive.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Responsive.padding.button,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.sm,
    minHeight: Responsive.buttonHeight.large,
  },
  primaryAction: {
    backgroundColor: Colors.accent,
  },
  secondaryAction: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  actionButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  secondaryActionText: {
    color: Colors.accent,
  },
  footer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    marginTop: Responsive.spacing.lg,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: Typography.sizes.sm * 1.4,
  },
});

export default AlertDetailScreen;
