require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'info.cynixinc@gmail.com', password: 'Student@1234' });
  if (error) throw error;
  console.log('Logged in!');
  const token = data.session.access_token;
  console.log('Token:', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Verified directly! decoded:', decoded);
  } catch (e) {
    console.log('Direct verification failed:', e.message);
    // Try base64 decoding
    try {
      const decoded2 = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'));
      console.log('Verified base64! decoded:', decoded2);
    } catch (e2) {
      console.log('Base64 verification failed:', e2.message);
    }
  }
}
main();
