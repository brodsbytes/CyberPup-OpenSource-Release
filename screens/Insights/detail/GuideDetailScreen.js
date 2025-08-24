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
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { GuideService } from '../../../utils/guideService';

const { width } = Dimensions.get('window');

const GuideDetailScreen = ({ navigation, route }) => {
  const { id: guideId } = route.params || {};
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    loadGuideDetail();
  }, [guideId]);

  const loadGuideDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!guideId) {
        throw new Error('No guide ID provided');
      }

      const guideDetail = await GuideService.getGuideById(guideId);
      setGuide(guideDetail);
    } catch (err) {
      console.log('Error loading guide detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToCheck = () => {
    if (!guide?.relatedCheckId) return;

    const checkRoutes = {
      '1-1-1': 'Check1_1_1_StrongPasswordsEnhancedScreen',
      '1-1-3': 'Check1_3_PasswordManagersScreen',
      '1-1-4': 'Check1_4_MFASetupScreen',
      '1-1-5': 'Check1_5_BreachCheckScreen',
    };

    const routeName = checkRoutes[guide.relatedCheckId];
    if (routeName) {
      navigation.navigate(routeName);
    } else {
      Alert.alert('Coming Soon', 'This security check will be available in a future update.');
    }
  };

  const handleNavigateToTool = (toolId) => {
    // For now, show coming soon alert
    Alert.alert('Coming Soon', 'Interactive tools will be available in a future update.');
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'GUIDE':
        return Colors.success;
      case 'PLAYBOOK':
        return Colors.accent;
      case 'TUTORIAL':
        return Colors.warning;
      default:
        return Colors.success;
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner':
        return Colors.success;
      case 'Essential':
        return Colors.warning;
      case 'Advanced':
        return Colors.error;
      default:
        return Colors.textSecondary;
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

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollProgress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setReadingProgress(Math.min(Math.max(scrollProgress, 0), 1));
  };

  const renderHTMLContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Simple HTML to React Native Text conversion
    const cleanContent = htmlContent
      .replace(/<h1[^>]*>/gi, '\n\n')
      .replace(/<\/h1>/gi, '\n')
      .replace(/<h2[^>]*>/gi, '\n\n')
      .replace(/<\/h2>/gi, '\n')
      .replace(/<h3[^>]*>/gi, '\n')
      .replace(/<\/h3>/gi, '\n')
      .replace(/<p[^>]*>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<strong[^>]*>/gi, '')
      .replace(/<\/strong>/gi, '')
      .replace(/<em[^>]*>/gi, '')
      .replace(/<\/em>/gi, '')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<ul[^>]*>|<\/ul>/gi, '\n')
      .replace(/<ol[^>]*>/gi, '\n')
      .replace(/<\/ol>/gi, '\n')
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

  const renderKeyTakeaways = () => {
    if (!guide?.keyTakeaways || guide.keyTakeaways.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Takeaways</Text>
        <View style={styles.takeawaysCard}>
          {guide.keyTakeaways.map((takeaway, index) => (
            <View key={index} style={styles.takeawayItem}>
              <View style={styles.takeawayBullet}>
                <Ionicons name="checkmark" size={16} color={Colors.success} />
              </View>
              <Text style={styles.takeawayText}>{takeaway}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRelatedLinks = () => {
    if (!guide?.relatedLinks || guide.relatedLinks.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related Resources</Text>
        {guide.relatedLinks.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.relatedLinkCard}
            onPress={() => {
              if (link.checkId) {
                handleNavigateToCheck();
              } else if (link.toolId) {
                handleNavigateToTool(link.toolId);
              }
            }}
          >
            <View style={styles.relatedLinkContent}>
              <Ionicons 
                name={link.checkId ? "shield-checkmark" : "build"} 
                size={20} 
                color={Colors.accent} 
              />
              <Text style={styles.relatedLinkText}>{link.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
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
          <Text style={styles.headerTitle}>Guide</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Loading */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading guide...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !guide) {
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
          <Text style={styles.headerTitle}>Guide</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Error */}
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={Responsive.iconSizes.xxlarge} color={Colors.error} />
          <Text style={styles.errorTitle}>Guide Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || 'The requested guide could not be loaded.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadGuideDetail}
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
      
      {/* Header with Reading Progress */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Guide</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Reading Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${readingProgress * 100}%` }]} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Guide Header */}
        <View style={styles.guideHeader}>
          <View style={styles.guideTags}>
            <View style={[styles.guideTag, { backgroundColor: getTagColor(guide.tag) }]}>
              <Text style={styles.guideTagText}>{guide.tag}</Text>
            </View>
            <View style={[styles.difficultyTag, { backgroundColor: getDifficultyColor(guide.level) }]}>
              <Text style={styles.difficultyTagText}>{guide.level}</Text>
            </View>
          </View>
          
          <Text style={styles.guideTitle}>{guide.title}</Text>
          
          <View style={styles.guideMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{guide.readMinutes} min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{guide.author}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(guide.publishedDate)}</Text>
            </View>
          </View>
        </View>

        {/* Excerpt */}
        <View style={styles.section}>
          <Text style={styles.excerptText}>{guide.excerpt}</Text>
        </View>

        {/* Main Content */}
        {guide.fullContent && (
          <View style={styles.section}>
            <View style={styles.contentCard}>
              {renderHTMLContent(guide.fullContent)}
            </View>
          </View>
        )}

        {/* Key Takeaways */}
        {renderKeyTakeaways()}

        {/* Action Button */}
        {guide.relatedCheckId && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryAction]}
              onPress={handleNavigateToCheck}
            >
              <Ionicons name="shield-checkmark" size={20} color={Colors.textPrimary} />
              <Text style={styles.actionButtonText}>Practice This Security Check</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Related Links */}
        {renderRelatedLinks()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This guide is part of the CyberPup security education series. 
            {guide.lastUpdated && ` Last updated: ${formatDate(guide.lastUpdated)}`}
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
  progressContainer: {
    height: 3,
    backgroundColor: Colors.border,
  },
  progressBar: {
    height: 3,
    backgroundColor: Colors.accent,
    transition: 'width 0.1s ease',
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
  guideHeader: {
    padding: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  guideTags: {
    flexDirection: 'row',
    gap: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.md,
  },
  guideTag: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  guideTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  difficultyTag: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  difficultyTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  guideTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.xxl * 1.2,
    marginBottom: Responsive.spacing.md,
  },
  guideMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  excerptText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.lg * 1.5,
    fontStyle: 'italic',
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
  takeawaysCard: {
    ...CommonStyles.premiumCard,
    backgroundColor: Colors.surface,
    marginVertical: 0,
  },
  takeawayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.md,
  },
  takeawayBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
    marginTop: 2,
  },
  takeawayText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.md * 1.5,
    flex: 1,
  },
  relatedLinkCard: {
    ...CommonStyles.premiumCard,
    backgroundColor: Colors.surface,
    marginBottom: Responsive.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  relatedLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Responsive.spacing.md,
  },
  relatedLinkText: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  actionsSection: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
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
  actionButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
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

export default GuideDetailScreen;
