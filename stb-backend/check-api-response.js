const mongoose = require('mongoose');
require('dotenv').config();

const LeaveSchema = new mongoose.Schema({}, { strict: false, collection: 'leaves' });
const Leave = mongoose.model('Leave', LeaveSchema);

async function checkApiResponse() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Get leaves for EMP1017 user
    const leaves = await Leave.find({ 
      employeeId: new mongoose.Types.ObjectId('6a6c53b27956f42b175e2301')
    }).sort({ createdAt: -1 }).lean();

    console.log(`\n📋 API Response Preview (${leaves.length} leaves):\n`);
    leaves.forEach((leave, i) => {
      console.log(`${i + 1}. ID: ${leave._id}`);
      console.log(`   status: "${leave.status}"`);
      console.log(`   type: "${leave.type}"`);
      console.log(`   days: ${leave.dureeDays || leave.duree}`);
      console.log(`   dateDebut: ${leave.dateDebut}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkApiResponse();
