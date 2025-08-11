import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';
import Badge from '../components/Badge';
import { Colors } from '../theme';
import { 
  loadUserBadges, 
  getEarnedBadgesCount, 
  BADGE_TYPES 
} from '../utils/badgeStorage';

const ProfileScreen = ({ navigation }) => {
  const [userBadges, setUserBadges] = useState([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBadges: 0,
    areaBadges: 0,
    levelBadges: 0,
    specialBadges: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadBadges = async () => {
    try {
      console.log('Loading badges...');
      const badges = await loadUserBadges();
      const earned = await getEarnedBadgesCount();
      
      console.log('Badges loaded:', badges.length, 'Earned:', earned);
      
      setUserBadges(badges);
      setEarnedCount(earned);
      
      // Calculate stats
      const areaBadges = badges.filter(b => b.type === BADGE_TYPES.AREA && b.isEarned).length;
      const levelBadges = badges.filter(b => b.type === BADGE_TYPES.LEVEL && b.isEarned).length;
      const specialBadges = badges.filter(b => b.type === BADGE_TYPES.SPECIAL && b.isEarned).length;
      
      setStats({
        totalBadges: badges.length,
        areaBadges,
        levelBadges,
        specialBadges,
      });
      
      console.log('Stats calculated:', { totalBadges: badges.length, areaBadges, levelBadges, specialBadges });
    } catch (error) {
      console.log('Error loading badges:', error);
      // Set default values to prevent rendering issues
      setUserBadges([]);
      setEarnedCount(0);
      setStats({
        totalBadges: 0,
        areaBadges: 0,
        levelBadges: 0,
        specialBadges: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBadges();
    setRefreshing(false);
  };

  useEffect(() => {
    loadBadges();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadBadges();
    }, [])
  );

  const getBadgesByType = (type) => {
    return userBadges.filter(badge => badge.type === type);
  };

  const renderBadgeSection = (title, badges, type) => {
    if (!badges || badges.length === 0) {
      return null;
    }
    
    const earnedBadges = badges.filter(b => b.isEarned);
    const unearnedBadges = badges.filter(b => !b.isEarned);
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSubtitle}>
            {earnedBadges.length} of {badges.length} earned
          </Text>
        </View>
        
        <View style={styles.badgesGrid}>
          {badges.map((badge) => (
            <Badge
              key={badge.id}
              badge={badge}
              size="medium"
              showDetails={true}
              style={styles.badgeItem}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>Your Cyber Security Journey</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading badges...</Text>
            </View>
          ) : (
            <>
              {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="trophy" size={24} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{earnedCount}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="shield-checkmark" size={24} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{stats.areaBadges}</Text>
              <Text style={styles.statLabel}>Areas Mastered</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name="star" size={24} color={Colors.accent} />
              </View>
              <Text style={styles.statNumber}>{stats.specialBadges}</Text>
              <Text style={styles.statLabel}>Special Achievements</Text>
            </View>
          </View>

          {/* Progress Overview */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${stats.totalBadges > 0 ? (earnedCount / stats.totalBadges) * 100 : 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {earnedCount} of {stats.totalBadges} badges earned
            </Text>
          </View>

          {/* Area Badges */}
          {renderBadgeSection(
            'Area Badges', 
            getBadgesByType(BADGE_TYPES.AREA),
            BADGE_TYPES.AREA
          )}

          {/* Level Badges */}
          {renderBadgeSection(
            'Level Badges', 
            getBadgesByType(BADGE_TYPES.LEVEL),
            BADGE_TYPES.LEVEL
          )}

          {/* Special Badges */}
          {renderBadgeSection(
            'Special Achievements', 
            getBadgesByType(BADGE_TYPES.SPECIAL),
            BADGE_TYPES.SPECIAL
          )}

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>Settings</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications" size={20} color={Colors.textSecondary} />
              <Text style={styles.settingText}>Notification Preferences</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="help-circle" size={20} color={Colors.textSecondary} />
              <Text style={styles.settingText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="information-circle" size={20} color={Colors.textSecondary} />
              <Text style={styles.settingText}>About CyberPup</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
            </>
          )}
        </View>
      </ScrollView>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab="profile"
        onTabPress={(screen) => {
          console.log('Tab pressed:', screen);
          console.log('Navigation object:', navigation);
          console.log('Navigation methods:', Object.keys(navigation));
          
          try {
            if (screen === 'Welcome') {
              console.log('Navigating to Welcome...');
              navigation.navigate('Welcome');
            } else if (screen === 'CategoryScreen') {
              console.log('Navigating to CategoryScreen...');
              navigation.navigate('CategoryScreen');
            } else {
              console.log('Unknown screen:', screen);
            }
          } catch (error) {
            console.log('Navigation error:', error);
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    marginBottom: 16,
    width: '30%',
  },
  settingsSection: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default ProfileScreen;
