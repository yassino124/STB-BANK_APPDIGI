const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const leaves = await db.collection('leaverequests').find().toArray();
  console.log(`Leave requests: ${leaves.length}`);
  
  const absences = await db.collection('absences').find().toArray();
  console.log(`Absences: ${absences.length}`);

  await client.close();
}
run().catch(console.dir);
