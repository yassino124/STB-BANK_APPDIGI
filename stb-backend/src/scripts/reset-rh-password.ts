/**
 * RESET RH PASSWORD
 * Usage: npx ts-node src/scripts/reset-rh-password.ts
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
  
  // Find RH account
  const rhAccount = await empColl.findOne({ matricule: 'RH001' });
  
  if (!rhAccount) {
    console.log('❌ RH account not found!');
    await mongoose.disconnect();
    return;
  }

  console.log('📋 Found RH account:');
  console.log('   Matricule:', rhAccount.matricule);
  console.log('   CIN:', rhAccount.cin);
  console.log('   Email:', rhAccount.email);
  console.log('   Date Naissance:', rhAccount.dateNaissance);
  console.log('   Activated:', rhAccount.isActivated);

  // Update password and PIN
  const newPassword = 'StbRH2024!';
  const newPin = '1234';
  
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const hashedPin = await bcrypt.hash(newPin, SALT_ROUNDS);

  await empColl.updateOne(
    { matricule: 'RH001' },
    {
      $set: {
        password: hashedPassword,
        pin: hashedPin,
        isActivated: true,
        status: 'ACTIVE',
        failedLoginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date(),
      }
    }
  );

  console.log('\n✅ Password reset successfully!\n');
  console.log('═══════════════════════════════════════');
  console.log('📋 MATRICULE:     RH001');
  console.log('🔐 NEW PASSWORD:  StbRH2024!');
  console.log('🔢 NEW PIN:       1234');
  console.log('📧 EMAIL:         ' + rhAccount.email);
  console.log('🔑 CIN:           ' + rhAccount.cin);
  console.log('═══════════════════════════════════════\n');

  // Test password verification
  const updated = await empColl.findOne({ matricule: 'RH001' });
  if (updated) {
    const passwordMatch = await bcrypt.compare(newPassword, updated.password);
    const pinMatch = await bcrypt.compare(newPin, updated.pin);
    
    console.log('🔍 Verification:');
    console.log('   Password match:', passwordMatch ? '✅' : '❌');
    console.log('   PIN match:', pinMatch ? '✅' : '❌');
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
