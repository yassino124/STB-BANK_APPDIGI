const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Let's check transactions with 909.84 amount
  const badTransactions = await db.collection('transactions').find({ montant: 909.84 }).toArray();
  console.log(`Found ${badTransactions.length} transactions with amount 909.84`);

  for (const t of badTransactions.slice(0, 3)) {
    console.log(`  Tx ${t._id}: date=${t.date}, type=${t.type}, accountId=${t.accountId}`);
  }

  // Let's check total transactions in DB
  const totalTx = await db.collection('transactions').countDocuments();
  console.log(`Total transactions in DB: ${totalTx}`);

  // Let's check the balance of EMP1015 (one of the affected employees)
  const emp = await db.collection('employees').findOne({ matricule: 'EMP1015' });
  if (emp) {
    const acc = await db.collection('accounts').findOne({ employeeId: emp._id });
    console.log(`EMP1015: salaireBase=${emp.salaireBase}, compteSolde=${emp.compteSolde}`);
    if (acc) console.log(`EMP1015 Account: solde=${acc.solde}`);
  }

  await client.close();
}
run().catch(console.dir);
