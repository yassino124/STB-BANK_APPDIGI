const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emp1008 = await db.collection('employees').findOne({ matricule: 'EMP1008' });
  console.log('EMP1008 ID:', emp1008._id.toString());

  const under = await db.collection('employees').find({ managerId: emp1008._id }).toArray();
  console.log(`Employees under EMP1008 (managerId matches): ${under.length}`);

  const all = await db.collection('employees').find({}).toArray();
  for (const e of all) {
    if (e.managerId) {
      console.log(`- ${e.matricule} has managerId: ${e.managerId.toString()}`);
    }
  }

  await client.close();
}
run().catch(console.dir);
