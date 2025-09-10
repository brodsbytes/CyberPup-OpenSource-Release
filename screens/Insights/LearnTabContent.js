import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  ScrollView,
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
import { trackGuideView, trackEvent } from '../../utils/analytics';

const LearnTabContent = ({ query, navigation }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [userCountry, setUserCountry] = useState('US');

  useEffect(() => {
    console.log('🔍 LearnTabContent: Component mounted, loading security alerts...');
    // Clear any existing mock data from cache first
    SecurityAlertsService.clearMockDataFromCache().then(() => {
      loadSecurityAlerts();
    });
  }, []);

  const loadSecurityAlerts = async () => {
    try {
      console.log('🔄 LearnTabContent: Starting to load security alerts...');
      setAlertsLoading(true);
      setAlertsError(null);
      
      console.log('📡 LearnTabContent: Fetching fresh security alerts from multiple sources (US + AU)...');
      const securityAlerts = await SecurityAlertsService.clearCacheAndRefresh();
      console.log(`✅ LearnTabContent: Successfully loaded ${securityAlerts.length} alerts from multiple sources`);
      setAlerts(securityAlerts);
    } catch (error) {
      console.log('❌ LearnTabContent: Error loading security alerts:', error);
      setAlertsError(error.message);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
      console.log('🏁 LearnTabContent: Security alerts loading completed');
    }
  };

  const onRefreshAlerts = async () => {
    try {
      setAlertsError(null);
      const freshAlerts = await SecurityAlertsService.clearCacheAndRefresh();
      setAlerts(freshAlerts);
    } catch (error) {
      console.log('Error refreshing alerts:', error);
      setAlertsError(error.message);
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
    navigation.navigate(SCREEN_NAMES.ALERT_DETAIL, { 
      alertId: alert.id 
    });
  };

  const handleGuidePress = (guide) => {
    // Track guide view
    trackGuideView(guide.title, {
      guide_id: guide.id,
      guide_category: guide.category,
      source: 'insights_learn_tab'
    });
    
    navigation.navigate(SCREEN_NAMES.GUIDE_DETAIL, { id: guide.id });
  };

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
          <Text style={styles.emptyText}>Live security alerts cannot be loaded</Text>
          <Text style={styles.emptySubtext}>Please refresh or try again later</Text>
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

  return (
    <View style={styles.container}>
      {/* Security Alerts Section */}
      <SectionHeader 
        title="Security Alerts"
        actionText={alertsLoading ? "Loading..." : "Refresh"}
        onActionPress={alertsLoading ? undefined : onRefreshAlerts}
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
      
      {/* Render guides directly without FlatList */}
      <View style={styles.guidesContainer}>
        {filteredGuides.map(guide => (
          <GuideCard
            key={guide.id}
            tag={guide.tag}
            level={guide.level}
            title={guide.title}
            excerpt={guide.excerpt}
            readMinutes={guide.readMinutes}
            onPress={() => handleGuidePress(guide)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default LearnTabContent;
