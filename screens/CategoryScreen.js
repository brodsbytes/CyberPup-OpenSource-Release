import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { levels, getAreasByLevel } from '../data/courseData';
import { Colors, Typography, Responsive, CommonStyles } from '../theme';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

const CategoryScreen = ({ navigation }) => {

  const LevelCard = ({ level, displayIndex }) => {
    const areaCount = getAreasByLevel(level.id).length;
    return (
      <TouchableOpacity
        style={[styles.categoryCard, { borderColor: level.color }]}
        onPress={() => navigation.navigate('ModuleListScreen', { category: level })}
        activeOpacity={0.85}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.categoryChip, { backgroundColor: level.color }]}>
            <Text style={styles.categoryChipText}>{`Level ${displayIndex}`}</Text>
          </View>
          <Text style={styles.cardTitle}>{level.title}</Text>
          <Text style={styles.cardSubline}>{areaCount} areas</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.iconRing, { borderColor: level.color }]}> 
            <Text style={styles.iconText}>{level.icon}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>CyberPup Levels 👨🏻‍💻</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Choose a level to run focused security checks
          </Text>
          
          {levels.map((level, idx) => (
            <LevelCard key={level.id} level={level} displayIndex={level.id} />
          ))}
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="insights"
        onTabPress={(screen) => {
          console.log('CategoryScreen - Tab pressed:', screen);
          if (screen === 'Welcome') {
            navigation.navigate('Welcome');
          } else if (screen === 'InsightsScreen') {
            navigation.navigate('InsightsScreen');
          } else if (screen === 'ProfileScreen') {
            navigation.navigate('ProfileScreen');
          }
        }}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Responsive.padding.screen,
    marginBottom: Responsive.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Responsive.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.accent,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Responsive.padding.screen,
    paddingTop: Responsive.spacing.lg,
  },
  subtitle: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Responsive.spacing.xl,
    lineHeight: Typography.sizes.md * 1.4,
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.xlarge,
    padding: Responsive.padding.card,
    marginBottom: Responsive.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardLeft: {
    flex: 1,
    paddingRight: Responsive.spacing.sm,
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: Responsive.iconSizes.xxlarge,
    height: Responsive.iconSizes.xxlarge,
    borderRadius: Responsive.iconSizes.xxlarge / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: Typography.sizes.xxl,
  },
  cardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    lineHeight: Typography.sizes.xl,
  },
  cardSubline: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: Responsive.borderRadius.medium,
    paddingHorizontal: Responsive.spacing.sm,
    paddingVertical: Responsive.spacing.xs,
    marginBottom: Responsive.spacing.sm,
    backgroundColor: Colors.accentSoft,
  },
  categoryChipText: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.xs,
  },
  bottomSpacing: {
    height: Responsive.iconSizes.xlarge,
  },
});

export default CategoryScreen; 