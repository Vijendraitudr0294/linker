import fs from 'fs';

const SUPABASE_URL = "https://hbrvtxmyeuyoxdpyznmb.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicnZ0eG15ZXV5b3hkcHl6bm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ1NTIsImV4cCI6MjA4ODU0MDU1Mn0.5Tevw-5MSx9xBG16bm6ofktm0e8fv0wy4cARH84gMQI";

const TABLES = [
  'profiles', 'links', 'catalog_items', 'appearance_settings', 
  'catalog_analytics', 'catalog_orders', 'contact_messages', 
  'notifications', 'platform_settings', 'profile_views'
];

async function fetchData() {
  const dataset = {};
  
  for (const table of TABLES) {
    try {
      console.log(`Fetching table: ${table}...`);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      });
      
      if (response.ok) {
        dataset[table] = await response.json();
        console.log(`✅ ${table}: pulled ${dataset[table].length} rows.`);
      } else {
        console.error(`❌ Failed to fetch ${table}: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error(`❌ Error fetching ${table}:`, err.message);
    }
  }

  const outputPath = 'd:\\demo try\\exact-screenshot-main\\exact-screenshot-main\\data_dump.json';
  fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2));
  console.log(`\n🎉 ALL DATA SAVED to: ${outputPath}`);
}

fetchData();
