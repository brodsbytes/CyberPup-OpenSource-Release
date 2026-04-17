#!/usr/bin/env node

/**
 * Test script to manually unlock badges for testing
 * Run with: node scripts/test-badges.js
 */

const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Mock AsyncStorage for Node.js environment
if (typeof window === 'undefined') {
  global.AsyncStorage = {
    getItem: async (key) => {
      console.log(`Getting: ${key}`);
      return null;
    },
    setItem: async (key, value) => {
      console.log(`Setting: ${key} = ${value}`);
    },
    removeItem: async (key) => {
      console.log(`Removing: ${key}`);
    }
  };
}

// Test badge unlocking
async function testBadgeUnlocking() {
  console.log('🧪 Testing Badge System...\n');

  try {
    // Test unlocking first check badge
    console.log('1. Testing first check badge unlock...');
    await AsyncStorage.setItem('check_1-1-1_completed', 'completed');
    console.log('✅ First check marked as completed\n');

    // Test unlocking password manager badge
    console.log('2. Testing password manager badge unlock...');
    await AsyncStorage.setItem('check_1-1-3_completed', 'completed');
    console.log('✅ Password manager check marked as completed\n');

    // Test unlocking breach checker badge
    console.log('3. Testing breach checker badge unlock...');
    await AsyncStorage.setItem('check_1-1-5_completed', 'completed');
    console.log('✅ Breach checker check marked as completed\n');

    // Test unlocking area badge (all checks in area 1-1)
    console.log('4. Testing area badge unlock...');
    await AsyncStorage.setItem('check_1-1-2_completed', 'completed');
    await AsyncStorage.setItem('check_1-1-4_completed', 'completed');
    console.log('✅ All checks in area 1-1 marked as completed\n');

    console.log('🎉 All test badges unlocked!');
    console.log('Now open the app and check the badges modal to see the unlocked badges.');

  } catch (error) {
    console.error('❌ Error testing badges:', error);
  }
}

// Run the test
testBadgeUnlocking();
