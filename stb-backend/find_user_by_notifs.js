const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  // Find notifications containing "1200 TND"
  const notifs = await db.collection('notifications').find({ title: '💰 Salaire versé', body: /1200/ }).toArray();
  console.log(`Found ${notifs.length} users who got the 1200 salary notification`);

  // Let's check which user has both 1200 salary AND "Congé validé"
  for (const n of notifs) {
    const congeNotifs = await db.collection('notifications').find({ employeeId: n.employeeId, title: '✅ Congé validé' }).toArray();
    if (congeNotifs.length > 0) {
      const emp = await db.collection('employees').findOne({ _id: n.employeeId });
      console.log(`Employee ${emp?.nom} ${emp?.prenom} (${emp?.matricule}) has both! Total notifications:`);
      const allNotifs = await db.collection('notifications').find({ employeeId: n.employeeId }).sort({ createdAt: -1 }).toArray();
      for (const a of allNotifs) {
        console.log(`  - ${a.title}`);
      }
    }
  }

  await client.close();
}
run().catch(console.dir);
