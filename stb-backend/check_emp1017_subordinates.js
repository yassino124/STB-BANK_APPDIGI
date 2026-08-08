const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emp1017 = await db.collection('employees').findOne({ matricule: 'EMP1017' });
  if (emp1017) {
    console.log('EMP1017 ID:', emp1017._id.toString());
    const id = emp1017._id.toString();
    const subs = await db.collection('employees').find({ managerId: { $in: [id, emp1017._id] } }).toArray();
    console.log(`Subordinates for EMP1017: ${subs.length}`);
    for (const sub of subs) {
      console.log(`  - ${sub.matricule} ${sub.nom} ${sub.prenom}`);
    }
  }

  await client.close();
}
run().catch(console.dir);
