const { MongoClient } = require('mongodb');
const http = require('http');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Verify the deletes are clean
  const remaining = await db.collection('payrolls').find({ annee: 2026, mois: 8 }).toArray();
  console.log(`Payrolls remaining for Aug 2026: ${remaining.length}`);
  for (const p of remaining) {
    const emp = await db.collection('employees').findOne({ _id: p.employeeId });
    console.log(`  ${emp?.matricule}: brut=${p.salaireBrut}, net=${p.salaireNet}`);
  }

  await client.close();
}
run().catch(console.dir);
