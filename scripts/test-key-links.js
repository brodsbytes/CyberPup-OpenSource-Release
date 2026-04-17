#!/usr/bin/env node

/**
 * Simple script to test key reference links
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test a few key links
const testLinks = [
  'https://haveibeenpwned.com/',
  'https://pages.nist.gov/800-63-3/sp800-63b.html',
  'https://www.cyber.gov.au/protect-yourself/securing-your-devices/how-secure-your-devices/secure-your-mobile-phone',
  'https://www.consumer.ftc.gov/articles/how-protect-your-privacy-online',
  'https://www.identitytheft.gov/'
];

function testUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        resolve({
          url,
          status: res.statusCode,
          accessible: res.statusCode >= 200 && res.statusCode < 400
        });
      });
      
      req.on('error', (error) => {
        resolve({
          url,
          status: 'ERROR',
          accessible: false,
          error: error.message
        });
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          status: 'TIMEOUT',
          accessible: false
        });
      });
      
      req.end();
    } catch (error) {
      resolve({
        url,
        status: 'INVALID',
        accessible: false,
        error: error.message
      });
    }
  });
}

async function runTests() {
  console.log('🔍 Testing key reference links...\n');
  
  for (const url of testLinks) {
    const result = await testUrl(url);
    if (result.accessible) {
      console.log(`✅ ${result.status} - ${url}`);
    } else {
      console.log(`❌ ${result.status} - ${url}`);
      if (result.error) console.log(`   Error: ${result.error}`);
    }
  }
}

runTests().catch(console.error);
