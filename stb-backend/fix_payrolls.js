const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Step 1: Delete the wrong payrolls for month 8/2026 with brut=1200
  const badPayrolls = await db.collection('payrolls').find({ salaireBrut: 1200, annee: 2026, mois: 8 }).toArray();
  console.log(`Found ${badPayrolls.length} bad payrolls to delete`);
  
  for (const p of badPayrolls) {
    const emp = await db.collection('employees').findOne({ _id: p.employeeId });
    console.log(`  Deleting payroll for ${emp?.matricule}`);
  }
  
  const deleteResult = await db.collection('payrolls').deleteMany({ salaireBrut: 1200, annee: 2026, mois: 8 });
  console.log(`\nDeleted ${deleteResult.deletedCount} bad payrolls`);

  // Step 2: Verify all employees have proper salaireBase
  const emps = await db.collection('employees').find({ status: 'ACTIVE' }).toArray();
  console.log('\n=== Employees and their salaries ===');
  let missingCount = 0;
  for (const e of emps) {
    if (!e.salaireBase || e.salaireBase === 0) {
      console.log(`  ⚠️  ${e.matricule}: NO salaireBase!`);
      missingCount++;
    } else {
      console.log(`  ✅ ${e.matricule}: salaireBase=${e.salaireBase}`);
    }
  }
  console.log(`\n${missingCount} employees missing salaireBase`);

  await client.close();
}
run().catch(console.dir);
