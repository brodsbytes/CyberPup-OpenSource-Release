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
        id: 'tool-1',
        tag: 'CHECKER',
        etaLabel: 'Instant',
        title: 'Password Strength Checker',
        description: 'Test the strength of your passwords and get recommendations for improvement.',
        topics: ['passwords', 'authentication'],
        relatedCheckId: '1-1-1',
        author: 'CyberPup Security Team',
        lastUpdated: '2025-01-15',
        category: 'Security Analysis',
        fullDescription: `
          Test the strength of your passwords against modern attack methods. Our password strength checker analyzes your passwords using advanced algorithms to identify weaknesses and provide specific recommendations for improvement.
        `,
        features: [
          'Real-time strength analysis as you type',
          'Detailed breakdown of password weaknesses',
          'Specific improvement recommendations',
          'Estimated time to crack calculations',
          'Common password detection',
          'Dictionary attack simulation'
        ],
        howItWorks: `
          <h2>How Password Strength Checking Works</h2>
          
          <p>Our password strength checker uses multiple analysis methods to evaluate your password security:</p>
          
          <h3>1. Length Analysis</h3>
          <p>Longer passwords are exponentially harder to crack. We analyze character count and recommend minimum lengths based on usage.</p>
          
          <h3>2. Character Complexity</h3>
          <p>We check for use of uppercase, lowercase, numbers, and special characters to ensure maximum entropy.</p>
          
          <h3>3. Pattern Detection</h3>
          <p>Our algorithms identify common patterns like keyboard walks (qwerty), sequences (123456), and repetition (aaa).</p>
          
          <h3>4. Dictionary Checks</h3>
          <p>We compare against databases of common passwords, leaked passwords, and dictionary words.</p>
          
          <h3>5. Personal Information</h3>
          <p>The tool warns against using personal information that could be easily guessed or found online.</p>
          
          <h2>Strength Scoring</h2>
          
          <ul>
            <li><strong>Very Weak (0-20):</strong> Easily cracked in seconds</li>
            <li><strong>Weak (21-40):</strong> Vulnerable to basic attacks</li>
            <li><strong>Fair (41-60):</strong> Some protection but improvements needed</li>
            <li><strong>Good (61-80):</strong> Reasonable security for most accounts</li>
            <li><strong>Strong (81-100):</strong> Excellent protection against attacks</li>
          </ul>
        `,
        mockInteraction: {
          type: 'password-checker',
          placeholder: 'Enter a password to test...',
          samplePasswords: [
            { password: 'password', strength: 5, message: 'Very weak - common password' },
            { password: 'Password123', strength: 25, message: 'Weak - predictable pattern' },
            { password: 'MySecureP@ssw0rd', strength: 65, message: 'Good - but could be longer' },
            { password: 'Coffee!Mountain@Sunrise2025', strength: 95, message: 'Very strong - excellent!' }
          ]
        },
        tips: [
          'Use at least 12 characters, preferably 16 or more',
          'Combine uppercase, lowercase, numbers, and symbols',
          'Avoid dictionary words and personal information',
          'Use unique passwords for every account',
          'Consider using a passphrase instead of complex characters'
        ],
        relatedLinks: [
          { title: 'Creating Strong Passwords Guide', guideId: 'guide-1' },
          { title: 'Password Manager Setup', guideId: 'guide-4' },
          { title: 'Password Security Check', checkId: '1-1-1' }
        ]
      },
      {
        id: 'tool-2',
        tag: 'LOOKUP',
        etaLabel: '2 min',
        title: 'Breach Lookup Tool',
        description: 'Check if your email address has been compromised in known data breaches.',
        topics: ['data-breach', 'account-security'],
        relatedCheckId: '1-1-5',
        author: 'CyberPup Security Team',
        lastUpdated: '2025-01-27',
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
          { title: 'Data Breach Response Guide', guideId: 'guide-6' },
          { title: 'Strong Password Creation', guideId: 'guide-1' },
          { title: 'Breach Check Security Module', checkId: '1-1-5' }
        ]
      },
      {
        id: 'tool-3',
        tag: 'WIZARD',
        etaLabel: '5 min',
        title: 'MFA Setup Wizard',
        description: 'Guided setup for enabling two-factor authentication on your accounts.',
        topics: ['mfa', 'authentication'],
        relatedCheckId: '1-1-4',
        author: 'CyberPup Security Team',
        lastUpdated: '2025-01-15',
        category: 'Security Configuration',
        fullDescription: `
          Step-by-step wizard to help you enable two-factor authentication on all your important accounts. Get personalized guidance for each platform and service you use.
        `,
        features: [
          'Platform-specific setup instructions',
          'Progress tracking across accounts',
          'QR code scanning guidance',
          'Backup code management',
          'Recovery method setup',
          'Testing and verification steps'
        ],
        howItWorks: `
          <h2>MFA Setup Process</h2>
          
          <p>Our wizard guides you through enabling two-factor authentication systematically:</p>
          
          <h3>1. Account Discovery</h3>
          <p>We help you identify which of your accounts support 2FA and prioritize them by importance.</p>
          
          <h3>2. Method Selection</h3>
          <p>Choose the best 2FA method for each account - authenticator apps, SMS, or hardware keys.</p>
          
          <h3>3. Step-by-Step Setup</h3>
          <p>Platform-specific instructions with screenshots and tips for successful configuration.</p>
          
          <h3>4. Backup Configuration</h3>
          <p>Ensure you have recovery methods in place - backup codes, alternative devices, etc.</p>
          
          <h3>5. Testing and Verification</h3>
          <p>Test each setup to ensure it works correctly before moving to the next account.</p>
          
          <h2>Supported Platforms</h2>
          
          <ul>
            <li><strong>Email Services:</strong> Gmail, Outlook, Yahoo, ProtonMail</li>
            <li><strong>Social Media:</strong> Facebook, Twitter, Instagram, LinkedIn</li>
            <li><strong>Financial:</strong> Banks, PayPal, investment platforms</li>
            <li><strong>Cloud Storage:</strong> Google Drive, Dropbox, OneDrive</li>
            <li><strong>Work Platforms:</strong> Microsoft 365, Slack, Zoom</li>
            <li><strong>Shopping:</strong> Amazon, eBay, major retailers</li>
          </ul>
          
          <h2>Best Practices</h2>
          
          <ul>
            <li>Use authenticator apps instead of SMS when possible</li>
            <li>Set up multiple backup methods</li>
            <li>Store backup codes securely</li>
            <li>Test everything before finishing setup</li>
            <li>Update recovery information regularly</li>
          </ul>
        `,
        mockInteraction: {
          type: 'mfa-wizard',
          steps: [
            { 
              title: 'Choose Your Platform',
              description: 'Select which service you want to secure',
              options: ['Google Account', 'Facebook', 'Banking', 'Microsoft', 'Custom']
            },
            { 
              title: 'Select 2FA Method',
              description: 'Choose your preferred authentication method',
              options: ['Authenticator App (Recommended)', 'SMS Text Message', 'Hardware Key']
            },
            { 
              title: 'Install Authenticator',
              description: 'Download and set up your authenticator app',
              apps: ['Google Authenticator', 'Microsoft Authenticator', 'Authy']
            },
            { 
              title: 'Configure Account',
              description: 'Follow platform-specific setup instructions',
              hasScreenshots: true
            },
            { 
              title: 'Test Setup',
              description: 'Verify your 2FA is working correctly',
              testSteps: ['Log out', 'Log back in', 'Enter 2FA code', 'Success!']
            }
          ]
        },
        tips: [
          'Start with your most important accounts first',
          'Always save backup codes in a secure location',
          'Test your setup immediately after configuration',
          'Use authenticator apps instead of SMS when possible',
          'Set up 2FA on your password manager first'
        ],
        relatedLinks: [
          { title: 'Two-Factor Authentication Guide', guideId: 'guide-2' },
          { title: 'Password Manager Setup', guideId: 'guide-4' },
          { title: 'MFA Security Check', checkId: '1-1-4' }
        ]
      },
      {
        id: 'tool-4',
        tag: 'CHECKER',
        etaLabel: 'Instant',
        title: 'Phishing Link Checker',
        description: 'Analyze suspicious links to determine if they\'re safe or potentially malicious.',
        topics: ['phishing', 'email-security'],
        author: 'CyberPup Security Team',
        lastUpdated: '2025-01-15',
        category: 'Threat Analysis',
        fullDescription: `
          Analyze suspicious URLs and links to detect phishing attempts and malicious websites. Our link checker uses multiple security databases and analysis techniques to keep you safe online.
        `,
        features: [
          'Real-time URL reputation checking',
          'Phishing database comparison',
          'Domain age and registration analysis',
          'SSL certificate verification',
          'Redirect chain analysis',
          'Safe preview without visiting'
        ],
        howItWorks: `
          <h2>Link Analysis Process</h2>
          
          <p>Our phishing link checker uses multiple layers of analysis to determine URL safety:</p>
          
          <h3>1. Reputation Databases</h3>
          <p>We check URLs against known malicious site databases and threat intelligence feeds.</p>
          
          <h3>2. Domain Analysis</h3>
          <p>Examine domain registration date, registrar information, and historical reputation.</p>
          
          <h3>3. URL Structure</h3>
          <p>Analyze URL patterns, suspicious subdomains, and deceptive formatting techniques.</p>
          
          <h3>4. SSL Certificate</h3>
          <p>Verify the authenticity and validity of security certificates.</p>
          
          <h3>5. Content Preview</h3>
          <p>Safely preview page content without exposing your device to potential threats.</p>
          
          <h2>Warning Signs</h2>
          
          <ul>
            <li><strong>Suspicious domains:</strong> Misspelled company names (payp4l.com)</li>
            <li><strong>URL shorteners:</strong> bit.ly, tinyurl without context</li>
            <li><strong>Unusual subdomains:</strong> security.paypal.malicious.com</li>
            <li><strong>HTTP instead of HTTPS:</strong> Especially for login pages</li>
            <li><strong>Recent domain registration:</strong> Created within last few days</li>
          </ul>
          
          <h2>Safety Recommendations</h2>
          
          <ul>
            <li>Never click suspicious links in emails</li>
            <li>Type URLs directly into your browser</li>
            <li>Look for HTTPS and valid certificates</li>
            <li>Verify sender identity through other means</li>
            <li>When in doubt, don't click</li>
          </ul>
        `,
        mockInteraction: {
          type: 'link-checker',
          placeholder: 'Paste a suspicious link here...',
          sampleAnalysis: [
            {
              url: 'https://payp4l-security.malicious.com/login',
              status: 'DANGEROUS',
              risks: ['Suspicious domain', 'Phishing attempt', 'Fake PayPal site'],
              recommendation: 'Do not visit this link. It appears to be a phishing attempt.'
            },
            {
              url: 'https://www.paypal.com/signin',
              status: 'SAFE',
              risks: [],
              recommendation: 'This appears to be a legitimate PayPal login page.'
            },
            {
              url: 'http://bankofamerica-alerts.net/verify',
              status: 'SUSPICIOUS',
              risks: ['HTTP instead of HTTPS', 'Unofficial domain'],
              recommendation: 'Proceed with caution. Visit the official Bank of America website directly.'
            }
          ]
        },
        tips: [
          'Always hover over links to see the destination before clicking',
          'Look for subtle misspellings in domain names',
          'Be suspicious of urgent or threatening language',
          'When in doubt, navigate to websites directly',
          'Report phishing attempts to the impersonated organization'
        ],
        relatedLinks: [
          { title: 'Spotting Phishing Emails Guide', guideId: 'guide-3' },
          { title: 'Email Security Best Practices', checkId: '1-1-1' }
        ]
      },
      {
        id: 'tool-5',
        tag: 'WIZARD',
        etaLabel: '3 min',
        title: 'Privacy Settings Scanner',
        description: 'Scan your social media accounts and get recommendations for privacy improvements.',
        topics: ['social-media', 'privacy'],
        author: 'CyberPup Security Team',
        lastUpdated: '2025-01-15',
        category: 'Privacy Configuration',
        fullDescription: `
          Analyze your social media privacy settings across platforms and get personalized recommendations to improve your digital privacy and security.
        `,
        features: [
          'Multi-platform privacy analysis',
          'Personalized recommendations',
          'Privacy score calculation',
          'Step-by-step improvement guide',
          'Regular monitoring alerts',
          'Before/after comparison'
        ],
        howItWorks: `
          <h2>Privacy Analysis Process</h2>
          
          <p>Our privacy scanner evaluates your social media settings across multiple dimensions:</p>
          
          <h3>1. Profile Visibility</h3>
          <p>Check who can see your profile information, posts, and personal details.</p>
          
          <h3>2. Data Sharing</h3>
          <p>Analyze what information is shared with third parties and advertisers.</p>
          
          <h3>3. Location Privacy</h3>
          <p>Review location sharing settings and geotagging preferences.</p>
          
          <h3>4. Contact Management</h3>
          <p>Examine who can contact you and how others can find your profile.</p>
          
          <h3>5. Activity Tracking</h3>
          <p>Check what activities are tracked and shared publicly.</p>
          
          <h2>Supported Platforms</h2>
          
          <ul>
            <li><strong>Facebook:</strong> Profile, timeline, apps, and advertising settings</li>
            <li><strong>Instagram:</strong> Account privacy, story controls, and activity status</li>
            <li><strong>Twitter:</strong> Tweet privacy, discoverability, and data sharing</li>
            <li><strong>LinkedIn:</strong> Public profile, activity broadcasts, and visibility</li>
            <li><strong>TikTok:</strong> Account privacy, safety settings, and analytics</li>
          </ul>
          
          <h2>Privacy Score Factors</h2>
          
          <ul>
            <li>Public vs. private account settings</li>
            <li>Data sharing with third parties</li>
            <li>Location tracking preferences</li>
            <li>Personal information visibility</li>
            <li>Contact and discovery settings</li>
          </ul>
        `,
        mockInteraction: {
          type: 'privacy-scanner',
          platforms: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok'],
          sampleReport: {
            overallScore: 65,
            platforms: [
              {
                name: 'Facebook',
                score: 45,
                issues: ['Profile is public', 'Location sharing enabled', 'Apps have broad permissions'],
                recommendations: ['Set profile to private', 'Disable location sharing', 'Review app permissions']
              },
              {
                name: 'Instagram',
                score: 80,
                issues: ['Activity status visible'],
                recommendations: ['Turn off activity status']
              }
            ]
          }
        },
        tips: [
          'Review privacy settings at least quarterly',
          'Be cautious about location sharing',
          'Limit who can contact you directly',
          'Review and remove unused app permissions',
          'Consider making profiles private by default'
        ],
        relatedLinks: [
          { title: 'Social Media Privacy Guide', guideId: 'guide-5' },
          { title: 'Online Privacy Best Practices', checkId: '1-1-1' }
        ]
      },
      {
        id: 'tool-6',
        tag: 'CHECKER',
        etaLabel: 'Instant',
        title: 'Scam Detection Tool',
        description: 'Analyze messages and offers to identify potential scams and fraud attempts.',
        topics: ['scams', 'online-safety'],
        author: 'CyberPup Security Team',
        lastUpdated: '2025-01-15',
        category: 'Fraud Prevention',
        fullDescription: `
          Analyze suspicious messages, emails, and offers to detect common scam patterns and fraudulent schemes. Protect yourself from financial fraud and identity theft.
        `,
        features: [
          'Multi-type scam detection',
          'Pattern recognition analysis',
          'Fraud database comparison',
          'Risk assessment scoring',
          'Educational explanations',
          'Reporting guidance'
        ],
        howItWorks: `
          <h2>Scam Detection Methods</h2>
          
          <p>Our scam detection tool analyzes multiple indicators to identify fraudulent content:</p>
          
          <h3>1. Language Analysis</h3>
          <p>Examine text for common scam phrases, urgency tactics, and grammatical patterns.</p>
          
          <h3>2. Pattern Matching</h3>
          <p>Compare against known scam templates and fraudulent message structures.</p>
          
          <h3>3. Contact Verification</h3>
          <p>Analyze sender information and contact methods for legitimacy.</p>
          
          <h3>4. Offer Analysis</h3>
          <p>Evaluate if offers are too good to be true or use pressure tactics.</p>
          
          <h3>5. Context Assessment</h3>
          <p>Consider timing, relevance, and personalization of the message.</p>
          
          <h2>Common Scam Types</h2>
          
          <ul>
            <li><strong>Romance Scams:</strong> Fake relationships for money</li>
            <li><strong>Investment Fraud:</strong> Get-rich-quick schemes</li>
            <li><strong>Tech Support:</strong> Fake computer problem calls</li>
            <li><strong>Prize/Lottery:</strong> Winning notifications requiring payment</li>
            <li><strong>Advance Fee:</strong> Upfront payment for fake services</li>
            <li><strong>Identity Theft:</strong> Requests for personal information</li>
          </ul>
          
          <h2>Red Flags</h2>
          
          <ul>
            <li>Requests for personal or financial information</li>
            <li>Pressure to act immediately</li>
            <li>Offers that seem too good to be true</li>
            <li>Poor grammar and spelling</li>
            <li>Requests for unusual payment methods</li>
            <li>Unsolicited contact from unknown parties</li>
          </ul>
        `,
        mockInteraction: {
          type: 'scam-detector',
          placeholder: 'Paste suspicious message here...',
          sampleAnalysis: [
            {
              message: 'CONGRATULATIONS! You have won $50,000! Send $500 for processing fees to claim your prize!',
              scamType: 'Prize/Lottery Scam',
              riskLevel: 'HIGH',
              indicators: ['Unsolicited prize notification', 'Upfront fee request', 'Excessive capitalization'],
              recommendation: 'This is definitely a scam. Legitimate prizes never require payment.'
            },
            {
              message: 'Hi, I saw your profile and would like to get to know you better. I am currently deployed overseas...',
              scamType: 'Romance Scam',
              riskLevel: 'MEDIUM',
              indicators: ['Military deployment story', 'Quick personal interest', 'Vague profile reference'],
              recommendation: 'Be very cautious. This shows common romance scam patterns.'
            }
          ]
        },
        tips: [
          'Be skeptical of unsolicited offers',
          'Never give personal information to unknown contacts',
          'Research suspicious offers online',
          'Trust your instincts if something feels wrong',
          'Report scams to appropriate authorities'
        ],
        relatedLinks: [
          { title: 'Online Safety Best Practices', checkId: '1-1-1' },
          { title: 'Phishing Email Detection', guideId: 'guide-3' }
        ]
      }
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
