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
import { categories, getModulesByCategory } from '../data/courseData';
import BottomNavigation from '../components/BottomNavigation';

const { width } = Dimensions.get('window');

const CategoryScreen = ({ navigation }) => {

  const CategoryCard = ({ category, displayIndex }) => {
    const moduleCount = getModulesByCategory(category.id).length;
    return (
      <TouchableOpacity
        style={[styles.categoryCard, { borderColor: category.color }]}
        onPress={() => navigation.navigate('CategoryIntroScreen', { category })}
        activeOpacity={0.85}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.categoryChip, { backgroundColor: category.color }]}>
            <Text style={styles.categoryChipText}>{`Category ${displayIndex}`}</Text>
          </View>
          <Text style={styles.cardTitle}>{category.title}</Text>
          <Text style={styles.cardSubline}>{moduleCount} modules</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.iconRing, { borderColor: category.color }]}> 
            <Text style={styles.iconText}>{category.icon}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Categories</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Choose a category to run focused security checks
          </Text>
          
          {(() => {
            // Reorder so that Welcome Aboard (id 6) displays first
            const reordered = [...categories].sort((a, b) => {
              if (a.id === 6) return -1;
              if (b.id === 6) return 1;
              return a.id - b.id;
            });
            return reordered.map((category, idx) => (
              <CategoryCard key={category.id} category={category} displayIndex={idx + 1} />
            ));
          })()}
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="learn"
        onTabPress={(screen) => {
          if (screen === 'Welcome') {
            navigation.navigate('Welcome');
          } else if (screen === 'Profile') {
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
    backgroundColor: '#1a365d',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2d5a87',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d5a87',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
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
    borderBottomColor: '#2d5a87',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4a90e2',
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
    color: '#a0aec0',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  categoryCard: {
    backgroundColor: '#2d5a87',
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
    color: '#ffffff',
    lineHeight: 24,
  },
  cardSubline: {
    fontSize: 14,
    color: '#a0aec0',
    marginTop: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  categoryChipText: {
    color: '#0b1b2b',
    fontWeight: '700',
    fontSize: 12,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CategoryScreen; 