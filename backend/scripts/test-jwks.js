require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const client = jwksClient({
  jwksUri: `${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`,
  cache: false
});

function getSigningKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

async function main() {
  const { data, error } = await supabase.auth.signInWithPassword({ email: 'info.cynixinc@gmail.com', password: 'Student@1234' });
  if (error) throw error;
  const token = data.session.access_token;
  jwt.verify(token, getSigningKey, { algorithms: ['ES256', 'RS256'] }, (err, decoded) => {
    if (err) console.error('JWKS Verify error:', err);
    else console.log('JWKS Verify success!', decoded);
  });
}
main();
