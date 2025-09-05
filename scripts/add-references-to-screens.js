#!/usr/bin/env node

/**
 * Script to add ReferencesSection to all check screens
 * This script systematically adds the references component to all check screens
 */

const fs = require('fs');
const path = require('path');

// Define the check screen files and their corresponding check IDs
const checkScreens = [
  { file: 'Check1_1_2_HighValueAccountsScreen.js', checkId: '1-1-2' },
  { file: 'Check1_1_3_PasswordManagersScreen.js', checkId: '1-1-3' },
  { file: 'Check1_1_4_MFASetupScreen.js', checkId: '1-1-4' },
  { file: 'Check1_2_2_RemoteLockScreen.js', checkId: '1-2-2' },
  { file: 'Check1_2_3_DeviceUpdatesScreen.js', checkId: '1-2-3' },
  { file: 'Check1_2_4_BluetoothWifiScreen.js', checkId: '1-2-4' },
  { file: 'Check1_2_5_PublicChargingScreen.js', checkId: '1-2-5' },
  { file: 'Check1_3_1_CloudBackupScreen.js', checkId: '1-3-1' },
  { file: 'Check1_3_2_LocalBackupScreen.js', checkId: '1-3-2' },
  { file: 'Check1_4_1_ScamRecognitionScreen.js', checkId: '1-4-1' },
  { file: 'Check1_4_2_ScamReportingScreen.js', checkId: '1-4-2' },
  { file: 'Check1_5_1_SharingAwarenessScreen.js', checkId: '1-5-1' },
  { file: 'Check1_5_2_PrivacySettingsScreen.js', checkId: '1-5-2' }
];

const screensDir = path.join(__dirname, '..', 'screens', 'lessons', 'level-1');

// Import statements to add
const importStatements = [
  "import ReferencesSection from '../../../components/ui/ReferencesSection';",
  "import { getReferencesForCheck } from '../../../data/references';"
];

// References section component to add
const referencesComponent = `
          {/* References Section */}
          <ReferencesSection references={getReferencesForCheck('CHECK_ID')} />`;

function addReferencesToScreen(filePath, checkId) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if ReferencesSection is already imported
    if (content.includes('ReferencesSection')) {
      console.log(`✅ ${path.basename(filePath)} already has ReferencesSection`);
      return;
    }
    
    // Add import statements
    const importRegex = /import.*from.*['"]\.\.\/\.\.\/\.\.\/theme['"];?\s*\n/;
    const match = content.match(importRegex);
    
    if (match) {
      const insertPoint = match.index + match[0].length;
      const newImports = importStatements.join('\n') + '\n';
      content = content.slice(0, insertPoint) + newImports + content.slice(insertPoint);
    }
    
    // Add ReferencesSection component before the closing </View> of the main content
    const contentEndRegex = /(\s*)(<\/View>\s*<\/ScrollView>)/;
    const endMatch = content.match(contentEndRegex);
    
    if (endMatch) {
      const insertPoint = endMatch.index;
      const componentWithCheckId = referencesComponent.replace('CHECK_ID', checkId);
      content = content.slice(0, insertPoint) + componentWithCheckId + '\n' + content.slice(insertPoint);
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added ReferencesSection to ${path.basename(filePath)}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error.message);
  }
}

// Process all check screens
console.log('🚀 Adding ReferencesSection to all check screens...\n');

checkScreens.forEach(({ file, checkId }) => {
  const filePath = path.join(screensDir, file);
  
  if (fs.existsSync(filePath)) {
    addReferencesToScreen(filePath, checkId);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log('\n✨ References addition complete!');
