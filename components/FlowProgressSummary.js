// Flow Progress Summary Component
// Displays enhanced progress tracking and analytics for interactive flows

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive } from '../theme';
import { ProgressManager } from '../utils/progressManager';

const FlowProgressSummary = ({ visible, onClose, flowId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [bestScores, setBestScores] = useState({});
  const [flowCompletion, setFlowCompletion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadProgressData();
    }
  }, [visible, flowId]);

  const loadProgressData = async () => {
    setLoading(true);
    try {
      const [analyticsData, scoresData, completionData] = await Promise.all([
        ProgressManager.getAnalytics(),
        ProgressManager.getBestScores(),
        flowId ? ProgressManager.getFlowCompletion(flowId) : null
      ]);

      setAnalytics(analyticsData);
      setBestScores(scoresData);
      setFlowCompletion(completionData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSpent = (milliseconds) => {
    if (!milliseconds) return '0m';
    
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return Colors.success;
    if (score >= 70) return Colors.accent;
    if (score >= 50) return Colors.warning;
    return Colors.error;
  };

  const renderOverallStats = () => {
    if (!analytics) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{analytics.totalFlows}</Text>
            <Text style={styles.statLabel}>Completed Flows</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getScoreColor(analytics.averageScore) }]}>
              {analytics.averageScore}%
            </Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatTimeSpent(analytics.totalTimeSpent)}</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>
              {analytics.perfectScores}
            </Text>
            <Text style={styles.statLabel}>Perfect Scores</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentFlowStats = () => {
    if (!flowCompletion) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Current Flow Performance</Text>
        
        <View style={styles.currentFlowCard}>
          <View style={styles.currentFlowHeader}>
            <Ionicons 
              name={flowCompletion.perfectScore ? "trophy" : "checkmark-circle"} 
              size={Responsive.iconSizes.xlarge} 
              color={getScoreColor(flowCompletion.score)} 
            />
            <View style={styles.currentFlowInfo}>
              <Text style={[styles.currentFlowScore, { color: getScoreColor(flowCompletion.score) }]}>
                {flowCompletion.score}%
              </Text>
              <Text style={styles.currentFlowLabel}>
                {flowCompletion.perfectScore ? 'Perfect Score!' : 'Score'}
              </Text>
            </View>
          </View>
          
          <View style={styles.currentFlowDetails}>
            <View style={styles.currentFlowDetail}>
              <Ionicons name="time" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
              <Text style={styles.currentFlowDetailText}>
                {formatTimeSpent(flowCompletion.timeSpent)}
              </Text>
            </View>
            
            <View style={styles.currentFlowDetail}>
              <Ionicons name="calendar" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
              <Text style={styles.currentFlowDetailText}>
                {new Date(flowCompletion.completedAt).toLocaleDateString()}
              </Text>
            </View>
            
            {flowCompletion.attempts > 1 && (
              <View style={styles.currentFlowDetail}>
                <Ionicons name="refresh" size={Responsive.iconSizes.medium} color={Colors.textSecondary} />
                <Text style={styles.currentFlowDetailText}>
                  Attempt #{flowCompletion.attempts}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderBestScores = () => {
    const scoreEntries = Object.entries(bestScores);
    if (scoreEntries.length === 0) return null;

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Best Scores</Text>
        
        <View style={styles.scoresContainer}>
          {scoreEntries.map(([flowIdKey, score]) => (
            <View key={flowIdKey} style={styles.scoreItem}>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreName}>
                  {getFlowDisplayName(flowIdKey)}
                </Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>
                  {score}%
                </Text>
              </View>
              
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreBarFill, 
                    { 
                      width: `${score}%`,
                      backgroundColor: getScoreColor(score)
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getFlowDisplayName = (flowId) => {
    const flowNames = {
      'breach-check-1-5': 'Breach Check',
      'scam-recognition-1-4-1': 'Scam Recognition',
    };
    return flowNames[flowId] || flowId;
  };

  if (loading) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.loadingText}>Loading progress data...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Progress Summary</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={Responsive.iconSizes.large} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {renderCurrentFlowStats()}
            {renderOverallStats()}
            {renderBestScores()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Responsive.padding.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: Responsive.padding.card,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.md,
  },
  statsSection: {
    marginBottom: Responsive.spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.md,
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  currentFlowCard: {
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
  },
  currentFlowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  currentFlowInfo: {
    marginLeft: Responsive.spacing.md,
    flex: 1,
  },
  currentFlowScore: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  currentFlowLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  currentFlowDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Responsive.spacing.md,
  },
  currentFlowDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  currentFlowDetailText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginLeft: Responsive.spacing.sm,
  },
  scoresContainer: {
    gap: Responsive.spacing.sm,
  },
  scoreItem: {
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.medium,
    padding: Responsive.spacing.md,
  },
  scoreInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Responsive.spacing.sm,
  },
  scoreName: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  scoreValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  scoreBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default FlowProgressSummary;
