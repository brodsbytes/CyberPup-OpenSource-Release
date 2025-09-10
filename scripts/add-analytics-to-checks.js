/**
 * Script to Add Analytics to All Security Check Screens
 * This script systematically adds analytics tracking to all security check screens
 */

const fs = require('fs');
const path = require('path');

// Define the security check screens and their mappings
const securityChecks = [
  { file: 'Check1_1_2_HighValueAccountsScreen.js', checkId: 'check_1-1-2_high_value_accounts', name: 'High Value Accounts', category: 'passwords' },
  { file: 'Check1_1_3_PasswordManagersScreen.js', checkId: 'check_1-1-3_password_managers', name: 'Password Managers', category: 'passwords' },
  { file: 'Check1_1_4_MFASetupScreen.js', checkId: 'check_1-1-4_mfa_setup', name: 'MFA Setup', category: 'authentication' },
  { file: 'Check1_1_5_BreachCheckScreen.js', checkId: 'check_1-1-5_breach_check', name: 'Breach Check', category: 'passwords' },
  { file: 'Check1_2_1_ScreenLockScreen.js', checkId: 'check_1-2-1_screen_lock', name: 'Screen Lock', category: 'device_security' },
  { file: 'Check1_2_2_RemoteLockScreen.js', checkId: 'check_1-2-2_remote_lock', name: 'Remote Lock', category: 'device_security' },
  { file: 'Check1_2_3_DeviceUpdatesScreen.js', checkId: 'check_1-2-3_device_updates', name: 'Device Updates', category: 'device_security' },
  { file: 'Check1_2_4_BluetoothWifiScreen.js', checkId: 'check_1-2-4_bluetooth_wifi', name: 'Bluetooth & WiFi', category: 'network_security' },
  { file: 'Check1_2_5_PublicChargingScreen.js', checkId: 'check_1-2-5_public_charging', name: 'Public Charging', category: 'device_security' },
  { file: 'Check1_3_1_CloudBackupScreen.js', checkId: 'check_1-3-1_cloud_backup', name: 'Cloud Backup', category: 'data_protection' },
  { file: 'Check1_3_2_LocalBackupScreen.js', checkId: 'check_1-3-2_local_backup', name: 'Local Backup', category: 'data_protection' },
  { file: 'Check1_4_1_ScamRecognitionScreen.js', checkId: 'check_1-4-1_scam_recognition', name: 'Scam Recognition', category: 'awareness' },
  { file: 'Check1_4_2_ScamReportingScreen.js', checkId: 'check_1-4-2_scam_reporting', name: 'Scam Reporting', category: 'awareness' },
  { file: 'Check1_5_1_SharingAwarenessScreen.js', checkId: 'check_1-5-1_sharing_awareness', name: 'Sharing Awareness', category: 'privacy' },
  { file: 'Check1_5_2_PrivacySettingsScreen.js', checkId: 'check_1-5-2_privacy_settings', name: 'Privacy Settings', category: 'privacy' },
];

const screensDir = path.join(__dirname, '../screens/lessons/level-1');

function addAnalyticsToCheckScreen(checkData) {
  const filePath = path.join(screensDir, checkData.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${checkData.file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if analytics is already imported
  if (content.includes('trackSecurityCheck')) {
    console.log(`✅ Analytics already added to ${checkData.file}`);
    return;
  }

  // Add import statement
  const importRegex = /(import.*from.*['"]\.\.\/\.\.\/\.\.\/data\/references['"];)/;
  const analyticsImport = "import { trackSecurityCheck, trackEvent } from '../../../utils/analytics';";
  
  if (importRegex.test(content)) {
    content = content.replace(importRegex, `$1\n${analyticsImport}`);
  } else {
    // Fallback: add after the last import
    const lastImportRegex = /(import.*from.*['"][^'"]*['"];)(?!.*import)/;
    if (lastImportRegex.test(content)) {
      content = content.replace(lastImportRegex, `$1\n${analyticsImport}`);
    }
  }

  // Add tracking to useFocusEffect or useEffect
  const useFocusEffectRegex = /(useFocusEffect\s*\(\s*React\.useCallback\s*\(\s*\(\s*\)\s*=>\s*\{)/;
  const useEffectRegex = /(useEffect\s*\(\s*\(\s*\)\s*=>\s*\{)/;
  
  const trackingCode = `
    // Track security check started
    trackSecurityCheck('${checkData.checkId}', 'started', {
      check_name: '${checkData.name}',
      level: 1,
      category: '${checkData.category}',
    });
`;

  if (useFocusEffectRegex.test(content)) {
    content = content.replace(useFocusEffectRegex, `$1${trackingCode}`);
  } else if (useEffectRegex.test(content)) {
    content = content.replace(useEffectRegex, `$1${trackingCode}`);
  }

  // Add tracking to completion handler
  const completionRegex = /(const\s+celebrateCompletion\s*=\s*[^{]*\{|const\s+handleCompletion\s*=\s*[^{]*\{|const\s+completeCheck\s*=\s*[^{]*\{)/;
  
  const completionTrackingCode = `
    // Track security check completed
    trackSecurityCheck('${checkData.checkId}', 'completed', {
      check_name: '${checkData.name}',
      level: 1,
      category: '${checkData.category}',
      completed_items: checklistItems?.filter(item => item.completed).length || 0,
      total_items: checklistItems?.length || 0,
    });
`;

  if (completionRegex.test(content)) {
    content = content.replace(completionRegex, `$1${completionTrackingCode}`);
  }

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`✅ Added analytics to ${checkData.file}`);
}

// Main execution
console.log('🚀 Starting analytics integration for security check screens...\n');

securityChecks.forEach(checkData => {
  addAnalyticsToCheckScreen(checkData);
});

console.log('\n🎉 Analytics integration completed for all security check screens!');
console.log('\nNext steps:');
console.log('1. Review the modified files');
console.log('2. Test the analytics tracking');
console.log('3. Verify events appear in PostHog dashboard');
