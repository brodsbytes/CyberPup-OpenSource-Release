// Tool Service - Provides enhanced tool content and mock interactions for detail screens
// Similar structure to GuideService but for interactive security tools

import { BreachCheckService } from './breachCheckService';

export class ToolService {
  
  // Get tool by ID with enhanced content and mock interactions
  static async getToolById(toolId) {
    try {
      const tools = this.getEnhancedTools();
      const tool = tools.find(t => t.id === toolId);
      
      if (tool) {
        return tool;
      }
      
      // Tool not found
      throw new Error(`Tool with ID ${toolId} not found`);
    } catch (error) {
      console.log('Error getting tool by ID:', error);
      throw error;
    }
  }

  // Get all tools with enhanced content and mock interactions
  static getEnhancedTools() {
    return [

      {
        id: 'tool-2',
        tag: 'LOOKUP',
        etaLabel: '2 min',
        title: 'Breach Lookup Tool',
        description: 'Check if your email address has been compromised in known data breaches.',
        topics: ['data-breach', 'account-security'],
        relatedCheckId: '1-1-5',
        author: 'CyberPup Security Team',
        lastUpdated: '2025-09-06',
        category: 'Security Monitoring',
        fullDescription: `See if your accounts have been exposed in a data breach. CyberPup will check safely through XposedOrNot and guide you on the next steps if your details are found.`,
        features: [
          'Search across major breach databases',
          'Real-time breach monitoring',
          'Detailed breach information and impact',
          'Recommended actions for each breach',
          'Historical timeline of your exposures',
          'Severity assessment for each incident'
        ],
        howItWorks: `
          <h2>How Breach Detection Works</h2>
          
          <p>Our breach lookup service aggregates data from multiple sources to provide comprehensive coverage:</p>
          
          <h3>1. Data Sources</h3>
          <p>We monitor breach databases, security research, and responsible disclosure reports to maintain up-to-date information.</p>
          
          <h3>2. Email Hashing</h3>
          <p>Your email is hashed before searching to protect your privacy while checking breach databases.</p>
          
          <h3>3. Breach Analysis</h3>
          <p>Each breach is analyzed for severity, data types exposed, and potential impact on users.</p>
          
          <h3>4. Remediation Guidance</h3>
          <p>We provide specific steps to take based on the type of data exposed in each breach.</p>
          
          <h2>Types of Data Breaches</h2>
          
          <ul>
            <li><strong>Email Lists:</strong> Email addresses only - Low risk</li>
            <li><strong>Password Breaches:</strong> Passwords exposed - High risk</li>
            <li><strong>Personal Data:</strong> Names, addresses, phone numbers - Medium risk</li>
            <li><strong>Financial Data:</strong> Credit cards, bank details - Very high risk</li>
            <li><strong>Identity Documents:</strong> SSN, passport data - Critical risk</li>
          </ul>
          
          <h2>What to Do If Found</h2>
          
          <ol>
            <li><strong>Change passwords immediately</strong> - Especially if password was exposed</li>
            <li><strong>Enable two-factor authentication</strong> - Add extra security layer</li>
            <li><strong>Monitor accounts closely</strong> - Watch for unauthorized activity</li>
            <li><strong>Consider credit monitoring</strong> - If financial data was exposed</li>
            <li><strong>Update security questions</strong> - If personal data was compromised</li>
          </ol>
        `,
        mockInteraction: {
          type: 'breach-lookup',
          placeholder: 'Enter your email address...',
          sampleResults: [
            { 
              email: 'user@example.com', 
              breaches: [
                { name: 'Adobe', date: '2013-10-04', records: '153M', dataTypes: ['Email', 'Password', 'Name'] },
                { name: 'LinkedIn', date: '2012-06-05', records: '165M', dataTypes: ['Email', 'Password'] }
              ]
            },
            { 
              email: 'safe@example.com', 
              breaches: [],
              message: 'Good news! No breaches found for this email address.'
            }
          ]
        },
        tips: [
          'Check all your email addresses regularly',
          'Change passwords for any breached accounts immediately',
          'Enable two-factor authentication on important accounts',
          'Use unique passwords for every account',
          'Monitor your accounts for suspicious activity'
        ],
        relatedLinks: [
          { title: 'Data Breach Response Guide', guideId: 'guide-7' },
          { title: 'Strong Password Creation', guideId: 'guide-1' },
          { title: 'Breach Check Security Module', checkId: '1-1-5' }
        ]
      },




    ];
  }

  // Get tools filtered by topics
  static getToolsByTopics(topicIds) {
    const tools = this.getEnhancedTools();
    if (!topicIds || topicIds.length === 0) {
      return tools;
    }
    
    return tools.filter(tool => 
      tool.topics.some(topic => topicIds.includes(topic))
    );
  }

  // Get related tools for a specific tool
  static getRelatedTools(toolId, limit = 3) {
    const tools = this.getEnhancedTools();
    const currentTool = tools.find(t => t.id === toolId);
    
    if (!currentTool) return [];
    
    return tools
      .filter(t => t.id !== toolId)
      .filter(t => t.topics.some(topic => currentTool.topics.includes(topic)))
      .slice(0, limit);
  }

  // Mock interaction handlers for different tool types
  static async performMockInteraction(toolId, inputData) {
    const tool = await this.getToolById(toolId);
    
    switch (tool.mockInteraction.type) {
      case 'password-checker':
        return this.mockPasswordCheck(inputData.password);
      case 'breach-lookup':
        return this.realBreachLookup(inputData.email);
      case 'link-checker':
        return this.mockLinkCheck(inputData.url);
      case 'scam-detector':
        return this.mockScamDetection(inputData.message);
      default:
        return { result: 'Mock interaction completed', success: true };
    }
  }

  static mockPasswordCheck(password) {
    if (!password) return { error: 'Please enter a password' };
    
    let score = 0;
    let issues = [];
    let suggestions = [];

    // Length check
    if (password.length < 8) {
      issues.push('Too short');
      suggestions.push('Use at least 12 characters');
    } else if (password.length >= 12) {
      score += 25;
    } else {
      score += 15;
    }

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    // Common patterns
    if (/123|abc|qwe/i.test(password)) {
      issues.push('Contains common sequences');
      suggestions.push('Avoid keyboard patterns and sequences');
      score -= 20;
    }

    // Common passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'admin'];
    if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
      issues.push('Contains common password elements');
      suggestions.push('Avoid dictionary words and common passwords');
      score -= 30;
    }

    score = Math.max(0, Math.min(100, score));
    
    let strength = 'Very Weak';
    if (score >= 80) strength = 'Very Strong';
    else if (score >= 60) strength = 'Strong';
    else if (score >= 40) strength = 'Fair';
    else if (score >= 20) strength = 'Weak';

    return {
      score,
      strength,
      issues,
      suggestions,
      estimatedCrackTime: this.calculateCrackTime(score)
    };
  }

  static async realBreachLookup(email) {
    if (!email) return { error: 'Please enter an email address' };
    
    try {
      // First try the detailed analytics API for rich data
      const analyticsResult = await BreachCheckService.getBreachAnalytics(email);
      
      if (analyticsResult.hasAnalytics && analyticsResult.exposedBreaches) {
        return this.formatAnalyticsResult(analyticsResult, email);
      }
      
      // Fallback to basic API if analytics not available
      const result = await BreachCheckService.checkEmailBreach(email);
      const formattedResult = BreachCheckService.formatBreachResult(result);
      
      // Transform breach names to match UI expectations
      const formattedBreaches = Array.isArray(result.breaches) 
        ? result.breaches.map(breachName => ({
            name: breachName,
            date: 'Unknown', // Basic API doesn't provide dates
            records: 'Unknown', // Basic API doesn't provide record counts
            dataTypes: ['Email addresses', 'Potentially passwords and personal data'] // Generic data types
          }))
        : [];
      
      return {
        isBreached: result.isBreached,
        breaches: formattedBreaches,
        breachCount: result.breachCount || 0,
        message: result.message,
        severity: formattedResult.severity,
        recommendations: formattedResult.recommendations,
        status: formattedResult.status,
        title: formattedResult.title,
        checkedAt: result.checkedAt
      };
    } catch (error) {
      console.log('Real breach lookup error:', error.message);
      return { 
        error: error.message,
        isBreached: false,
        breaches: [],
        message: 'Unable to check for breaches. Please try again later.'
      };
    }
  }

  static formatAnalyticsResult(analyticsResult, email) {
    const exposedBreaches = analyticsResult.exposedBreaches.breaches_details || [];
    
    // Debug logging to understand the data structure
    console.log('🔍 Analytics result structure:', JSON.stringify(analyticsResult, null, 2));
    console.log('🔍 Exposed breaches details:', JSON.stringify(exposedBreaches, null, 2));
    
    // Transform detailed breach data to match UI expectations
    const formattedBreaches = exposedBreaches.map(breach => {
      // Parse the date from xposed_date field
      let formattedDate = 'Unknown';
      if (breach.xposed_date) {
        // Handle different date formats
        if (breach.xposed_date.length === 4) {
          // Just year (e.g., "2015")
          formattedDate = breach.xposed_date;
        } else {
          // Try parsing as full date
          const date = new Date(breach.xposed_date);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString();
          } else {
            formattedDate = breach.xposed_date; // Use as-is if can't parse
          }
        }
      } else if (breach.breachedDate) {
        // Fallback to breachedDate format
        formattedDate = new Date(breach.breachedDate).toLocaleDateString();
      }

      // Format record count from xposed_records
      let formattedRecords = 'Unknown';
      if (breach.xposed_records && typeof breach.xposed_records === 'number') {
        if (breach.xposed_records >= 1000000) {
          formattedRecords = `${(breach.xposed_records / 1000000).toFixed(1)}M`;
        } else if (breach.xposed_records >= 1000) {
          formattedRecords = `${(breach.xposed_records / 1000).toFixed(0)}K`;
        } else {
          formattedRecords = breach.xposed_records.toLocaleString();
        }
      } else if (breach.exposedRecords) {
        // Fallback to exposedRecords format
        formattedRecords = `${(breach.exposedRecords / 1000000).toFixed(1)}M`;
      }

      // Parse exposed data types from xposed_data (semicolon separated)
      let dataTypes = ['Email addresses'];
      if (breach.xposed_data && typeof breach.xposed_data === 'string') {
        dataTypes = breach.xposed_data.split(';').map(type => type.trim());
      } else if (breach.exposedData && Array.isArray(breach.exposedData)) {
        dataTypes = breach.exposedData;
      }

      return {
        name: breach.breach || breach.breachID || 'Unknown',
        date: formattedDate,
        records: formattedRecords,
        dataTypes: dataTypes,
        description: breach.details || breach.exposureDescription || '',
        industry: breach.industry || 'Unknown',
        passwordRisk: breach.password_risk || breach.passwordRisk || 'unknown',
        verified: breach.verified === 'Yes' || breach.verified === true,
        domain: breach.domain || '',
        searchable: breach.searchable === 'Yes' || breach.searchable === true
      };
    });

    const breachCount = formattedBreaches.length;
    const severity = breachCount > 5 ? 'high' : breachCount > 2 ? 'medium' : 'low';

    return {
      isBreached: breachCount > 0,
      breaches: formattedBreaches,
      breachCount: breachCount,
      message: breachCount > 0 
        ? `Your email was found in ${breachCount} data breach${breachCount > 1 ? 'es' : ''} with detailed information available.`
        : 'Good news! Your email was not found in any known data breaches.',
      severity: severity,
      recommendations: this.getDetailedRecommendations(formattedBreaches),
      status: breachCount > 0 ? 'breached' : 'safe',
      title: breachCount > 0 ? `Found in ${breachCount} Breach${breachCount > 1 ? 'es' : ''}` : 'No Breaches Found',
      checkedAt: new Date().toISOString(),
      hasDetailedData: true
    };
  }

  static getDetailedRecommendations(breaches) {
    const recommendations = [
      'Change your password immediately for any accounts using this email'
    ];

    const hasPasswordExposure = breaches.some(breach => 
      breach.dataTypes.some(type => 
        type.toLowerCase().includes('password')
      )
    );

    const hasFinancialData = breaches.some(breach => 
      breach.dataTypes.some(type => 
        type.toLowerCase().includes('credit') || 
        type.toLowerCase().includes('financial') ||
        type.toLowerCase().includes('payment')
      )
    );

    const hasPersonalData = breaches.some(breach => 
      breach.dataTypes.some(type => 
        type.toLowerCase().includes('name') || 
        type.toLowerCase().includes('address') ||
        type.toLowerCase().includes('phone')
      )
    );

    if (hasPasswordExposure) {
      recommendations.push('Enable two-factor authentication on all important accounts');
      recommendations.push('Use a password manager to generate unique passwords');
    }

    if (hasFinancialData) {
      recommendations.push('Monitor your bank and credit card statements closely');
      recommendations.push('Consider placing a fraud alert on your credit reports');
    }

    if (hasPersonalData) {
      recommendations.push('Be vigilant about phishing attempts using your personal information');
      recommendations.push('Update security questions and recovery information');
    }

    recommendations.push('Monitor your accounts closely for suspicious activity');

    return recommendations;
  }

  // Keep the mock function for reference/fallback
  static mockBreachLookup(email) {
    if (!email) return { error: 'Please enter an email address' };
    
    // Mock breach data
    const mockBreaches = [
      { name: 'Adobe', date: '2013-10-04', records: '153M', dataTypes: ['Email', 'Password', 'Name'] },
      { name: 'LinkedIn', date: '2012-06-05', records: '165M', dataTypes: ['Email', 'Password'] },
      { name: 'Dropbox', date: '2012-07-01', records: '68M', dataTypes: ['Email', 'Password'] }
    ];

    // Simulate different results based on email
    if (email.includes('safe')) {
      return { breaches: [], message: 'No breaches found for this email address.' };
    } else {
      const numBreaches = Math.floor(Math.random() * 3) + 1;
      return { 
        breaches: mockBreaches.slice(0, numBreaches),
        message: `Found in ${numBreaches} breach${numBreaches > 1 ? 'es' : ''}.`
      };
    }
  }

  static mockLinkCheck(url) {
    if (!url) return { error: 'Please enter a URL' };

    // Mock analysis based on URL patterns
    if (url.includes('payp4l') || url.includes('phishing')) {
      return {
        status: 'DANGEROUS',
        risks: ['Suspicious domain', 'Phishing attempt', 'Known malicious site'],
        recommendation: 'Do not visit this link. It appears to be a phishing attempt.',
        trustScore: 15
      };
    } else if (url.startsWith('http://') || url.includes('suspicious')) {
      return {
        status: 'SUSPICIOUS',
        risks: ['HTTP instead of HTTPS', 'Unusual domain'],
        recommendation: 'Proceed with caution. Consider visiting the official website directly.',
        trustScore: 45
      };
    } else {
      return {
        status: 'SAFE',
        risks: [],
        recommendation: 'This appears to be a legitimate website.',
        trustScore: 95
      };
    }
  }

  static mockScamDetection(message) {
    if (!message) return { error: 'Please enter a message to analyze' };

    const scamIndicators = {
      'prize': 'Prize/Lottery Scam',
      'congratulations': 'Prize/Lottery Scam',
      'won': 'Prize/Lottery Scam',
      'deployed': 'Romance Scam',
      'military': 'Romance Scam',
      'investment': 'Investment Fraud',
      'guaranteed return': 'Investment Fraud',
      'tech support': 'Tech Support Scam',
      'computer infected': 'Tech Support Scam'
    };

    let scamType = 'Unknown';
    let riskLevel = 'LOW';
    let indicators = [];

    const lowerMessage = message.toLowerCase();
    
    // Check for scam indicators
    Object.keys(scamIndicators).forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        scamType = scamIndicators[keyword];
        riskLevel = 'HIGH';
        indicators.push(`Contains "${keyword}"`);
      }
    });

    // Check for urgency
    if (/urgent|immediate|act now|limited time/i.test(message)) {
      indicators.push('Uses urgency tactics');
      riskLevel = 'MEDIUM';
    }

    // Check for poor grammar
    if (/\b[A-Z]{3,}\b/.test(message)) {
      indicators.push('Excessive capitalization');
    }

    return {
      scamType,
      riskLevel,
      indicators,
      recommendation: this.getScamRecommendation(riskLevel),
      confidence: indicators.length > 0 ? 'High' : 'Low'
    };
  }

  static calculateCrackTime(score) {
    if (score >= 80) return 'Centuries';
    if (score >= 60) return 'Years';
    if (score >= 40) return 'Months';
    if (score >= 20) return 'Days';
    return 'Minutes';
  }

  static getScamRecommendation(riskLevel) {
    switch (riskLevel) {
      case 'HIGH':
        return 'This appears to be a scam. Do not respond or provide any information.';
      case 'MEDIUM':
        return 'This shows suspicious patterns. Be very cautious and verify independently.';
      default:
        return 'No obvious scam indicators detected, but always remain vigilant.';
    }
  }
}
