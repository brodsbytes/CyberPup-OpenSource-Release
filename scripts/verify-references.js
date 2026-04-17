#!/usr/bin/env node

/**
 * Script to verify all reference links in the references.js file
 * This script checks if URLs are accessible and provides a report
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Import the references data
import { REFERENCES } from '../data/references.js';

function checkUrl(url) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const req = client.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        resolve({
          url,
          status: res.statusCode,
          accessible: res.statusCode >= 200 && res.statusCode < 400,
          redirect: res.statusCode >= 300 && res.statusCode < 400
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
          accessible: false,
          error: 'Request timeout'
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

async function verifyAllReferences() {
  console.log('🔍 Verifying all reference links...\n');
  
  const results = [];
  
  for (const [checkId, references] of Object.entries(REFERENCES)) {
    console.log(`Checking references for ${checkId}:`);
    
    for (const reference of references) {
      console.log(`  - ${reference.title}`);
      const result = await checkUrl(reference.url);
      results.push({
        checkId,
        reference,
        result
      });
      
      if (result.accessible) {
        console.log(`    ✅ ${result.status} - Accessible`);
      } else {
        console.log(`    ❌ ${result.status} - ${result.error || 'Not accessible'}`);
      }
    }
    console.log('');
  }
  
  // Summary
  const accessible = results.filter(r => r.result.accessible).length;
  const total = results.length;
  
  console.log('📊 SUMMARY:');
  console.log(`Total references: ${total}`);
  console.log(`Accessible: ${accessible}`);
  console.log(`Broken/Inaccessible: ${total - accessible}\n`);
  
  // List broken links
  const broken = results.filter(r => !r.result.accessible);
  if (broken.length > 0) {
    console.log('❌ BROKEN LINKS:');
    broken.forEach(({ checkId, reference, result }) => {
      console.log(`  ${checkId}: ${reference.title}`);
      console.log(`    URL: ${reference.url}`);
      console.log(`    Status: ${result.status}`);
      if (result.error) console.log(`    Error: ${result.error}`);
      console.log('');
    });
  }
  
  return results;
}

// Run the verification
verifyAllReferences().catch(console.error);
