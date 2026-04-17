import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Colors, Responsive, Typography } from '../../theme';
import { SCREEN_NAMES } from '../../constants';
import { GuideService } from '../../utils/guideService';
import { TopicsService } from '../../utils/topicsService';
import { SecurityAlertsService } from '../../utils/securityAlerts';
import { LocationUtils } from '../../utils/locationUtils';

import SectionHeader from '../../components/insights/SectionHeader';
import AlertCard from '../../components/insights/AlertCard';
import TopicChip from '../../components/insights/TopicChip';
import GuideCard from '../../components/insights/GuideCard';

const LearnTab = ({ query, navigation, scrollRef, scrollPosition, onScrollPositionChange }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [alerts, setAlerts] = useState([]); // Dynamic alerts
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userCountry, setUserCountry] = useState('US'); // Track user's country

  // Load security alerts on component mount
  useEffect(() => {
    loadSecurityAlerts();
  }, []);

  // Restore scroll position when component mounts
  useEffect(() => {
    if (scrollRef && scrollPosition > 0) {
      // Use a longer delay and better null checking to ensure the ScrollView is fully rendered
      const timeoutId = setTimeout(() => {
        if (scrollRef.current) {
          try {
            scrollRef.current.scrollTo({ y: scrollPosition, animated: false });
          } catch (error) {
            console.log('Error restoring scroll position:', error);
          }
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [scrollPosition]); // Remove scrollRef from dependencies to prevent re-running

  const loadSecurityAlerts = async () => {
    try {
      setAlertsLoading(true);
      setAlertsError(null);
      
      // Fetch alerts from multiple sources (US + AU)
      const securityAlerts = await SecurityAlertsService.getSecurityAlerts();
      setAlerts(securityAlerts);
    } catch (error) {
      console.log('Error loading security alerts:', error);
      setAlertsError(error.message);
      // Set empty array as fallback
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setAlertsError(null);
      // Force refresh alerts from multiple sources
      const freshAlerts = await SecurityAlertsService.refreshAlerts();
      setAlerts(freshAlerts);
    } catch (error) {
      console.log('Error refreshing alerts:', error);
      setAlertsError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter guides based on query and selected topics
  const filteredGuides = useMemo(() => {
    const guides = GuideService.getEnhancedGuides();
    return guides.filter(guide => {
      const matchesQuery = !query || 
        guide.title.toLowerCase().includes(query.toLowerCase()) ||
        guide.excerpt.toLowerCase().includes(query.toLowerCase());
      
      const matchesTopics = selectedTopics.length === 0 ||
        selectedTopics.some(topic => guide.topics.includes(topic));
      
      return matchesQuery && matchesTopics;
    });
  }, [query, selectedTopics]);

  const handleTopicPress = (topicId) => {
    setSelectedTopics(prev => 
      prev.includes(topicId) 
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleAlertPress = (alert) => {
    // Navigate to alert detail screen
    navigation.navigate(SCREEN_NAMES.ALERT_DETAIL, { 
      alertId: alert.id 
    });
  };

  const handleGuidePress = (guide) => {
    // Navigate to guide detail screen
    navigation.navigate(SCREEN_NAMES.GUIDE_DETAIL, { id: guide.id });
  };



  const renderAlertCard = ({ item }) => (
    <AlertCard
      title={item.title}
      summary={item.summary}
      tag={item.tag}
      source={item.source}
      onPress={() => handleAlertPress(item)}
    />
  );

  const renderGuideCard = ({ item }) => (
    <GuideCard
      tag={item.tag}
      level={item.level}
      title={item.title}
      excerpt={item.excerpt}
      readMinutes={item.readMinutes}
      onPress={() => handleGuidePress(item)}
    />
  );

  const renderAlertsSection = () => {
    if (alertsLoading) {
      return (
        <View style={styles.alertsLoadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Loading security alerts...</Text>
        </View>
      );
    }

    if (alertsError) {
      return (
        <View style={styles.alertsErrorContainer}>
          <Text style={styles.errorText}>Unable to load alerts</Text>
          <Text style={styles.errorSubtext}>Using cached data</Text>
        </View>
      );
    }

    if (alerts.length === 0) {
      return (
        <View style={styles.alertsEmptyContainer}>
          <Text style={styles.emptyText}>No security alerts at this time</Text>
          <Text style={styles.emptySubtext}>Your security is up to date!</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alertsContainer}
      >
        {alerts.map(alert => (
          <AlertCard
            key={alert.id}
            title={alert.title}
            summary={alert.summary}
            tag={alert.tag}
            source={alert.source}
            onPress={() => handleAlertPress(alert)}
          />
        ))}
      </ScrollView>
    );
  };

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    if (onScrollPositionChange && contentOffset.y >= 0) {
      onScrollPositionChange(contentOffset.y);
    }
  };

  return (
    <ScrollView 
      ref={scrollRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={100}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.accent]}
          tintColor={Colors.accent}
        />
      }
    >
      {/* Security Alerts Section */}
      <SectionHeader 
        title="Security Alerts"
        actionText={alertsLoading ? "Loading..." : "Refresh"}
        onActionPress={alertsLoading ? undefined : onRefresh}
      />
      

      {renderAlertsSection()}

      {/* Browse by Topic Section */}
      <SectionHeader 
        title="Browse by Topic" 
        actionText="View all"
        onActionPress={() => {}}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicsContainer}
      >
        {TopicsService.getAllTopics().map(topic => (
          <TopicChip
            key={topic.id}
            label={topic.label}
            selected={selectedTopics.includes(topic.id)}
            onPress={() => handleTopicPress(topic.id)}
          />
        ))}
      </ScrollView>

      {/* Latest Guides Section */}
      <SectionHeader 
        title="Latest Guides" 
        actionText="View all"
        onActionPress={() => {}}
      />
      <FlatList
        data={filteredGuides}
        renderItem={renderGuideCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.guidesContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingBottom: Responsive.spacing.xxl,
  },
  alertsContainer: {
    paddingLeft: Responsive.padding.screen,
    paddingRight: Responsive.spacing.lg,
  },
  alertsLoadingContainer: {
    paddingVertical: Responsive.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Responsive.padding.screen,
  },
  alertsErrorContainer: {
    paddingVertical: Responsive.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Responsive.padding.screen,
    backgroundColor: Colors.surface,
    borderRadius: Responsive.borderRadius.large,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  alertsEmptyContainer: {
    paddingVertical: Responsive.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Responsive.padding.screen,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.lg,
    color: Colors.error,
    fontWeight: Typography.weights.semibold,
  },
  errorSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
  },
  emptySubtext: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
  },
  topicsContainer: {
    paddingLeft: Responsive.padding.screen,
    paddingRight: Responsive.spacing.lg,
  },
  guidesContainer: {
    paddingTop: Responsive.spacing.md,
  },
});

export default LearnTab;
