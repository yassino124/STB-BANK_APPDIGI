const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb://localhost:27017/stb_bank';

// Employee Schema
const EmployeeSchema = new mongoose.Schema({
  matricule: String,
  prenom: String,
  nom: String,
  email: String,
  cin: String,
  dateNaissance: Date,
  poste: String,
  direction: String,
  branchId: String,
  salaireBase: Number,
  dateEmbauche: Date,
  passwordHash: String,
  status: { type: String, default: 'ACTIVE' },
  isActivated: { type: Boolean, default: true },
  roles: { type: [String], default: ['EMPLOYEE'] },
}, { timestamps: true });

const Employee = mongoose.model('Employee', EmployeeSchema, 'employees');

async function createTestEmployee() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if employee already exists
    const existing = await Employee.findOne({ matricule: 'TEST001' });
    if (existing) {
      console.log('✅ Test employee already exists:', existing.prenom, existing.nom);
      console.log('   Employee ID:', existing._id.toString());
      await mongoose.disconnect();
      return existing._id.toString();
    }
    
    // Create test employee
    const passwordHash = await bcrypt.hash('Test123!', 12);
    
    const employee = await Employee.create({
      matricule: 'TEST001',
      prenom: 'Mohamed',
      nom: 'Test',
      email: 'test@stb.com.tn',
      cin: '12345678',
      dateNaissance: new Date('1990-01-01'),
      poste: 'Ingénieur Test',
      direction: 'IT',
      branchId: 'Ariana',
      salaireBase: 2000,
      dateEmbauche: new Date(),
      passwordHash,
      status: 'ACTIVE',
      isActivated: true,
      roles: ['EMPLOYEE'],
    });
    
    console.log('✅ Test employee created!');
    console.log('   Matricule: TEST001');
    console.log('   Password: Test123!');
    console.log('   Employee ID:', employee._id.toString());
    
    await mongoose.disconnect();
    return employee._id.toString();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
  }
}

createTestEmployee().then(id => {
  if (id) {
    console.log('\n🎯 Now run: node fix-documents-system.js');
  }
});
