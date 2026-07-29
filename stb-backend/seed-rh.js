const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGODB_URI = 'mongodb://localhost:27017/stb_db';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const EmployeeSchema = new mongoose.Schema({
    matricule: String,
    cin: String,
    dateNaissance: Date,
    nom: String,
    prenom: String,
    email: String,
    phone: String,
    passwordHash: String,
    pinHash: String,
    roles: [String],
    status: String,
    isActivated: Boolean
  }, { collection: 'employees' });

  const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

  // Check if RH admin exists
  const existing = await Employee.findOne({ matricule: 'RH001' });
  if (existing) {
    console.log('RH Admin already exists.');
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash('AdminSTB123!', 12);
  const pinHash = await bcrypt.hash('123456', 12);

  await Employee.create({
    matricule: 'RH001',
    cin: '12345678',
    dateNaissance: new Date('1985-01-01'),
    nom: 'Admin',
    prenom: 'RH',
    email: 'rh.admin@stb.com.tn',
    phone: '+21699999999',
    passwordHash,
    pinHash,
    roles: ['RH', 'ADMIN'],
    status: 'ACTIVE',
    isActivated: true
  });

  console.log('RH Admin created: Matricule: RH001 / Password: AdminSTB123!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
