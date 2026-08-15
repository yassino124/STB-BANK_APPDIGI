const mongoose = require('mongoose');

async function checkRH() {
  try {
    await mongoose.connect('mongodb://localhost:27017/stb_db');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const employees = await db.collection('employees').find({ roles: 'RH' }).toArray();
    
    if (employees.length === 0) {
      console.log('❌ No RH employees found in local stb_db');
    } else {
      console.log(`✅ Found ${employees.length} RH employee(s):`);
      employees.forEach(emp => {
        console.log(`- Email: ${emp.email}, Name: ${emp.firstName} ${emp.lastName}, Roles: ${emp.roles}`);
      });
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRH();
