/**
 * CREATE NEW RH ADMIN ACCOUNT
 * Usage: npx ts-node src/scripts/create-rh-admin.ts
 */
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';
const SALT_ROUNDS = 12;

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const empColl = mongoose.connection.collection('employees');
  
  // Check if RH002 exists
  const existing = await empColl.findOne({ matricule: 'RH002' });
  if (existing) {
    console.log('⚠️  RH002 already exists!');
    await mongoose.disconnect();
    return;
  }

  // Create new admin account
  const password = 'Admin123!';
  const pin = '9999';
  
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS);

  const newAdmin = {
    matricule: 'RH002',
    nom: 'SuperAdmin',
    prenom: 'RH',
    cin: '99999999',
    dateNaissance: new Date('1990-01-01'),
    telephone: '+21699999999',
    email: 'rhadmin@stb.tn',
    role: 'SUPER_ADMIN',
    roles: ['EMPLOYEE', 'RH', 'ADMIN', 'SUPER_ADMIN'],
    departement: 'Direction Générale',
    poste: 'Directeur Général RH',
    dateEmbauche: new Date('2020-01-01'),
    soldeConge: 30,
    soldeMaladie: 15,
    soldeExceptionnel: 10,
    status: 'ACTIVE',
    isActivated: true,
    password: hashedPassword,
    pin: hashedPin,
    biometricEnabled: false,
    faceEnabled: false,
    fingerEnabled: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await empColl.insertOne(newAdmin);
  
  console.log('\n🎉 NEW RH ADMIN CREATED!\n');
  console.log('═══════════════════════════════════════');
  console.log('📋 MATRICULE:     RH002');
  console.log('🔐 PASSWORD:      Admin123!');
  console.log('🔢 PIN:           9999');
  console.log('📧 EMAIL:         rhadmin@stb.tn');
  console.log('🔑 CIN:           99999999');
  console.log('📅 DATE NAISS:    01/01/1990');
  console.log('📱 TÉLÉPHONE:     +21699999999');
  console.log('👑 ROLE:          SUPER_ADMIN');
  console.log('═══════════════════════════════════════\n');
  console.log('✅ Account activated and ready!\n');

  // Verify
  const created = await empColl.findOne({ matricule: 'RH002' });
  if (created) {
    const pwdMatch = await bcrypt.compare(password, created.password);
    const pinMatch = await bcrypt.compare(pin, created.pin);
    console.log('🔍 Verification:');
    console.log('   Password match:', pwdMatch ? '✅' : '❌');
    console.log('   PIN match:', pinMatch ? '✅' : '❌');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
