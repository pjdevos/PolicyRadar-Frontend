#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Read the env-config.js template
const envConfigPath = path.join(__dirname, '../build/env-config.js');
if (fs.existsSync(envConfigPath)) {
  let content = fs.readFileSync(envConfigPath, 'utf8');
  
  // Replace placeholder with actual environment variable
  const apiUrl = process.env.REACT_APP_API_URL || 'https://policyradar-backend-production.up.railway.app/api';
  content = content.replace('%REACT_APP_API_URL%', apiUrl);
  
  // Write back the updated file
  fs.writeFileSync(envConfigPath, content);
  console.log(`✅ Injected API_BASE_URL: ${apiUrl}`);
} else {
  console.log('⚠️  env-config.js not found in build directory');
}