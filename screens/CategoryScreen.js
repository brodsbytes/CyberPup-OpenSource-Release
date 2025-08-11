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
import { Colors } from '../theme';
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
        activeTab="learn"
        onTabPress={(screen) => {
          console.log('CategoryScreen - Tab pressed:', screen);
          if (screen === 'Welcome') {
            navigation.navigate('Welcome');
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
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
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
    paddingRight: 12,
  },
  cardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  cardSubline: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    backgroundColor: Colors.accentSoft,
  },
  categoryChipText: {
    color: Colors.textPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CategoryScreen; 