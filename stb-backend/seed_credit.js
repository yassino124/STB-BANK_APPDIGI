const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/stb_mobile').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('employees').find().toArray();
  if (users.length === 0) { console.log('No users found'); process.exit(0); }
  const user = users[0];
  
  await db.collection('credits').deleteMany({ employeeId: user._id });
  
  await db.collection('credits').insertOne({
    employeeId: user._id,
    title: "Crédit Personnel (Dossier Actif)",
    type: "PERSONNEL",
    montantInitial: 48000.0,
    montantRestant: 40000.0,
    tauxInteret: 0,
    mensualite: 1667.0,
    nombreMois: 28,
    dateDebut: new Date("2024-01-15T00:00:00.000Z"),
    dateFin: new Date("2028-01-15T00:00:00.000Z"),
    status: "ACTIVE",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('Credit seeded successfully for user ' + user._id);
  process.exit(0);
}).catch(console.error);
