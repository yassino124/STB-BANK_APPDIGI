const mongoose = require('mongoose');
async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/stb_db');
  const db = mongoose.connection;
  const session = await db.collection('sessions').findOne({ isRevoked: false });
  if (!session) { console.log('No active session found'); process.exit(0); }
  
  const res = await fetch('http://localhost:3000/api/v1/auth/token/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken })
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
  process.exit(0);
}
test();
