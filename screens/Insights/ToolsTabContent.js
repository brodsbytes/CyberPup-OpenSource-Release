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
import { ToolService } from '../../utils/toolService';
import { TopicsService } from '../../utils/topicsService';
import { SecurityAlertsService } from '../../utils/securityAlerts';
import { LocationUtils } from '../../utils/locationUtils';
import SectionHeader from '../../components/insights/SectionHeader';
import AlertCard from '../../components/insights/AlertCard';
import TopicChip from '../../components/insights/TopicChip';
import ToolCard from '../../components/insights/ToolCard';

const ToolsTabContent = ({ query, navigation }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [userCountry, setUserCountry] = useState('US');

  useEffect(() => {
    loadSecurityAlerts();
  }, []);

  const loadSecurityAlerts = async () => {
    try {
      setAlertsLoading(true);
      setAlertsError(null);

      const detectedCountry = await LocationUtils.getUserCountry();
      setUserCountry(detectedCountry);

      const securityAlerts = await SecurityAlertsService.getSecurityAlerts(detectedCountry);
      setAlerts(securityAlerts);
    } catch (error) {
      console.log('Error loading security alerts:', error);
      setAlertsError(error.message);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  };

  const onRefreshAlerts = async () => {
    try {
      setAlertsError(null);
      const detectedCountry = await LocationUtils.getUserCountry();
      setUserCountry(detectedCountry);
      const freshAlerts = await SecurityAlertsService.refreshAlerts(detectedCountry);
      setAlerts(freshAlerts);
    } catch (error) {
      console.log('Error refreshing alerts:', error);
      setAlertsError(error.message);
    }
  };

  // Filter tools based on query and selected topics
  const filteredTools = useMemo(() => {
    const tools = ToolService.getEnhancedTools();
    return tools.filter(tool => {
      const matchesQuery = !query || 
        tool.title.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase());
      
      const matchesTopics = selectedTopics.length === 0 ||
        selectedTopics.some(topic => tool.topics.includes(topic));
      
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

  const handleToolPress = (tool) => {
    navigation.navigate(SCREEN_NAMES.TOOL_DETAIL, { id: tool.id });
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
          <Text style={styles.errorSubtext}>Pull down to refresh</Text>
        </View>
      );
    }

    if (alerts.length === 0) {
      return (
        <View style={styles.alertsEmptyContainer}>
          <Text style={styles.emptyText}>No security alerts available</Text>
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
        subtitle={userCountry ? LocationUtils.getCountryInfo(userCountry)?.flag : null}
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

      {/* Interactive Tools Section */}
      <SectionHeader 
        title="Interactive Tools" 
        actionText="View all"
        onActionPress={() => {}}
      />
      
      {/* Render tools directly without FlatList */}
      <View style={styles.toolsContainer}>
        {filteredTools.map(tool => (
          <ToolCard
            key={tool.id}
            tag={tool.tag}
            etaLabel={tool.etaLabel}
            title={tool.title}
            description={tool.description}
            onPress={() => handleToolPress(tool)}
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
    padding: Responsive.padding.screen,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  alertsErrorContainer: {
    padding: Responsive.padding.screen,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  alertsEmptyContainer: {
    padding: Responsive.padding.screen,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  loadingText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.sm,
  },
  errorText: {
    fontSize: Typography.sizes.md,
    color: Colors.error,
    fontWeight: Typography.weights.medium,
  },
  errorSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Responsive.spacing.xs,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  topicsContainer: {
    paddingLeft: Responsive.padding.screen,
    paddingRight: Responsive.spacing.lg,
  },
  toolsContainer: {
    paddingTop: Responsive.spacing.md,
  },
});

export default ToolsTabContent;
