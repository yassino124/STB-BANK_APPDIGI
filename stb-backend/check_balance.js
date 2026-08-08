const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emps = await db.collection('employees').find().sort({ createdAt: -1 }).limit(1).toArray();
  const newEmp = emps[0];
  console.log(`New Employee: ${newEmp.nom} ${newEmp.prenom} ID: ${newEmp._id}`);

  const accounts = await db.collection('accounts').find({ employeeId: newEmp._id }).toArray();
  console.log(`Accounts found: ${accounts.length}`);
  for (const acc of accounts) {
    console.log(`Account ${acc.accountNumber}: solde = ${acc.solde}`);
    
    // Calculate total from transactions
    const txs = await db.collection('transactions').find({ accountId: acc._id, status: 'COMPLETED' }).toArray();
    let computedSolde = 0;
    for (const tx of txs) {
      computedSolde += tx.montant;
    }
    console.log(`Computed solde from ${txs.length} transactions: ${computedSolde}`);
  }

  await client.close();
}
run().catch(console.dir);
