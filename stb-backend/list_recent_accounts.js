const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const accounts = await db.collection('accounts').find().sort({ createdAt: -1 }).limit(3).toArray();
  for (const acc of accounts) {
    const emp = await db.collection('employees').findOne({ _id: acc.employeeId });
    console.log(`Account ${acc.numCompte} belongs to ${emp?.nom} ${emp?.prenom}`);
    console.log(`  -> Solde: ${acc.solde}`);
    const txs = await db.collection('transactions').find({ accountId: acc._id }).toArray();
    console.log(`  -> Transactions: ${txs.length}`);
    for (const t of txs) {
      console.log(`     - ${t.montant} (${t.type})`);
    }
  }

  await client.close();
}
run().catch(console.dir);
