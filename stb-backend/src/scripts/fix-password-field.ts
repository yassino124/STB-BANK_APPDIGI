/**
 * FIX PASSWORD FIELD NAME
 * Rename 'password' to 'passwordHash' and 'pin' to 'pinHash'
 * Usage: npx ts-node src/scripts/fix-password-field.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const empColl = mongoose.connection.collection('employees');
  
  // Find all employees with 'password' field
  const employees = await empColl.find({ password: { $exists: true } }).toArray();
  
  console.log(`📋 Found ${employees.length} employees with 'password' field`);
  
  if (employees.length === 0) {
    console.log('✅ No migration needed - all fields already correct!');
    await mongoose.disconnect();
    return;
  }

  // Migrate each employee
  for (const emp of employees) {
    const updates: any = {};
    
    if (emp.password) {
      updates.passwordHash = emp.password;
      updates.$unset = { password: '' };
    }
    
    if (emp.pin) {
      updates.pinHash = emp.pin;
      if (!updates.$unset) updates.$unset = {};
      updates.$unset.pin = '';
    }
    
    if (Object.keys(updates).length > 0) {
      const unsetFields = updates.$unset;
      delete updates.$unset;
      
      await empColl.updateOne(
        { _id: emp._id },
        {
          $set: updates,
          ...(unsetFields && { $unset: unsetFields })
        }
      );
      
      console.log(`✅ Migrated ${emp.matricule}`);
    }
  }
  
  console.log('\n🎉 Migration completed successfully!');
  console.log('Field names updated:');
  console.log('  password → passwordHash');
  console.log('  pin → pinHash\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
