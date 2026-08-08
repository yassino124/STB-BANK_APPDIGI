const mongoose = require('mongoose');
require('dotenv').config();

async function checkLeaveRequests() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté\n');

    const db = mongoose.connection.db;
    const leaves = await db.collection('leaverequests').find({}).sort({ createdAt: -1 }).limit(10).toArray();
    
    console.log(`📋 ${leaves.length} derniers congés:\n`);
    leaves.forEach((l, i) => {
      console.log(`${i + 1}. _id: ${l._id}`);
      console.log(`   employeeId: ${l.employeeId}`);
      console.log(`   status: "${l.status}"`);
      console.log(`   type: "${l.type}"`);
      console.log(`   dureeDays: ${l.dureeDays}`);
      console.log(`   dateDebut: ${l.dateDebut}`);
      console.log('');
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌', error);
    process.exit(1);
  }
}

checkLeaveRequests();
