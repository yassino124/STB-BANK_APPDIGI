const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/stb_db');
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const employeeHash = await bcrypt.hash('Azerty123', 12);

  // Drop collections to be clean
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped');

  const Employee = mongoose.connection.collection('employees');
  const Account = mongoose.connection.collection('accounts');
  
  const adminId = new mongoose.Types.ObjectId();
  const empId = new mongoose.Types.ObjectId();
  const babouId = new mongoose.Types.ObjectId();

  await Employee.insertMany([
    {
      _id: adminId,
      matricule: 'RH001',
      cin: '11111111',
      email: 'admin@stb.tn',
      nom: 'Admin',
      prenom: 'RH',
      passwordHash: passwordHash,
      roles: ['SUPER_ADMIN', 'RH', 'EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 50000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: empId,
      matricule: 'EMP1001',
      cin: '22222222',
      email: 'employee@stb.tn',
      nom: 'Ouertani',
      prenom: 'Yassine',
      passwordHash: employeeHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 15000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: babouId,
      matricule: 'EMP1002',
      cin: '33333333',
      email: 'babou@stb.tn',
      nom: 'Babou',
      prenom: 'Ali',
      passwordHash: employeeHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  await Account.insertMany([
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: adminId,
      type: 'COURANT',
      rib: '000123456789012345678',
      solde: 50000,
      status: 'ACTIVE',
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: empId,
      type: 'COURANT',
      rib: '000987654321098765432',
      solde: 15000,
      status: 'ACTIVE',
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(),
      employeeId: babouId,
      type: 'COURANT',
      rib: '000555555555055555555',
      solde: 10000,
      status: 'ACTIVE',
      isPrimary: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  console.log('Data seeded successfully');
  mongoose.disconnect();
}

seed().catch(console.error);
