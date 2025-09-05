#!/usr/bin/env node

/**
 * Automated E2E Test Runner with Emulator Management
 * This script handles the complete E2E testing workflow:
 * 1. Starts Android emulator
 * 2. Installs Expo Go
 * 3. Starts Expo development server
 * 4. Runs Maestro tests
 * 5. Cleans up resources
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  emulatorName: 'CyberPup_Test_Emulator',
  expoGoPackage: 'host.exp.exponent',
  testTimeout: 30 * 60 * 1000, // 30 minutes
  emulatorStartTimeout: 5 * 60 * 1000, // 5 minutes
  expoStartTimeout: 2 * 60 * 1000, // 2 minutes
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`🚀 Step ${step}: ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Utility function to run shell commands
function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn('bash', ['-c', command], {
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });

    let stdout = '';
    let stderr = '';

    if (options.silent) {
      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });
      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });
    }

    process.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

// Check if emulator is running
async function isEmulatorRunning() {
  try {
    const { stdout } = await runCommand('adb devices', { silent: true });
    return stdout.includes('device') && !stdout.includes('offline');
  } catch (error) {
    return false;
  }
}

// Start Android emulator
async function startEmulator() {
  logStep(1, 'Starting Android emulator...');
  
  if (await isEmulatorRunning()) {
    logWarning('Emulator is already running');
    return true;
  }

  try {
    // Start emulator using our setup script
    await runCommand('./scripts/setup-android-emulator.sh start');
    
    // Wait for emulator to be ready
    log('Waiting for emulator to be ready...', 'blue');
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    
    while (attempts < maxAttempts) {
      if (await isEmulatorRunning()) {
        // Additional check for boot completion
        try {
          await runCommand('adb shell getprop sys.boot_completed', { silent: true });
          logSuccess('Emulator is ready!');
          return true;
        } catch (error) {
          // Still booting, continue waiting
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
      log(`Still waiting... (${attempts}/${maxAttempts})`, 'yellow');
    }
    
    throw new Error('Emulator failed to start within timeout');
  } catch (error) {
    logError(`Failed to start emulator: ${error.message}`);
    return false;
  }
}

// Start Expo development server
async function startExpoServer() {
  logStep(2, 'Starting Expo development server...');
  
  try {
    // Kill any existing Expo processes
    await runCommand('pkill -f "expo start" || true', { silent: true });
    await runCommand('pkill -f "metro" || true', { silent: true });
    
    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start Expo server in tunnel mode for emulator access
    const expoProcess = spawn('npx', ['expo', 'start', '--tunnel'], {
      stdio: 'pipe',
      cwd: process.cwd(),
      env: { ...process.env, EXPO_NO_DOTENV: '1' }
    });

    let expoReady = false;
    let expoUrl = '';

    expoProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      
      // Look for the QR code or URL
      if (output.includes('exp://') && !expoReady) {
        const match = output.match(/exp:\/\/[^\s]+/);
        if (match) {
          expoUrl = match[0];
          expoReady = true;
          logSuccess(`Expo server ready: ${expoUrl}`);
        }
      }
    });

    expoProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    expoProcess.on('error', (error) => {
      logError(`Expo process error: ${error.message}`);
    });

    expoProcess.on('close', (code) => {
      if (code !== 0) {
        logError(`Expo process exited with code ${code}`);
      }
    });

    // Wait for Expo to be ready
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes with 5-second intervals
    
    while (!expoReady && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
      log(`Waiting for Expo server... (${attempts}/${maxAttempts})`, 'yellow');
    }

    if (!expoReady) {
      throw new Error('Expo server failed to start within timeout');
    }

    return { process: expoProcess, url: expoUrl };
  } catch (error) {
    logError(`Failed to start Expo server: ${error.message}`);
    return null;
  }
}

// Install and launch CyberPup app on emulator
async function setupCyberPupApp(expoUrl) {
  logStep(3, 'Setting up CyberPup app on emulator...');
  
  try {
    // Open Expo Go and load the app
    await runCommand(`adb shell am start -n ${CONFIG.expoGoPackage}/.MainActivity`, { silent: true });
    
    // Wait a moment for Expo Go to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Use ADB to input the Expo URL
    await runCommand(`adb shell input text "${expoUrl}"`, { silent: true });
    await runCommand('adb shell input keyevent 66', { silent: true }); // Enter key
    
    logSuccess('CyberPup app launched on emulator');
    
    // Wait for app to load
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    return true;
  } catch (error) {
    logError(`Failed to setup CyberPup app: ${error.message}`);
    return false;
  }
}

// Run Maestro tests
async function runMaestroTests(testSuite = 'smoke') {
  logStep(4, `Running Maestro tests: ${testSuite}`);
  
  try {
    const { stdout, stderr } = await runCommand(`npm run test:e2e:${testSuite}`);
    
    if (stdout.includes('✅') && !stdout.includes('❌')) {
      logSuccess('All tests passed!');
      return true;
    } else {
      logWarning('Some tests failed or had issues');
      console.log(stdout);
      return false;
    }
  } catch (error) {
    logError(`Test execution failed: ${error.message}`);
    return false;
  }
}

// Cleanup function
async function cleanup(expoProcess) {
  logStep(5, 'Cleaning up resources...');
  
  try {
    // Stop Expo server
    if (expoProcess) {
      expoProcess.kill();
      logSuccess('Expo server stopped');
    }
    
    // Stop emulator (optional - comment out if you want to keep it running)
    // await runCommand('./scripts/setup-android-emulator.sh stop', { silent: true });
    // logSuccess('Emulator stopped');
    
    logSuccess('Cleanup completed');
  } catch (error) {
    logWarning(`Cleanup had issues: ${error.message}`);
  }
}

// Main execution function
async function main() {
  const testSuite = process.argv[2] || 'smoke';
  
  log(`🎯 Starting automated E2E testing for CyberPup`, 'bright');
  log(`📱 Test Suite: ${testSuite}`, 'blue');
  log(`⏱️  Timeout: ${CONFIG.testTimeout / 1000 / 60} minutes`, 'blue');
  
  let expoProcess = null;
  
  try {
    // Step 1: Start emulator
    if (!(await startEmulator())) {
      throw new Error('Failed to start emulator');
    }
    
    // Step 2: Start Expo server
    const expoResult = await startExpoServer();
    if (!expoResult) {
      throw new Error('Failed to start Expo server');
    }
    expoProcess = expoResult.process;
    
    // Step 3: Setup CyberPup app
    if (!(await setupCyberPupApp(expoResult.url))) {
      throw new Error('Failed to setup CyberPup app');
    }
    
    // Step 4: Run tests
    const testSuccess = await runMaestroTests(testSuite);
    
    if (testSuccess) {
      logSuccess('🎉 E2E testing completed successfully!');
      process.exit(0);
    } else {
      logWarning('⚠️  E2E testing completed with issues');
      process.exit(1);
    }
    
  } catch (error) {
    logError(`💥 E2E testing failed: ${error.message}`);
    process.exit(1);
  } finally {
    await cleanup(expoProcess);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  logWarning('Received SIGINT, cleaning up...');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logWarning('Received SIGTERM, cleaning up...');
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    logError(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main, startEmulator, startExpoServer, runMaestroTests };
