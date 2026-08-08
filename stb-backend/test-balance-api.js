const mongoose = require('mongoose');
require('dotenv').config();

const LeaveBalanceSchema = new mongoose.Schema({}, { strict: false, collection: 'leavebalances' });
const LeaveBalance = mongoose.model('LeaveBalance', LeaveBalanceSchema);

async function testBalanceApi() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const empId = '6a6c61985e137b299821b7b9'; // EMP1018
    const balance = await LeaveBalance.findOne({ employeeId: new mongoose.Types.ObjectId(empId) }).lean();
    
    console.log('\n📋 Raw LeaveBalance document from DB:\n');
    console.log(JSON.stringify(balance, null, 2));
    
    console.log('\n💡 What API /leave/my-balance would return:\n');
    console.log({
      soldeAnnuel: balance?.soldeAnnuel,
      soldeUtilise: balance?.soldeUtilise,
      soldeDisponible: balance?.soldeDisponible || (balance?.soldeAnnuel - balance?.soldeUtilise)
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌', error);
    process.exit(1);
  }
}

testBalanceApi();
