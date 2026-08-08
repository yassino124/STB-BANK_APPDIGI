const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');
  
  const mois = 8;
  const annee = 2026;

  const emps = await db.collection('employees').find({ status: 'ACTIVE' }).toArray();
  let created = 0;
  let skipped = 0;
  
  for (const emp of emps) {
    // Skip if payroll already exists
    const exists = await db.collection('payrolls').findOne({ employeeId: emp._id, mois, annee });
    if (exists) { skipped++; continue; }
    
    const salaireBrut = emp.salaireBase;
    if (!salaireBrut || salaireBrut <= 0) {
      console.log(`⚠️  ${emp.matricule}: Skipped, salaireBase not set`);
      continue;
    }
    
    const cnss = Math.round(salaireBrut * 0.0918 * 100) / 100;
    const impot = Math.round(salaireBrut * 0.15 * 100) / 100;
    const retenues = 0; // No credits/avances for these new employees
    const salaireNet = Math.round((salaireBrut - cnss - impot - retenues) * 100) / 100;
    
    await db.collection('payrolls').insertOne({
      employeeId: emp._id,
      mois,
      annee,
      salaireBrut,
      cnss,
      impot,
      retenues,
      salaireNet,
      status: 'VALIDATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log(`✅ ${emp.matricule}: brut=${salaireBrut}, cnss=${cnss}, impot=${impot}, net=${salaireNet}`);
    created++;
  }
  
  console.log(`\nDone: ${created} payrolls created, ${skipped} already existed`);
  await client.close();
}
run().catch(console.dir);
