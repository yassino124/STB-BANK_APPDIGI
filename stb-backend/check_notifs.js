const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Let's see some notifications
  const notifs = await db.collection('notifications').find().sort({ createdAt: -1 }).limit(10).toArray();
  for (const n of notifs) {
    console.log(`Notif: ${n.title} | employeeId=${n.employeeId}`);
  }

  // Let's see what Flutter sends when employeeId is "null"
  const nullNotifs = await db.collection('notifications').find({ employeeId: null }).toArray();
  console.log(`Notifs with null employeeId: ${nullNotifs.length}`);

  await client.close();
}
run().catch(console.dir);
