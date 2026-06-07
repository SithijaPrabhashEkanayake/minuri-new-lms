require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('REPLACE_WITH')) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in backend/.env');
  console.log('Please get it from: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Failed to fetch Supabase users:', error.message);
    return;
  }

  console.log('=== SUPABASE AUTH USERS ===');
  data.users.forEach(u => {
    console.log(JSON.stringify({
      id: u.id,
      email: u.email,
      confirmed: !!u.email_confirmed_at,
      created: u.created_at
    }));
  });
  console.log('Total Supabase users:', data.users.length);
}

main().catch(e => console.error(e.message));
