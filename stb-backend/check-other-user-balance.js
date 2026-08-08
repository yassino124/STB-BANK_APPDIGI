const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const empId = '6a6c61985e137b299821b7b9';
    const employee = await db.collection('employees').findOne({ _id: new mongoose.Types.ObjectId(empId) });
    const balance = await db.collection('leavebalances').findOne({ employeeId: new mongoose.Types.ObjectId(empId) });
    const leaves = await db.collection('leaverequests').find({ employeeId: new mongoose.Types.ObjectId(empId) }).toArray();
    
    console.log(`\n👤 Employee: ${employee?.nom} ${employee?.prenom} (${employee?.matricule})`);
    console.log(`📋 Total leaves: ${leaves.length}`);
    leaves.forEach((l, i) => {
      const duree = l.nombreJours || l.dureeDays || l.duree || '?';
      console.log(`${i + 1}. ${l.status} | ${duree} jours | ${l.type}`);
    });
    
    console.log(`\n💰 Balance:`);
    console.log(`   soldeAnnuel: ${balance?.soldeAnnuel}`);
    console.log(`   soldeUtilise: ${balance?.soldeUtilise}`);
    console.log(`   soldeDisponible: ${balance?.soldeDisponible || (balance?.soldeAnnuel - balance?.soldeUtilise)}`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌', error);
    process.exit(1);
  }
}

check();
