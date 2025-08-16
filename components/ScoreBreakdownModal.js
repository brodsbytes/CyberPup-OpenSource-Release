import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import { levels, getAllChecks, getAreasByLevel } from '../data/courseData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ScoreBreakdownModal = ({ visible, onClose, overallProgress }) => {
  const [levelBreakdown, setLevelBreakdown] = useState([]);
  const [expandedLevels, setExpandedLevels] = useState(new Set());
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      loadBreakdownData();
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const loadBreakdownData = async () => {
    try {
      const allChecks = getAllChecks();
      const breakdown = [];

      for (const level of levels) {
        const levelAreas = getAreasByLevel(level.id);
        let levelCompletedChecks = 0;
        let levelTotalChecks = 0;
        const areasWithProgress = [];

        for (const area of levelAreas) {
          let areaCompletedChecks = 0;
          let areaTotalChecks = area.checks.length;

          for (const check of area.checks) {
            const progressKey = `check_${check.id}_completed`;
            const progressData = await AsyncStorage.getItem(progressKey);
            
            if (progressData === 'completed') {
              areaCompletedChecks++;
              levelCompletedChecks++;
            }
          }

          levelTotalChecks += areaTotalChecks;
          areasWithProgress.push({
            ...area,
            completedChecks: areaCompletedChecks,
            totalChecks: areaTotalChecks,
            progressPercentage: areaTotalChecks > 0 ? Math.round((areaCompletedChecks / areaTotalChecks) * 100) : 0,
          });
        }

        breakdown.push({
          ...level,
          completedChecks: levelCompletedChecks,
          totalChecks: levelTotalChecks,
          progressPercentage: levelTotalChecks > 0 ? Math.round((levelCompletedChecks / levelTotalChecks) * 100) : 0,
          areas: areasWithProgress,
        });
      }

      setLevelBreakdown(breakdown);
    } catch (error) {
      console.log('Error loading breakdown data:', error);
    }
  };

  const toggleLevelExpansion = (levelId) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  const getScoreColor = (score) => {
    const colors = {
      0: '#FF6666',    // Red
      25: '#FF8C66',   // Orange-red
      50: '#FFDD66',   // Yellow
      75: '#99CC66',   // Yellow-green
      100: '#66BB6A',  // Green
    };

    if (score <= 25) {
      const ratio = score / 25;
      return interpolateColor(colors[0], colors[25], ratio);
    } else if (score <= 50) {
      const ratio = (score - 25) / 25;
      return interpolateColor(colors[25], colors[50], ratio);
    } else if (score <= 75) {
      const ratio = (score - 50) / 25;
      return interpolateColor(colors[50], colors[75], ratio);
    } else {
      const ratio = (score - 75) / 25;
      return interpolateColor(colors[75], colors[100], ratio);
    }
  };

  const interpolateColor = (color1, color2, ratio) => {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const LevelCard = ({ level }) => {
    const isExpanded = expandedLevels.has(level.id);
    const scoreColor = getScoreColor(level.progressPercentage);

    return (
      <View style={styles.levelCard}>
        <TouchableOpacity
          style={styles.levelHeader}
          onPress={() => toggleLevelExpansion(level.id)}
          activeOpacity={0.7}
        >
          <View style={styles.levelHeaderLeft}>
            <View style={[styles.levelIcon, { backgroundColor: level.color }]}>
              <Text style={styles.levelIconText}>{level.icon}</Text>
            </View>
            <View style={styles.levelInfo}>
              <Text style={styles.levelTitle}>{level.title}</Text>
              <Text style={styles.levelSubtitle}>
                {level.completedChecks} of {level.totalChecks} checks completed
              </Text>
            </View>
          </View>
          <View style={styles.levelHeaderRight}>
            <Text style={[styles.levelScore, { color: scoreColor }]}>
              {level.progressPercentage}%
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.areasContainer}>
            {level.areas.map((area, index) => {
              const areaScoreColor = getScoreColor(area.progressPercentage);
              return (
                <View key={area.id} style={styles.areaItem}>
                  <View style={styles.areaHeader}>
                    <View style={styles.areaInfo}>
                      <Text style={styles.areaTitle}>{area.title}</Text>
                      <Text style={styles.areaSubtitle}>
                        {area.completedChecks} of {area.totalChecks} checks
                      </Text>
                    </View>
                    <Text style={[styles.areaScore, { color: areaScoreColor }]}>
                      {area.progressPercentage}%
                    </Text>
                  </View>
                  <View style={styles.areaProgressBar}>
                    <View 
                      style={[
                        styles.areaProgressFill, 
                        { 
                          width: `${area.progressPercentage}%`,
                          backgroundColor: areaScoreColor,
                        }
                      ]} 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View
          style={[
            styles.modalContent,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Security Score Breakdown</Text>
              <Text style={styles.headerSubtitle}>
                Your overall security score: {overallProgress}%
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {levelBreakdown.map((level) => (
              <LevelCard key={level.id} level={level} />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Responsive.borderRadius.xlarge,
    borderTopRightRadius: Responsive.borderRadius.xlarge,
    maxHeight: height * 0.85,
    minHeight: height * 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingVertical: Responsive.spacing.md,
  },
  levelCard: {
    backgroundColor: Colors.background,
    borderRadius: Responsive.borderRadius.large,
    marginBottom: Responsive.spacing.md,
    overflow: 'hidden',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Responsive.spacing.md,
  },
  levelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelIcon: {
    width: Responsive.iconSizes.large,
    height: Responsive.iconSizes.large,
    borderRadius: Responsive.iconSizes.large / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Responsive.spacing.md,
  },
  levelIconText: {
    fontSize: Typography.sizes.lg,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  levelSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  levelHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Responsive.spacing.sm,
  },
  levelScore: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  areasContainer: {
    paddingHorizontal: Responsive.spacing.md,
    paddingBottom: Responsive.spacing.md,
  },
  areaItem: {
    marginTop: Responsive.spacing.md,
    paddingTop: Responsive.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Responsive.spacing.sm,
  },
  areaInfo: {
    flex: 1,
  },
  areaTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  areaSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  areaScore: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  areaProgressBar: {
    height: 4,
    backgroundColor: Colors.track,
    borderRadius: 2,
    overflow: 'hidden',
  },
  areaProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ScoreBreakdownModal;
