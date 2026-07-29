/**
 * SEED SCRIPT — Injects demo data for Investments, Budgets, Reports
 * Usage: npx ts-node src/scripts/seed-demo-data.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'));

  // ── Get first employee ID to link data ──────────────────────────
  const empColl = mongoose.connection.collection('employees');
  const firstEmp = await empColl.findOne({});
  if (!firstEmp) {
    console.error('❌ No employees found. Please create an employee first.');
    process.exit(1);
  }
  const empId = firstEmp._id;
  console.log('👤 Using employee:', firstEmp.matricule || empId);

  // ── Investments ──────────────────────────────────────────────────
  const invColl = mongoose.connection.collection('investments');
  const invCount = await invColl.countDocuments();
  if (invCount === 0) {
    await invColl.insertMany([
      { employeeId: empId, type: 'FUNDS', name: 'Fonds STB Croissance', description: 'Fonds d\'investissement diversifié', initialAmount: 250000, currentValue: 281250, currency: 'TND', startDate: new Date('2024-01-15'), endDate: null, expectedReturn: 12.5, riskLevel: 'MEDIUM', status: 'ACTIVE', accountId: null, metadata: {}, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, type: 'BONDS', name: 'Obligations Gouvernementales', description: 'Bons du trésor 5 ans', initialAmount: 500000, currentValue: 537500, currency: 'TND', startDate: new Date('2024-02-01'), endDate: new Date('2029-02-01'), expectedReturn: 7.5, riskLevel: 'LOW', status: 'ACTIVE', accountId: null, metadata: {}, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, type: 'SAVINGS_PLAN', name: 'Plan Retraite Premium', description: 'Plan épargne-retraite', initialAmount: 180000, currentValue: 196200, currency: 'TND', startDate: new Date('2023-11-10'), endDate: new Date('2035-11-10'), expectedReturn: 9.0, riskLevel: 'LOW', status: 'ACTIVE', accountId: null, metadata: {}, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, type: 'STOCKS', name: 'Actions Tech BVMT', description: 'Portefeuille actions technologie', initialAmount: 95000, currentValue: 90250, currency: 'TND', startDate: new Date('2024-03-20'), endDate: null, expectedReturn: -5.0, riskLevel: 'HIGH', status: 'ACTIVE', accountId: null, metadata: {}, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log('✅ Seeded 4 investments');
  } else {
    console.log(`⏭  Investments already seeded (${invCount} docs)`);
  }

  // ── Budgets ──────────────────────────────────────────────────────
  const budColl = mongoose.connection.collection('budgets');
  const budCount = await budColl.countDocuments();
  if (budCount === 0) {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    await budColl.insertMany([
      { employeeId: empId, name: 'Alimentation', category: 'FOOD', amount: 45000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 32400, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Logement', category: 'BILLS', amount: 120000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 118000, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Transport', category: 'TRANSPORT', amount: 30000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 18700, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Santé', category: 'HEALTH', amount: 25000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 9800, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Technologie', category: 'OTHER', amount: 20000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 21500, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Formation', category: 'EDUCATION', amount: 15000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 7200, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Voyages', category: 'ENTERTAINMENT', amount: 50000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 14300, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
      { employeeId: empId, name: 'Loisirs', category: 'SHOPPING', amount: 18000, period: 'MONTHLY', startDate: now, endDate: endOfMonth, spent: 11600, currency: 'TND', isActive: true, alertThreshold: 80, createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log('✅ Seeded 8 budgets');
  } else {
    console.log(`⏭  Budgets already seeded (${budCount} docs)`);
  }

  // ── Reports ──────────────────────────────────────────────────────
  const repColl = mongoose.connection.collection('reports');
  const repCount = await repColl.countDocuments();
  if (repCount === 0) {
    await repColl.insertMany([
      { name: 'Rapport Paie Juin 2026', type: 'PAYROLL', format: 'PDF', parameters: { mois: 6, annee: 2026 }, generatedBy: empId, fileUrl: null, fileSize: 145000, status: 'COMPLETED', completedAt: new Date('2026-06-30'), createdAt: new Date('2026-06-30'), updatedAt: new Date('2026-06-30') },
      { name: 'Rapport Congés T1 2026', type: 'LEAVE', format: 'EXCEL', parameters: { trimestre: 1, annee: 2026 }, generatedBy: empId, fileUrl: null, fileSize: 78000, status: 'COMPLETED', completedAt: new Date('2026-04-02'), createdAt: new Date('2026-04-01'), updatedAt: new Date('2026-04-02') },
      { name: 'Rapport Collaborateurs Actifs', type: 'EMPLOYEE', format: 'PDF', parameters: {}, generatedBy: empId, fileUrl: null, fileSize: 221000, status: 'COMPLETED', completedAt: new Date(), createdAt: new Date(), updatedAt: new Date() },
      { name: 'Audit Financier Juillet 2026', type: 'AUDIT', format: 'PDF', parameters: { mois: 7, annee: 2026 }, generatedBy: empId, fileUrl: null, fileSize: 0, status: 'GENERATING', createdAt: new Date(), updatedAt: new Date() },
    ]);
    console.log('✅ Seeded 4 reports');
  } else {
    console.log(`⏭  Reports already seeded (${repCount} docs)`);
  }

  await mongoose.disconnect();
  console.log('\n🚀 Seed completed successfully!');
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
