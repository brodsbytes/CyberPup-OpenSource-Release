#!/usr/bin/env node

/**
 * Maestro Test Validator for CyberPup
 * This script validates that all Maestro test files are properly formatted
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

console.log('🔍 Validating CyberPup Maestro Tests...');

// Configuration
const config = {
  maestroTestsDir: './maestro-tests',
  requiredFiles: [
    '01-welcome-flow.yaml',
    '02-device-audit-flow.yaml',
    '03-password-security-flow.yaml',
    '04-device-security-flow.yaml',
    '05-data-protection-flow.yaml',
    '06-scam-awareness-flow.yaml',
    '07-privacy-protection-flow.yaml',
    '08-complete-level1-flow.yaml'
  ]
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// Validate YAML file
function validateYamlFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for required Maestro structure
    if (!content.includes('appId:')) {
      throw new Error('Missing appId field');
    }
    
    if (!content.includes('host.exp.Exponent')) {
      throw new Error('App ID should be host.exp.Exponent');
    }
    
    if (!content.includes('---')) {
      throw new Error('Missing YAML document separator (---)');
    }
    
    // Try to parse as YAML
    const docs = yaml.loadAll(content);
    
    if (!docs || docs.length === 0) {
      throw new Error('No valid YAML documents found');
    }
    
    // Check for required Maestro commands
    const contentLower = content.toLowerCase();
    const requiredCommands = ['launchapp', 'assertvisible'];
    const hasRequiredCommands = requiredCommands.some(cmd => contentLower.includes(cmd));
    
    if (!hasRequiredCommands) {
      throw new Error('Missing required Maestro commands (launchApp, assertVisible)');
    }
    
    return { valid: true, docs: docs.length };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Validate test file structure
function validateTestStructure(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let hasAppId = false;
    let hasSeparator = false;
    let hasCommands = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('appId:')) {
        hasAppId = true;
      }
      
      if (trimmed === '---') {
        hasSeparator = true;
      }
      
      if (trimmed.startsWith('- ') && (trimmed.includes('launchApp') || trimmed.includes('assertVisible'))) {
        hasCommands = true;
      }
    }
    
    return {
      hasAppId,
      hasSeparator,
      hasCommands,
      valid: hasAppId && hasSeparator && hasCommands
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Main validation function
async function validateTests() {
  log('Starting test validation...');
  
  const results = [];
  let totalValid = 0;
  let totalInvalid = 0;
  
  // Check if maestro-tests directory exists
  if (!fs.existsSync(config.maestroTestsDir)) {
    log(`Test directory not found: ${config.maestroTestsDir}`, 'error');
    return false;
  }
  
  // Validate each required file
  for (const fileName of config.requiredFiles) {
    const filePath = path.join(config.maestroTestsDir, fileName);
    
    log(`Validating ${fileName}...`);
    
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${fileName}`, 'error');
      results.push({ file: fileName, valid: false, error: 'File not found' });
      totalInvalid++;
      continue;
    }
    
    // Validate YAML structure
    const yamlResult = validateYamlFile(filePath);
    
    // Validate test structure
    const structureResult = validateTestStructure(filePath);
    
    if (yamlResult.valid && structureResult.valid) {
      log(`✅ ${fileName} - Valid (${yamlResult.docs} YAML documents)`, 'success');
      results.push({ 
        file: fileName, 
        valid: true, 
        yamlDocs: yamlResult.docs,
        hasAppId: structureResult.hasAppId,
        hasSeparator: structureResult.hasSeparator,
        hasCommands: structureResult.hasCommands
      });
      totalValid++;
    } else {
      const errors = [];
      if (!yamlResult.valid) errors.push(`YAML: ${yamlResult.error}`);
      if (!structureResult.valid) {
        if (!structureResult.hasAppId) errors.push('Missing appId');
        if (!structureResult.hasSeparator) errors.push('Missing YAML separator');
        if (!structureResult.hasCommands) errors.push('Missing Maestro commands');
      }
      
      log(`❌ ${fileName} - Invalid: ${errors.join(', ')}`, 'error');
      results.push({ file: fileName, valid: false, error: errors.join(', ') });
      totalInvalid++;
    }
  }
  
  // Summary
  log(`\n📊 Validation Results:`, 'info');
  log(`✅ Valid files: ${totalValid}`, 'success');
  log(`❌ Invalid files: ${totalInvalid}`, totalInvalid > 0 ? 'error' : 'info');
  
  if (totalInvalid > 0) {
    log('\nInvalid files:', 'error');
    results.filter(r => !r.valid).forEach(r => {
      log(`  - ${r.file}: ${r.error}`, 'error');
    });
  }
  
  // Check for additional files
  const allFiles = fs.readdirSync(config.maestroTestsDir);
  const yamlFiles = allFiles.filter(f => f.endsWith('.yaml'));
  const extraFiles = yamlFiles.filter(f => !config.requiredFiles.includes(f));
  
  if (extraFiles.length > 0) {
    log(`\n📁 Additional test files found: ${extraFiles.join(', ')}`, 'info');
  }
  
  const success = totalInvalid === 0;
  
  if (success) {
    log('\n🎉 All tests are valid!', 'success');
    log('You can now run tests with: npm run test:e2e:smoke', 'info');
  } else {
    log('\n⚠️  Some tests need fixing before running', 'error');
  }
  
  return success;
}

// Run validation
if (require.main === module) {
  validateTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    log(`Validation failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { validateTests, validateYamlFile, validateTestStructure };
