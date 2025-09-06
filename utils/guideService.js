// Guide Service - Provides enhanced guide content for detail screens
// Similar structure to SecurityAlertsService but for educational guides

import { CopywritingService } from './copywritingService';

export class GuideService {
  
  // Get guide by ID with enhanced content
  static async getGuideById(guideId) {
    try {
      const guides = this.getEnhancedGuides();
      const guide = guides.find(g => g.id === guideId);
      
      if (guide) {
        return guide;
      }
      
      // Guide not found
      throw new Error(`Guide with ID ${guideId} not found`);
    } catch (error) {
      console.log('Error getting guide by ID:', error);
      throw error;
    }
  }

  // Get all guides with enhanced content
  static getEnhancedGuides() {
    return [
      {
        id: 'guide-1',
        tag: 'GUIDE',
        level: 'Beginner',
        title: 'Creating Strong Passwords',
        excerpt: 'Learn the fundamentals of password security and how to create passwords that are both strong and memorable.',
        readMinutes: 8,
        topics: ['passwords', 'authentication'],
        relatedCheckId: '1-1-1',
        author: 'CyberPup Security Team',
        publishedDate: '2025-08-28',
        lastUpdated: '2025-09-06',
        difficulty: 'Beginner',
        fullContent: `
          <h1>Creating Strong Passwords: Your First Line of Defense</h1>
          
          <p>Passwords are the keys to your digital life. A strong password is your first and most important line of defense against cybercriminals. This comprehensive guide will teach you everything you need to know about creating passwords that are both secure and manageable.</p>
          
          <h2>Why Strong Passwords Matter</h2>
          <p>Weak passwords are responsible for 81% of data breaches. Cybercriminals use sophisticated tools that can crack simple passwords in seconds. A strong password can be the difference between a secure account and a compromised identity.</p>
          
          <h3>Common Password Mistakes</h3>
          <ul>
            <li><strong>Using personal information</strong> - Names, birthdays, addresses</li>
            <li><strong>Dictionary words</strong> - Easy for computers to guess</li>
            <li><strong>Simple patterns</strong> - 123456, qwerty, password</li>
            <li><strong>Reusing passwords</strong> - One breach affects all accounts</li>
            <li><strong>Short passwords</strong> - Less than 12 characters</li>
          </ul>
          
          <h2>The Anatomy of a Strong Password</h2>
          <p>A strong password should have these characteristics:</p>
          
          <h3>Length: The Most Important Factor</h3>
          <ul>
            <li><strong>Minimum 12 characters</strong> - Industry standard</li>
            <li><strong>16+ characters preferred</strong> - Exponentially more secure</li>
            <li><strong>Longer is always better</strong> - Each character adds significant protection</li>
          </ul>
          
          <h3>Complexity: Mix It Up</h3>
          <ul>
            <li><strong>Uppercase letters</strong> (A-Z)</li>
            <li><strong>Lowercase letters</strong> (a-z)</li>
            <li><strong>Numbers</strong> (0-9)</li>
            <li><strong>Special characters</strong> (!@#$%^&*)</li>
          </ul>
          
          <h3>Unpredictability: Avoid Patterns</h3>
          <ul>
            <li>No dictionary words</li>
            <li>No personal information</li>
            <li>No sequential characters (abc, 123)</li>
            <li>No keyboard patterns (qwerty, asdf)</li>
          </ul>
          
          <h2>Password Creation Methods</h2>
          
          <h3>Method 1: The Passphrase Technique</h3>
          <p>Create a memorable sentence and modify it:</p>
          <ol>
            <li><strong>Start with a sentence:</strong> "I love eating 3 apples every morning"</li>
            <li><strong>Take first letters:</strong> Ile3aem</li>
            <li><strong>Add complexity:</strong> Il3@3m!</li>
            <li><strong>Add length:</strong> ILove3@pplesEveryMorning!</li>
          </ol>
          
          <h3>Method 2: The Substitution Method</h3>
          <p>Replace letters with numbers and symbols:</p>
          <ul>
            <li>a → @</li>
            <li>e → 3</li>
            <li>i → !</li>
            <li>o → 0</li>
            <li>s → $</li>
          </ul>
          
          <h3>Method 3: Random Generation (Recommended)</h3>
          <p>Use a password manager to generate truly random passwords:</p>
          <ul>
            <li>No human bias or patterns</li>
            <li>Maximum security</li>
            <li>Unique for every account</li>
            <li>Automatically saved and filled</li>
          </ul>
          
          <h2>Password Storage and Management</h2>
          
          <h3>Never Store Passwords In:</h3>
          <ul>
            <li>Plain text files</li>
            <li>Email drafts</li>
            <li>Sticky notes</li>
            <li>Browser without master password</li>
            <li>Unencrypted documents</li>
          </ul>
          
          <h3>Recommended Password Managers:</h3>
          <ul>
            <li><strong>Bitwarden</strong> - Open source, free tier available</li>
            <li><strong>1Password</strong> - Premium features, family sharing</li>
            <li><strong>LastPass</strong> - User-friendly interface</li>
            <li><strong>KeePass</strong> - Self-hosted option</li>
          </ul>
          
          <h2>Best Practices for Password Security</h2>
          
          <h3>The Golden Rules</h3>
          <ol>
            <li><strong>One password per account</strong> - Never reuse passwords</li>
            <li><strong>Change compromised passwords immediately</strong> - Monitor for breaches</li>
            <li><strong>Use two-factor authentication</strong> - Extra security layer</li>
            <li><strong>Regular security audits</strong> - Check for weak or reused passwords</li>
            <li><strong>Keep password manager updated</strong> - Latest security features</li>
          </ol>
          
          <h3>When to Change Your Password</h3>
          <ul>
            <li>After a known data breach</li>
            <li>If you suspect account compromise</li>
            <li>When leaving a job or relationship</li>
            <li>If you've shared it with someone</li>
            <li>For high-value accounts annually</li>
          </ul>
          
          <h2>Testing Your Password Strength</h2>
          <p>Use our Password Strength Checker tool to test your passwords. A strong password should:</p>
          <ul>
            <li>Take centuries to crack</li>
            <li>Score 80+ on strength meters</li>
            <li>Have high entropy (randomness)</li>
            <li>Pass all security checks</li>
          </ul>
          
          <h2>Common Myths Debunked</h2>
          
          <h3>Myth: "I need to change passwords every 90 days"</h3>
          <p><strong>Reality:</strong> Modern security experts recommend changing passwords only when necessary. Frequent changes often lead to weaker passwords.</p>
          
          <h3>Myth: "Complex passwords are enough"</h3>
          <p><strong>Reality:</strong> Length trumps complexity. A 16-character passphrase is stronger than an 8-character complex password.</p>
          
          <h3>Myth: "Password managers aren't safe"</h3>
          <p><strong>Reality:</strong> Password managers are far safer than reusing passwords or storing them insecurely. Even if breached, your passwords remain encrypted.</p>
          
          <h2>Your Next Steps</h2>
          <ol>
            <li><strong>Audit your current passwords</strong> - Check for weak or reused passwords</li>
            <li><strong>Install a password manager</strong> - Choose one that fits your needs</li>
            <li><strong>Generate new passwords</strong> - Start with your most important accounts</li>
            <li><strong>Enable two-factor authentication</strong> - Add an extra security layer</li>
            <li><strong>Practice good password hygiene</strong> - Make security a habit</li>
          </ol>
          
          <p><strong>Remember:</strong> A strong password is just the beginning. Combine it with good security practices for comprehensive protection.</p>
        `,
        keyTakeaways: [
          'Use passwords with 12+ characters, preferably 16+',
          'Combine uppercase, lowercase, numbers, and symbols',
          'Never reuse passwords across multiple accounts',
          'Use a password manager for generation and storage',
          'Enable two-factor authentication on all accounts'
        ],
        relatedLinks: [
          { title: 'Password Manager Setup Guide', checkId: '1-1-3' },
          { title: 'Two-Factor Authentication Setup', checkId: '1-1-4' },
          { title: 'Breach Check Tool', checkId: '1-1-5' }
        ]
      },
      {
        id: 'guide-2',
        tag: 'GUIDE',
        level: 'Essential',
        title: 'Setting Up Two-Factor Authentication',
        excerpt: 'Step-by-step guide to enabling 2FA on your most important accounts for enhanced security.',
        readMinutes: 12,
        topics: ['mfa', 'authentication', 'account-security'],
        relatedCheckId: '1-1-4',
        author: 'CyberPup Security Team',
        publishedDate: '2025-08-28',
        lastUpdated: '2025-09-06',
        difficulty: 'Essential',
        fullContent: `
          <h1>Setting Up Two-Factor Authentication: Double Your Security</h1>
          
          <p>Two-Factor Authentication (2FA) is one of the most effective ways to protect your online accounts. Even if someone steals your password, they can't access your account without the second factor. This comprehensive playbook will guide you through setting up 2FA on all your important accounts.</p>
          
          <h2>What is Two-Factor Authentication?</h2>
          <p>Two-Factor Authentication requires two different types of verification to access your account:</p>
          
          <h3>The Three Factors of Authentication</h3>
          <ul>
            <li><strong>Something you know</strong> - Password, PIN, secret question</li>
            <li><strong>Something you have</strong> - Phone, token, smart card</li>
            <li><strong>Something you are</strong> - Fingerprint, face, voice</li>
          </ul>
          
          <p>2FA typically combines "something you know" (password) with "something you have" (phone or authenticator app).</p>
          
          <h2>Types of Two-Factor Authentication</h2>
          
          <h3>1. SMS Text Messages</h3>
          <p><strong>How it works:</strong> Receive a code via text message</p>
          <ul>
            <li><strong>Pros:</strong> Easy to set up, works on any phone</li>
            <li><strong>Cons:</strong> Vulnerable to SIM swapping attacks</li>
            <li><strong>Best for:</strong> Better than no 2FA, but not the most secure option</li>
          </ul>
          
          <h3>2. Authenticator Apps (Recommended)</h3>
          <p><strong>How it works:</strong> Generate time-based codes on your smartphone</p>
          <ul>
            <li><strong>Pros:</strong> More secure than SMS, works offline</li>
            <li><strong>Cons:</strong> Need to backup recovery codes</li>
            <li><strong>Best for:</strong> Most online accounts</li>
          </ul>
          
          <h3>3. Hardware Security Keys</h3>
          <p><strong>How it works:</strong> Physical device that plugs into your computer or phone</p>
          <ul>
            <li><strong>Pros:</strong> Highest security level, phishing-resistant</li>
            <li><strong>Cons:</strong> Additional cost, can be lost</li>
            <li><strong>Best for:</strong> High-value accounts, businesses</li>
          </ul>
          
          <h3>4. Biometric Authentication</h3>
          <p><strong>How it works:</strong> Use fingerprint, face, or voice recognition</p>
          <ul>
            <li><strong>Pros:</strong> Convenient, difficult to replicate</li>
            <li><strong>Cons:</strong> Device-specific, privacy concerns</li>
            <li><strong>Best for:</strong> Mobile devices, local authentication</li>
          </ul>
          
          <h2>Recommended Authenticator Apps</h2>
          
          <h3>Google Authenticator</h3>
          <ul>
            <li>Free and widely supported</li>
            <li>Simple interface</li>
            <li>Cloud backup available</li>
          </ul>
          
          <h3>Microsoft Authenticator</h3>
          <ul>
            <li>Integrates well with Microsoft services</li>
            <li>Push notifications for approval</li>
            <li>Cloud sync across devices</li>
          </ul>
          
          <h3>Authy (Recommended)</h3>
          <ul>
            <li>Multi-device support</li>
            <li>Encrypted cloud backups</li>
            <li>Desktop and mobile apps</li>
          </ul>
          
          <h3>1Password (If you use 1Password)</h3>
          <ul>
            <li>Integrated with password manager</li>
            <li>Automatic backup and sync</li>
            <li>One app for passwords and 2FA</li>
          </ul>
          
          <h2>Step-by-Step Setup Guide</h2>
          
          <h3>Step 1: Install an Authenticator App</h3>
          <ol>
            <li>Download Authy, Google Authenticator, or Microsoft Authenticator</li>
            <li>Create an account (for apps that support backup)</li>
            <li>Set up a master password if available</li>
          </ol>
          
          <h3>Step 2: Enable 2FA on Priority Accounts</h3>
          <p>Start with these critical accounts:</p>
          <ol>
            <li><strong>Email accounts</strong> (Gmail, Outlook, etc.)</li>
            <li><strong>Banking and financial</strong></li>
            <li><strong>Password manager</strong></li>
            <li><strong>Cloud storage</strong> (Google Drive, Dropbox)</li>
            <li><strong>Social media</strong> (Facebook, Twitter, Instagram)</li>
            <li><strong>Work accounts</strong></li>
          </ol>
          
          <h3>Step 3: General Setup Process</h3>
          <ol>
            <li>Log into your account</li>
            <li>Find Security or Privacy settings</li>
            <li>Look for "Two-Factor Authentication", "2FA", or "2-Step Verification"</li>
            <li>Choose "Authenticator App" option</li>
            <li>Scan the QR code with your authenticator app</li>
            <li>Enter the 6-digit code to verify</li>
            <li><strong>Save your backup codes!</strong></li>
          </ol>
          
          <h2>Platform-Specific Instructions</h2>
          
          <h3>Google Accounts</h3>
          <ol>
            <li>Go to myaccount.google.com</li>
            <li>Click "Security" in the left menu</li>
            <li>Under "2-Step Verification", click "Get started"</li>
            <li>Enter your phone number for SMS backup</li>
            <li>Add authenticator app as primary method</li>
            <li>Download and save backup codes</li>
          </ol>
          
          <h3>Apple ID</h3>
          <ol>
            <li>Go to appleid.apple.com</li>
            <li>Sign in and go to Security section</li>
            <li>Click "Turn on Two-Factor Authentication"</li>
            <li>Add trusted phone numbers</li>
            <li>Verify with received code</li>
          </ol>
          
          <h3>Microsoft Accounts</h3>
          <ol>
            <li>Go to account.microsoft.com</li>
            <li>Click "Security" tab</li>
            <li>Select "Advanced security options"</li>
            <li>Turn on "Two-step verification"</li>
            <li>Set up authenticator app</li>
            <li>Save recovery codes</li>
          </ol>
          
          <h3>Facebook</h3>
          <ol>
            <li>Go to Settings & Privacy > Settings</li>
            <li>Click "Security and Login"</li>
            <li>Find "Two-Factor Authentication"</li>
            <li>Choose "Authentication app"</li>
            <li>Scan QR code with your app</li>
            <li>Enter verification code</li>
          </ol>
          
          <h2>Critical: Backup and Recovery</h2>
          
          <h3>Always Save Backup Codes</h3>
          <ul>
            <li>Download when offered during setup</li>
            <li>Store in password manager</li>
            <li>Print and store securely offline</li>
            <li>Each code typically works only once</li>
          </ul>
          
          <h3>Multiple Recovery Methods</h3>
          <ol>
            <li><strong>Backup codes</strong> - Primary recovery method</li>
            <li><strong>SMS backup</strong> - Secondary option</li>
            <li><strong>Multiple devices</strong> - Install authenticator on phone and tablet</li>
            <li><strong>Recovery email</strong> - Alternative contact method</li>
          </ol>
          
          <h3>If You Lose Access</h3>
          <ol>
            <li>Use saved backup codes</li>
            <li>Contact customer support with ID verification</li>
            <li>Use SMS backup if available</li>
            <li>Check for account recovery options</li>
          </ol>
          
          <h2>Best Practices and Security Tips</h2>
          
          <h3>Dos</h3>
          <ul>
            <li><strong>Use authenticator apps</strong> over SMS when possible</li>
            <li><strong>Enable 2FA on all important accounts</strong></li>
            <li><strong>Keep backup codes safe</strong> and accessible</li>
            <li><strong>Use multiple recovery methods</strong></li>
            <li><strong>Test your setup</strong> before you need it</li>
            <li><strong>Update phone numbers</strong> when you change devices</li>
          </ul>
          
          <h3>Don'ts</h3>
          <ul>
            <li><strong>Don't rely only on SMS</strong> - SIM swapping risks</li>
            <li><strong>Don't ignore backup codes</strong> - You'll need them</li>
            <li><strong>Don't use the same phone</strong> for all authentication</li>
            <li><strong>Don't screenshot codes</strong> - Save securely instead</li>
            <li><strong>Don't disable 2FA</strong> unless absolutely necessary</li>
          </ul>
          
          <h2>Advanced 2FA Strategies</h2>
          
          <h3>Hardware Security Keys</h3>
          <p>For ultimate security, consider hardware keys:</p>
          <ul>
            <li><strong>YubiKey</strong> - Most popular option</li>
            <li><strong>Google Titan Key</strong> - Google's solution</li>
            <li><strong>Feitian Keys</strong> - Budget-friendly alternative</li>
          </ul>
          
          <h3>Multi-Device Strategy</h3>
          <ol>
            <li>Primary authenticator on main phone</li>
            <li>Backup authenticator on tablet or secondary phone</li>
            <li>Hardware key for critical accounts</li>
            <li>Backup codes stored securely offline</li>
          </ol>
          
          <h2>Troubleshooting Common Issues</h2>
          
          <h3>Time Sync Problems</h3>
          <ul>
            <li>Ensure device time is correct</li>
            <li>Enable automatic time in settings</li>
            <li>Restart authenticator app</li>
          </ul>
          
          <h3>Lost Phone or Device</h3>
          <ol>
            <li>Use backup codes immediately</li>
            <li>Install authenticator on new device</li>
            <li>Re-scan QR codes for accounts</li>
            <li>Update recovery information</li>
          </ol>
          
          <h3>App Not Working</h3>
          <ul>
            <li>Check internet connection</li>
            <li>Restart the app</li>
            <li>Update to latest version</li>
            <li>Use backup codes as temporary solution</li>
          </ul>
          
          <h2>Your 2FA Action Plan</h2>
          
          <h3>Week 1: Essential Accounts</h3>
          <ol>
            <li>Install authenticator app</li>
            <li>Enable 2FA on email accounts</li>
            <li>Set up banking and financial accounts</li>
            <li>Save all backup codes</li>
          </ol>
          
          <h3>Week 2: Important Accounts</h3>
          <ol>
            <li>Password manager</li>
            <li>Cloud storage services</li>
            <li>Work/business accounts</li>
            <li>Social media platforms</li>
          </ol>
          
          <h3>Week 3: Additional Accounts</h3>
          <ol>
            <li>Shopping and e-commerce</li>
            <li>Streaming services</li>
            <li>Gaming platforms</li>
            <li>Any remaining accounts with 2FA support</li>
          </ol>
          
          <h3>Monthly Maintenance</h3>
          <ul>
            <li>Review enabled 2FA methods</li>
            <li>Test backup codes</li>
            <li>Update recovery information</li>
            <li>Check for new accounts needing 2FA</li>
          </ul>
          
          <p><strong>Remember:</strong> 2FA is not perfect, but it dramatically reduces your risk of account compromise. Combined with strong passwords, it provides excellent protection for your digital life.</p>
        `,
        keyTakeaways: [
          'Use authenticator apps instead of SMS when possible',
          'Always save and secure your backup codes',
          'Enable 2FA on all critical accounts (email, banking, work)',
          'Consider hardware security keys for ultimate protection',
          'Test your setup and keep recovery methods updated'
        ],
        relatedLinks: [
          { title: 'Strong Password Guide', checkId: '1-1-1' },
          { title: 'Password Manager Setup', checkId: '1-1-3' },
          { title: 'MFA Setup Wizard Tool', toolId: 'tool-3' }
        ]
      },
      {
        id: 'guide-3',
        tag: 'GUIDE',
        level: 'Beginner',
        title: 'Spotting Phishing Emails',
        excerpt: 'Master the art of identifying suspicious emails and avoiding phishing attacks.',
        readMinutes: 10,
        topics: ['phishing', 'email-security'],
        author: 'CyberPup Security Team',
        publishedDate: '2025-08-28',
        lastUpdated: '2025-09-06',
        difficulty: 'Beginner',
        fullContent: `
          <h1>Spotting Phishing Emails: Your Defense Against Digital Deception</h1>
          
          <p>Phishing emails are one of the most common cyber threats you'll encounter. These deceptive messages trick millions of people into revealing sensitive information or downloading malware. Learning to spot phishing attempts is a crucial skill for staying safe online.</p>
          
          <h2>What is Phishing?</h2>
          <p>Phishing is a cyber attack where criminals impersonate legitimate organizations to steal your personal information, passwords, or money. These attacks typically arrive via email but can also occur through text messages, phone calls, or fake websites.</p>
          
          <h3>Common Phishing Goals</h3>
          <ul>
            <li><strong>Steal login credentials</strong> - Usernames and passwords</li>
            <li><strong>Harvest personal information</strong> - Social security numbers, addresses</li>
            <li><strong>Financial theft</strong> - Banking details, credit card numbers</li>
            <li><strong>Install malware</strong> - Viruses, ransomware, spyware</li>
            <li><strong>Business email compromise</strong> - Corporate fraud and data theft</li>
          </ul>
          
          <h2>Types of Phishing Attacks</h2>
          
          <h3>1. Spray and Pray Phishing</h3>
          <p>Generic emails sent to millions of recipients hoping some will take the bait.</p>
          <ul>
            <li>Low effort, high volume</li>
            <li>Generic greetings like "Dear Customer"</li>
            <li>Common brands (Netflix, Amazon, PayPal)</li>
            <li>Easy to spot with basic knowledge</li>
          </ul>
          
          <h3>2. Spear Phishing</h3>
          <p>Targeted attacks using personal information about specific individuals.</p>
          <ul>
            <li>Personalized with your name and details</li>
            <li>Reference recent activities or purchases</li>
            <li>Much more convincing than generic phishing</li>
            <li>Higher success rate</li>
          </ul>
          
          <h3>3. Whaling</h3>
          <p>Attacks targeting high-value individuals like executives or celebrities.</p>
          <ul>
            <li>Extremely sophisticated and researched</li>
            <li>Often impersonate business partners or colleagues</li>
            <li>Focus on financial transfers or sensitive data</li>
            <li>Hardest to detect</li>
          </ul>
          
          <h3>4. Clone Phishing</h3>
          <p>Replicas of legitimate emails with malicious links or attachments.</p>
          <ul>
            <li>Nearly identical to real messages</li>
            <li>Minor changes to links or attachments</li>
            <li>Often claim to be "updated" versions</li>
            <li>Very difficult to distinguish</li>
          </ul>
          
          <h2>Red Flags: How to Spot Phishing Emails</h2>
          
          <h3>Sender Red Flags</h3>
          <ul>
            <li><strong>Suspicious email addresses</strong> - netflix-security@gmail.com instead of netflix.com</li>
            <li><strong>Misspelled domains</strong> - payp4l.com instead of paypal.com</li>
            <li><strong>Generic sender names</strong> - "Security Team" instead of specific person</li>
            <li><strong>Unexpected senders</strong> - Banks you don't use, services you don't have</li>
          </ul>
          
          <h3>Subject Line Red Flags</h3>
          <ul>
            <li><strong>Urgent action required</strong> - "Account will be closed!"</li>
            <li><strong>Fear-inducing</strong> - "Suspicious activity detected"</li>
            <li><strong>Too good to be true</strong> - "You've won $1,000,000!"</li>
            <li><strong>Deadline pressure</strong> - "Act within 24 hours"</li>
          </ul>
          
          <h3>Content Red Flags</h3>
          <ul>
            <li><strong>Generic greetings</strong> - "Dear Valued Customer"</li>
            <li><strong>Poor grammar/spelling</strong> - Professional companies proofread</li>
            <li><strong>Mismatched branding</strong> - Wrong logos, colors, or fonts</li>
            <li><strong>Suspicious attachments</strong> - Unexpected .exe, .zip, or .doc files</li>
            <li><strong>Urgent requests for information</strong> - Passwords, SSN, account details</li>
          </ul>
          
          <h3>Link Red Flags</h3>
          <ul>
            <li><strong>Hover before clicking</strong> - URL doesn't match claimed destination</li>
            <li><strong>Shortened URLs</strong> - bit.ly, tinyurl without context</li>
            <li><strong>Misspelled domains</strong> - gooogle.com instead of google.com</li>
            <li><strong>HTTP instead of HTTPS</strong> - Especially for login pages</li>
            <li><strong>Suspicious subdomains</strong> - paypal.security-check.com</li>
          </ul>
          
          <h2>Real-World Phishing Examples</h2>
          
          <h3>Example 1: Fake Bank Alert</h3>
          <p><strong>Subject:</strong> "URGENT: Suspicious Activity on Your Account"</p>
          <p><strong>Red Flags:</strong></p>
          <ul>
            <li>Sender: security@bankofamerica-alerts.net (wrong domain)</li>
            <li>Generic greeting: "Dear Valued Customer"</li>
            <li>Urgent language creating panic</li>
            <li>Link goes to bankofamerica.security-center.net</li>
            <li>Requests full login credentials</li>
          </ul>
          
          <h3>Example 2: Fake Package Delivery</h3>
          <p><strong>Subject:</strong> "Package Delivery Failed - Rescheduling Required"</p>
          <p><strong>Red Flags:</strong></p>
          <ul>
            <li>You weren't expecting a package</li>
            <li>Sender: notifications@ups-delivery.com (suspicious domain)</li>
            <li>Attachment named "delivery_details.pdf.exe"</li>
            <li>Poor grammar: "Your package are waiting"</li>
          </ul>
          
          <h3>Example 3: Fake IT Support</h3>
          <p><strong>Subject:</strong> "Password Expiring - Immediate Action Required"</p>
          <p><strong>Red Flags:</strong></p>
          <ul>
            <li>Internal sender but external email address</li>
            <li>Company doesn't typically email about passwords</li>
            <li>Link goes to external website</li>
            <li>Requests current password (IT never needs this)</li>
          </ul>
          
          <h2>Advanced Detection Techniques</h2>
          
          <h3>Email Header Analysis</h3>
          <ul>
            <li><strong>Return-Path:</strong> Should match sender domain</li>
            <li><strong>SPF/DKIM/DMARC:</strong> Authentication failures are red flags</li>
            <li><strong>Received headers:</strong> Track email routing</li>
            <li><strong>Message-ID:</strong> Should be consistent with sender</li>
          </ul>
          
          <h3>Link Investigation</h3>
          <ol>
            <li><strong>Hover first:</strong> Check destination URL</li>
            <li><strong>Use URL checkers:</strong> VirusTotal, URLVoid</li>
            <li><strong>Navigate independently:</strong> Go to the real website directly</li>
            <li><strong>Check WHOIS data:</strong> Recent domain registration is suspicious</li>
          </ol>
          
          <h3>Attachment Safety</h3>
          <ul>
            <li><strong>Scan with antivirus</strong> before opening</li>
            <li><strong>Be wary of double extensions</strong> - file.pdf.exe</li>
            <li><strong>Avoid macros</strong> in Office documents from unknown sources</li>
            <li><strong>Use sandboxing</strong> for suspicious files</li>
          </ul>
          
          <h2>What to Do When You Receive Phishing</h2>
          
          <h3>Immediate Actions</h3>
          <ol>
            <li><strong>Don't click anything</strong> - Links, attachments, or reply</li>
            <li><strong>Don't provide information</strong> - Passwords, personal details</li>
            <li><strong>Verify independently</strong> - Contact the organization directly</li>
            <li><strong>Mark as spam/phishing</strong> - Help train email filters</li>
            <li><strong>Delete the email</strong> - Remove temptation to click later</li>
          </ol>
          
          <h3>If You Already Clicked</h3>
          <ol>
            <li><strong>Disconnect from internet</strong> - Stop any data transmission</li>
            <li><strong>Change passwords immediately</strong> - Start with the targeted account</li>
            <li><strong>Run antivirus scan</strong> - Check for malware</li>
            <li><strong>Monitor accounts</strong> - Watch for unauthorized activity</li>
            <li><strong>Enable 2FA</strong> - Add extra security layer</li>
            <li><strong>Consider credit monitoring</strong> - If personal info was compromised</li>
          </ol>
          
          <h3>Reporting Phishing</h3>
          <ul>
            <li><strong>Forward to Anti-Phishing Working Group:</strong> reportphishing@apwg.org</li>
            <li><strong>Report to FTC:</strong> reportfraud.ftc.gov</li>
            <li><strong>Forward to impersonated company:</strong> Most have dedicated phishing addresses</li>
            <li><strong>Report to your email provider</strong> - Help improve filtering</li>
          </ul>
          
          <h2>Email Security Best Practices</h2>
          
          <h3>Email Client Settings</h3>
          <ul>
            <li><strong>Enable spam filtering</strong> - Use highest safe setting</li>
            <li><strong>Disable auto-loading images</strong> - Prevents tracking pixels</li>
            <li><strong>Turn off auto-execution</strong> - For scripts and macros</li>
            <li><strong>Enable phishing protection</strong> - Most clients have built-in protection</li>
          </ul>
          
          <h3>Safe Email Habits</h3>
          <ul>
            <li><strong>Verify before trusting</strong> - When in doubt, check independently</li>
            <li><strong>Be skeptical of urgency</strong> - Legitimate companies rarely create panic</li>
            <li><strong>Keep software updated</strong> - Email clients and operating systems</li>
            <li><strong>Use different passwords</strong> - Don't reuse email passwords elsewhere</li>
            <li><strong>Regular security training</strong> - Stay updated on new threats</li>
          </ul>
          
          <h2>Special Considerations</h2>
          
          <h3>Business Email Security</h3>
          <ul>
            <li><strong>Implement DMARC policies</strong> - Prevent domain spoofing</li>
            <li><strong>Employee training programs</strong> - Regular phishing simulation</li>
            <li><strong>Email gateway solutions</strong> - Advanced threat detection</li>
            <li><strong>Incident response procedures</strong> - What to do when attacked</li>
          </ul>
          
          <h3>Mobile Email Safety</h3>
          <ul>
            <li><strong>Harder to inspect links</strong> - Be extra cautious</li>
            <li><strong>Use official apps</strong> - Avoid third-party email clients</li>
            <li><strong>Be wary of attachments</strong> - Limited security scanning</li>
            <li><strong>Don't auto-sync</strong> - Manual email checking is safer</li>
          </ul>
          
          <h2>Building Your Phishing Defense</h2>
          
          <h3>Daily Habits</h3>
          <ol>
            <li><strong>Pause before clicking</strong> - Take time to evaluate</li>
            <li><strong>Verify unexpected emails</strong> - Call or visit websites directly</li>
            <li><strong>Question urgency</strong> - Real companies give reasonable time</li>
            <li><strong>Trust your instincts</strong> - If something feels wrong, investigate</li>
          </ol>
          
          <h3>Monthly Security Tasks</h3>
          <ul>
            <li>Review spam folder for false positives</li>
            <li>Update email security settings</li>
            <li>Check for compromised accounts</li>
            <li>Practice with phishing quizzes</li>
          </ul>
          
          <h3>Staying Informed</h3>
          <ul>
            <li><strong>Follow security blogs</strong> - KrebsOnSecurity, SANS</li>
            <li><strong>Subscribe to threat feeds</strong> - FBI IC3, CISA alerts</li>
            <li><strong>Join security communities</strong> - Learn from others' experiences</li>
            <li><strong>Practice with simulators</strong> - Test your detection skills</li>
          </ul>
          
          <p><strong>Remember:</strong> Phishing attacks are constantly evolving, but the fundamentals remain the same. Stay skeptical, verify independently, and when in doubt, don't click!</p>
        `,
        keyTakeaways: [
          'Always verify unexpected emails by contacting the organization directly',
          'Hover over links to check destinations before clicking',
          'Be suspicious of urgent language and deadline pressure',
          'Never provide sensitive information via email',
          'When in doubt, delete the email and navigate to websites directly'
        ],
        relatedLinks: [
          { title: 'Phishing Link Checker Tool', toolId: 'tool-4' },
          { title: 'Email Security Best Practices', checkId: '1-1-1' }
        ]
      },
      {
        id: 'guide-4',
        tag: 'GUIDE',
        level: 'Essential',
        title: 'Password Manager Setup',
        excerpt: 'Complete walkthrough for setting up and using a password manager to secure all your accounts.',
        readMinutes: 15,
        topics: ['passwords', 'authentication'],
        relatedCheckId: '1-1-3',
        author: 'CyberPup Security Team',
        publishedDate: '2025-08-28',
        lastUpdated: '2025-09-06',
        difficulty: 'Essential',
        fullContent: `
          <h1>Password Manager Setup: Your Digital Vault</h1>
          
          <p>A password manager is the single most important tool for digital security. It generates, stores, and automatically fills unique, strong passwords for all your accounts. This comprehensive playbook will guide you through choosing, setting up, and mastering your password manager.</p>
          
          <h2>Why You Need a Password Manager</h2>
          <p>The average person has over 100 online accounts, making it impossible to remember unique, strong passwords for each. Password managers solve this by:</p>
          
          <ul>
            <li><strong>Generating uncrackable passwords</strong> - Random, unique for every account</li>
            <li><strong>Storing passwords securely</strong> - Military-grade encryption</li>
            <li><strong>Auto-filling login forms</strong> - Convenience without compromise</li>
            <li><strong>Syncing across devices</strong> - Access from anywhere</li>
            <li><strong>Monitoring for breaches</strong> - Alerts when passwords are compromised</li>
          </ul>
          
          <h2>Choosing Your Password Manager</h2>
          
          <h3>Bitwarden (Recommended for Most)</h3>
          <ul>
            <li><strong>Free tier includes:</strong> Unlimited passwords, sync across devices</li>
            <li><strong>Premium ($10/year):</strong> Advanced 2FA, encrypted file storage</li>
            <li><strong>Open source:</strong> Transparent security</li>
            <li><strong>Best for:</strong> Budget-conscious users, privacy advocates</li>
          </ul>
          
          <h3>1Password (Premium Choice)</h3>
          <ul>
            <li><strong>Individual ($36/year):</strong> Advanced features, travel mode</li>
            <li><strong>Family ($60/year):</strong> Up to 5 users, shared vaults</li>
            <li><strong>Best for:</strong> Families, users wanting premium features</li>
          </ul>
          
          <h3>LastPass (User-Friendly)</h3>
          <ul>
            <li><strong>Free:</strong> Limited to one device type</li>
            <li><strong>Premium ($36/year):</strong> Full features, priority support</li>
            <li><strong>Best for:</strong> Simple interface preferences</li>
          </ul>
          
          <h2>Setting Up Bitwarden (Step-by-Step)</h2>
          
          <h3>Step 1: Create Your Account</h3>
          <ol>
            <li>Go to bitwarden.com</li>
            <li>Click "Get Started"</li>
            <li>Enter email address</li>
            <li>Create a strong master password (you'll need to remember this!)</li>
            <li>Verify your email address</li>
          </ol>
          
          <h3>Step 2: Install Browser Extensions</h3>
          <ol>
            <li>Chrome: Chrome Web Store → "Bitwarden Password Manager"</li>
            <li>Firefox: Firefox Add-ons → "Bitwarden Password Manager"</li>
            <li>Safari: App Store → "Bitwarden for Safari"</li>
            <li>Edge: Microsoft Store → "Bitwarden Password Manager"</li>
          </ol>
          
          <h3>Step 3: Install Mobile Apps</h3>
          <ul>
            <li><strong>iOS:</strong> App Store → "Bitwarden Password Manager"</li>
            <li><strong>Android:</strong> Google Play → "Bitwarden Password Manager"</li>
          </ul>
          
          <h3>Step 4: Import Existing Passwords</h3>
          <ol>
            <li>Export from your browser or current password manager</li>
            <li>In Bitwarden: Tools → Import Data</li>
            <li>Select your source (Chrome, Firefox, LastPass, etc.)</li>
            <li>Upload the exported file</li>
            <li>Review and organize imported passwords</li>
          </ol>
          
          <h2>Master Password Best Practices</h2>
          
          <h3>Creating Your Master Password</h3>
          <p>Your master password is the key to your digital vault. It should be:</p>
          <ul>
            <li><strong>Long:</strong> 16+ characters minimum</li>
            <li><strong>Memorable:</strong> You'll type it frequently</li>
            <li><strong>Unique:</strong> Never used anywhere else</li>
            <li><strong>Strong:</strong> Resistant to attacks</li>
          </ul>
          
          <h3>Master Password Techniques</h3>
          <ol>
            <li><strong>Passphrase method:</strong> "Coffee!Mountain@Sunrise2025"</li>
            <li><strong>Sentence method:</strong> "My2Cats@re7YearsOld&Fluffy!"</li>
            <li><strong>Personal story:</strong> "I!Moved2Sydney@Christmas2020"</li>
          </ol>
          
          <h2>Securing Your Setup</h2>
          
          <h3>Enable Two-Factor Authentication</h3>
          <ol>
            <li>Settings → Security → Two-step Login</li>
            <li>Choose authenticator app (recommended)</li>
            <li>Scan QR code with Google Authenticator/Authy</li>
            <li>Save recovery codes securely</li>
            <li>Test the setup before closing</li>
          </ol>
          
          <h3>Configure Security Settings</h3>
          <ul>
            <li><strong>Vault timeout:</strong> 15 minutes (balance security/convenience)</li>
            <li><strong>Vault timeout action:</strong> Lock (not logout)</li>
            <li><strong>Unlock with biometrics:</strong> Enable for mobile apps</li>
            <li><strong>Auto-fill on page load:</strong> Disable for security</li>
          </ul>
          
          <h2>Daily Usage Workflow</h2>
          
          <h3>Adding New Accounts</h3>
          <ol>
            <li>When creating a new account, click the Bitwarden icon</li>
            <li>Select "Generate password"</li>
            <li>Adjust length (16+ characters) and complexity</li>
            <li>Use the generated password</li>
            <li>Save the login when prompted</li>
          </ol>
          
          <h3>Logging Into Existing Accounts</h3>
          <ol>
            <li>Navigate to the login page</li>
            <li>Click the Bitwarden icon</li>
            <li>Select the appropriate login</li>
            <li>Password is auto-filled</li>
            <li>Complete any 2FA if required</li>
          </ol>
          
          <h3>Updating Compromised Passwords</h3>
          <ol>
            <li>Check Bitwarden's Security Report regularly</li>
            <li>Update weak or reused passwords</li>
            <li>Generate new passwords for breached accounts</li>
            <li>Delete old, unused accounts</li>
          </ol>
          
          <h2>Advanced Features</h2>
          
          <h3>Secure Notes</h3>
          <ul>
            <li>Store WiFi passwords</li>
            <li>Security questions and answers</li>
            <li>Software license keys</li>
            <li>Emergency contact information</li>
          </ul>
          
          <h3>Organization and Folders</h3>
          <ul>
            <li><strong>Work:</strong> Professional accounts</li>
            <li><strong>Personal:</strong> Social media, shopping</li>
            <li><strong>Financial:</strong> Banking, investments</li>
            <li><strong>Utilities:</strong> Services, subscriptions</li>
          </ul>
          
          <h3>Family Sharing (Premium)</h3>
          <ol>
            <li>Create shared collections</li>
            <li>Share streaming service passwords</li>
            <li>Emergency access setup</li>
            <li>Individual vault privacy maintained</li>
          </ol>
          
          <h2>Security Maintenance</h2>
          
          <h3>Monthly Tasks</h3>
          <ul>
            <li>Review security report</li>
            <li>Update weak passwords</li>
            <li>Remove unused accounts</li>
            <li>Check for duplicate entries</li>
          </ul>
          
          <h3>Quarterly Tasks</h3>
          <ul>
            <li>Export vault backup</li>
            <li>Review shared items</li>
            <li>Update emergency contacts</li>
            <li>Test recovery process</li>
          </ul>
          
          <h3>Annual Tasks</h3>
          <ul>
            <li>Change master password (if needed)</li>
            <li>Review all stored items</li>
            <li>Update payment methods</li>
            <li>Security training refresh</li>
          </ul>
          
          <h2>Troubleshooting Common Issues</h2>
          
          <h3>Auto-fill Not Working</h3>
          <ol>
            <li>Check if extension is enabled</li>
            <li>Refresh the page</li>
            <li>Manually search in extension</li>
            <li>Update browser and extension</li>
          </ol>
          
          <h3>Can't Remember Master Password</h3>
          <ol>
            <li>Try common variations you use</li>
            <li>Check if caps lock is on</li>
            <li>Use password hint if set</li>
            <li>Account recovery (loses all data)</li>
          </ol>
          
          <h3>Sync Issues Between Devices</h3>
          <ol>
            <li>Force sync in settings</li>
            <li>Log out and back in</li>
            <li>Check internet connection</li>
            <li>Reinstall app if necessary</li>
          </ol>
          
          <p><strong>Remember:</strong> A password manager is only as secure as your master password. Choose it carefully, remember it well, and never share it with anyone.</p>
        `,
        keyTakeaways: [
          'Choose a reputable password manager like Bitwarden, 1Password, or LastPass',
          'Create a strong, memorable master password you\'ll never forget',
          'Enable two-factor authentication on your password manager',
          'Generate unique passwords for every single account',
          'Regularly review and update weak or compromised passwords'
        ],
        relatedLinks: [
          { title: 'Strong Password Creation Guide', checkId: '1-1-1' },
          { title: 'Two-Factor Authentication Setup', checkId: '1-1-4' },
          { title: 'Password Strength Checker Tool', toolId: 'tool-1' }
        ]
      },

      {
        id: 'guide-7',
        tag: 'GUIDE',
        level: 'Beginner',
        title: 'Password Change After Data Breach',
        excerpt: 'Step-by-step guide to securely change passwords after discovering your accounts have been compromised in a data breach.',
        readMinutes: 5,
        topics: ['passwords', 'data-breach', 'account-security'],
        relatedCheckId: '1-1-5',
        author: 'CyberPup Security Team',
        publishedDate: '2025-08-28',
        lastUpdated: '2025-09-06',
        difficulty: 'Beginner',
        fullContent: `
          <h1>Password Change After Data Breach: Secure Your Accounts</h1>
          
          <p>Discovering your accounts have been compromised in a data breach can be stressful, but taking immediate action to change your passwords is crucial for protecting your digital security. This guide will walk you through the process step-by-step, making it as smooth and secure as possible.</p>
          
          <h2>Why Immediate Action Matters</h2>
          <p>When your passwords are exposed in a data breach, cybercriminals can quickly attempt to access your accounts. The faster you change your passwords, the less time attackers have to cause damage. Even if you don't see any suspicious activity, changing passwords is a critical preventive measure.</p>
          
          <h3>What Happens in a Data Breach</h3>
          <ul>
            <li><strong>Passwords are exposed</strong> - Often in plain text or weak hashes</li>
            <li><strong>Personal information leaked</strong> - Names, emails, addresses</li>
            <li><strong>Account takeover attempts</strong> - Criminals try to access your accounts</li>
            <li><strong>Identity theft risk</strong> - Your information can be used fraudulently</li>
            <li><strong>Credential stuffing</strong> - Attackers try your password on other sites</li>
          </ul>
          
          <h2>Step-by-Step Password Change Process</h2>
          <p>Follow these steps to securely update your passwords after a breach:</p>
          
          <h3>Step 1: Open Your Password Manager</h3>
          <p>Start by opening your password manager and navigating to the affected website. Your password manager will make this process much easier by:</p>
          <ul>
            <li>Storing your current credentials securely</li>
            <li>Generating strong new passwords automatically</li>
            <li>Filling in forms for you</li>
            <li>Keeping track of all your passwords</li>
          </ul>
          
          <h3>Step 2: Generate a Strong New Password</h3>
          <p>Use your password manager's built-in password generator to create a strong, unique password. Look for these features:</p>
          <ul>
            <li><strong>Length:</strong> At least 16 characters</li>
            <li><strong>Complexity:</strong> Mix of letters, numbers, and symbols</li>
            <li><strong>Uniqueness:</strong> Different from all other passwords</li>
            <li><strong>Randomness:</strong> No patterns or dictionary words</li>
          </ul>
          
          <h3>Step 3: Update Your Account</h3>
          <p>Navigate to the account settings or password change page on the affected website. Common locations include:</p>
          <ul>
            <li>Account Settings → Security → Change Password</li>
            <li>Profile → Password & Security</li>
            <li>Settings → Account → Password</li>
            <li>Security Center → Password Management</li>
          </ul>
          
          <h3>Step 4: Save New Credentials</h3>
          <p>After updating your password, your password manager should prompt you to save the new credentials. If it doesn't:</p>
          <ul>
            <li>Manually add the new password to your vault</li>
            <li>Update the existing entry if one exists</li>
            <li>Add any additional security notes</li>
            <li>Tag the entry for easy identification</li>
          </ul>
          
          <h3>Step 5: Repeat for All Affected Accounts</h3>
          <p>Go through this process for every account that was compromised in the breach. Don't skip any accounts, even if they seem less important. Remember:</p>
          <ul>
            <li>Each compromised account needs a new password</li>
            <li>Use unique passwords for each account</li>
            <li>Don't reuse passwords across different sites</li>
            <li>Consider this an opportunity to improve overall security</li>
          </ul>
          
          <h2>💡 Essential Security Tips</h2>
          
          <h3>Use Your Password Manager's Security Features</h3>
          <p>Most password managers offer security monitoring tools:</p>
          <ul>
            <li><strong>Security audits</strong> - Identify weak or reused passwords</li>
            <li><strong>Breach monitoring</strong> - Get notified of new breaches</li>
            <li><strong>Password health scores</strong> - Track overall security</li>
            <li><strong>Dark web monitoring</strong> - Check if credentials are for sale</li>
          </ul>
          
          <h3>Enable Two-Factor Authentication (2FA)</h3>
          <p>After changing passwords, add an extra layer of security:</p>
          <ul>
            <li>Enable 2FA on all important accounts</li>
            <li>Use authenticator apps when possible</li>
            <li>Keep backup codes in a secure location</li>
            <li>Consider hardware security keys for maximum protection</li>
          </ul>
          
          <h3>Consider Using Passphrases</h3>
          <p>For maximum security and memorability:</p>
          <ul>
            <li>Use long, memorable phrases</li>
            <li>Add numbers and symbols for complexity</li>
            <li>Make them unique to each account</li>
            <li>Example: "Coffee!Mountain@Sunrise2025"</li>
          </ul>
          
          <h2>You've Got This! 💪</h2>
          
          <p>Changing passwords after a breach is one of the most important security steps you can take. While it may seem overwhelming, your password manager will handle most of the complexity, allowing you to focus on staying secure.</p>
          
          <h3>Remember These Key Points</h3>
          <ul>
            <li><strong>Take your time</strong> - Rushing can lead to mistakes</li>
            <li><strong>Be thorough</strong> - Don't skip any compromised accounts</li>
            <li><strong>Stay organized</strong> - Keep track of which accounts you've updated</li>
            <li><strong>Monitor for suspicious activity</strong> - Watch for unauthorized access</li>
            <li><strong>Your future self will thank you</strong> - This effort protects you long-term</li>
          </ul>
          
          <h3>Additional Resources</h3>
          <p>If you need more help with password security:</p>
          <ul>
            <li>Check your password manager's help documentation</li>
            <li>Enable breach notifications for early warning</li>
            <li>Consider a security audit of all your accounts</li>
            <li>Set up regular password change reminders</li>
          </ul>
          
          <p><strong>Remember:</strong> You're taking control of your digital security, and that's something to be proud of. Every password you change makes you more secure and less vulnerable to future attacks.</p>
        `,
        keyTakeaways: [
          'Change passwords immediately after discovering a breach',
          'Use your password manager to generate strong, unique passwords',
          'Enable two-factor authentication on all important accounts',
          'Monitor accounts for suspicious activity after password changes',
          'Consider this an opportunity to improve overall security posture'
        ],
        tips: [
          'Use your password manager\'s security features to monitor for weak passwords',
          'Enable 2FA on all accounts after changing passwords',
          'Consider using passphrases for better security',
          'Monitor your accounts closely for suspicious activity',
          'Keep backup codes in a secure location'
        ],
        relatedLinks: [
          { title: 'Creating Strong Passwords', guideId: 'guide-1' },
          { title: 'Two-Factor Authentication Setup', guideId: 'guide-4' },
          { title: 'Breach Check Security Module', checkId: '1-1-5' },
          { title: 'Password Manager Setup', guideId: 'guide-4' }
        ]
      }
      // Additional guides would continue here...
    ];
  }

  // Get guides filtered by topics
  static getGuidesByTopics(topicIds) {
    const guides = this.getEnhancedGuides();
    if (!topicIds || topicIds.length === 0) {
      return guides;
    }
    
    return guides.filter(guide => 
      guide.topics.some(topic => topicIds.includes(topic))
    );
  }

  // Get related guides for a specific guide
  static getRelatedGuides(guideId, limit = 3) {
    const guides = this.getEnhancedGuides();
    const currentGuide = guides.find(g => g.id === guideId);
    
    if (!currentGuide) return [];
    
    return guides
      .filter(g => g.id !== guideId)
      .filter(g => g.topics.some(topic => currentGuide.topics.includes(topic)))
      .slice(0, limit);
  }
}
