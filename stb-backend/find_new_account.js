const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Let's find the most recently created employee
  const emps = await db.collection('employees').find().sort({ createdAt: -1 }).limit(1).toArray();
  const newEmp = emps[0];
  console.log(`New Employee: ${newEmp.nom} ${newEmp.prenom} (matricule: ${newEmp.matricule}) ID: ${newEmp._id}`);

  // Get notifications for this employee
  const notifs = await db.collection('notifications').find({ employeeId: newEmp._id }).sort({ createdAt: -1 }).toArray();
  console.log(`Found ${notifs.length} notifications:`);
  for (const n of notifs) {
    console.log(`- ${n.title} : ${n.body}`);
  }

  await client.close();
}
run().catch(console.dir);
