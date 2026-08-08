/**
 * Script to check leave balance discrepancies
 * Usage: node check-leave-balance.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB\n');

    const LeaveRequests = mongoose.connection.collection('leaverequests');
    const LeaveBalances = mongoose.connection.collection('leavebalances');
    const Employees = mongoose.connection.collection('employees');

    // Get employee wertani23
    const employee = await Employees.findOne({ matricule: 'EMP1017' });
    if (!employee) {
      console.log('❌ Employee EMP1017 not found');
      await mongoose.connection.close();
      return;
    }

    console.log(`👤 Employee: ${employee.prenom} ${employee.nom} (${employee.matricule})`);
    console.log(`   ID: ${employee._id}\n`);

    // Get all leave requests for this employee
    const leaves = await LeaveRequests.find({ employeeId: employee._id }).toArray();
    console.log(`📋 Total leave requests: ${leaves.length}\n`);

    let totalApproved = 0;
    leaves.forEach((leave, index) => {
      console.log(`${index + 1}. Status: ${leave.status} | Days: ${leave.nombreJours} | From: ${leave.dateDebut.toISOString().split('T')[0]}`);
      if (leave.status === 'APPROVED') {
        totalApproved += leave.nombreJours;
      }
    });

    console.log(`\n✅ Total APPROVED days: ${totalApproved}`);

    // Get balance
    const balance = await LeaveBalances.findOne({ employeeId: employee._id });
    if (!balance) {
      console.log('\n❌ No balance found for this employee');
    } else {
      console.log(`\n💰 Balance:`);
      console.log(`   - soldeAnnuel: ${balance.soldeAnnuel}`);
      console.log(`   - soldeUtilise: ${balance.soldeUtilise}`);
      console.log(`   - soldeDisponible: ${balance.soldeAnnuel - balance.soldeUtilise}`);
      
      if (balance.soldeUtilise !== totalApproved) {
        console.log(`\n⚠️  MISMATCH DETECTED!`);
        console.log(`   Expected soldeUtilise: ${totalApproved}`);
        console.log(`   Actual soldeUtilise: ${balance.soldeUtilise}`);
        console.log(`   Difference: ${totalApproved - balance.soldeUtilise} days\n`);
        
        // Fix option
        console.log(`Do you want to fix this? (Run with FIX=true to apply)`);
        if (process.env.FIX === 'true') {
          await LeaveBalances.updateOne(
            { _id: balance._id },
            { $set: { soldeUtilise: totalApproved } }
          );
          console.log(`✅ Fixed! soldeUtilise updated to ${totalApproved}`);
        }
      } else {
        console.log(`\n✅ Balance is correct!`);
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
