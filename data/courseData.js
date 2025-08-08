// Course Data Structure
// This file contains all course content in a structured format
// Easy to maintain and update

export const categories = [
  {
    id: 1,
    title: 'Password Security & Authentication',
    description: 'Learn to create strong passwords and secure your accounts with multi-factor authentication.',
    headerMessage: 'Master password security fundamentals to protect your digital accounts',
    whyItMatters: 'Weak or reused passwords are a leading cause of account compromise. According to the 2023 Data Breach Investigations Report by Verizon, 81% of hacking-related breaches involve stolen or weak passwords. Strengthening your password hygiene is the single highest-impact change you can make with the least technical complexity.',
    whatYoullLearn: 'You\'ll learn to create strong, unique passwords, use password managers effectively, set up multi-factor authentication, and recover accounts safely when needed.',
    icon: '🔐',
    color: '#4a90e2',
  },
  {
    id: 2,
    title: 'Phishing & Scam Awareness',
    description: 'Identify and avoid phishing attempts, scams, and social engineering attacks.',
    headerMessage: 'Learn to spot and avoid common cyber scams and phishing attempts',
    whyItMatters: 'Phishing attacks are the most common cyber threat, with over 3.4 billion phishing emails sent daily. Social engineering tactics exploit human psychology and can bypass even the strongest technical defenses. Being able to recognize and avoid these attacks is crucial for protecting your personal and financial information.',
    whatYoullLearn: 'You\'ll learn to identify phishing emails, understand social engineering tactics, verify links safely, and know how to report scams to help protect others.',
    icon: '🎣',
    color: '#e74c3c',
  },
  {
    id: 3,
    title: 'Device & Network Security',
    description: 'Protect your devices and secure your home network from cyber threats.',
    headerMessage: 'Secure your devices and home network against cyber threats',
    whyItMatters: 'Your devices and home network are the foundation of your digital security. Unsecured devices can be compromised, leading to data theft, malware infections, and unauthorized access to your personal information. A secure network protects all connected devices and your family\'s privacy.',
    whatYoullLearn: 'You\'ll learn to keep devices updated, secure your home Wi-Fi network, choose and configure security software, and protect mobile devices from threats.',
    icon: '🛡️',
    color: '#27ae60',
  },
  {
    id: 4,
    title: 'Online Privacy & Social Media',
    description: 'Manage your digital footprint and protect your privacy on social platforms.',
    headerMessage: 'Take control of your online privacy and digital footprint',
    whyItMatters: 'Your personal information is valuable to companies and potentially malicious actors. Every online action creates a digital footprint that can be tracked, analyzed, and potentially misused. Understanding and controlling your privacy settings helps protect your personal information and reputation.',
    whatYoullLearn: 'You\'ll learn to configure privacy settings on social media, manage your digital footprint, understand data sharing practices, and use privacy-focused tools and services.',
    icon: '🔒',
    color: '#9b59b6',
  },
  {
    id: 5,
    title: 'Secure Finances & Identity Protection',
    description: 'Safeguard your financial information and prevent identity theft.',
    headerMessage: 'Protect your finances and identity from theft and fraud',
    whyItMatters: 'Financial fraud and identity theft can have devastating consequences, affecting your credit, finances, and peace of mind for years. Cybercriminals target financial information because it\'s directly convertible to money. Protecting your financial accounts and monitoring for fraud is essential in today\'s digital economy.',
    whatYoullLearn: 'You\'ll learn to bank securely online, set up credit monitoring, shop safely online, and know what to do if your identity is compromised.',
    icon: '💰',
    color: '#f39c12',
  },
  {
    id: 6,
    title: 'Welcome Aboard',
    description: 'A quick introduction to CyberPup and how to get the most out of it.',
    headerMessage: 'Start here to learn what CyberPup is and how it helps you stay safe online',
    whyItMatters: 'Beginning with a clear understanding of the app ensures you get maximum value from every module and feature, focusing your time where it has the biggest impact.',
    whatYoullLearn: 'You\'ll learn what CyberPup covers, how progress works, and tips to get the most value from your learning time.',
    icon: '👋',
    color: '#00bcd4',
  },
];

export const modules = {
  1: [ // Password Security & Authentication
    {
      id: '1-1',
      title: 'Creating Strong Passwords',
      description: 'Learn the fundamentals of creating secure, memorable passwords that protect your accounts.',
      duration: '10 min',
      lessons: 2,
      categoryId: 1,
    },
    {
      id: '1-2',
      title: 'Password Managers',
      description: 'Discover how password managers can simplify your security while keeping you safe.',
      duration: '15 min',
      lessons: 5,
      categoryId: 1,
    },
    {
      id: '1-3',
      title: 'Multi-Factor Authentication',
      description: 'Set up and use 2FA to add an extra layer of protection to your accounts.',
      duration: '12 min',
      lessons: 3,
      categoryId: 1,
    },
    {
      id: '1-4',
      title: 'Password Recovery',
      description: 'Learn safe practices for recovering lost passwords without compromising security.',
      duration: '8 min',
      lessons: 2,
      categoryId: 1,
    },
  ],
  2: [ // Phishing & Scam Awareness
    {
      id: '2-1',
      title: 'Identifying Phishing Emails',
      description: 'Spot the telltale signs of phishing attempts in your email inbox.',
      duration: '12 min',
      lessons: 4,
      categoryId: 2,
    },
    {
      id: '2-2',
      title: 'Social Engineering Tactics',
      description: 'Understand how attackers manipulate human psychology to gain access.',
      duration: '15 min',
      lessons: 5,
      categoryId: 2,
    },
    {
      id: '2-3',
      title: 'Safe Link Practices',
      description: 'Learn to verify links and avoid malicious websites.',
      duration: '10 min',
      lessons: 3,
      categoryId: 2,
    },
    {
      id: '2-4',
      title: 'Reporting Scams',
      description: 'Know how to report suspicious activity and help protect others.',
      duration: '8 min',
      lessons: 2,
      categoryId: 2,
    },
  ],
  3: [ // Device & Network Security
    {
      id: '3-1',
      title: 'Device Updates & Patches',
      description: 'Keep your devices secure by staying up to date with the latest security patches.',
      duration: '10 min',
      lessons: 3,
      categoryId: 3,
    },
    {
      id: '3-2',
      title: 'Home Network Security',
      description: 'Secure your Wi-Fi network and protect all connected devices.',
      duration: '18 min',
      lessons: 5,
      categoryId: 3,
    },
    {
      id: '3-3',
      title: 'Antivirus & Firewalls',
      description: 'Choose and configure the right security software for your needs.',
      duration: '14 min',
      lessons: 4,
      categoryId: 3,
    },
    {
      id: '3-4',
      title: 'Mobile Device Security',
      description: 'Protect your smartphone and tablet from threats.',
      duration: '12 min',
      lessons: 3,
      categoryId: 3,
    },
  ],
  4: [ // Online Privacy & Social Media
    {
      id: '4-1',
      title: 'Social Media Privacy Settings',
      description: 'Configure your social media accounts to protect your personal information.',
      duration: '15 min',
      lessons: 4,
      categoryId: 4,
    },
    {
      id: '4-2',
      title: 'Digital Footprint Management',
      description: 'Understand and control what information about you is available online.',
      duration: '12 min',
      lessons: 3,
      categoryId: 4,
    },
    {
      id: '4-3',
      title: 'Data Sharing Awareness',
      description: 'Learn what data you\'re sharing and how to minimize unnecessary exposure.',
      duration: '10 min',
      lessons: 3,
      categoryId: 4,
    },
    {
      id: '4-4',
      title: 'Privacy-Focused Tools',
      description: 'Discover tools and services that prioritize your privacy.',
      duration: '14 min',
      lessons: 4,
      categoryId: 4,
    },
  ],
  5: [ // Secure Finances & Identity Protection
    {
      id: '5-1',
      title: 'Secure Online Banking',
      description: 'Protect your financial accounts when banking online.',
      duration: '12 min',
      lessons: 3,
      categoryId: 5,
    },
    {
      id: '5-2',
      title: 'Credit Monitoring',
      description: 'Set up credit monitoring to detect potential identity theft early.',
      duration: '10 min',
      lessons: 3,
      categoryId: 5,
    },
    {
      id: '5-3',
      title: 'Safe Online Shopping',
      description: 'Shop safely online and protect your payment information.',
      duration: '14 min',
      lessons: 4,
      categoryId: 5,
    },
    {
      id: '5-4',
      title: 'Identity Theft Response',
      description: 'Know what to do if your identity is compromised.',
      duration: '16 min',
      lessons: 4,
      categoryId: 5,
    },
  ],
  6: [ // Welcome Aboard
    {
      id: '6-1',
      title: 'Welcome to CyberPup',
      description: 'Overview and how to get the most out of the app.',
      duration: '5 min',
      lessons: 2,
      categoryId: 6,
    },
  ],
};

export const lessons = {
  '1-1': [ // Creating Strong Passwords
    {
      id: '1-1-1',
      title: 'Lesson 1: Creating Strong Passwords',
      content: 'Learning Goal:\n\nUnderstand how to create strong, memorable passwords that resist common attacks.\n\nWhat You Should Know:\n\n• Longer passwords are better: aim for 12+ characters\n• Avoid personal info like names, birth dates, or pet names\n• Use passphrases — e.g., correct-horse-battery-staple\n• Include a mix of letters, numbers, and symbols\n• Don\'t use the same password on more than one site\n\nReference: NIST Password Guidelines emphasize passphrase over complexity.',
      type: 'instruction',
    },
    {
      id: '1-1-2',
      title: 'Actionable Checklist',
      content: 'My passwords are at least 12 characters long\n\nI avoid names, birthdays, or common words\n\nI use a mix of uppercase, lowercase, numbers, and symbols\n\nI never reuse passwords across services',
      type: 'checklist',
    },
  ],
  '1-2': [ // Password Managers
    {
      id: '1-2-1',
      title: 'Why Use a Password Manager?',
      content: 'Password managers securely store all your passwords in one place, generate strong passwords for you, and automatically fill them in when you visit websites. This eliminates the need to remember dozens of complex passwords and ensures each account has a unique, strong password.',
      type: 'instruction',
    },
    {
      id: '1-2-2',
      title: 'Popular Password Manager Options',
      content: 'Some popular options include LastPass, 1Password, Bitwarden, and Dashlane. Most offer free versions with basic features and premium versions with advanced security features like secure sharing and emergency access.',
      type: 'instruction',
    },
    {
      id: '1-2-3',
      title: 'Setting Up Your First Password Manager',
      content: 'Download your chosen password manager, create a master password (make this one extra strong!), and start by adding your most important accounts like email and banking. Take your time to explore the features and settings.',
      type: 'instruction',
    },
    {
      id: '1-2-4',
      title: 'Security Best Practices',
      content: 'Never share your master password, enable two-factor authentication on your password manager account, and regularly backup your password database. Consider using a passphrase for your master password instead of a single word.',
      type: 'instruction',
    },
    {
      id: '1-2-5',
      title: 'Practice: Set Up Password Manager',
      content: 'Choose a password manager and begin the setup process. Create a strong master password and add at least one account. This hands-on practice will help you become comfortable with using a password manager.',
      type: 'exercise',
    },
  ],
  '1-3': [ // Multi-Factor Authentication
    {
      id: '1-3-1',
      title: 'What is Multi-Factor Authentication?',
      content: 'Multi-factor authentication (MFA) adds an extra layer of security by requiring something you know (password) plus something you have (phone, security key) or something you are (fingerprint, face scan). This makes it much harder for attackers to access your accounts.',
      type: 'instruction',
    },
    {
      id: '1-3-2',
      title: 'Setting Up 2FA on Your Accounts',
      content: 'Start with your most important accounts like email, banking, and social media. Most services offer SMS codes, authenticator apps, or security keys. Authenticator apps like Google Authenticator or Authy are generally more secure than SMS.',
      type: 'instruction',
    },
    {
      id: '1-3-3',
      title: 'Practice: Enable 2FA',
      content: 'Choose one of your important accounts and enable two-factor authentication. Follow the setup process and test that it works correctly. This hands-on experience will help you understand the process.',
      type: 'exercise',
    },
  ],
  '1-4': [ // Password Recovery
    {
      id: '1-4-1',
      title: 'Secure Password Recovery Methods',
      content: 'When setting up password recovery, use a dedicated recovery email that\'s different from your main email. Avoid using security questions that can be easily researched online. Consider using recovery codes or backup authentication methods.',
      type: 'instruction',
    },
    {
      id: '1-4-2',
      title: 'What to Do If You Forget a Password',
      content: 'Don\'t panic! Use your recovery email or backup authentication method. If you can\'t recover access, contact the service\'s support. Never share your recovery information with anyone, and be wary of fake recovery emails.',
      type: 'instruction',
    },
  ],
  '2-1': [ // Identifying Phishing Emails
    {
      id: '2-1-1',
      title: 'Common Phishing Red Flags',
      content: 'Look for urgent language, poor grammar, suspicious sender addresses, and requests for personal information. Phishing emails often create a sense of urgency to pressure you into acting quickly without thinking.',
      type: 'instruction',
    },
    {
      id: '2-1-2',
      title: 'Analyzing Email Headers',
      content: 'Check the sender\'s email address carefully. Phishing emails often use addresses that look similar to legitimate ones but have slight differences. Hover over links to see the actual destination URL before clicking.',
      type: 'instruction',
    },
    {
      id: '2-1-3',
      title: 'Verifying Legitimate Requests',
      content: 'If you receive an email from a company asking for information, contact them directly using their official website or phone number. Never use contact information provided in a suspicious email.',
      type: 'instruction',
    },
    {
      id: '2-1-4',
      title: 'Practice: Spot the Phish',
      content: 'Review these example emails and identify which ones are phishing attempts. Look for the red flags we discussed: urgency, poor grammar, suspicious links, and requests for personal information.',
      type: 'exercise',
    },
  ],
  '2-2': [ // Social Engineering Tactics
    {
      id: '2-2-1',
      title: 'Understanding Social Engineering',
      content: 'Social engineering manipulates human psychology to gain access to information or systems. Attackers exploit trust, authority, urgency, and human nature to trick people into revealing sensitive information.',
      type: 'instruction',
    },
    {
      id: '2-2-2',
      title: 'Common Social Engineering Techniques',
      content: 'Pretexting creates a false scenario to gain information. Baiting uses physical media to spread malware. Quid pro quo offers a service in exchange for information. Tailgating follows authorized personnel into restricted areas.',
      type: 'instruction',
    },
    {
      id: '2-2-3',
      title: 'Protecting Against Social Engineering',
      content: 'Always verify identities independently, be suspicious of urgent requests, and never share sensitive information without proper verification. Trust your instincts - if something feels wrong, it probably is.',
      type: 'instruction',
    },
    {
      id: '2-2-4',
      title: 'Real-World Examples',
      content: 'Learn from real social engineering attacks. These examples show how attackers use psychological manipulation to bypass technical security measures. Understanding these tactics helps you recognize and avoid them.',
      type: 'instruction',
    },
    {
      id: '2-2-5',
      title: 'Practice: Social Engineering Defense',
      content: 'Role-play different social engineering scenarios and practice your responses. This helps you develop the right mindset and responses for real situations.',
      type: 'exercise',
    },
  ],
  '2-3': [ // Safe Link Practices
    {
      id: '2-3-1',
      title: 'Verifying Links Before Clicking',
      content: 'Always hover over links to see the actual destination URL. Look for HTTPS, check the domain name carefully, and be wary of shortened URLs. When in doubt, type the URL directly into your browser.',
      type: 'instruction',
    },
    {
      id: '2-3-2',
      title: 'Recognizing Malicious URLs',
      content: 'Suspicious URLs often have misspellings, extra characters, or use different domains than expected. Be especially careful with links in emails, social media, and text messages.',
      type: 'instruction',
    },
    {
      id: '2-3-3',
      title: 'Practice: URL Analysis',
      content: 'Review these example URLs and identify which ones are suspicious. Look for the warning signs we discussed and practice your link verification skills.',
      type: 'exercise',
    },
  ],
  '2-4': [ // Reporting Scams
    {
      id: '2-4-1',
      title: 'Where to Report Scams',
      content: 'Report phishing emails to the Anti-Phishing Working Group (APWG) and the Federal Trade Commission (FTC). For financial scams, contact your bank and the Consumer Financial Protection Bureau. Save evidence like screenshots and emails.',
      type: 'instruction',
    },
    {
      id: '2-4-2',
      title: 'Helping Others Stay Safe',
      content: 'Share information about scams with friends and family. Report fake social media accounts and websites. Your reports help protect others and can lead to the shutdown of scam operations.',
      type: 'instruction',
    },
  ],
  '3-1': [ // Device Updates & Patches
    {
      id: '3-1-1',
      title: 'Why Updates Matter',
      content: 'Software updates fix security vulnerabilities that attackers can exploit. Keeping your devices updated is one of the most important steps you can take to protect yourself. Enable automatic updates when possible.',
      type: 'instruction',
    },
    {
      id: '3-1-2',
      title: 'Managing Updates Across Devices',
      content: 'Set up automatic updates for your operating system, web browser, and important applications. For devices that don\'t support automatic updates, create a regular schedule to check for updates manually.',
      type: 'instruction',
    },
    {
      id: '3-1-3',
      title: 'Practice: Update Your Devices',
      content: 'Check for updates on your current device and any other devices you use regularly. Install any available security updates and set up automatic updates where possible.',
      type: 'exercise',
    },
  ],
  '3-2': [ // Home Network Security
    {
      id: '3-2-1',
      title: 'Securing Your Wi-Fi Router',
      content: 'Change the default admin password on your router, use WPA3 encryption if available, and hide your network name (SSID). Regularly check for router firmware updates and disable remote administration.',
      type: 'instruction',
    },
    {
      id: '3-2-2',
      title: 'Network Device Management',
      content: 'Keep an inventory of all devices connected to your network. Remove devices you no longer use and monitor for unknown devices. Consider using a guest network for visitors.',
      type: 'instruction',
    },
    {
      id: '3-2-3',
      title: 'IoT Device Security',
      content: 'Internet of Things devices (smart speakers, cameras, thermostats) often have weak security. Change default passwords, keep them updated, and consider isolating them on a separate network.',
      type: 'instruction',
    },
    {
      id: '3-2-4',
      title: 'Network Monitoring',
      content: 'Use your router\'s admin panel to monitor network activity. Look for unusual traffic patterns or unknown devices. Consider using network security tools to detect potential threats.',
      type: 'instruction',
    },
    {
      id: '3-2-5',
      title: 'Practice: Secure Your Network',
      content: 'Access your router\'s admin panel and review the security settings. Change the default password if you haven\'t already and check for firmware updates.',
      type: 'exercise',
    },
  ],
  '3-3': [ // Antivirus & Firewalls
    {
      id: '3-3-1',
      title: 'Choosing Antivirus Software',
      content: 'Look for antivirus software with real-time protection, automatic updates, and good independent test results. Many operating systems include built-in antivirus that may be sufficient for basic protection.',
      type: 'instruction',
    },
    {
      id: '3-3-2',
      title: 'Understanding Firewalls',
      content: 'Firewalls monitor and control network traffic to and from your device. They can block malicious connections and prevent unauthorized access. Most operating systems include a built-in firewall.',
      type: 'instruction',
    },
    {
      id: '3-3-3',
      title: 'Configuring Security Software',
      content: 'Enable real-time protection, schedule regular scans, and configure the software to update automatically. Don\'t disable security features unless absolutely necessary and you understand the risks.',
      type: 'instruction',
    },
    {
      id: '3-3-4',
      title: 'Practice: Security Software Setup',
      content: 'Review your current antivirus and firewall settings. Ensure they\'re properly configured and up to date. Consider running a full system scan to check for any existing threats.',
      type: 'exercise',
    },
  ],
  '3-4': [ // Mobile Device Security
    {
      id: '3-4-1',
      title: 'Mobile Device Basics',
      content: 'Use a strong passcode or biometric authentication, keep your device updated, and only install apps from official app stores. Be careful with public Wi-Fi and consider using a VPN.',
      type: 'instruction',
    },
    {
      id: '3-4-2',
      title: 'App Security & Permissions',
      content: 'Review app permissions before installing and regularly audit existing apps. Remove apps you no longer use and be cautious of apps that request unnecessary permissions.',
      type: 'instruction',
    },
    {
      id: '3-4-3',
      title: 'Practice: Mobile Security Check',
      content: 'Review your mobile device\'s security settings. Check for updates, review app permissions, and ensure you have a strong passcode or biometric authentication enabled.',
      type: 'exercise',
    },
  ],
  '4-1': [ // Social Media Privacy Settings
    {
      id: '4-1-1',
      title: 'Understanding Privacy Settings',
      content: 'Each social media platform has different privacy controls. Take time to understand what information is public, who can see your posts, and how to limit data collection. Review settings regularly as platforms update their policies.',
      type: 'instruction',
    },
    {
      id: '4-1-2',
      title: 'Configuring Account Privacy',
      content: 'Set your accounts to private when possible, limit who can see your posts, and be careful about what personal information you share. Consider using a pseudonym for additional privacy.',
      type: 'instruction',
    },
    {
      id: '4-1-3',
      title: 'Managing Friend Lists',
      content: 'Regularly review your friend/follower lists and remove people you don\'t know or trust. Use custom privacy settings to control what different groups of people can see.',
      type: 'instruction',
    },
    {
      id: '4-1-4',
      title: 'Practice: Privacy Settings Review',
      content: 'Go through your social media accounts and review their privacy settings. Make sure you\'re comfortable with what information is public and who can see your content.',
      type: 'exercise',
    },
  ],
  '4-2': [ // Digital Footprint Management
    {
      id: '4-2-1',
      title: 'What is Your Digital Footprint?',
      content: 'Your digital footprint includes all the information about you available online - social media posts, public records, news articles, and more. Understanding your footprint helps you manage your online reputation.',
      type: 'instruction',
    },
    {
      id: '4-2-2',
      title: 'Managing Your Online Presence',
      content: 'Regularly search for your name online to see what information is publicly available. Request removal of outdated or inaccurate information when possible. Be mindful of what you post and share.',
      type: 'instruction',
    },
    {
      id: '4-2-3',
      title: 'Practice: Digital Footprint Audit',
      content: 'Search for your name online and review what information is publicly available. Make a list of any information you\'d like to remove or update.',
      type: 'exercise',
    },
  ],
  '4-3': [ // Data Sharing Awareness
    {
      id: '4-3-1',
      title: 'Understanding Data Collection',
      content: 'Companies collect vast amounts of data about users - browsing history, location data, purchase history, and more. This data is used for advertising, product development, and sometimes sold to third parties.',
      type: 'instruction',
    },
    {
      id: '4-3-2',
      title: 'Minimizing Data Sharing',
      content: 'Read privacy policies, use privacy-focused browsers and search engines, and limit the information you share with apps and websites. Consider using ad blockers and tracking protection.',
      type: 'instruction',
    },
    {
      id: '4-3-3',
      title: 'Practice: Data Sharing Review',
      content: 'Review the privacy settings and data sharing options for your most-used apps and websites. Identify where you can reduce the amount of data you\'re sharing.',
      type: 'exercise',
    },
  ],
  '4-4': [ // Privacy-Focused Tools
    {
      id: '4-4-1',
      title: 'Privacy-Focused Browsers',
      content: 'Browsers like Firefox, Brave, and Tor offer enhanced privacy features. They block trackers, prevent fingerprinting, and give you more control over your browsing data.',
      type: 'instruction',
    },
    {
      id: '4-4-2',
      title: 'VPNs and Privacy Services',
      content: 'Virtual Private Networks (VPNs) encrypt your internet traffic and hide your IP address. Privacy-focused search engines like DuckDuckGo don\'t track your searches or build profiles.',
      type: 'instruction',
    },
    {
      id: '4-4-3',
      title: 'Secure Communication Tools',
      content: 'Use end-to-end encrypted messaging apps like Signal or WhatsApp. Consider using encrypted email services for sensitive communications.',
      type: 'instruction',
    },
    {
      id: '4-4-4',
      title: 'Practice: Privacy Tools Setup',
      content: 'Try a privacy-focused browser or search engine. Set up a VPN if you haven\'t already, and explore secure messaging options for your communications.',
      type: 'exercise',
    },
  ],
  '5-1': [ // Secure Online Banking
    {
      id: '5-1-1',
      title: 'Banking Security Basics',
      content: 'Use strong, unique passwords for banking accounts and enable two-factor authentication. Only access banking sites through official apps or by typing the URL directly. Never use public Wi-Fi for banking.',
      type: 'instruction',
    },
    {
      id: '5-1-2',
      title: 'Recognizing Banking Scams',
      content: 'Banks will never ask for your password via email or phone. Be suspicious of urgent requests for account information or transfers. Verify any banking communications through official channels.',
      type: 'instruction',
    },
    {
      id: '5-1-3',
      title: 'Practice: Banking Security Review',
      content: 'Review your banking security settings. Ensure you have strong passwords, 2FA enabled, and that you\'re using official banking apps or websites.',
      type: 'exercise',
    },
  ],
  '5-2': [ // Credit Monitoring
    {
      id: '5-2-1',
      title: 'Understanding Credit Monitoring',
      content: 'Credit monitoring services track your credit reports and alert you to changes that might indicate fraud. They can help you detect identity theft early and take action quickly.',
      type: 'instruction',
    },
    {
      id: '5-2-2',
      title: 'Setting Up Credit Monitoring',
      content: 'You can get free credit reports annually from AnnualCreditReport.com. Consider paid monitoring services for more frequent updates and additional features like identity theft insurance.',
      type: 'instruction',
    },
    {
      id: '5-2-3',
      title: 'Practice: Credit Report Review',
      content: 'Request your free credit report and review it for any errors or suspicious activity. Set up alerts for future credit report changes.',
      type: 'exercise',
    },
  ],
  '5-3': [ // Safe Online Shopping
    {
      id: '5-3-1',
      title: 'Secure Shopping Practices',
      content: 'Only shop on secure websites (look for HTTPS and a padlock icon). Use credit cards instead of debit cards for online purchases, as they offer better fraud protection.',
      type: 'instruction',
    },
    {
      id: '5-3-2',
      title: 'Payment Security',
      content: 'Consider using virtual credit card numbers or payment services like PayPal for additional security. Never save payment information on shared computers.',
      type: 'instruction',
    },
    {
      id: '5-3-3',
      title: 'Recognizing Shopping Scams',
      content: 'Be wary of deals that seem too good to be true, especially on social media. Research sellers before making purchases and be cautious of requests for unusual payment methods.',
      type: 'instruction',
    },
    {
      id: '5-3-4',
      title: 'Practice: Secure Shopping Setup',
      content: 'Review your online shopping accounts and payment methods. Consider setting up virtual credit card numbers or payment services for additional security.',
      type: 'exercise',
    },
  ],
  '5-4': [ // Identity Theft Response
    {
      id: '5-4-1',
      title: 'Recognizing Identity Theft',
      content: 'Signs of identity theft include unauthorized charges, accounts you didn\'t open, credit report errors, and bills for services you didn\'t use. Act quickly if you suspect identity theft.',
      type: 'instruction',
    },
    {
      id: '5-4-2',
      title: 'Immediate Response Steps',
      content: 'Contact your bank and credit card companies immediately. Place a fraud alert on your credit reports and file a report with the Federal Trade Commission. Keep detailed records of all communications.',
      type: 'instruction',
    },
    {
      id: '5-4-3',
      title: 'Long-Term Recovery',
      content: 'Monitor your accounts and credit reports closely. Consider a credit freeze to prevent new accounts from being opened. Be patient - identity theft recovery can take months or years.',
      type: 'instruction',
    },
    {
      id: '5-4-4',
      title: 'Practice: Identity Theft Plan',
      content: 'Create a plan for what you would do if you became a victim of identity theft. Include contact information for your bank, credit card companies, and relevant government agencies.',
      type: 'exercise',
    },
  ],
  '6-1': [ // Welcome to CyberPup
    {
      id: '6-1-1',
      title: 'Welcome to CyberPup',
      content: 'Welcome to CyberPup! This brief introduction explains what the app is designed to do and how to navigate through categories and modules to build your security skills.',
      type: 'instruction',
    },
    {
      id: '6-1-2',
      title: 'Getting the Most Out of CyberPup',
      content: 'Tips for success: set aside short, regular sessions, complete modules in order, and apply the practical steps right away. Track your progress and revisit topics as needed.',
      type: 'instruction',
    },
  ],
};

// Helper functions for easy data access
export const getCategoryById = (id) => {
  return categories.find(category => category.id === id);
};

export const getModulesByCategory = (categoryId) => {
  return modules[categoryId] || [];
};

export const getLessonsByModule = (moduleId) => {
  return lessons[moduleId] || [];
};

export const getAllModules = () => {
  return Object.values(modules).flat();
};

export const getAllLessons = () => {
  return Object.values(lessons).flat();
};

// Search functionality
export const searchContent = (query) => {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  // Search in categories
  categories.forEach(category => {
    if (category.title.toLowerCase().includes(searchTerm) || 
        category.description.toLowerCase().includes(searchTerm)) {
      results.push({ type: 'category', data: category });
    }
  });
  
  // Search in modules
  getAllModules().forEach(module => {
    if (module.title.toLowerCase().includes(searchTerm) || 
        module.description.toLowerCase().includes(searchTerm)) {
      results.push({ type: 'module', data: module });
    }
  });
  
  // Search in lessons
  getAllLessons().forEach(lesson => {
    if (lesson.title.toLowerCase().includes(searchTerm) || 
        lesson.content.toLowerCase().includes(searchTerm)) {
      results.push({ type: 'lesson', data: lesson });
    }
  });
  
  return results;
}; 