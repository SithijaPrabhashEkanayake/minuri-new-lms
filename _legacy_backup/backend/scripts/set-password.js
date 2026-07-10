require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setPassword(email, newPassword) {
  // First find the user
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const user = listData.users.find(u => u.email === email);
  if (!user) {
    console.error(`No Supabase user found with email: ${email}`);
    console.log('Available emails:', listData.users.map(u => u.email).join(', '));
    process.exit(1);
  }

  console.log(`Found user: ${user.email} (id: ${user.id})`);
  console.log(`Email confirmed: ${!!user.email_confirmed_at}`);

  // Update the password
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
    email_confirm: true // Ensure email is confirmed
  });

  if (error) {
    console.error('Failed to update password:', error.message);
    process.exit(1);
  }

  console.log(`\n✅ Password updated successfully for ${email}`);
  console.log(`   New password: ${newPassword}`);
  console.log(`\nYou can now log in at http://localhost:5173/lms`);
}

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node set-password.js <email> <password>');
  process.exit(1);
}

setPassword(email, password).catch(e => console.error(e.message));
