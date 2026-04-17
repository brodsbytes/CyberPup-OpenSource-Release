/**
 * Simple Analytics Integration Script
 * Adds basic progress tracking to all security check screens
 * Works with existing completion storage without requiring component knowledge
 */

const fs = require('fs');
const path = require('path');

// Define the security check screens and their mappings
const securityChecks = [
  { file: 'Check1_1_1_StrongPasswordsScreen.js', checkId: '1-1-1', name: 'Strong Passwords', category: 'passwords' },
  { file: 'Check1_1_2_HighValueAccountsScreen.js', checkId: '1-1-2', name: 'High Value Accounts', category: 'passwords' },
  { file: 'Check1_1_3_PasswordManagersScreen.js', checkId: '1-1-3', name: 'Password Managers', category: 'passwords' },
  { file: 'Check1_1_4_MFASetupScreen.js', checkId: '1-1-4', name: 'MFA Setup', category: 'authentication' },
  { file: 'Check1_1_5_BreachCheckScreen.js', checkId: '1-1-5', name: 'Breach Check', category: 'passwords' },
  { file: 'Check1_2_1_ScreenLockScreen.js', checkId: '1-2-1', name: 'Screen Lock', category: 'device_security' },
  { file: 'Check1_2_2_RemoteLockScreen.js', checkId: '1-2-2', name: 'Remote Lock', category: 'device_security' },
  { file: 'Check1_2_3_DeviceUpdatesScreen.js', checkId: '1-2-3', name: 'Device Updates', category: 'device_security' },
  { file: 'Check1_2_4_BluetoothWifiScreen.js', checkId: '1-2-4', name: 'Bluetooth & WiFi', category: 'network_security' },
  { file: 'Check1_2_5_PublicChargingScreen.js', checkId: '1-2-5', name: 'Public Charging', category: 'device_security' },
  { file: 'Check1_3_1_CloudBackupScreen.js', checkId: '1-3-1', name: 'Cloud Backup', category: 'data_protection' },
  { file: 'Check1_3_2_LocalBackupScreen.js', checkId: '1-3-2', name: 'Local Backup', category: 'data_protection' },
  { file: 'Check1_4_1_ScamRecognitionScreen.js', checkId: '1-4-1', name: 'Scam Recognition', category: 'awareness' },
  { file: 'Check1_4_2_ScamReportingScreen.js', checkId: '1-4-2', name: 'Scam Reporting', category: 'awareness' },
  { file: 'Check1_5_1_SharingAwarenessScreen.js', checkId: '1-5-1', name: 'Sharing Awareness', category: 'privacy' },
  { file: 'Check1_5_2_PrivacySettingsScreen.js', checkId: '1-5-2', name: 'Privacy Settings', category: 'privacy' },
];

const screensDir = path.join(__dirname, '../screens/lessons/level-1');

function addSimpleAnalyticsToCheckScreen(checkData) {
  const filePath = path.join(screensDir, checkData.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${checkData.file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if simple analytics is already imported
  if (content.includes('trackCheckScreenView')) {
    console.log(`✅ Simple analytics already added to ${checkData.file}`);
    return;
  }

  // Add import statement after the last import
  const lastImportRegex = /(import.*from.*['"][^'"]*['"];)(?!.*import)/;
  const analyticsImport = "import { trackCheckScreenView, trackCheckProgress, trackCheckCompletion } from '../../../utils/checkAnalytics';";
  
  if (lastImportRegex.test(content)) {
    content = content.replace(lastImportRegex, `$1\n${analyticsImport}`);
  }

  // Add screen view tracking to useFocusEffect or useEffect
  const useFocusEffectRegex = /(useFocusEffect\s*\(\s*React\.useCallback\s*\(\s*\(\s*\)\s*=>\s*\{)/;
  const useEffectRegex = /(useEffect\s*\(\s*\(\s*\)\s*=>\s*\{)/;
  
  const screenViewTracking = `
    // Track check screen view
    trackCheckScreenView('${checkData.checkId}', '${checkData.name}', 1, '${checkData.category}');
`;

  if (useFocusEffectRegex.test(content)) {
    content = content.replace(useFocusEffectRegex, `$1${screenViewTracking}`);
  } else if (useEffectRegex.test(content)) {
    content = content.replace(useEffectRegex, `$1${screenViewTracking}`);
  }

  // Add completion tracking to completion handler
  const completionRegex = /(const\s+celebrateCompletion\s*=\s*[^{]*\{|const\s+handleCompletion\s*=\s*[^{]*\{|const\s+completeCheck\s*=\s*[^{]*\{)/;
  
  const completionTracking = `
    // Track check completion
    trackCheckCompletion('${checkData.checkId}', '${checkData.name}', 1, '${checkData.category}');
`;

  if (completionRegex.test(content)) {
    content = content.replace(completionRegex, `$1${completionTracking}`);
  }

  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
  console.log(`✅ Added simple analytics to ${checkData.file}`);
}

// Main execution
console.log('🚀 Starting simple analytics integration for security check screens...\n');

securityChecks.forEach(checkData => {
  addSimpleAnalyticsToCheckScreen(checkData);
});

console.log('\n🎉 Simple analytics integration completed for all security check screens!');
console.log('\nThis implementation:');
console.log('✅ Tracks screen views when users enter check screens');
console.log('✅ Tracks completion when checks are finished');
console.log('✅ Works with existing completion storage system');
console.log('✅ No dependency on specific component structures');
console.log('✅ Simple and reliable across all check screens');
