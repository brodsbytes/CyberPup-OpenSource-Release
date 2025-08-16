import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Colors, Responsive } from '../../theme';
import { SCREEN_NAMES } from '../../constants';
import { alerts, topics, tools } from '../../data/insightsMock';
import SectionHeader from '../../components/insights/SectionHeader';
import AlertCard from '../../components/insights/AlertCard';
import TopicChip from '../../components/insights/TopicChip';
import ToolCard from '../../components/insights/ToolCard';

const ToolsTab = ({ query, navigation }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Filter tools based on query and selected topics
  const filteredTools = useMemo(() => {
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
    // Navigate to alert detail or related check
    if (alert.relatedCheckId) {
      const checkRoutes = {
        '1-1-1': 'Check1_1_StrongPasswordsScreen',
        '1-1-4': 'Check1_4_MFASetupScreen',
        '1-1-5': 'Check1_5_BreachCheckScreen',
      };
      const routeName = checkRoutes[alert.relatedCheckId];
      if (routeName) {
        navigation.navigate(routeName);
      }
    }
  };

  const handleToolPress = (tool) => {
    // Navigate to tool detail or related check
    if (tool.relatedCheckId) {
      const checkRoutes = {
        '1-1-1': 'Check1_1_StrongPasswordsScreen',
        '1-1-4': 'Check1_4_MFASetupScreen',
        '1-1-5': 'Check1_5_BreachCheckScreen',
      };
      const routeName = checkRoutes[tool.relatedCheckId];
      if (routeName) {
        navigation.navigate(routeName);
      }
    } else {
      // Navigate to placeholder tool detail
      navigation.navigate(SCREEN_NAMES.TOOL_DETAIL, { id: tool.id });
    }
  };

  const renderAlertCard = ({ item }) => (
    <AlertCard
      title={item.title}
      summary={item.summary}
      tag={item.tag}
      onPress={() => handleAlertPress(item)}
    />
  );

  const renderToolCard = ({ item }) => (
    <ToolCard
      tag={item.tag}
      etaLabel={item.etaLabel}
      title={item.title}
      description={item.description}
      onPress={() => handleToolPress(item)}
    />
  );

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Security Alerts Section */}
      <SectionHeader 
        title="Security Alerts" 
        actionText="See all"
        onActionPress={() => {}}
      />
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
            onPress={() => handleAlertPress(alert)}
          />
        ))}
      </ScrollView>

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
        {topics.map(topic => (
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
      <FlatList
        data={filteredTools}
        renderItem={renderToolCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.toolsContainer}
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
  topicsContainer: {
    paddingLeft: Responsive.padding.screen,
    paddingRight: Responsive.spacing.lg,
  },
  toolsContainer: {
    paddingTop: Responsive.spacing.md,
  },
});

export default ToolsTab;
