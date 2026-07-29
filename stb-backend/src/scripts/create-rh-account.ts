/**
 * CREATE RH TEST ACCOUNT
 * Usage: npx ts-node src/scripts/create-rh-account.ts
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
  
  // Check if RH account already exists
  const existing = await empColl.findOne({ matricule: 'RH001' });
  if (existing) {
    console.log('⚠️  RH account already exists!');
    console.log('📋 Matricule: RH001');
    console.log('🔑 CIN: 12345678');
    console.log('📅 Date de naissance: 1990-01-01');
    console.log('📧 Email: rh@stb.tn');
    console.log('📱 Téléphone: +21612345678');
    
    if (existing.isActivated) {
      console.log('✅ Compte activé');
      console.log('🔐 Password: StbRH2024!');
      console.log('🔢 PIN: 1234');
    } else {
      console.log('⚠️  Compte non activé - Utilisez l\'app pour l\'activer');
    }
    
    await mongoose.disconnect();
    return;
  }

  // Hash password and PIN
  const hashedPassword = await bcrypt.hash('StbRH2024!', SALT_ROUNDS);
  const hashedPin = await bcrypt.hash('1234', SALT_ROUNDS);

  // Create RH account
  const rhAccount = {
    matricule: 'RH001',
    nom: 'Admin',
    prenom: 'RH',
    cin: '12345678',
    dateNaissance: new Date('1990-01-01'),
    telephone: '+21612345678',
    email: 'rh@stb.tn',
    role: 'RH',
    departement: 'Ressources Humaines',
    poste: 'Responsable RH',
    dateEmbauche: new Date('2020-01-01'),
    soldeConge: 30,
    soldeMaladie: 15,
    soldeExceptionnel: 10,
    status: 'ACTIVE',
    isActivated: true,
    password: hashedPassword,
    pin: hashedPin,
    biometricEnabled: false,
    failedLoginAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await empColl.insertOne(rhAccount);
  
  console.log('\n🎉 RH Account créé avec succès!\n');
  console.log('═══════════════════════════════════════');
  console.log('📋 MATRICULE:     RH001');
  console.log('🔐 PASSWORD:      StbRH2024!');
  console.log('🔢 PIN:           1234');
  console.log('📧 EMAIL:         rh@stb.tn');
  console.log('🔑 CIN:           12345678');
  console.log('📅 DATE NAISS:    01/01/1990');
  console.log('📱 TÉLÉPHONE:     +21612345678');
  console.log('═══════════════════════════════════════\n');
  console.log('✅ Compte activé et prêt à utiliser!');
  console.log('🚀 Connectez-vous avec matricule + password\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
