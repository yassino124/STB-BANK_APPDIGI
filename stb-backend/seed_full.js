const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = 'mongodb://localhost:27017/stb_db';

function oid() { return new mongoose.Types.ObjectId(); }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function monthStart(offset = 0) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - offset); return d; }
function ref(str) { return 'TRF-' + str + '-' + Date.now().toString(36).toUpperCase(); }

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await mongoose.connection.db.dropDatabase();
  console.log('🗑️  Database dropped');

  const db = mongoose.connection.db;

  // ─── Hash passwords ───────────────────────────────────────────────────────
  const [adminHash, empHash, pinHash, cvvHash] = await Promise.all([
    bcrypt.hash('Admin123!', 12),
    bcrypt.hash('Azerty123!', 12),
    bcrypt.hash('123456', 12),
    bcrypt.hash('123', 12),
  ]);

  // ─── IDs ─────────────────────────────────────────────────────────────────
  const adminId     = oid();
  const ouertaniId  = oid();
  const babouId     = oid();
  const monirId     = oid();

  const branchSiegeId   = oid();
  const branchLacId     = oid();
  const deptRHId        = oid();
  const deptITId        = oid();
  const deptFinanceId   = oid();
  const deptCommercialId= oid();

  const accAdminId     = oid();
  const accOuertaniId  = oid();
  const accOuertaniEpId= oid();
  const accBabouId     = oid();
  const accMonirId     = oid();

  const cardOuertaniId = oid();
  const cardBabouId    = oid();

  const convAdminOuertaniId = oid();
  const convGroupId         = oid();

  // ─── 1. BRANCHES ─────────────────────────────────────────────────────────
  await db.collection('branches').insertMany([
    {
      _id: branchSiegeId, name: 'Siège STB', code: 'SIEGE',
      address: 'Rue Hédi Nouira, Tunis 1001', city: 'Tunis', country: 'Tunisie',
      phone: '+216 71 340 477', email: 'siege@stb.tn',
      managerId: adminId, isActive: true, metadata: {},
      createdAt: new Date('2010-01-01'), updatedAt: new Date()
    },
    {
      _id: branchLacId, name: 'Agence Lac 2', code: 'LAC2',
      address: 'Rue du Lac Malären, Tunis 1053', city: 'Tunis', country: 'Tunisie',
      phone: '+216 71 964 255', email: 'lac2@stb.tn',
      managerId: monirId, isActive: true, metadata: {},
      createdAt: new Date('2015-03-01'), updatedAt: new Date()
    },
  ]);
  console.log('✅ Branches');

  // ─── 2. DEPARTMENTS ──────────────────────────────────────────────────────
  await db.collection('departments').insertMany([
    {
      _id: deptRHId, name: 'Ressources Humaines', code: 'RH',
      description: 'Gestion des ressources humaines et paie',
      managerId: adminId, parentDepartmentId: null, isActive: true, employeeCount: 1,
      metadata: {}, createdAt: new Date('2010-01-01'), updatedAt: new Date()
    },
    {
      _id: deptITId, name: 'IT & Digital Banking', code: 'IT',
      description: 'Infrastructure informatique et développement numérique',
      managerId: ouertaniId, parentDepartmentId: null, isActive: true, employeeCount: 1,
      metadata: {}, createdAt: new Date('2015-06-01'), updatedAt: new Date()
    },
    {
      _id: deptFinanceId, name: 'Finance & Contrôle de Gestion', code: 'FIN',
      description: 'Analyse financière, reporting et contrôle de gestion',
      managerId: babouId, parentDepartmentId: null, isActive: true, employeeCount: 1,
      metadata: {}, createdAt: new Date('2012-01-01'), updatedAt: new Date()
    },
    {
      _id: deptCommercialId, name: 'Commercial & Réseau', code: 'COM',
      description: 'Animation commerciale et développement réseau agences',
      managerId: monirId, parentDepartmentId: null, isActive: true, employeeCount: 1,
      metadata: {}, createdAt: new Date('2013-09-01'), updatedAt: new Date()
    },
  ]);
  console.log('✅ Departments');

  // ─── 3. EMPLOYEES ────────────────────────────────────────────────────────
  await db.collection('employees').insertMany([
    {
      _id: adminId, matricule: 'RH001', cin: '11111111',
      dateNaissance: new Date('1985-06-15'),
      nom: 'Admin', prenom: 'RH',
      email: 'admin@stb.tn', phone: '+21671000001',
      passwordHash: adminHash, pinHash: pinHash,
      roles: ['SUPER_ADMIN', 'RH', 'EMPLOYEE'],
      status: 'ACTIVE', isActivated: true,
      faceEnabled: true, fingerEnabled: true,
      failedLoginAttempts: 0, lockedUntil: null,
      lastLoginAt: new Date(), passwordChangedAt: null,
      poste: 'Directeur Ressources Humaines',
      departmentId: deptRHId, branchId: branchSiegeId, managerId: null,
      contractType: 'CDI', contractStart: new Date('2015-01-15'),
      contractEnd: null, workSchedule: '08:00-17:00', shiftPattern: 'NORMAL',
      soldeConges: 30, creditsEnCours: 0, prime: 2000, salaireBase: 5000,
      dateEmbauche: new Date('2015-01-15'), compteSolde: 150000,
      metadata: {}, createdAt: new Date('2015-01-15'), updatedAt: new Date()
    },
    {
      _id: ouertaniId, matricule: 'EMP1001', cin: '22222222',
      dateNaissance: new Date('2000-10-12'),
      nom: 'Ouertani', prenom: 'Yassine',
      email: 'employee@stb.tn', phone: '+21690429117',
      passwordHash: empHash, pinHash: pinHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE', isActivated: true,
      faceEnabled: true, fingerEnabled: true,
      failedLoginAttempts: 0, lockedUntil: null,
      lastLoginAt: daysAgo(0), passwordChangedAt: null,
      poste: 'Ingénieur Logiciel',
      departmentId: deptITId, branchId: branchSiegeId, managerId: adminId,
      contractType: 'CDI', contractStart: new Date('2022-09-01'),
      contractEnd: null, workSchedule: '09:00-18:00', shiftPattern: 'NORMAL',
      soldeConges: 24, creditsEnCours: 5000, prime: 800, salaireBase: 2500,
      dateEmbauche: new Date('2022-09-01'), compteSolde: 10000,
      metadata: {}, createdAt: new Date('2022-09-01'), updatedAt: new Date()
    },
    {
      _id: babouId, matricule: 'EMP1002', cin: '33333333',
      dateNaissance: new Date('1992-03-22'),
      nom: 'Babou', prenom: 'Ali',
      email: 'babou@stb.tn', phone: '+21698765432',
      passwordHash: empHash, pinHash: pinHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE', isActivated: true,
      faceEnabled: false, fingerEnabled: true,
      failedLoginAttempts: 0, lockedUntil: null,
      lastLoginAt: daysAgo(1), passwordChangedAt: null,
      poste: 'Analyste Financier Senior',
      departmentId: deptFinanceId, branchId: branchSiegeId, managerId: adminId,
      contractType: 'CDI', contractStart: new Date('2020-05-10'),
      contractEnd: null, workSchedule: '08:30-17:30', shiftPattern: 'NORMAL',
      soldeConges: 15, creditsEnCours: 0, prime: 0, salaireBase: 3000,
      dateEmbauche: new Date('2020-05-10'), compteSolde: 18500,
      metadata: {}, createdAt: new Date('2020-05-10'), updatedAt: new Date()
    },
    {
      _id: monirId, matricule: 'EMP1003', cin: '44444444',
      dateNaissance: new Date('1988-11-05'),
      nom: 'Ouertani', prenom: 'Monir',
      email: 'monir@stb.tn', phone: '+21677444555',
      passwordHash: empHash, pinHash: pinHash,
      roles: ['EMPLOYEE', 'BRANCH_MANAGER'],
      status: 'ACTIVE', isActivated: true,
      faceEnabled: true, fingerEnabled: false,
      failedLoginAttempts: 0, lockedUntil: null,
      lastLoginAt: daysAgo(2), passwordChangedAt: null,
      poste: "Chef d'Agence",
      departmentId: deptCommercialId, branchId: branchLacId, managerId: adminId,
      contractType: 'CDI', contractStart: new Date('2018-03-20'),
      contractEnd: null, workSchedule: '08:00-17:00', shiftPattern: 'NORMAL',
      soldeConges: 18, creditsEnCours: 2000, prime: 500, salaireBase: 2800,
      dateEmbauche: new Date('2018-03-20'), compteSolde: 12000,
      metadata: {}, createdAt: new Date('2018-03-20'), updatedAt: new Date()
    },
  ]);
  console.log('✅ Employees');

  // ─── 4. ACCOUNTS ─────────────────────────────────────────────────────────
  await db.collection('accounts').insertMany([
    {
      _id: accAdminId, employeeId: adminId, type: 'COURANT', status: 'ACTIVE',
      rib: '10001000000100000001', iban: 'TN5910001000000100000001', numCompte: 'STB-COU-000001',
      solde: 150000, currency: 'TND', isPrimary: true,
      branchId: branchSiegeId,
      dailyWithdrawalLimit: 50000, dailyTransferLimit: 100000, monthlyLimit: 500000,
      dailySpent: 0, monthlySpent: 0,
      metadata: {}, createdAt: new Date('2015-01-15'), updatedAt: new Date()
    },
    {
      _id: accOuertaniId, employeeId: ouertaniId, type: 'COURANT', status: 'ACTIVE',
      rib: '10001000000200000002', iban: 'TN5910001000000200000002', numCompte: 'STB-COU-000002',
      solde: 10000, currency: 'TND', isPrimary: true,
      branchId: branchSiegeId,
      dailyWithdrawalLimit: 2000, dailyTransferLimit: 5000, monthlyLimit: 20000,
      dailySpent: 0, monthlySpent: 0,
      metadata: {}, createdAt: new Date('2022-09-01'), updatedAt: new Date()
    },
    {
      _id: accOuertaniEpId, employeeId: ouertaniId, type: 'EPARGNE', status: 'ACTIVE',
      rib: '10001000000200000099', iban: 'TN5910001000000200000099', numCompte: 'STB-EPG-000002',
      solde: 15000, currency: 'TND', isPrimary: false,
      branchId: branchSiegeId,
      dailyWithdrawalLimit: 1000, dailyTransferLimit: 2000, monthlyLimit: 10000,
      dailySpent: 0, monthlySpent: 0,
      metadata: {}, createdAt: new Date('2022-09-01'), updatedAt: new Date()
    },
    {
      _id: accBabouId, employeeId: babouId, type: 'COURANT', status: 'ACTIVE',
      rib: '10001000000300000003', iban: 'TN5910001000000300000003', numCompte: 'STB-COU-000003',
      solde: 18500, currency: 'TND', isPrimary: true,
      branchId: branchSiegeId,
      dailyWithdrawalLimit: 3000, dailyTransferLimit: 8000, monthlyLimit: 30000,
      dailySpent: 0, monthlySpent: 0,
      metadata: {}, createdAt: new Date('2020-05-10'), updatedAt: new Date()
    },
    {
      _id: accMonirId, employeeId: monirId, type: 'COURANT', status: 'ACTIVE',
      rib: '10001000000400000004', iban: 'TN5910001000000400000004', numCompte: 'STB-COU-000004',
      solde: 12000, currency: 'TND', isPrimary: true,
      branchId: branchLacId,
      dailyWithdrawalLimit: 3000, dailyTransferLimit: 8000, monthlyLimit: 30000,
      dailySpent: 0, monthlySpent: 0,
      metadata: {}, createdAt: new Date('2018-03-20'), updatedAt: new Date()
    },
  ]);
  console.log('✅ Accounts');

  // ─── 5. CARDS ────────────────────────────────────────────────────────────
  await db.collection('cards').insertMany([
    {
      _id: cardOuertaniId, employeeId: ouertaniId, accountId: accOuertaniId,
      cardNumber: '4532756279624033', maskedNumber: '**** **** **** 4033',
      expiryDate: '12/28', cvvHash, pinHash, type: 'VISA', status: 'ACTIVE',
      limitQuotidien: 2000, limitMensuel: 8000,
      isVirtual: false, isFrozen: false, frozenAt: null, frozenBy: null, freezeReason: null,
      contactlessEnabled: true, onlinePaymentsEnabled: true, internationalEnabled: false,
      spendingLimits: { daily: 2000, weekly: 5000, monthly: 8000, atmDaily: 1000 },
      allowedCountries: ['TN', 'FR', 'DE'], blockedCountries: [],
      activatedAt: new Date('2022-09-15'), cancelledAt: null,
      metadata: {}, createdAt: new Date('2022-09-15'), updatedAt: new Date()
    },
    {
      _id: cardBabouId, employeeId: babouId, accountId: accBabouId,
      cardNumber: '5425233430109903', maskedNumber: '**** **** **** 9903',
      expiryDate: '06/27', cvvHash, pinHash, type: 'MASTERCARD', status: 'ACTIVE',
      limitQuotidien: 5000, limitMensuel: 15000,
      isVirtual: false, isFrozen: false, frozenAt: null, frozenBy: null, freezeReason: null,
      contactlessEnabled: true, onlinePaymentsEnabled: true, internationalEnabled: true,
      spendingLimits: { daily: 5000, weekly: 12000, monthly: 15000, atmDaily: 2000 },
      allowedCountries: [], blockedCountries: [],
      activatedAt: new Date('2020-06-01'), cancelledAt: null,
      metadata: {}, createdAt: new Date('2020-06-01'), updatedAt: new Date()
    },
  ]);
  console.log('✅ Cards');

  // ─── 6. TRANSACTIONS ─────────────────────────────────────────────────────
  // Rich 6-month history for Yassine (ouertaniId) to power Analytics
  const now = new Date();
  const transactions = [];
  // Month -5 (Jan)
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 2500, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Janvier', date: monthStart(5), reference: 'SAL-JAN-001', fee: 0, exchangeRate: 1, originalAmount: 2500, originalCurrency: 'TND', tags: ['salaire'], fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(5), updatedAt: monthStart(5) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 145, type: 'PAYMENT', category: 'FOOD', status: 'COMPLETED', description: 'Carrefour Market', date: new Date(now.getFullYear(), now.getMonth()-5, 8), merchantName: 'Carrefour', reference: 'PAY-JAN-001', fee: 0, exchangeRate: 1, originalAmount: 145, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-5, 8), updatedAt: new Date() });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 200, type: 'BILL_PAYMENT', category: 'BILLS', status: 'COMPLETED', description: 'Facture STEG', date: new Date(now.getFullYear(), now.getMonth()-5, 15), merchantName: 'STEG', reference: 'STEG-JAN-001', fee: 0, exchangeRate: 1, originalAmount: 200, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-5, 15), updatedAt: new Date() });
  // Month -4 (Feb)
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 2500, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Février', date: monthStart(4), reference: 'SAL-FEB-001', fee: 0, exchangeRate: 1, originalAmount: 2500, originalCurrency: 'TND', tags: ['salaire'], fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(4), updatedAt: monthStart(4) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 320, type: 'PAYMENT', category: 'SHOPPING', status: 'COMPLETED', description: 'Zara Tunis', date: new Date(now.getFullYear(), now.getMonth()-4, 12), merchantName: 'Zara', reference: 'PAY-FEB-001', fee: 0, exchangeRate: 1, originalAmount: 320, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-4, 12), updatedAt: new Date() });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 90, type: 'PAYMENT', category: 'TRANSPORT', status: 'COMPLETED', description: 'Uber Tunis', date: new Date(now.getFullYear(), now.getMonth()-4, 20), merchantName: 'Uber', reference: 'PAY-FEB-002', fee: 0, exchangeRate: 1, originalAmount: 90, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-4, 20), updatedAt: new Date() });
  // Month -3 (Mar)
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 2500, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Mars', date: monthStart(3), reference: 'SAL-MAR-001', fee: 0, exchangeRate: 1, originalAmount: 2500, originalCurrency: 'TND', tags: ['salaire'], fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(3), updatedAt: monthStart(3) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 50, type: 'PAYMENT', category: 'HEALTH', status: 'COMPLETED', description: 'Pharmacie Centrale', date: new Date(now.getFullYear(), now.getMonth()-3, 10), merchantName: 'Pharmacie', reference: 'PAY-MAR-001', fee: 0, exchangeRate: 1, originalAmount: 50, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-3, 10), updatedAt: new Date() });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 800, type: 'PRIME', category: 'INCOME', status: 'COMPLETED', description: 'Prime de rendement Q1', date: new Date(now.getFullYear(), now.getMonth()-3, 25), reference: 'PRM-MAR-001', fee: 0, exchangeRate: 1, originalAmount: 800, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-3, 25), updatedAt: new Date() });
  // Month -2 (Apr)
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 2500, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Avril', date: monthStart(2), reference: 'SAL-APR-001', fee: 0, exchangeRate: 1, originalAmount: 2500, originalCurrency: 'TND', tags: ['salaire'], fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(2), updatedAt: monthStart(2) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, to: monirId, toAccountId: accMonirId, montant: 50, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED', description: 'Virement vers Ouertani Monir', date: new Date(now.getFullYear(), now.getMonth()-2, 10), reference: 'TRF-APR-001', fee: 0, exchangeRate: 1, originalAmount: 50, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-2, 10), updatedAt: new Date() });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, to: babouId, toAccountId: accBabouId, montant: 50, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED', description: 'Virement vers Babou Ali', date: new Date(now.getFullYear(), now.getMonth()-2, 15), reference: 'TRF-APR-002', fee: 0, exchangeRate: 1, originalAmount: 50, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-2, 15), updatedAt: new Date() });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 180, type: 'BILL_PAYMENT', category: 'BILLS', status: 'COMPLETED', description: 'Facture SONEDE', date: new Date(now.getFullYear(), now.getMonth()-2, 20), merchantName: 'SONEDE', reference: 'BILL-APR-001', fee: 0, exchangeRate: 1, originalAmount: 180, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-2, 20), updatedAt: new Date() });
  // Month -1 (May)
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 2500, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Mai', date: monthStart(1), reference: 'SAL-MAY-001', fee: 0, exchangeRate: 1, originalAmount: 2500, originalCurrency: 'TND', tags: ['salaire'], fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(1), updatedAt: monthStart(1) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 500, type: 'DEPOSIT', category: 'INCOME', status: 'COMPLETED', description: 'Avance sur salaire approuvée', date: new Date(now.getFullYear(), now.getMonth()-1, 15), reference: 'AVN-MAY-001', fee: 0, exchangeRate: 1, originalAmount: 500, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-1, 15), updatedAt: new Date() });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 110, type: 'PAYMENT', category: 'ENTERTAINMENT', status: 'COMPLETED', description: 'Netflix & Spotify', date: new Date(now.getFullYear(), now.getMonth()-1, 18), merchantName: 'Netflix', reference: 'PAY-MAY-001', fee: 0, exchangeRate: 1, originalAmount: 110, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: new Date(now.getFullYear(), now.getMonth()-1, 18), updatedAt: new Date() });
  // Month 0 (Jun - current)
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 2500, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Juin', date: monthStart(0), reference: 'SAL-JUN-001', fee: 0, exchangeRate: 1, originalAmount: 2500, originalCurrency: 'TND', tags: ['salaire'], fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(0), updatedAt: monthStart(0) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, to: monirId, toAccountId: accMonirId, montant: 10000, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED', description: 'Virement vers Ouertani Monir', date: daysAgo(12), reference: 'TRF-JUN-001', fee: 0, exchangeRate: 1, originalAmount: 10000, originalCurrency: 'TND', fraudScore: 5, riskLevel: 'LOW', metadata: {}, createdAt: daysAgo(12), updatedAt: daysAgo(12) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, to: monirId, toAccountId: accMonirId, montant: 50000, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED', description: 'Virement vers Ouertani Monir', date: daysAgo(10), reference: 'TRF-JUN-002', fee: 250, exchangeRate: 1, originalAmount: 50000, originalCurrency: 'TND', fraudScore: 45, riskLevel: 'MEDIUM', metadata: {}, createdAt: daysAgo(10), updatedAt: daysAgo(10) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, to: babouId, toAccountId: accBabouId, montant: 10000, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED', description: 'Virement vers Babou Ali', date: daysAgo(7), reference: 'TRF-JUN-003', fee: 0, exchangeRate: 1, originalAmount: 10000, originalCurrency: 'TND', fraudScore: 10, riskLevel: 'LOW', metadata: {}, createdAt: daysAgo(7), updatedAt: daysAgo(7) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, to: babouId, toAccountId: accBabouId, montant: 10000, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED', description: 'Virement vers Babou Ali', date: daysAgo(5), reference: 'TRF-JUN-004', fee: 0, exchangeRate: 1, originalAmount: 10000, originalCurrency: 'TND', fraudScore: 10, riskLevel: 'LOW', metadata: {}, createdAt: daysAgo(5), updatedAt: daysAgo(5) });
  transactions.push({ employeeId: ouertaniId, accountId: accOuertaniId, montant: 80, type: 'BILL_PAYMENT', category: 'BILLS', status: 'COMPLETED', description: 'Facture STEG', date: daysAgo(3), merchantName: 'STEG', reference: 'STEG-JUN-001', fee: 0, exchangeRate: 1, originalAmount: 80, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: daysAgo(3), updatedAt: daysAgo(3) });
  // Transactions for Babou
  transactions.push({ employeeId: babouId, accountId: accBabouId, montant: 3000, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Juin', date: monthStart(0), reference: 'SAL-BAB-JUN-001', fee: 0, exchangeRate: 1, originalAmount: 3000, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(0), updatedAt: monthStart(0) });
  transactions.push({ employeeId: monirId, accountId: accMonirId, montant: 2800, type: 'SALARY', category: 'SALARY', status: 'COMPLETED', description: 'Salaire Juin', date: monthStart(0), reference: 'SAL-MON-JUN-001', fee: 0, exchangeRate: 1, originalAmount: 2800, originalCurrency: 'TND', fraudScore: 0, riskLevel: 'LOW', metadata: {}, createdAt: monthStart(0), updatedAt: monthStart(0) });
  await db.collection('transactions').insertMany(transactions);
  console.log('✅ Transactions (' + transactions.length + ' records)');

  // ─── 7. REQUESTS ─────────────────────────────────────────────────────────
  const reqOuertaniCongeId = oid();
  const reqBabouAvanceId   = oid();
  const reqMonirPrimeId    = oid();
  const reqOuertaniPrimeId = oid();
  await db.collection('requests').insertMany([
    {
      _id: reqOuertaniCongeId, employeeId: ouertaniId, type: 'CONGE', status: 'APPROUVE',
      payload: { startDate: '2026-08-01', endDate: '2026-08-10', days: 7, reason: 'Vacances en famille', type: 'REPOS' },
      responseMessage: 'Demande approuvée. Bon congé !',
      createdAt: daysAgo(15), updatedAt: daysAgo(10)
    },
    {
      _id: reqBabouAvanceId, employeeId: babouId, type: 'AVANCE', status: 'EN_ATTENTE',
      payload: { amount: 300, reason: "Frais de réparation véhicule" },
      responseMessage: null,
      createdAt: daysAgo(2), updatedAt: daysAgo(2)
    },
    {
      _id: reqMonirPrimeId, employeeId: monirId, type: 'PRIME', status: 'APPROUVE',
      payload: { amount: 500, reason: "Objectif commercial dépassé - T2 2026" },
      responseMessage: 'Prime accordée pour performance commerciale.',
      createdAt: daysAgo(20), updatedAt: daysAgo(18)
    },
    {
      _id: reqOuertaniPrimeId, employeeId: ouertaniId, type: 'PRIME', status: 'REFUSE',
      payload: { amount: 1000, reason: "Contribution au projet digital banking" },
      responseMessage: "Budget primes épuisé pour ce trimestre. Resoumettez en Q3.",
      createdAt: daysAgo(8), updatedAt: daysAgo(6)
    },
    {
      _id: oid(), employeeId: ouertaniId, type: 'AVANCE', status: 'APPROUVE',
      payload: { amount: 500, reason: "Achat matériel informatique" },
      responseMessage: 'Avance accordée. Voir transaction AVN-MAY-001.',
      createdAt: daysAgo(35), updatedAt: daysAgo(30)
    },
    {
      _id: oid(), employeeId: babouId, type: 'CONGE', status: 'APPROUVE',
      payload: { startDate: '2026-07-01', endDate: '2026-07-15', days: 10, reason: 'Mariage', type: 'EXCEPTIONNEL' },
      responseMessage: 'Félicitations ! Congé accordé.',
      createdAt: daysAgo(40), updatedAt: daysAgo(38)
    },
  ]);
  console.log('✅ Requests');

  // ─── 8. NOTIFICATIONS ────────────────────────────────────────────────────
  await db.collection('notifications').insertMany([
    {
      _id: oid(), employeeId: ouertaniId,
      title: '✅ Congé Approuvé', body: 'Votre demande de congé du 01/08 au 10/08 a été approuvée par la RH.',
      type: 'HR_REQUEST', isRead: false, data: { requestId: reqOuertaniCongeId },
      createdAt: daysAgo(10), updatedAt: daysAgo(10)
    },
    {
      _id: oid(), employeeId: ouertaniId,
      title: '💰 Salaire Viré', body: 'Votre salaire de 2 500 TND a été crédité sur votre compte.',
      type: 'TRANSACTION', isRead: true, data: { montant: 2500, reference: 'SAL-JUN-001' },
      createdAt: monthStart(0), updatedAt: monthStart(0)
    },
    {
      _id: oid(), employeeId: ouertaniId,
      title: '❌ Prime Refusée', body: 'Votre demande de prime de 1 000 TND a été refusée. Budget Q2 épuisé.',
      type: 'HR_REQUEST', isRead: false, data: { requestId: reqOuertaniPrimeId },
      createdAt: daysAgo(6), updatedAt: daysAgo(6)
    },
    {
      _id: oid(), employeeId: ouertaniId,
      title: '🔔 Virement effectué', body: 'Virement de 50 000 TND envoyé vers Ouertani Monir.',
      type: 'TRANSACTION', isRead: true, data: { montant: 50000, reference: 'TRF-JUN-002' },
      createdAt: daysAgo(10), updatedAt: daysAgo(10)
    },
    {
      _id: oid(), employeeId: adminId,
      title: '📋 Nouvelle Demande d\'Avance', body: 'EMP1002 Babou Ali a soumis une demande d\'avance de 300 TND.',
      type: 'HR_REQUEST', isRead: false, data: { requestId: reqBabouAvanceId, employeeId: babouId },
      createdAt: daysAgo(2), updatedAt: daysAgo(2)
    },
    {
      _id: oid(), employeeId: adminId,
      title: '⚠️ Alerte Transaction', body: 'Transaction de 50 000 TND détectée pour EMP1001. Score fraude : 45/100.',
      type: 'SYSTEM', isRead: true, data: { fraudScore: 45, reference: 'TRF-JUN-002' },
      createdAt: daysAgo(10), updatedAt: daysAgo(9)
    },
    {
      _id: oid(), employeeId: babouId,
      title: '⏳ Demande en attente', body: 'Votre demande d\'avance de 300 TND est en cours d\'examen par la RH.',
      type: 'HR_REQUEST', isRead: false, data: { requestId: reqBabouAvanceId },
      createdAt: daysAgo(2), updatedAt: daysAgo(2)
    },
    {
      _id: oid(), employeeId: monirId,
      title: '🎉 Prime Approuvée', body: 'Votre prime de 500 TND a été approuvée et sera créditée ce mois-ci.',
      type: 'HR_REQUEST', isRead: true, data: { requestId: reqMonirPrimeId },
      createdAt: daysAgo(18), updatedAt: daysAgo(18)
    },
  ]);
  console.log('✅ Notifications');

  // ─── 9. LEAVE BALANCES & REQUESTS ────────────────────────────────────────
  const year = new Date().getFullYear();
  await db.collection('leavebalances').insertMany([
    { _id: oid(), employeeId: adminId,    soldeAnnuel: 30, soldeUtilise: 5,  soldeReporte: 0, annee: year, createdAt: new Date(), updatedAt: new Date() },
    { _id: oid(), employeeId: ouertaniId, soldeAnnuel: 30, soldeUtilise: 7,  soldeReporte: 1, annee: year, createdAt: new Date(), updatedAt: new Date() },
    { _id: oid(), employeeId: babouId,    soldeAnnuel: 30, soldeUtilise: 10, soldeReporte: 2, annee: year, createdAt: new Date(), updatedAt: new Date() },
    { _id: oid(), employeeId: monirId,    soldeAnnuel: 30, soldeUtilise: 12, soldeReporte: 0, annee: year, createdAt: new Date(), updatedAt: new Date() },
  ]);
  await db.collection('leaverequests').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, type: 'REPOS',
      dateDebut: new Date('2026-08-01'), dateFin: new Date('2026-08-10'), nombreJours: 7,
      motif: 'Vacances famille', pieceJointe: null, status: 'APPROVED',
      validatedBy: adminId, validatedAt: daysAgo(10), commentaire: 'Bon congé !',
      createdAt: daysAgo(15), updatedAt: daysAgo(10)
    },
    {
      _id: oid(), employeeId: babouId, type: 'EXCEPTIONNEL',
      dateDebut: new Date('2026-07-01'), dateFin: new Date('2026-07-15'), nombreJours: 10,
      motif: 'Mariage', pieceJointe: null, status: 'APPROVED',
      validatedBy: adminId, validatedAt: daysAgo(38), commentaire: 'Félicitations !',
      createdAt: daysAgo(40), updatedAt: daysAgo(38)
    },
  ]);
  console.log('✅ Leave (balances + requests)');

  // ─── 10. PRIMES ──────────────────────────────────────────────────────────
  await db.collection('primes').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, type: 'PERFORMANCE', montant: 800,
      status: 'PAID', description: 'Prime de performance Q1 2026',
      approvedBy: adminId, approvedAt: daysAgo(90),
      createdAt: daysAgo(95), updatedAt: daysAgo(90)
    },
    {
      _id: oid(), employeeId: monirId, type: 'PERFORMANCE', montant: 500,
      status: 'APPROVED', description: 'Prime objectif commercial T2 2026',
      approvedBy: adminId, approvedAt: daysAgo(18),
      createdAt: daysAgo(20), updatedAt: daysAgo(18)
    },
    {
      _id: oid(), employeeId: adminId, type: 'ANCIENNETE', montant: 2000,
      status: 'PAID', description: "Prime d'ancienneté 2026",
      approvedBy: adminId, approvedAt: daysAgo(30),
      createdAt: daysAgo(35), updatedAt: daysAgo(30)
    },
  ]);
  console.log('✅ Primes');

  // ─── 11. CREDITS ─────────────────────────────────────────────────────────
  const creditOuertaniId = oid();
  const creditMonirId    = oid();
  await db.collection('credits').insertMany([
    {
      _id: creditOuertaniId, employeeId: ouertaniId, title: 'Crédit Personnel',
      type: 'PERSONNEL', montantInitial: 5000, montantRestant: 4200,
      tauxInteret: 8.5, mensualite: 150, nombreMois: 36,
      dateDebut: new Date('2025-01-01'), dateFin: new Date('2028-01-01'),
      status: 'ACTIVE', createdAt: new Date('2025-01-01'), updatedAt: new Date()
    },
    {
      _id: creditMonirId, employeeId: monirId, title: 'Crédit Auto',
      type: 'AUTO', montantInitial: 25000, montantRestant: 22000,
      tauxInteret: 7.0, mensualite: 450, nombreMois: 60,
      dateDebut: new Date('2024-06-01'), dateFin: new Date('2029-06-01'),
      status: 'ACTIVE', createdAt: new Date('2024-06-01'), updatedAt: new Date()
    },
  ]);
  await db.collection('creditpayments').insertMany([
    { _id: oid(), creditId: creditOuertaniId, employeeId: ouertaniId, montant: 150, datePaiement: daysAgo(60), mode: 'AUTO', createdAt: daysAgo(60), updatedAt: daysAgo(60) },
    { _id: oid(), creditId: creditOuertaniId, employeeId: ouertaniId, montant: 150, datePaiement: daysAgo(30), mode: 'AUTO', createdAt: daysAgo(30), updatedAt: daysAgo(30) },
    { _id: oid(), creditId: creditMonirId,    employeeId: monirId,    montant: 450, datePaiement: daysAgo(30), mode: 'AUTO', createdAt: daysAgo(30), updatedAt: daysAgo(30) },
  ]);
  console.log('✅ Credits + CreditPayments');

  // ─── 12. PAYROLLS ────────────────────────────────────────────────────────
  const m = new Date().getMonth() + 1;
  const y = new Date().getFullYear();
  const payrolls = [];
  for (const [empId, base] of [[ouertaniId, 2500], [babouId, 3000], [monirId, 2800], [adminId, 5000]]) {
    const cnss = Number((base * 0.0718).toFixed(2));
    const impot = Number((base * 0.15).toFixed(2));
    const net = Number((base - cnss - impot).toFixed(2));
    payrolls.push({ _id: oid(), employeeId: empId, mois: m, annee: y, salaireBrut: base, cnss, impot, prime: 0, heuresSup: 0, retenues: 0, salaireNet: net, status: 'VALIDATED', createdAt: monthStart(0), updatedAt: new Date() });
    const cnss2 = Number((base * 0.0718).toFixed(2));
    const impot2 = Number((base * 0.15).toFixed(2));
    const net2 = Number((base - cnss2 - impot2).toFixed(2));
    const prevM = m === 1 ? 12 : m - 1;
    const prevY = m === 1 ? y - 1 : y;
    payrolls.push({ _id: oid(), employeeId: empId, mois: prevM, annee: prevY, salaireBrut: base, cnss: cnss2, impot: impot2, prime: 0, heuresSup: 0, retenues: 0, salaireNet: net2, status: 'PAID', createdAt: monthStart(1), updatedAt: monthStart(1) });
  }
  await db.collection('payrolls').insertMany(payrolls);
  console.log('✅ Payrolls');

  // ─── 13. DEVICES ─────────────────────────────────────────────────────────
  await db.collection('devices').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, deviceUUID: 'iphone17-ouertani-uuid-001',
      deviceName: "iPhone 17 Yassine", platform: 'iOS', model: 'iPhone 17',
      osVersion: 'iOS 26.0', trusted: true, lastLoginAt: new Date(),
      lastLoginIp: '197.1.2.3', lastLoginLocation: 'Tunis, TN',
      biometricsEnabled: true, loginCount: 47, createdAt: daysAgo(300), updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: adminId, deviceUUID: 'mac-admin-uuid-001',
      deviceName: "MacBook Pro Admin", platform: 'Web', model: 'MacBook Pro M3',
      osVersion: 'macOS 15', trusted: true, lastLoginAt: new Date(),
      lastLoginIp: '10.0.0.1', lastLoginLocation: 'Tunis, TN',
      biometricsEnabled: false, loginCount: 210, createdAt: daysAgo(400), updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: babouId, deviceUUID: 'android-babou-uuid-001',
      deviceName: "Samsung Galaxy S24 Babou", platform: 'Android', model: 'Galaxy S24',
      osVersion: 'Android 14', trusted: true, lastLoginAt: daysAgo(1),
      lastLoginIp: '197.2.3.4', lastLoginLocation: 'Tunis, TN',
      biometricsEnabled: true, loginCount: 89, createdAt: daysAgo(200), updatedAt: daysAgo(1)
    },
  ]);
  console.log('✅ Devices');

  // ─── 14. AUDIT LOGS ──────────────────────────────────────────────────────
  await db.collection('audit_logs').insertMany([
    { _id: oid(), employeeId: ouertaniId, action: 'LOGIN', deviceUUID: 'iphone17-ouertani-uuid-001', ip: '197.1.2.3', userAgent: 'Flutter/3.0', location: 'Tunis, TN', success: true, metadata: {}, createdAt: new Date(), updatedAt: new Date() },
    { _id: oid(), employeeId: ouertaniId, action: 'TRANSFER', deviceUUID: 'iphone17-ouertani-uuid-001', ip: '197.1.2.3', success: true, metadata: { amount: 50000, to: 'EMP1003' }, createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    { _id: oid(), employeeId: adminId,    action: 'LOGIN', deviceUUID: 'mac-admin-uuid-001', ip: '10.0.0.1', success: true, metadata: {}, createdAt: new Date(), updatedAt: new Date() },
    { _id: oid(), employeeId: babouId,    action: 'LOGIN', deviceUUID: 'android-babou-uuid-001', ip: '197.2.3.4', success: true, metadata: {}, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    { _id: oid(), employeeId: ouertaniId, action: 'BIOMETRICS_ENABLED', ip: '197.1.2.3', success: true, metadata: { type: 'FACE_ID' }, createdAt: daysAgo(300), updatedAt: daysAgo(300) },
  ]);
  console.log('✅ Audit Logs');

  // ─── 15. RISK ALERTS ─────────────────────────────────────────────────────
  await db.collection('risk_alerts').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, type: 'LARGE_WITHDRAWAL', severity: 'HIGH',
      title: 'Virement important détecté', description: 'Virement de 50 000 TND vers EMP1003 — montant inhabituel.',
      data: { amount: 50000, reference: 'TRF-JUN-002' }, status: 'OPEN',
      resolvedBy: null, resolvedAt: null,
      createdAt: daysAgo(10), updatedAt: daysAgo(10)
    },
    {
      _id: oid(), employeeId: ouertaniId, type: 'UNUSUAL_TRANSACTION', severity: 'MEDIUM',
      title: 'Transactions multiples en moins de 48h', description: '4 virements en 2 jours pour un total de 80 000 TND.',
      data: { totalAmount: 80000, transactionCount: 4 }, status: 'ACKNOWLEDGED',
      resolvedBy: adminId, resolvedAt: daysAgo(8),
      createdAt: daysAgo(9), updatedAt: daysAgo(8)
    },
    {
      _id: oid(), employeeId: babouId, type: 'ACCOUNT_ANOMALY', severity: 'LOW',
      title: 'Solde compte élevé', description: 'Solde 18 500 TND — historiquement élevé pour ce profil.',
      data: { solde: 18500 }, status: 'RESOLVED',
      resolvedBy: adminId, resolvedAt: daysAgo(5), resolution: 'Revenu normal — virements clients légitimes.',
      createdAt: daysAgo(7), updatedAt: daysAgo(5)
    },
  ]);
  console.log('✅ Risk Alerts');

  // ─── 16. FRAUD DETECTIONS ────────────────────────────────────────────────
  await db.collection('fraud_detections').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, transactionId: null, alertId: null,
      type: 'SUSPICIOUS_PATTERN', riskScore: 45,
      factors: ['Virement > 40K TND', 'Horaire inhabituel', 'Nouveau bénéficiaire'],
      details: { reference: 'TRF-JUN-002', amount: 50000 },
      status: 'INVESTIGATING', assignedTo: adminId, actionTaken: 'En attente de vérification client.',
      createdAt: daysAgo(10), updatedAt: daysAgo(10)
    },
  ]);
  console.log('✅ Fraud Detections');

  // ─── 17. INVESTMENTS ─────────────────────────────────────────────────────
  await db.collection('investments').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, type: 'SAVINGS_PLAN', name: 'Plan Épargne Retraite',
      description: 'Épargne mensuelle automatique vers compte épargne',
      initialAmount: 5000, currentValue: 5420, currency: 'TND',
      startDate: new Date('2023-01-01'), endDate: null,
      expectedReturn: 5.5, riskLevel: 'LOW', status: 'ACTIVE',
      accountId: accOuertaniEpId, metadata: {}, createdAt: new Date('2023-01-01'), updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: babouId, type: 'BONDS', name: 'Obligations STB 2025',
      description: 'Obligations État Tunisien 5 ans',
      initialAmount: 10000, currentValue: 10800, currency: 'TND',
      startDate: new Date('2022-06-01'), endDate: new Date('2027-06-01'),
      expectedReturn: 7.0, riskLevel: 'LOW', status: 'ACTIVE',
      accountId: accBabouId, metadata: {}, createdAt: new Date('2022-06-01'), updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: adminId, type: 'FUNDS', name: 'SICAV STB Gestion',
      description: 'SICAV monétaire STB avec capital garanti',
      initialAmount: 50000, currentValue: 53200, currency: 'TND',
      startDate: new Date('2020-01-01'), endDate: null,
      expectedReturn: 6.0, riskLevel: 'MEDIUM', status: 'ACTIVE',
      accountId: accAdminId, metadata: {}, createdAt: new Date('2020-01-01'), updatedAt: new Date()
    },
  ]);
  console.log('✅ Investments');

  // ─── 18. BUDGETS ─────────────────────────────────────────────────────────
  const budgetStart = monthStart(0);
  const budgetEnd   = new Date(budgetStart.getFullYear(), budgetStart.getMonth()+1, 0);
  await db.collection('budgets').insertMany([
    {
      _id: oid(), employeeId: ouertaniId, name: 'Budget Alimentation', category: 'FOOD',
      amount: 400, period: 'MONTHLY', startDate: budgetStart, endDate: budgetEnd,
      spent: 145, currency: 'TND', isActive: true, alertThreshold: 80,
      createdAt: budgetStart, updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: ouertaniId, name: 'Budget Transport', category: 'TRANSPORT',
      amount: 150, period: 'MONTHLY', startDate: budgetStart, endDate: budgetEnd,
      spent: 90, currency: 'TND', isActive: true, alertThreshold: 80,
      createdAt: budgetStart, updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: ouertaniId, name: 'Budget Factures', category: 'BILLS',
      amount: 300, period: 'MONTHLY', startDate: budgetStart, endDate: budgetEnd,
      spent: 280, currency: 'TND', isActive: true, alertThreshold: 80,
      createdAt: budgetStart, updatedAt: new Date()
    },
    {
      _id: oid(), employeeId: ouertaniId, name: 'Budget Shopping', category: 'SHOPPING',
      amount: 500, period: 'MONTHLY', startDate: budgetStart, endDate: budgetEnd,
      spent: 0, currency: 'TND', isActive: true, alertThreshold: 80,
      createdAt: budgetStart, updatedAt: new Date()
    },
  ]);
  console.log('✅ Budgets');

  // ─── 19. CONVERSATIONS & MESSAGES ────────────────────────────────────────
  await db.collection('conversations').insertMany([
    {
      _id: convAdminOuertaniId, type: 'DIRECT',
      participants: [adminId, ouertaniId],
      title: null, description: null,
      lastMessageAt: daysAgo(1), lastMessagePreview: 'Votre demande a été traitée.',
      createdBy: adminId, isActive: true, metadata: {},
      createdAt: daysAgo(20), updatedAt: daysAgo(1)
    },
    {
      _id: convGroupId, type: 'GROUP',
      participants: [adminId, ouertaniId, babouId, monirId],
      title: 'Équipe STB Digital', description: 'Canal officiel équipe IT & Finance',
      lastMessageAt: daysAgo(0), lastMessagePreview: 'Réunion demain 10h salle A.',
      createdBy: adminId, isActive: true, metadata: {},
      createdAt: daysAgo(60), updatedAt: daysAgo(0)
    },
  ]);
  await db.collection('messages').insertMany([
    {
      _id: oid(), conversationId: convAdminOuertaniId, senderId: adminId, recipientId: ouertaniId,
      content: 'Bonjour Yassine, votre demande de congé a été approuvée.', type: 'TEXT',
      attachments: [], isRead: true, readAt: daysAgo(10), isDeleted: false, deletedAt: null, metadata: {},
      createdAt: daysAgo(10), updatedAt: daysAgo(10)
    },
    {
      _id: oid(), conversationId: convAdminOuertaniId, senderId: ouertaniId, recipientId: adminId,
      content: 'Merci beaucoup ! À bientôt.', type: 'TEXT',
      attachments: [], isRead: true, readAt: daysAgo(9), isDeleted: false, deletedAt: null, metadata: {},
      createdAt: daysAgo(9), updatedAt: daysAgo(9)
    },
    {
      _id: oid(), conversationId: convAdminOuertaniId, senderId: adminId, recipientId: ouertaniId,
      content: 'Votre demande a été traitée.', type: 'TEXT',
      attachments: [], isRead: false, readAt: null, isDeleted: false, deletedAt: null, metadata: {},
      createdAt: daysAgo(1), updatedAt: daysAgo(1)
    },
    {
      _id: oid(), conversationId: convGroupId, senderId: adminId, recipientId: ouertaniId,
      content: 'Bonjour équipe, rappel réunion demain 10h00 salle A — présence obligatoire.', type: 'TEXT',
      attachments: [], isRead: false, readAt: null, isDeleted: false, deletedAt: null, metadata: {},
      createdAt: new Date(), updatedAt: new Date()
    },
  ]);
  console.log('✅ Conversations + Messages');

  // ─── FINAL SUMMARY ───────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log('🎉  ALL COLLECTIONS SEEDED SUCCESSFULLY!');
  console.log('══════════════════════════════════════════════════════');
  console.log('👤  Employees    : 4  (Admin RH, Ouertani, Babou, Monir)');
  console.log('🏦  Accounts     : 5  (Courant + Epargne)');
  console.log('💳  Cards        : 2  (Visa + Mastercard)');
  console.log('💸  Transactions : ' + transactions.length + '  (6 months history)');
  console.log('📋  Requests     : 6  (Congé, Avance, Prime)');
  console.log('🔔  Notifications: 8');
  console.log('🌴  Leave        : 4 balances + 2 requests');
  console.log('🎁  Primes       : 3');
  console.log('🏛️   Credits      : 2 + 3 payments');
  console.log('💰  Payrolls     : 8  (current + previous month)');
  console.log('📱  Devices      : 3');
  console.log('📊  Audit Logs   : 5');
  console.log('⚠️   Risk Alerts  : 3');
  console.log('🕵️   Fraud Dets   : 1');
  console.log('📈  Investments  : 3');
  console.log('💹  Budgets      : 4');
  console.log('💬  Conversations: 2 + 4 messages');
  console.log('🏢  Branches     : 2');
  console.log('🏗️   Departments  : 4');
  console.log('══════════════════════════════════════════════════════');
  console.log('\n🔑  LOGIN CREDENTIALS:');
  console.log('   Admin RH  : RH001   / Admin123!');
  console.log('   Yassine   : EMP1001 / Azerty123!');
  console.log('   Babou     : EMP1002 / Azerty123!');
  console.log('   Monir     : EMP1003 / Azerty123!');
  console.log('   PIN Code  : 123456  (all employees)');
  console.log('══════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error('❌ Seed Error:', err.message); mongoose.disconnect(); });
