const mongoose = require('mongoose');
async function test() {
  await mongoose.connect('mongodb://127.0.0.1:27017/stb_db');
  const db = mongoose.connection;
  const emps = await db.collection('employees').find({}).toArray();
  console.log("Employees:", emps.map(e => ({ matricule: e.matricule, roles: e.roles, isActivated: e.isActivated, status: e.status })));
  const sessions = await db.collection('sessions').find({}).toArray();
  console.log("Sessions count:", sessions.length);
  process.exit(0);
}
test();
