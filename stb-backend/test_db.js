const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');
  
  const leaves = await db.collection('leaverequests').find({}).toArray();
  for (const l of leaves) {
    if (l.currentApproverId) {
      console.log('Leave', l._id.toString(), 'approver:', l.currentApproverId.toString());
    }
  }
  await client.close();
}
run().catch(console.dir);
