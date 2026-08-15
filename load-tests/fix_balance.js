// fix_balance.js - Set account balance to exactly 800 DT for race condition test
const mongoose = require('mongoose');

async function fixBalance() {
  await mongoose.connect('mongodb://localhost:27017/stb_db');
  console.log('✅ Connected to MongoDB');

  const result = await mongoose.connection.db.collection('accounts').updateOne(
    { _id: new mongoose.Types.ObjectId('6a5dfa023be40ce16246dcb3') },
    { $set: { solde: 800 } }
  );
  
  console.log('Modified:', result.modifiedCount, 'document(s)');
  
  const acc = await mongoose.connection.db.collection('accounts')
    .findOne({ _id: new mongoose.Types.ObjectId('6a5dfa023be40ce16246dcb3') });
  
  console.log('✅ New balance (solde):', acc.solde, 'DT');
  console.log('⚡ Account ready for race condition test: 800 DT (2 simultaneous 800 DT transfers)');

  await mongoose.disconnect();
}

fixBalance().catch(console.error);
