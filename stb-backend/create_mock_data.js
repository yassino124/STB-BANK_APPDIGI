const { MongoClient, ObjectId } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('stb_db');

  const emp1018 = await db.collection('employees').findOne({ matricule: 'EMP1018' });
  const emp1019 = await db.collection('employees').findOne({ matricule: 'EMP1019' });
  const emp1017 = await db.collection('employees').findOne({ matricule: 'EMP1017' });

  if (emp1018 && emp1017) {
    // Check if a leave request already exists
    const existingLeave = await db.collection('leaverequests').findOne({ employeeId: emp1018._id });
    if (!existingLeave) {
      await db.collection('leaverequests').insertOne({
        employeeId: emp1018._id,
        type: 'ANNUAL',
        dateDebut: new Date(new Date().setDate(new Date().getDate() + 2)), // +2 days
        dateFin: new Date(new Date().setDate(new Date().getDate() + 5)), // +5 days
        nombreJours: 3,
        motif: 'Vacances annuelles',
        status: 'PENDING_MANAGER',
        currentApproverId: emp1017._id,
        managerId: emp1017._id.toString(), // ensure it's a string, or ObjectId
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created leave request for EMP1018');
    }
  }

  if (emp1019 && emp1017) {
    // Check if an absence already exists
    const existingAbs = await db.collection('absences').findOne({ employeeId: emp1019._id });
    if (!existingAbs) {
      await db.collection('absences').insertOne({
        employeeId: emp1019._id,
        date: new Date(),
        status: 'ABSENT',
        type: 'MALADIE',
        justified: false,
        absentDays: 1,
        lateDays: 0,
        alert: true,
        managerId: emp1017._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created absence for EMP1019');
    }
  }

  await client.close();
}
run().catch(console.dir);
