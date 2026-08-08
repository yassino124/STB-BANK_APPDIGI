const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  console.log('--- ROLLING BACK ALL SALARY TRANSACTIONS ---');
  
  // Find all SALARY transactions
  const salaryTxs = await db.collection('transactions').find({ type: 'SALARY' }).toArray();
  console.log(`Found ${salaryTxs.length} SALARY transactions`);
  
  let totalDeducted = 0;
  for (const tx of salaryTxs) {
    // 1. Deduct from account solde
    await db.collection('accounts').updateOne(
      { _id: tx.accountId },
      { $inc: { solde: -tx.montant } }
    );
    // 2. Deduct from employee compteSolde
    await db.collection('employees').updateOne(
      { _id: tx.employeeId },
      { $inc: { compteSolde: -tx.montant } }
    );
    totalDeducted += tx.montant;
  }
  
  // 3. Delete all SALARY transactions
  await db.collection('transactions').deleteMany({ type: 'SALARY' });
  console.log(`Deleted all SALARY transactions. Total amount rolled back: ${totalDeducted}`);
  
  // 4. Delete all payrolls
  const pRes = await db.collection('payrolls').deleteMany({});
  console.log(`Deleted ${pRes.deletedCount} payrolls`);

  // Verify EMP1015 balance
  const emp1015 = await db.collection('employees').findOne({ matricule: 'EMP1015' });
  const acc1015 = await db.collection('accounts').findOne({ employeeId: emp1015._id });
  console.log(`EMP1015: compteSolde=${emp1015.compteSolde}, accountSolde=${acc1015.solde}`);

  await client.close();
}
run().catch(console.dir);
