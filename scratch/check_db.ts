
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://hbrvtxmyeuyoxdpyznmb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicnZ0eG15ZXV5b3hkcHl6bm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ1NTIsImV4cCI6MjA4ODU0MDU1Mn0.5Tevw-5MSx9xBG16bm6ofktm0e8fv0wy4cARH84gMQI"
);

async function check() {
  console.log('Checking profiles for vjs...');
  const { data, error } = await supabase
    .from('profiles')
    .select('username, id, user_id')
    .eq('username', 'vjs')
    .maybeSingle();

  if (error) {
    console.error('Error fetching vjs:', error.message);
  } else if (!data) {
    console.log('User vjs NOT found.');
  } else {
    console.log('User found:', data);
  }

  console.log('Checking platform_settings columns...');
  const { data: settings, error: sError } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single();

  if (sError) {
    console.error('Platform Settings Error:', sError.message);
    if (sError.message.includes('column')) {
       // Try selecting only known safe columns
       const { data: safeSettings } = await supabase
         .from('platform_settings')
         .select('id, site_name')
         .limit(1)
         .single();
       console.log('Safe fetch worked. Missing columns confirmed.');
    }
  } else {
    console.log('Platform Settings columns:', Object.keys(settings));
  }
}

check();
