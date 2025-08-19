// Topics Service - Provides security topics for filtering guides and tools

export class TopicsService {
  // Get all available topics
  static getAllTopics() {
    return [
      { id: 'passwords', label: 'Passwords' },
      { id: 'mfa', label: 'MFA & 2FA' },
      { id: 'phishing', label: 'Phishing' },
      { id: 'social-media', label: 'Social Media' },
      { id: 'data-breach', label: 'Data Breaches' },
      { id: 'email-security', label: 'Email Security' },
      { id: 'mobile-security', label: 'Mobile Security' },
      { id: 'privacy', label: 'Privacy' },
      { id: 'scams', label: 'Scams' },
      { id: 'authentication', label: 'Authentication' },
      { id: 'account-security', label: 'Account Security' },
      { id: 'online-safety', label: 'Online Safety' },
    ];
  }

  // Get topics by IDs
  static getTopicsByIds(topicIds) {
    const allTopics = this.getAllTopics();
    return allTopics.filter(topic => topicIds.includes(topic.id));
  }

  // Get topic by ID
  static getTopicById(topicId) {
    const allTopics = this.getAllTopics();
    return allTopics.find(topic => topic.id === topicId);
  }
}
