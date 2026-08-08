const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');
  
  // Check all collections and their counts
  const collections = await db.listCollections().toArray();
  console.log('\n=== COLLECTIONS & COUNTS ===');
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`  ${col.name}: ${count} documents`);
  }
  
  // Check employees with NO account (critical bug - salary can't be credited)
  const emps = await db.collection('employees').find({ status: 'ACTIVE' }).toArray();
  console.log('\n=== EMPLOYEES WITHOUT BANK ACCOUNT ===');
  let missingAccount = 0;
  for (const e of emps) {
    const account = await db.collection('accounts').findOne({ employeeId: e._id });
    if (!account) {
      console.log(`  ⚠️  ${e.matricule} (${e.prenom} ${e.nom}): NO ACCOUNT`);
      missingAccount++;
    }
  }
  if (missingAccount === 0) console.log('  ✅ All employees have accounts');
  
  // Check leave balance issues
  console.log('\n=== LEAVE BALANCES ===');
  for (const e of emps.slice(0, 8)) {
    console.log(`  ${e.matricule}: soldeConges=${e.soldeConges}`);
  }
  
  // Check leave requests status distribution
  const leaveStatuses = await db.collection('leaverequests').aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]).toArray();
  console.log('\n=== LEAVE REQUEST STATUSES ===');
  for (const s of leaveStatuses) console.log(`  ${s._id}: ${s.count}`);
  
  // Check credits active
  const activeCredits = await db.collection('credits').find({ status: 'ACTIVE' }).toArray();
  console.log(`\n=== ACTIVE CREDITS: ${activeCredits.length} ===`);
  for (const c of activeCredits.slice(0, 5)) {
    console.log(`  ${c.matricule || 'emp'}: montantRestant=${c.montantRestant}, mensualite=${c.mensualite}`);
  }

  await client.close();
}
run().catch(console.dir);
