import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function checkFile(filename) {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const items = checkFile('items.json') || [];
const culturalRules = checkFile('cultural_rules.json') || { rules: [] };
const kb = checkFile('knowledge_base.json') || [];
const sources = checkFile('sources.json') || [];

let errorCount = 0;

function checkPlaceholders(obj, pathStr) {
  if (typeof obj === 'string') {
    if (obj.includes('<<PLACEHOLDER')) {
      return true;
    }
  } else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (checkPlaceholders(obj[i], `${pathStr}[${i}]`)) return true;
    }
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (checkPlaceholders(obj[key], `${pathStr}.${key}`)) return true;
    }
  }
  return false;
}

// 2. Checks: if any entry has status='reviewed' AND any string field contains '<<PLACEHOLDER', print an error and exit with code 1
for (const item of items) {
  if (item.status === 'reviewed' && checkPlaceholders(item, `items[${item.id}]`)) {
    console.error(`Error: Item ${item.id} is marked 'reviewed' but contains placeholders.`);
    errorCount++;
  }
}

for (const rule of culturalRules.rules) {
  if (rule.status === 'reviewed' && checkPlaceholders(rule, `rules[${rule.id}]`)) {
    console.error(`Error: Rule ${rule.id} is marked 'reviewed' but contains placeholders.`);
    errorCount++;
  }
}

// 3. Checks: all source_ids referenced exist in sources.json
const validSourceIds = new Set(sources.map(s => s.id));
function verifySourceIds(ids, context) {
  for (const id of ids) {
    if (!validSourceIds.has(id)) {
      console.error(`Error: Source ID '${id}' referenced in ${context} not found in sources.json.`);
      errorCount++;
    }
  }
}

for (const item of items) {
  if (item.source_ids) verifySourceIds(item.source_ids, `Item ${item.id}`);
}
for (const rule of culturalRules.rules) {
  if (rule.source_ids) verifySourceIds(rule.source_ids, `Rule ${rule.id}`);
}
for (const card of kb) {
  for (const pt of card.points) {
    if (pt.source_ids) verifySourceIds(pt.source_ids, `KnowledgeCard ${card.id}`);
  }
}

if (errorCount > 0) {
  console.error(`Data validation failed with ${errorCount} errors.`);
  process.exit(1);
} else {
  console.log('✅ Data validation passed successfully.');
}
