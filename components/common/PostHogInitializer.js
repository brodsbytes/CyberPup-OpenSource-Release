/**
 * PostHog Initializer Component
 * Sets up PostHog instance in analytics service
 */

import React, { useEffect } from 'react';
import { usePostHog } from 'posthog-react-native';
import { analyticsService } from '../../utils/analytics';
import { cyberPupLogger, LOG_CATEGORIES } from '../../utils/logger';

const PostHogInitializer = () => {
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog) {
      cyberPupLogger.info(LOG_CATEGORIES.GENERAL, 'PostHog instance received from provider');
      analyticsService.setPostHogInstance(posthog);
      
      // Initialize analytics after PostHog instance is set
      analyticsService.initialize().catch(error => {
        cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, 'Analytics initialization failed', { error: error.message });
      });
    } else {
      cyberPupLogger.warn(LOG_CATEGORIES.GENERAL, 'PostHog instance not available from provider');
    }
  }, [posthog]);

  // This component doesn't render anything
  return null;
};

export default PostHogInitializer;
