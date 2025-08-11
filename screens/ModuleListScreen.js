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
import { Colors } from '../theme';

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
                  <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
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
      case '1-1-1': return 'Check1_1_StrongPasswordsScreen';
      case '1-1-2': return 'Check1_2_HighValueAccountsScreen';
      case '1-1-3': return 'Check1_3_PasswordManagersScreen';
      case '1-1-4': return 'Check1_4_MFASetupScreen';
      case '1-1-5': return 'Check1_5_BreachCheckScreen';
      case '1-2-1': return 'Check1_2_1_ScreenLockScreen';
      // TODO: Add more check screens as they are created
      default: return 'Welcome'; // Fallback to WelcomeScreen
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
          onPress={() => navigation.navigate('Welcome')}
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSection: {
    paddingTop: 24,
    paddingBottom: 32,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryIconText: {
    fontSize: 24,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  moduleCount: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  areaSection: {
    marginBottom: 32,
  },
  areaHeader: {
    marginBottom: 16,
  },
  areaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  areaDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  checkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  checkMeta: {
    alignItems: 'flex-end',
  },
  checkDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 2,
  },
  checkTasks: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  checkDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accent,
    marginLeft: 4,
  },
});

export default ModuleListScreen; 