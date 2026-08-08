const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emps = await db.collection('employees').find().sort({ createdAt: -1 }).limit(3).toArray();
  for (const emp of emps) {
    const notifs = await db.collection('notifications').find({ employeeId: emp._id }).toArray();
    console.log(`Emp: ${emp.nom} ${emp.prenom} (matricule: ${emp.matricule}), ID: ${emp._id}`);
    console.log(`  -> has ${notifs.length} notifications`);
  }

  await client.close();
}
run().catch(console.dir);
