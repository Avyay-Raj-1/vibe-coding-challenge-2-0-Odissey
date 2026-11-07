import fs from 'fs';

const file = process.argv[2] || 'supabase/schema.sql';
const sql = fs.readFileSync(file, 'utf8');
const token = process.env.SUPABASE_ACCESS_TOKEN || '';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'gigdobucdtfbtkzlpxrp';

async function run() {
  console.log(`Running migration from ${file}...`);
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  const result = await response.text();
  console.log('Status:', response.status);
  console.log('Result:', result);
}

run().catch(console.error);
