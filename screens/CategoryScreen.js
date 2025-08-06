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

const { width } = Dimensions.get('window');

const CategoryScreen = ({ navigation }) => {
  const categories = [
    {
      id: 1,
      title: 'Password Security & Authentication',
      description: 'Learn to create strong passwords and secure your accounts with multi-factor authentication.',
      icon: '🔐',
      color: '#4a90e2',
    },
    {
      id: 2,
      title: 'Phishing & Scam Awareness',
      description: 'Identify and avoid phishing attempts, scams, and social engineering attacks.',
      icon: '🎣',
      color: '#e74c3c',
    },
    {
      id: 3,
      title: 'Device & Network Security',
      description: 'Protect your devices and secure your home network from cyber threats.',
      icon: '🛡️',
      color: '#27ae60',
    },
    {
      id: 4,
      title: 'Online Privacy & Social Media',
      description: 'Manage your digital footprint and protect your privacy on social platforms.',
      icon: '🔒',
      color: '#9b59b6',
    },
    {
      id: 5,
      title: 'Secure Finances & Identity Protection',
      description: 'Safeguard your financial information and prevent identity theft.',
      icon: '💰',
      color: '#f39c12',
    },
  ];

  const CategoryCard = ({ category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('ModuleListScreen', { category })}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
            <Text style={styles.iconText}>{category.icon}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.cardTitle}>{category.title}</Text>
          </View>
        </View>
        <Text style={styles.cardDescription}>{category.description}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );

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
            Choose a category to start learning about cybersecurity
          </Text>
          
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </View>
        
        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 20,
  },
  titleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#a0aec0',
    lineHeight: 20,
    marginLeft: 64, // Align with title text
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CategoryScreen; 