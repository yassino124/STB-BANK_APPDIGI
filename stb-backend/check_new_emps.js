const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Check the employees with 1200 salary
  const emps = await db.collection('employees').find({ matricule: { $in: ['EMP1015','EMP1016','EMP1017','EMP1018','EMP1019','EMP1020','EMP1021'] } }).toArray();
  for (const e of emps) {
    console.log(`${e.matricule}: salaireBase=${e.salaireBase}, poste=${e.poste}, roles=${e.roles}, status=${e.status}`);
  }

  // Count payrolls per employee and check if wrong ones need to be deleted
  const badPayrolls = await db.collection('payrolls').find({ salaireBrut: 1200, annee: 2026, mois: 8 }).toArray();
  console.log(`\nPayrolls with brut=1200 this month: ${badPayrolls.length}`);
  for (const p of badPayrolls) {
    const emp = await db.collection('employees').findOne({ _id: p.employeeId });
    console.log(`  ${emp?.matricule}: actual salaireBase=${emp?.salaireBase}, payroll brut=${p.salaireBrut}`);
  }

  await client.close();
}
run().catch(console.dir);
