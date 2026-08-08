const mongoose = require('mongoose');
require('dotenv').config();

async function verifyLeaveStatus() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📚 Collections:', collections.map(c => c.name).join(', '));
    
    // Check for leave-related collections
    const leaveCollection = collections.find(c => c.name.toLowerCase().includes('leave'));
    if (leaveCollection) {
      console.log(`\n📋 Found leave collection: "${leaveCollection.name}"`);
      
      const leaves = await db.collection(leaveCollection.name).find({}).sort({ createdAt: -1 }).limit(5).toArray();
      console.log(`\n🔍 Latest ${leaves.length} leaves:\n`);
      
      leaves.forEach((leave, i) => {
        console.log(`${i + 1}. _id: ${leave._id}`);
        console.log(`   employeeId: ${leave.employeeId}`);
        console.log(`   status: "${leave.status}"`);
        console.log(`   type: "${leave.type}"`);
        console.log(`   dureeDays: ${leave.dureeDays}`);
        console.log(`   dateDebut: ${leave.dateDebut}`);
        console.log('');
      });
    } else {
      console.log('\n❌ No leave collection found');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyLeaveStatus();
