const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emp1017 = await db.collection('employees').findOne({ matricule: 'EMP1017' });
  console.log('EMP1017 managerId:', emp1017.managerId, typeof emp1017.managerId);
  console.log('Is managerId an ObjectId?', emp1017.managerId instanceof require('mongodb').ObjectId);

  await client.close();
}
run().catch(console.dir);
