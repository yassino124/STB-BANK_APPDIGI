const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/stb_db');
  console.log('Connected to MongoDB');

  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const employeeHash = await bcrypt.hash('Azerty123', 12);
  const pinHash = await bcrypt.hash('123456', 12);

  // Drop collections to be clean
  await mongoose.connection.db.dropDatabase();
  console.log('Database dropped, starting fresh seed...');

  const Employee = mongoose.connection.collection('employees');
  const Account = mongoose.connection.collection('accounts');
  const Card = mongoose.connection.collection('cards');
  const Transaction = mongoose.connection.collection('transactions');
  const Request = mongoose.connection.collection('requests');
  const Notification = mongoose.connection.collection('notifications');
  
  const adminId = new mongoose.Types.ObjectId();
  const ouertaniId = new mongoose.Types.ObjectId();
  const babouId = new mongoose.Types.ObjectId();
  const monirId = new mongoose.Types.ObjectId();

  // 1. EMPLOYEES
  await Employee.insertMany([
    {
      _id: adminId,
      matricule: 'RH001',
      cin: '11111111',
      email: 'admin@stb.tn',
      nom: 'Admin',
      prenom: 'RH',
      passwordHash: passwordHash,
      pinHash: pinHash,
      roles: ['SUPER_ADMIN', 'RH', 'EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 150000,
      salaireBase: 5000,
      soldeConges: 30,
      creditsEnCours: 0,
      prime: 1500,
      departement: 'Ressources Humaines',
      poste: 'Directeur RH',
      agence: 'Siège STB',
      dateEmbauche: new Date('2015-01-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: ouertaniId,
      matricule: 'EMP1001',
      cin: '22222222',
      email: 'employee@stb.tn',
      nom: 'Ouertani',
      prenom: 'Yassine',
      passwordHash: employeeHash,
      pinHash: pinHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 2390,
      salaireBase: 2500,
      soldeConges: 24,
      creditsEnCours: 5000,
      prime: 800,
      departement: 'IT & Digital',
      poste: 'Ingénieur Logiciel',
      agence: 'Siège STB',
      dateEmbauche: new Date('2022-09-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: babouId,
      matricule: 'EMP1002',
      cin: '33333333',
      email: 'babou@stb.tn',
      nom: 'Babou',
      prenom: 'Ali',
      passwordHash: employeeHash,
      pinHash: pinHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 10500,
      salaireBase: 3000,
      soldeConges: 15,
      creditsEnCours: 0,
      prime: 0,
      departement: 'Finance',
      poste: 'Analyste Financier',
      agence: 'Agence Centrale',
      dateEmbauche: new Date('2020-05-10'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: monirId,
      matricule: 'EMP1003',
      cin: '44444444',
      email: 'monir@stb.tn',
      nom: 'Ouertani',
      prenom: 'Monir',
      passwordHash: employeeHash,
      pinHash: pinHash,
      roles: ['EMPLOYEE'],
      status: 'ACTIVE',
      isActivated: true,
      compteSolde: 12000,
      salaireBase: 2800,
      soldeConges: 18,
      creditsEnCours: 2000,
      prime: 500,
      departement: 'Commercial',
      poste: 'Chef d\'agence',
      agence: 'Agence Lac 2',
      dateEmbauche: new Date('2018-03-20'),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('Employees seeded');

  // 2. ACCOUNTS
  const ouertaniCourantId = new mongoose.Types.ObjectId();
  const ouertaniEpargneId = new mongoose.Types.ObjectId();
  const adminAccountId = new mongoose.Types.ObjectId();
  const babouAccountId = new mongoose.Types.ObjectId();
  const monirAccountId = new mongoose.Types.ObjectId();

  await Account.insertMany([
    {
      _id: adminAccountId, employeeId: adminId, type: 'COURANT',
      rib: '10001234567890123456', solde: 150000, status: 'ACTIVE', isPrimary: true,
      currency: 'TND', createdAt: new Date(), updatedAt: new Date()
    },
    {
      _id: ouertaniCourantId, employeeId: ouertaniId, type: 'COURANT',
      rib: '10009876543210987654', solde: 2390, status: 'ACTIVE', isPrimary: true,
      currency: 'TND', createdAt: new Date(), updatedAt: new Date()
    },
    {
      _id: ouertaniEpargneId, employeeId: ouertaniId, type: 'EPARGNE',
      rib: '10009876543210987777', solde: 15000, status: 'ACTIVE', isPrimary: false,
      currency: 'TND', createdAt: new Date(), updatedAt: new Date()
    },
    {
      _id: babouAccountId, employeeId: babouId, type: 'COURANT',
      rib: '10005555555555555555', solde: 10500, status: 'ACTIVE', isPrimary: true,
      currency: 'TND', createdAt: new Date(), updatedAt: new Date()
    },
    {
      _id: monirAccountId, employeeId: monirId, type: 'COURANT',
      rib: '10004444444444444444', solde: 12000, status: 'ACTIVE', isPrimary: true,
      currency: 'TND', createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('Accounts seeded');

  // 3. CARDS
  await Card.insertMany([
    {
      _id: new mongoose.Types.ObjectId(), employeeId: ouertaniId, accountId: ouertaniCourantId,
      cardNumber: '5321456789012345', maskedNumber: '**** **** **** 2345', type: 'DEBIT',
      expirationDate: '12/28', cvv: '123', status: 'ACTIVE', isLocked: false, isVirtual: false,
      dailyLimit: 2000, monthlyLimit: 10000, pinHash: pinHash, createdAt: new Date(), updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(), employeeId: babouId, accountId: babouAccountId,
      cardNumber: '4111111111111111', maskedNumber: '**** **** **** 1111', type: 'CREDIT',
      expirationDate: '05/27', cvv: '999', status: 'ACTIVE', isLocked: false, isVirtual: false,
      dailyLimit: 5000, monthlyLimit: 20000, pinHash: pinHash, createdAt: new Date(), updatedAt: new Date()
    }
  ]);
  console.log('Cards seeded');

  // 4. TRANSACTIONS (Rich data for Yassine Ouertani to see beautiful Analytics & History)
  const txs = [];
  const now = new Date();
  
  // Salary (Revenu)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, montant: 2500, type: 'SALARY', category: 'SALARY',
    status: 'COMPLETED', description: 'Virement Salaire Juin', date: new Date(now.getFullYear(), now.getMonth(), 1),
    reference: 'SAL-001', createdAt: new Date(), updatedAt: new Date()
  });

  // Prime (Revenu)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, montant: 800, type: 'PRIME', category: 'INCOME',
    status: 'COMPLETED', description: 'Prime de rendement', date: new Date(now.getFullYear(), now.getMonth(), 5),
    reference: 'PRM-001', createdAt: new Date(), updatedAt: new Date()
  });

  // Food Expense (Dépense)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, montant: 45, type: 'PAYMENT', category: 'FOOD',
    status: 'COMPLETED', description: 'Paiement Monoprix', date: new Date(now.getFullYear(), now.getMonth(), 10),
    reference: 'PAY-001', merchantName: 'Monoprix', location: 'Tunis', createdAt: new Date(), updatedAt: new Date()
  });

  // Shopping Expense (Dépense)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, montant: 120, type: 'PAYMENT', category: 'SHOPPING',
    status: 'COMPLETED', description: 'Zara Tunis', date: new Date(now.getFullYear(), now.getMonth(), 12),
    reference: 'PAY-002', merchantName: 'Zara', location: 'Tunis', createdAt: new Date(), updatedAt: new Date()
  });

  // Transfer to Monir (Dépense)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, to: monirId, toAccountId: monirAccountId,
    montant: 50, type: 'TRANSFER', category: 'TRANSFER', status: 'COMPLETED',
    description: 'Virement vers Ouertani Monir', date: new Date(now.getFullYear(), now.getMonth(), 15),
    reference: 'TRF-001', createdAt: new Date(), updatedAt: new Date()
  });

  // Bill Payment (Dépense)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, montant: 80, type: 'BILL_PAYMENT', category: 'BILLS',
    status: 'COMPLETED', description: 'Facture STEG', date: new Date(now.getFullYear(), now.getMonth(), 18),
    reference: 'STEG-001', merchantName: 'STEG', createdAt: new Date(), updatedAt: new Date()
  });

  // Avance (Revenu exceptionnel)
  txs.push({
    employeeId: ouertaniId, accountId: ouertaniCourantId, montant: 500, type: 'DEPOSIT', category: 'INCOME',
    status: 'COMPLETED', description: 'Avance sur salaire', date: new Date(now.getFullYear(), now.getMonth(), 20),
    reference: 'AVN-001', createdAt: new Date(), updatedAt: new Date()
  });

  await Transaction.insertMany(txs);
  console.log('Transactions seeded');

  // 5. REQUESTS (HR Requests)
  await Request.insertMany([
    {
      _id: new mongoose.Types.ObjectId(), employeeId: ouertaniId, type: 'CONGE', status: 'APPROUVE',
      payload: { startDate: '2026-08-01', endDate: '2026-08-15', days: 10, reason: 'Vacances d\'été' },
      createdAt: new Date(now.getTime() - 86400000 * 5), updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(), employeeId: babouId, type: 'AVANCE', status: 'EN_ATTENTE',
      payload: { amount: 300, reason: 'Réparation voiture' },
      createdAt: new Date(now.getTime() - 86400000 * 2), updatedAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(), employeeId: monirId, type: 'PRIME', status: 'APPROUVE',
      payload: { amount: 500, reason: 'Objectif atteint' },
      createdAt: new Date(now.getTime() - 86400000 * 10), updatedAt: new Date()
    }
  ]);
  console.log('Requests seeded');

  // 6. NOTIFICATIONS
  await Notification.insertMany([
    {
      _id: new mongoose.Types.ObjectId(), employeeId: ouertaniId,
      title: 'Congé approuvé', body: 'Votre demande de congé du 01/08 au 15/08 a été approuvée.',
      type: 'REQUEST_UPDATE', isRead: false, createdAt: new Date()
    },
    {
      _id: new mongoose.Types.ObjectId(), employeeId: ouertaniId,
      title: 'Virement reçu', body: 'Votre salaire de 2500 TND a été viré sur votre compte.',
      type: 'TRANSACTION', isRead: true, createdAt: new Date(now.getFullYear(), now.getMonth(), 1)
    },
    {
      _id: new mongoose.Types.ObjectId(), employeeId: adminId,
      title: 'Nouvelle demande', body: 'EMP1002 (Babou Ali) a soumis une demande d\'avance.',
      type: 'NEW_REQUEST', isRead: false, createdAt: new Date()
    }
  ]);
  console.log('Notifications seeded');

  console.log('✅ ALL SEEDED SUCCESSFULLY! YOU CAN LOGIN NOW.');
  mongoose.disconnect();
}

seed().catch(console.error);
