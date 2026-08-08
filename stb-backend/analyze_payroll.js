const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emps = await db.collection('employees').find({ status: 'ACTIVE' }).limit(10).toArray();
  console.log('\n=== EMPLOYEES + SALARIES ===');
  for (const e of emps) {
    console.log(`${e.matricule}: salaireBase=${e.salaireBase}, compteSolde=${e.compteSolde}, avancesEnCours=${e.avancesEnCours}`);
  }

  const payrolls = await db.collection('payrolls').find({}).sort({ createdAt: -1 }).limit(10).toArray();
  console.log('\n=== PAYROLLS ===');
  for (const p of payrolls) {
    const emp = await db.collection('employees').findOne({ _id: p.employeeId });
    console.log(`${emp?.matricule || 'UNKNOWN'}: brut=${p.salaireBrut}, net=${p.salaireNet}, mois=${p.mois}/${p.annee}`);
  }

  const accounts = await db.collection('accounts').find({}).limit(10).toArray();
  console.log('\n=== ACCOUNTS (solde) ===');
  for (const a of accounts) {
    const emp = await db.collection('employees').findOne({ _id: a.employeeId });
    console.log(`${emp?.matricule || 'UNKNOWN'}: solde=${a.solde}, type=${a.type}`);
  }

  await client.close();
}
run().catch(console.dir);
