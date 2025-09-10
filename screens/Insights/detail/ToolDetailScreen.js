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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../../../theme';
import { ToolService } from '../../../utils/toolService';
import { trackToolUsage, trackEvent } from '../../../utils/analytics';

const ToolDetailScreen = ({ navigation, route }) => {
  const { id: toolId } = route.params || {};
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interactionInput, setInteractionInput] = useState('');
  const [interactionResult, setInteractionResult] = useState(null);
  const [interactionLoading, setInteractionLoading] = useState(false);

  useEffect(() => {
    loadToolDetail();
    
    // Track tool detail view
    if (toolId) {
      trackToolUsage(toolId, 'detail_viewed', {
        source: 'tool_detail_screen'
      });
    }
  }, [toolId]);

  const loadToolDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!toolId) {
        throw new Error('No tool ID provided');
      }

      const toolDetail = await ToolService.getToolById(toolId);
      setTool(toolDetail);
    } catch (err) {
      console.log('Error loading tool detail:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTool = async () => {
    if (!interactionInput.trim()) {
      Alert.alert('Input Required', 'Please enter some text to analyze.');
      return;
    }

    setInteractionLoading(true);
    try {
      let inputData = {};
      
      // Determine input type based on tool
      switch (tool.mockInteraction.type) {
        case 'password-checker':
          inputData = { password: interactionInput };
          break;
        case 'breach-lookup':
          inputData = { email: interactionInput };
          break;
        case 'link-checker':
          inputData = { url: interactionInput };
          break;
        case 'scam-detector':
          inputData = { message: interactionInput };
          break;
        default:
          inputData = { input: interactionInput };
      }

      const result = await ToolService.performMockInteraction(toolId, inputData);
      setInteractionResult(result);
    } catch (error) {
      Alert.alert('Error', 'Unable to process your request. Please try again.');
    } finally {
      setInteractionLoading(false);
    }
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'CHECKER':
        return Colors.success;
      case 'LOOKUP':
        return Colors.warning;
      case 'WIZARD':
        return Colors.accent;
      default:
        return Colors.success;
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

  const renderInteractionResult = () => {
    if (!interactionResult) return null;

    if (interactionResult.error) {
      return (
        <View style={styles.resultCard}>
          <Text style={styles.resultError}>{interactionResult.error}</Text>
        </View>
      );
    }

    switch (tool.mockInteraction.type) {
      case 'password-checker':
        return (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Password Analysis</Text>
              <View style={[styles.scoreChip, { backgroundColor: interactionResult.score >= 60 ? Colors.success : Colors.error }]}>
                <Text style={styles.scoreText}>{interactionResult.score}/100</Text>
              </View>
            </View>
            <Text style={styles.strengthText}>Strength: {interactionResult.strength}</Text>
            <Text style={styles.crackTimeText}>Estimated crack time: {interactionResult.estimatedCrackTime}</Text>
            
            {interactionResult.issues.length > 0 && (
              <View style={styles.issuesContainer}>
                <Text style={styles.issuesTitle}>Issues:</Text>
                {interactionResult.issues.map((issue, index) => (
                  <Text key={index} style={styles.issueText}>• {issue}</Text>
                ))}
              </View>
            )}
            
            {interactionResult.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                {interactionResult.suggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.suggestionText}>• {suggestion}</Text>
                ))}
              </View>
            )}
          </View>
        );

      case 'breach-lookup':
        return (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Breach Lookup Results</Text>
            <Text style={styles.resultMessage}>{interactionResult.message}</Text>
            
            {interactionResult.breaches && interactionResult.breaches.length > 0 && (
              <View style={styles.breachesContainer}>
                {interactionResult.breaches.map((breach, index) => (
                  <View key={index} style={styles.breachItem}>
                    <View style={styles.breachHeader}>
                      <Text style={styles.breachName}>{breach.name || breach}</Text>
                      {breach.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓ Verified</Text>
                        </View>
                      )}
                    </View>
                    
                    <Text style={styles.breachDate}>Date: {breach.date || 'Unknown'}</Text>
                    <Text style={styles.breachRecords}>Records: {breach.records || 'Unknown'}</Text>
                    
                    {breach.industry && breach.industry !== 'Unknown' && (
                      <Text style={styles.breachIndustry}>Industry: {breach.industry}</Text>
                    )}
                    
                    <Text style={styles.breachData}>
                      Data: {breach.dataTypes ? 
                        (Array.isArray(breach.dataTypes) ? breach.dataTypes.join(', ') : breach.dataTypes) : 
                        'Email addresses and potentially other data'
                      }
                    </Text>
                    
                    {breach.passwordRisk && breach.passwordRisk !== 'unknown' && (
                      <View style={[styles.riskBadge, { 
                        backgroundColor: breach.passwordRisk === 'plaintext' ? Colors.error : 
                                       breach.passwordRisk === 'easytocrack' ? Colors.warning : Colors.success 
                      }]}>
                        <Text style={styles.passwordRiskText}>
                          Password Risk: {breach.passwordRisk === 'plaintext' ? 'High (Plain Text)' : 
                                        breach.passwordRisk === 'easytocrack' ? 'Medium (Weak Hash)' : 'Low (Strong Hash)'}
                        </Text>
                      </View>
                    )}
                    
                    {breach.description && (
                      <Text style={styles.breachDescription} numberOfLines={3}>
                        {breach.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Enhanced recommendations section */}
            {interactionResult.recommendations && interactionResult.recommendations.length > 0 && (
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommended Actions:</Text>
                {interactionResult.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 'link-checker':
        return (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Link Analysis</Text>
              <View style={[styles.statusChip, { backgroundColor: 
                interactionResult.status === 'SAFE' ? Colors.success :
                interactionResult.status === 'SUSPICIOUS' ? Colors.warning : Colors.error
              }]}>
                <Text style={styles.statusText}>{interactionResult.status}</Text>
              </View>
            </View>
            
            <Text style={styles.recommendationText}>{interactionResult.recommendation}</Text>
            
            {interactionResult.risks.length > 0 && (
              <View style={styles.risksContainer}>
                <Text style={styles.risksTitle}>Risk Factors:</Text>
                {interactionResult.risks.map((risk, index) => (
                  <Text key={index} style={styles.riskFactorText}>• {risk}</Text>
                ))}
              </View>
            )}
          </View>
        );

      case 'scam-detector':
        return (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Scam Analysis</Text>
              <View style={[styles.riskChip, { backgroundColor: 
                interactionResult.riskLevel === 'LOW' ? Colors.success :
                interactionResult.riskLevel === 'MEDIUM' ? Colors.warning : Colors.error
              }]}>
                <Text style={styles.riskText}>{interactionResult.riskLevel} RISK</Text>
              </View>
            </View>
            
            <Text style={styles.scamTypeText}>Type: {interactionResult.scamType}</Text>
            <Text style={styles.recommendationText}>{interactionResult.recommendation}</Text>
            
            {interactionResult.indicators.length > 0 && (
              <View style={styles.indicatorsContainer}>
                <Text style={styles.indicatorsTitle}>Warning Signs:</Text>
                {interactionResult.indicators.map((indicator, index) => (
                  <Text key={index} style={styles.indicatorText}>• {indicator}</Text>
                ))}
              </View>
            )}
          </View>
        );

      default:
        return (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis Complete</Text>
            <Text style={styles.resultMessage}>Tool analysis completed successfully.</Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Tool</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading tool...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !tool) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Security Tool</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="construct-outline" size={Responsive.iconSizes.xxlarge} color={Colors.error} />
          <Text style={styles.errorTitle}>Tool Not Found</Text>
          <Text style={styles.errorMessage}>
            {error || 'The requested tool could not be loaded.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadToolDetail}
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
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Tool</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.toolHeader}>
          <View style={styles.toolTags}>
            <View style={[styles.toolTag, { backgroundColor: getTagColor(tool.tag) }]}>
              <Text style={styles.toolTagText}>{tool.tag}</Text>
            </View>
            <View style={styles.etaTag}>
              <Text style={styles.etaTagText}>{tool.etaLabel}</Text>
            </View>
          </View>
          
          <Text style={styles.toolTitle}>{tool.title}</Text>
          
          <View style={styles.toolMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="person" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{tool.author}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{formatDate(tool.lastUpdated)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.descriptionText}>{tool.fullDescription}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Try It Now</Text>
          <View style={styles.interactionCard}>
            <TextInput
              style={styles.interactionInput}
              placeholder={tool.mockInteraction.placeholder}
              placeholderTextColor={Colors.textSecondary}
              value={interactionInput}
              onChangeText={setInteractionInput}
              multiline={tool.mockInteraction.type === 'scam-detector'}
              numberOfLines={tool.mockInteraction.type === 'scam-detector' ? 4 : 1}
            />
            <TouchableOpacity
              style={styles.runButton}
              onPress={handleRunTool}
              disabled={interactionLoading}
            >
              {interactionLoading ? (
                <ActivityIndicator size="small" color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="play" size={20} color={Colors.textPrimary} />
                  <Text style={styles.runButtonText}>Analyze</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          {renderInteractionResult()}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This tool is part of the CyberPup security toolkit.
            {tool.lastUpdated && ` Last updated: ${formatDate(tool.lastUpdated)}`}
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
  toolHeader: {
    padding: Responsive.padding.screen,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  toolTags: {
    flexDirection: 'row',
    gap: Responsive.spacing.sm,
    marginBottom: Responsive.spacing.md,
  },
  toolTag: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  toolTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  etaTag: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
    backgroundColor: Colors.surface,
  },
  etaTagText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
  },
  toolTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.xxl * 1.2,
    marginBottom: Responsive.spacing.md,
  },
  toolMeta: {
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
  descriptionText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.5,
  },
  interactionCard: {
    ...CommonStyles.premiumCard,
    backgroundColor: Colors.surface,
    marginVertical: 0,
  },
  interactionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.md,
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
    minHeight: 48,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: Responsive.spacing.md,
    paddingHorizontal: Responsive.spacing.lg,
    borderRadius: Responsive.borderRadius.medium,
    gap: Responsive.spacing.sm,
  },
  runButtonText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  resultCard: {
    ...CommonStyles.premiumCard,
    backgroundColor: Colors.surface,
    marginTop: Responsive.spacing.md,
    marginHorizontal: 0,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  resultTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  resultError: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    textAlign: 'center',
  },
  scoreChip: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  scoreText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  strengthText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  crackTimeText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Responsive.spacing.md,
  },
  issuesContainer: {
    marginTop: Responsive.spacing.md,
  },
  issuesTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.error,
    marginBottom: Responsive.spacing.xs,
  },
  issueText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    marginBottom: Responsive.spacing.xs,
  },
  suggestionsContainer: {
    marginTop: Responsive.spacing.md,
  },
  suggestionsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.success,
    marginBottom: Responsive.spacing.xs,
  },
  suggestionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    marginBottom: Responsive.spacing.xs,
  },
  resultMessage: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  breachesContainer: {
    marginTop: Responsive.spacing.md,
  },
  breachItem: {
    backgroundColor: Colors.background,
    padding: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
    marginBottom: Responsive.spacing.sm,
  },
  breachName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: '#FF6B6B', // Brighter red for better contrast on dark background
  },
  breachDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  breachRecords: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  breachData: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  breachHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: '#27AE60', // Green background
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  verifiedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF', // Pure white text for maximum contrast on green
  },
  breachIndustry: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  riskBadge: {
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
    marginTop: Responsive.spacing.xs,
  },
  riskText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF', // Pure white text for maximum contrast on colored badges
  },
  passwordRiskText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#FFFFFF', // Pure white text for password risk badges
  },
  riskFactorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
    marginBottom: Responsive.spacing.xs,
  },
  breachDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  recommendationsContainer: {
    marginTop: Responsive.spacing.lg,
    backgroundColor: Colors.background,
    padding: Responsive.spacing.md,
    borderRadius: Responsive.borderRadius.medium,
  },
  recommendationsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    marginBottom: Responsive.spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.xs,
  },
  recommendationBullet: {
    fontSize: Typography.sizes.md,
    color: Colors.accent,
    marginRight: Responsive.spacing.xs,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    flex: 1,
    lineHeight: Typography.sizes.sm * 1.3,
  },
  statusChip: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  statusText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },

  risksContainer: {
    marginTop: Responsive.spacing.md,
  },
  risksTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.error,
    marginBottom: Responsive.spacing.xs,
  },

  riskChip: {
    paddingHorizontal: Responsive.spacing.md,
    paddingVertical: Responsive.spacing.xs,
    borderRadius: Responsive.borderRadius.small,
  },
  scamTypeText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.sm,
  },
  indicatorsContainer: {
    marginTop: Responsive.spacing.md,
  },
  indicatorsTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.warning,
    marginBottom: Responsive.spacing.xs,
  },
  indicatorText: {
    fontSize: Typography.sizes.sm,
    color: Colors.warning,
    marginBottom: Responsive.spacing.xs,
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

export default ToolDetailScreen;
