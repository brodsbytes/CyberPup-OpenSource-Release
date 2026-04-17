/**
 * Performance Tracker Component
 * Tracks component load times and performance metrics
 */

import { useEffect, useRef } from 'react';
import { trackPerformance } from '../../utils/analytics';

export const usePerformanceTracker = (componentName, trackingProps = {}) => {
  const startTimeRef = useRef(Date.now());
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      const loadTime = Date.now() - startTimeRef.current;
      
      // Track component load time
      trackPerformance(`${componentName}_load_time`, loadTime, {
        component_name: componentName,
        load_time_ms: loadTime,
        ...trackingProps
      });
      
      hasMountedRef.current = true;
    }
  }, [componentName, trackingProps]);

  return {
    trackAction: (actionName, additionalProps = {}) => {
      trackPerformance(`${componentName}_${actionName}`, Date.now() - startTimeRef.current, {
        component_name: componentName,
        action: actionName,
        ...trackingProps,
        ...additionalProps
      });
    }
  };
};

export default usePerformanceTracker;
