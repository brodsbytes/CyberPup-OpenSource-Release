/**
 * Analytics Testing Script
 * 
 * This script helps test PostHog analytics implementation
 * Run with: node scripts/test-analytics.js
 */

// Mock React Native components for Node.js testing
const mockAsyncStorage = {
  getItem: async (key) => {
    console.log(`📦 AsyncStorage.getItem('${key}')`);
    return null; // Simulate no stored data
  },
  setItem: async (key, value) => {
    console.log(`📦 AsyncStorage.setItem('${key}', '${value}')`);
    return true;
  },
  removeItem: async (key) => {
    console.log(`📦 AsyncStorage.removeItem('${key}')`);
    return true;
  }
};

const mockPlatform = {
  OS: 'web'
};

const mockPostHog = {
  initAsync: async (config) => {
    console.log('🔧 PostHog.initAsync called with config:', JSON.stringify(config, null, 2));
    return true;
  },
  identify: (userId, properties) => {
    console.log('👤 PostHog.identify called:', userId, properties);
  },
  capture: (eventName, properties) => {
    console.log('📊 PostHog.capture called:', eventName, properties);
  },
  setPersonProperties: (properties) => {
    console.log('👤 PostHog.setPersonProperties called:', properties);
  },
  flush: async () => {
    console.log('🚀 PostHog.flush called');
  }
};

const mockLogger = {
  info: (category, message, data) => console.log(`ℹ️ [${category}] ${message}`, data || ''),
  debug: (category, message, data) => console.log(`🐛 [${category}] ${message}`, data || ''),
  warn: (category, message, data) => console.log(`⚠️ [${category}] ${message}`, data || ''),
  error: (category, message, data) => console.log(`❌ [${category}] ${message}`, data || ''),
};

// Mock the dependencies
global.AsyncStorage = mockAsyncStorage;
global.Platform = mockPlatform;
global.PostHog = mockPostHog;

// Create a mock analytics service for testing
class TestAnalyticsService {
  constructor() {
    this.isInitialized = false;
    this.isEnabled = false;
    this.anonymousUserId = null;
    this.events = []; // Store events for testing
  }

  async initialize() {
    console.log('\n🚀 Initializing Analytics Service...');
    
    // Check consent
    const consentStatus = await this.getConsentStatus();
    console.log(`📋 Consent status: ${consentStatus || 'not set'}`);
    
    if (consentStatus === 'denied') {
      console.log('❌ Analytics disabled - user denied consent');
      return;
    }

    if (consentStatus === null) {
      console.log('🤔 No consent decision made yet');
      return;
    }

    // Initialize PostHog
    await mockPostHog.initAsync({
      apiKey: 'test-api-key',
      host: 'https://app.posthog.com',
    });

    // Generate anonymous user ID
    this.anonymousUserId = await this.getOrCreateAnonymousUserId();
    mockPostHog.identify(this.anonymousUserId, {
      platform: 'web',
      app_version: '1.0.0',
      is_anonymous: true,
    });

    this.isInitialized = true;
    this.isEnabled = true;
    
    console.log('✅ Analytics initialized successfully');
  }

  async getConsentStatus() {
    return await mockAsyncStorage.getItem('analytics_consent');
  }

  async setConsent(granted) {
    const status = granted ? 'granted' : 'denied';
    await mockAsyncStorage.setItem('analytics_consent', status);
    
    if (granted) {
      await this.initialize();
      this.trackEvent('analytics_consent_given');
    } else {
      this.trackEvent('analytics_consent_denied');
      this.disableAnalytics();
    }
    
    console.log(`✅ Analytics consent ${status}`);
  }

  async getOrCreateAnonymousUserId() {
    let userId = await mockAsyncStorage.getItem('analytics_user_id');
    if (!userId) {
      userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await mockAsyncStorage.setItem('analytics_user_id', userId);
    }
    return userId;
  }

  disableAnalytics() {
    this.isEnabled = false;
    this.isInitialized = false;
    console.log('📴 Analytics disabled');
  }

  trackEvent(eventName, properties = {}) {
    if (!this.isEnabled || !this.isInitialized) {
      console.log(`⏭️ Skipping event (analytics disabled): ${eventName}`);
      return;
    }

    const eventData = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        platform: 'web',
        app_version: '1.0.0',
      }
    };

    this.events.push(eventData);
    mockPostHog.capture(eventName, eventData.properties);
  }

  trackScreenView(screenName, properties = {}) {
    this.trackEvent('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  trackSecurityCheck(checkId, action, properties = {}) {
    const eventName = action === 'started' ? 'security_check_started' :
                     action === 'completed' ? 'security_check_completed' :
                     action === 'skipped' ? 'security_check_skipped' : null;

    if (eventName) {
      this.trackEvent(eventName, {
        check_id: checkId,
        ...properties,
      });
    }
  }

  getTrackedEvents() {
    return this.events;
  }
}

// Test scenarios
async function runTests() {
  console.log('🧪 Starting PostHog Analytics Tests\n');
  
  const analytics = new TestAnalyticsService();

  // Test 1: Initialize without consent
  console.log('📋 Test 1: Initialize without consent');
  await analytics.initialize();
  console.log('Expected: Should not initialize due to no consent\n');

  // Test 2: Grant consent and initialize
  console.log('📋 Test 2: Grant consent and initialize');
  await analytics.setConsent(true);
  console.log('Expected: Should initialize successfully\n');

  // Test 3: Track various events
  console.log('📋 Test 3: Track various events');
  analytics.trackEvent('app_started', { version: '1.0.0' });
  analytics.trackScreenView('welcome_screen', { first_visit: true });
  analytics.trackSecurityCheck('check_1-1-1_strong_passwords', 'started', {
    check_name: 'Strong Passwords',
    level: 1,
  });
  analytics.trackSecurityCheck('check_1-1-1_strong_passwords', 'completed', {
    check_name: 'Strong Passwords',
    level: 1,
    score: 100,
  });
  console.log('Expected: Should track all events successfully\n');

  // Test 4: Deny consent
  console.log('📋 Test 4: Deny consent');
  const analytics2 = new TestAnalyticsService();
  await analytics2.setConsent(false);
  analytics2.trackEvent('test_event', { should_not_track: true });
  console.log('Expected: Should disable analytics and skip event tracking\n');

  // Test 5: Summary
  console.log('📋 Test Summary');
  console.log(`Events tracked by analytics1: ${analytics.getTrackedEvents().length}`);
  console.log(`Events tracked by analytics2: ${analytics2.getTrackedEvents().length}`);
  console.log('\nTracked events:');
  analytics.getTrackedEvents().forEach((event, index) => {
    console.log(`${index + 1}. ${event.event} - ${JSON.stringify(event.properties.check_id || event.properties.screen_name || 'general')}`);
  });

  console.log('\n✅ All tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Replace "test-api-key" with your actual PostHog API key');
  console.log('2. Test on actual device with React Native');
  console.log('3. Verify events appear in PostHog dashboard');
  console.log('4. Test consent flow in app');
}

// Run the tests
runTests().catch(console.error);
