import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = 'mongodb://localhost:27017/stb_db';

async function seedSavingsGoals() {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db();
  
  console.log('🌱 Seeding savings goals and budgets...');

  // Find an employee (use the first one or a specific one)
  const employee = await db.collection('employees').findOne({ matricule: 'EMP1001' });
  
  if (!employee) {
    console.log('❌ No employee found');
    await client.close();
    return;
  }

  const employeeId = employee._id;
  console.log(`✓ Found employee: ${employee.prenom} ${employee.nom} (${employee.matricule})`);

  // Clear existing budgets for this employee
  await db.collection('budgets').deleteMany({ employeeId });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const savingsGoals = [
    {
      employeeId,
      name: 'Voyage à Paris',
      category: 'TRAVEL',
      type: 'SAVINGS_GOAL',
      amount: 5000,
      saved: 3200,
      period: 'YEARLY',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      targetDate: new Date('2026-08-15'),
      description: 'Vacances d\'été à Paris',
      currency: 'TND',
      isActive: true,
      alertThreshold: 80,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      employeeId,
      name: 'Fonds d\'urgence',
      category: 'EMERGENCY',
      type: 'SAVINGS_GOAL',
      amount: 10000,
      saved: 8500,
      period: 'YEARLY',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      description: 'Épargne de sécurité pour 6 mois',
      currency: 'TND',
      isActive: true,
      alertThreshold: 80,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      employeeId,
      name: 'Nouvelle voiture',
      category: 'SAVINGS',
      type: 'SAVINGS_GOAL',
      amount: 30000,
      saved: 12000,
      period: 'YEARLY',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      targetDate: new Date('2027-06-01'),
      description: 'Économiser pour une nouvelle voiture',
      currency: 'TND',
      isActive: true,
      alertThreshold: 75,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const spendingBudgets = [
    {
      employeeId,
      name: 'Budget Alimentation',
      category: 'FOOD',
      type: 'SPENDING',
      amount: 800,
      spent: 565,
      period: 'MONTHLY',
      startDate: monthStart,
      endDate: monthEnd,
      currency: 'TND',
      isActive: true,
      alertThreshold: 80,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      employeeId,
      name: 'Budget Transport',
      category: 'TRANSPORT',
      type: 'SPENDING',
      amount: 300,
      spent: 240,
      period: 'MONTHLY',
      startDate: monthStart,
      endDate: monthEnd,
      currency: 'TND',
      isActive: true,
      alertThreshold: 85,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      employeeId,
      name: 'Budget Loisirs',
      category: 'ENTERTAINMENT',
      type: 'SPENDING',
      amount: 500,
      spent: 150,
      period: 'MONTHLY',
      startDate: monthStart,
      endDate: monthEnd,
      currency: 'TND',
      isActive: true,
      alertThreshold: 80,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const allBudgets = [...savingsGoals, ...spendingBudgets];

  const result = await db.collection('budgets').insertMany(allBudgets);
  
  console.log(`✅ Created ${result.insertedCount} budgets and savings goals`);
  console.log(`   - ${savingsGoals.length} savings goals`);
  console.log(`   - ${spendingBudgets.length} spending budgets`);

  await client.close();
  console.log('✨ Done!');
}

seedSavingsGoals().catch(console.error);
