import fs from 'fs';
import path from 'path';
import https from 'https';

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ FATAL: .env.local not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length > 0) {
    envVars[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
  }
});

const apiKey = envVars['GEMINI_API_KEY'];
const model = envVars['GEMINI_MODEL'];

if (!apiKey || apiKey.includes('PLACEHOLDER') || apiKey.includes('VERIFY')) {
  console.error('❌ FATAL: GEMINI_API_KEY is invalid or missing');
  process.exit(1);
}

if (!model || model.includes('PLACEHOLDER') || model.includes('VERIFY')) {
  console.error('❌ FATAL: GEMINI_MODEL is invalid or missing');
  process.exit(1);
}

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${model}?key=${apiKey}`,
  method: 'GET'
};

const req = https.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log(`✅ Model verified: ${model}`);
    process.exit(0);
  } else {
    console.error(`❌ FATAL: Model is inaccessible or retired. Status Code: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (e) => {
  console.error(`❌ FATAL: Model is inaccessible or retired. Error: ${e.message}`);
  process.exit(1);
});

req.end();
