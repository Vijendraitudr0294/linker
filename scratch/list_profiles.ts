
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://hbrvtxmyeuyoxdpyznmb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhicnZ0eG15ZXV5b3hkcHl6bm1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NjQ1NTIsImV4cCI6MjA4ODU0MDU1Mn0.5Tevw-5MSx9xBG16bm6ofktm0e8fv0wy4cARH84gMQI"
);

async function check() {
  console.log('Listing all profiles...');
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('username, email, id');

  if (pError) {
    console.error('Error fetching profiles:', pError.message);
  } else {
    console.log('Profiles found:', profiles);
  }
}

check();
