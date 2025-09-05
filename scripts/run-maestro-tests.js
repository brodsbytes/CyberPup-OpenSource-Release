#!/usr/bin/env node

/**
 * Maestro Test Runner for CyberPup
 * This script runs Maestro e2e tests with proper device selection and reporting
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting CyberPup Maestro Test Runner...');

// Configuration
const config = {
  maestroTestsDir: './maestro-tests',
  testTimeout: 300000, // 5 minutes per test
  deviceTypes: {
    ios: 'iPhone 15',
    android: 'Pixel_7_API_34',
    default: 'auto'
  }
};

// Test suites
const testSuites = {
  'smoke': ['01-welcome-flow.yaml'],
  'device': ['02-device-audit-flow.yaml'],
  'password': ['03-password-security-flow.yaml'],
  'device-security': ['04-device-security-flow.yaml'],
  'data': ['05-data-protection-flow.yaml'],
  'scam': ['06-scam-awareness-flow.yaml'],
  'privacy': ['07-privacy-protection-flow.yaml'],
  'complete': ['08-complete-level1-flow.yaml'],
  'all': [
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get available devices (simplified approach)
async function getAvailableDevices() {
  // Since Maestro doesn't have a device list command, we'll return empty array
  // and let Maestro handle device selection automatically
  return [];
}

// Run Maestro test
async function runMaestroTest(testFile, deviceId = null) {
  return new Promise((resolve, reject) => {
    const args = ['test', path.join(config.maestroTestsDir, testFile)];
    if (deviceId) {
      args.push('--device-id', deviceId);
    }
    
    log(`Running test: ${testFile}${deviceId ? ` on ${deviceId}` : ''}`);
    
    const maestroProcess = spawn('maestro', args, { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    
    let output = '';
    let errorOutput = '';
    
    maestroProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    maestroProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    maestroProcess.on('close', (code) => {
      if (code === 0) {
        log(`✅ Test passed: ${testFile}`, 'success');
        resolve({ success: true, output, testFile });
      } else {
        log(`❌ Test failed: ${testFile}`, 'error');
        reject({ success: false, output, errorOutput, testFile, code });
      }
    });
    
    // Timeout handling
    setTimeout(() => {
      maestroProcess.kill();
      reject(new Error(`Test timeout: ${testFile}`));
    }, config.testTimeout);
  });
}

// Run test suite
async function runTestSuite(suiteName, deviceId = null) {
  log(`Running test suite: ${suiteName}`);
  
  const tests = testSuites[suiteName];
  if (!tests) {
    throw new Error(`Unknown test suite: ${suiteName}`);
  }
  
  const results = [];
  
  for (const testFile of tests) {
    try {
      const result = await runMaestroTest(testFile, deviceId);
      results.push(result);
      
      // Copy test artifacts to our results directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const testName = path.basename(testFile, '.yaml');
      const resultsDir = `test-results/${testName}-${timestamp}`;
      
      try {
        await runCommand(`mkdir -p ${resultsDir}`, { silent: true });
        await runCommand(`cp -r ~/.maestro/tests/* ${resultsDir}/ 2>/dev/null || true`, { silent: true });
        log(`📸 Test artifacts saved to: ${resultsDir}`, 'info');
      } catch (error) {
        log(`⚠️  Could not copy test artifacts: ${error.message}`, 'error');
      }
      
      await delay(2000); // Wait between tests
    } catch (error) {
      log(`Test failed: ${testFile} - ${error.message}`, 'error');
      results.push({ success: false, testFile, error: error.message });
    }
  }
  
  return results;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const suite = args[0] || 'smoke';
  const deviceType = args[1] || 'default';
  
  log(`Test suite: ${suite}`);
  log(`Device type: ${deviceType}`);
  
  try {
    // Get available devices (simplified)
    log('Preparing for test execution...');
    const devices = await getAvailableDevices();
    
    // Select device
    let deviceId = null;
    if (deviceType !== 'default' && deviceType !== 'auto') {
      deviceId = config.deviceTypes[deviceType] || deviceType;
      log(`Using device: ${deviceId}`);
    } else {
      log('Using auto device detection');
    }
    
    // Run tests
    const results = await runTestSuite(suite, deviceId);
    
    // Report results
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    log(`\n📊 Test Results:`, 'info');
    log(`✅ Passed: ${passed}`, 'success');
    log(`❌ Failed: ${failed}`, failed > 0 ? 'error' : 'info');
    
    if (failed > 0) {
      log('\nFailed tests:', 'error');
      results.filter(r => !r.success).forEach(r => {
        log(`  - ${r.testFile}: ${r.error}`, 'error');
      });
    }
    
    log('\n🎉 Test execution completed!', 'success');
    
  } catch (error) {
    log(`Test runner failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Help text
function showHelp() {
  console.log(`
CyberPup Maestro Test Runner

Usage: node scripts/run-maestro-tests.js [suite] [device]

Test Suites:
  smoke       - Quick smoke test (welcome flow only)
  device      - Device audit tests
  password    - Password security tests
  device-security - Device security tests
  data        - Data protection tests
  scam        - Scam awareness tests
  privacy     - Privacy protection tests
  complete    - Complete Level 1 flow
  all         - All tests

Device Types:
  ios         - Use iOS simulator
  android     - Use Android emulator
  default     - Auto-detect device
  auto        - Auto-detect device

Examples:
  node scripts/run-maestro-tests.js smoke
  node scripts/run-maestro-tests.js all ios
  node scripts/run-maestro-tests.js password android
  node scripts/run-maestro-tests.js complete
`);
}

// Handle help
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

// Run main function
if (require.main === module) {
  main().catch(error => {
    log(`Test runner failed: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runTestSuite, runMaestroTest, config, testSuites };
