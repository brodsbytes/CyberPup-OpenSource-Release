import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getAreasByLevel, getChecksByArea } from '../data/courseData';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import { SCREEN_NAMES } from '../constants';

const { width } = Dimensions.get('window');

const ModuleListScreen = ({ navigation, route }) => {
  const { category } = route.params || {};
  const [areas, setAreas] = useState([]);

  // Get areas for the selected level
  const getAreasForLevel = (levelId) => {
    return getAreasByLevel(levelId);
  };

  // Load areas and their progress when component mounts or screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadAreasWithProgress();
    }, [category])
  );

  const loadAreasWithProgress = async () => {
    try {
      const areas = getAreasForLevel(category?.id);
      const areasWithProgress = await Promise.all(
        areas.map(async (area) => {
          const checks = getChecksByArea(area.id);
          const checksWithProgress = await Promise.all(
            checks.map(async (check) => {
              const progressKey = `check_${check.id}_completed`;
              const isCompleted = await AsyncStorage.getItem(progressKey);
              return {
                ...check,
                isCompleted: isCompleted === 'completed',
              };
            })
          );
          return {
            ...area,
            checks: checksWithProgress,
          };
        })
      );
      setAreas(areasWithProgress);
    } catch (error) {
      console.log('Error loading areas with progress:', error);
    }
  };

  const renderAreaItem = ({ item }) => {
    return (
      <View style={styles.areaSection}>
        <View style={styles.areaHeader}>
          <Text style={styles.areaTitle}>{item.title}</Text>
          <Text style={styles.areaDescription}>{item.description}</Text>
        </View>
        
        {item.checks.map((check) => (
          <TouchableOpacity
            key={check.id}
            style={[styles.checkCard, check.isCompleted && styles.checkCardCompleted]}
            onPress={() => {
              const routeName = getCheckNavigationTarget(check.id);
              navigation.navigate(routeName, { check });
            }}
            activeOpacity={0.8}
          >
            <View style={styles.checkContent}>
              <View style={styles.checkHeader}>
                <Text style={styles.checkTitle}>{check.title}</Text>
                <View style={styles.checkMeta}>
                  <Text style={styles.checkDuration}>{check.duration}</Text>
                  <Text style={styles.checkTasks}>{check.tasks} tasks</Text>
                </View>
              </View>
              <Text style={styles.checkDescription}>{check.description}</Text>
              
              {check.isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={Responsive.iconSizes.medium} color={Colors.accent} />
                  <Text style={styles.completedText}>Completed</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getCheckNavigationTarget = (checkId) => {
    switch (checkId) {
      case '1-0-1': return SCREEN_NAMES.INITIAL_WELCOME;
      case '1-1-1': return SCREEN_NAMES.CHECK_1_1_STRONG_PASSWORDS;
      case '1-1-2': return SCREEN_NAMES.CHECK_1_2_HIGH_VALUE_ACCOUNTS;
      case '1-1-3': return SCREEN_NAMES.CHECK_1_3_PASSWORD_MANAGERS;
      case '1-1-4': return SCREEN_NAMES.CHECK_1_4_MFA_SETUP;
      case '1-1-5': return SCREEN_NAMES.CHECK_1_5_BREACH_CHECK;
      case '1-2-1': return SCREEN_NAMES.CHECK_1_2_1_SCREEN_LOCK;
      // TODO: Add more check screens as they are created
      default: return SCREEN_NAMES.WELCOME; // Fallback to WelcomeScreen
    }
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIcon, { backgroundColor: category?.color || Colors.accent }]}>
          <Text style={styles.categoryIconText}>{category?.icon || '📚'}</Text>
        </View>
        <View style={styles.categoryDetails}>
          <Text style={styles.categoryTitle}>{category?.title || 'Level'}</Text>
          <Text style={styles.moduleCount}>{areas.length} areas</Text>
        </View>
      </View>
      <Text style={styles.headerDescription}>
        {category?.headerMessage || 'Complete all checks to master this security topic'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate(SCREEN_NAMES.WELCOME)}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checks</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={areas}
        renderItem={renderAreaItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: Responsive.iconSizes.xlarge,
    height: Responsive.iconSizes.xlarge,
    borderRadius: Responsive.iconSizes.xlarge / 2,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.sizes.xxl,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: Responsive.iconSizes.xlarge,
  },
  listContainer: {
    paddingHorizontal: Responsive.padding.screen,
    paddingBottom: Responsive.iconSizes.xlarge,
  },
  headerSection: {
    paddingTop: Responsive.spacing.lg,
    paddingBottom: Responsive.spacing.xl,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Responsive.spacing.md,
  },
  categoryIcon: {
    width: Responsive.iconSizes.xxlarge,
    height: Responsive.iconSizes.xxlarge,
    borderRadius: Responsive.iconSizes.xxlarge / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Responsive.spacing.md,
  },
  categoryIconText: {
    fontSize: Typography.sizes.xxl,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  moduleCount: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  headerDescription: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.md * 1.4,
  },
  areaSection: {
    marginBottom: Responsive.spacing.xl,
  },
  areaHeader: {
    marginBottom: Responsive.spacing.md,
  },
  areaTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Responsive.spacing.xs,
  },
  areaDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
  },
  checkCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkCardCompleted: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentSoft,
  },
  checkContent: {
    flex: 1,
  },
  checkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Responsive.spacing.sm,
  },
  checkTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Responsive.spacing.sm,
  },
  checkMeta: {
    alignItems: 'flex-end',
  },
  checkDuration: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    marginBottom: Responsive.spacing.xs,
  },
  checkTasks: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  checkDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sizes.sm * 1.4,
    marginBottom: Responsive.spacing.sm,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.accent,
    marginLeft: Responsive.spacing.xs,
  },
});

export default ModuleListScreen; 