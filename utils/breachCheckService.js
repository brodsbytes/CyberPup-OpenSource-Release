// Breach Check Service - XposedOrNot API Integration
// Provides real data breach checking functionality using XposedOrNot API

export class BreachCheckService {
  // Rate limiting: XposedOrNot allows 1 query per second
  static lastRequestTime = 0;
  static RATE_LIMIT_DELAY = 1000; // 1 second in milliseconds

  /**
   * Create a timeout signal for fetch requests (Android compatible)
   * @param {number} timeoutMs - Timeout in milliseconds
   * @returns {AbortSignal} Abort signal with timeout
   */
  static createTimeoutSignal(timeoutMs) {
    const controller = new AbortController();
    
    // Use setTimeout for timeout (Android compatible)
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    // Clean up timeout if request completes normally
    const originalSignal = controller.signal;
    const cleanup = () => clearTimeout(timeoutId);
    
    // Add event listener to clean up timeout
    originalSignal.addEventListener('abort', cleanup);
    
    return originalSignal;
  }

  /**
   * Check if an email address has been involved in data breaches
   * @param {string} email - Email address to check
   * @returns {Promise<Object>} Breach check result
   */
  static async checkEmailBreach(email) {
    try {
      // Validate email format first
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Respect rate limiting
      await this.enforceRateLimit();

      const response = await fetch(
        `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CyberPup-App/1.0'
          },
          // 10 second timeout (Android compatible)
          signal: this.createTimeoutSignal(10000)
        }
      );

      // Handle different response status codes
      if (response.status === 404) {
        // No breach found - this is the expected response for clean emails
        return {
          isBreached: false,
          breaches: [],
          message: 'Good news! Your email was not found in any known data breaches.',
          checkedAt: new Date().toISOString()
        };
      }

      if (response.status === 429) {
        // Rate limit exceeded
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (!response.ok) {
        throw new Error(`Service temporarily unavailable (${response.status})`);
      }

      const data = await response.json();
      
      // Parse XposedOrNot response format
      const breaches = data.breaches?.[0] || [];
      const breachCount = Array.isArray(breaches) ? breaches.length : 0;

      return {
        isBreached: breachCount > 0,
        breaches: breaches,
        breachCount: breachCount,
        message: breachCount > 0 
          ? `Your email was found in ${breachCount} data breach${breachCount > 1 ? 'es' : ''}. We recommend changing your passwords immediately.`
          : 'Good news! Your email was not found in any known data breaches.',
        checkedAt: new Date().toISOString()
      };

    } catch (error) {
      // Error will be handled by the calling component
      
      // Return user-friendly error messages
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      
      if (error.message.includes('Too many requests')) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      
      throw new Error('Unable to check for breaches. Please try again later.');
    }
  }

  /**
   * Get detailed breach analytics for an email address
   * @param {string} email - Email address to analyze
   * @returns {Promise<Object>} Detailed breach analytics
   */
  static async getBreachAnalytics(email) {
    try {
      if (!this.validateEmail(email)) {
        throw new Error('Invalid email format');
      }

      await this.enforceRateLimit();

      const response = await fetch(
        `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CyberPup-App/1.0'
          },
          signal: this.createTimeoutSignal(10000)
        }
      );

      if (response.status === 404) {
        // No detailed data available
        return {
          hasAnalytics: false,
          message: 'No detailed breach information available for this email.'
        };
      }

      if (!response.ok) {
        throw new Error(`Service temporarily unavailable (${response.status})`);
      }

      const data = await response.json();
      
      return {
        hasAnalytics: true,
        breachMetrics: data.BreachMetrics || {},
        breachesSummary: data.BreachesSummary || {},
        exposedBreaches: data.ExposedBreaches || {},
        checkedAt: new Date().toISOString()
      };

    } catch (error) {
      console.log('Breach analytics error:', error.message);
      
      // Fallback to basic breach check if analytics fail
      console.log('Falling back to basic breach check...');
      return await this.checkEmailBreach(email);
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if email format is valid
   */
  static validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Basic email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Enforce rate limiting to respect API limits (1 request per second)
   * @returns {Promise<void>}
   */
  static async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      const delay = this.RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Format breach information for display
   * @param {Object} breachResult - Result from breach check
   * @returns {Object} Formatted breach information
   */
  static formatBreachResult(breachResult) {
    if (!breachResult.isBreached) {
      return {
        status: 'safe',
        title: 'No Breaches Found',
        message: breachResult.message,
        severity: 'low',
        recommendations: [
          'Continue monitoring your accounts',
          'Use strong, unique passwords',
          'Enable two-factor authentication'
        ]
      };
    }

    const severity = breachResult.breachCount > 5 ? 'high' : 
                    breachResult.breachCount > 2 ? 'medium' : 'low';

    return {
      status: 'breached',
      title: `Found in ${breachResult.breachCount} Breach${breachResult.breachCount > 1 ? 'es' : ''}`,
      message: breachResult.message,
      severity: severity,
      breaches: breachResult.breaches,
      recommendations: [
        'Change your password immediately',
        'Enable two-factor authentication',
        'Monitor accounts for suspicious activity',
        'Consider using a password manager',
        'Check other accounts with the same password'
      ]
    };
  }

  /**
   * Get breach severity level based on breach count
   * @param {number} breachCount - Number of breaches found
   * @returns {string} Severity level: 'low', 'medium', 'high'
   */
  static getBreachSeverity(breachCount) {
    if (breachCount === 0) return 'low';
    if (breachCount <= 2) return 'medium';
    return 'high';
  }

  /**
   * Get recommended actions based on breach result
   * @param {Object} breachResult - Result from breach check
   * @returns {Array<string>} Array of recommended actions
   */
  static getRecommendedActions(breachResult) {
    if (!breachResult.isBreached) {
      return [
        'Continue monitoring your accounts regularly',
        'Use strong, unique passwords for all accounts',
        'Enable two-factor authentication where possible',
        'Consider using a reputable password manager'
      ];
    }

    const actions = [
      'Change your password immediately for any accounts using this email',
      'Enable two-factor authentication on all important accounts',
      'Monitor your accounts closely for suspicious activity'
    ];

    if (breachResult.breachCount > 2) {
      actions.push(
        'Consider using a password manager to generate unique passwords',
        'Review and update security questions and recovery information',
        'Consider credit monitoring if financial information may have been exposed'
      );
    }

    return actions;
  }
}
