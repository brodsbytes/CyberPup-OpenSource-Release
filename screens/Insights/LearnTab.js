import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Colors, Responsive } from '../../theme';
import { SCREEN_NAMES } from '../../constants';
import { alerts, topics, guides } from '../../data/insightsMock';
import SectionHeader from '../../components/insights/SectionHeader';
import AlertCard from '../../components/insights/AlertCard';
import TopicChip from '../../components/insights/TopicChip';
import GuideCard from '../../components/insights/GuideCard';

const LearnTab = ({ query, navigation }) => {
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Filter guides based on query and selected topics
  const filteredGuides = useMemo(() => {
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
    // Navigate to alert detail or related check
    if (alert.relatedCheckId) {
      // Map to existing check screens
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

  const handleGuidePress = (guide) => {
    // Navigate to guide detail or related check
    if (guide.relatedCheckId) {
      const checkRoutes = {
        '1-1-1': 'Check1_1_StrongPasswordsScreen',
        '1-1-3': 'Check1_3_PasswordManagersScreen',
        '1-1-4': 'Check1_4_MFASetupScreen',
        '1-1-5': 'Check1_5_BreachCheckScreen',
      };
      const routeName = checkRoutes[guide.relatedCheckId];
      if (routeName) {
        navigation.navigate(routeName);
      }
    } else {
      // Navigate to placeholder guide detail
      navigation.navigate(SCREEN_NAMES.GUIDE_DETAIL, { id: guide.id });
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
  topicsContainer: {
    paddingLeft: Responsive.padding.screen,
    paddingRight: Responsive.spacing.lg,
  },
  guidesContainer: {
    paddingTop: Responsive.spacing.md,
  },
});

export default LearnTab;
