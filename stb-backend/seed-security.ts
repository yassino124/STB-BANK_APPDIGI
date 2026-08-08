import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://yassino124:Yassine0201@cluster0.pld80.mongodb.net/stb_db?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Fetch some employees to attach alerts to
  const employees = await mongoose.connection.db!.collection('employees').find({}).limit(5).toArray();
  
  if (employees.length === 0) {
    console.log('No employees found. Run standard seed first.');
    process.exit(1);
  }

  // Clear existing
  await mongoose.connection.db!.collection('fraud_detections').deleteMany({});
  await mongoose.connection.db!.collection('risk_alerts').deleteMany({});

  const fraudData = [
    {
      employeeId: employees[0]._id,
      type: 'UNUSUAL_TRANSACTION',
      description: 'Virement de 25,000 TND vers compte inconnu détecté',
      riskScore: 92,
      factors: ['Montant très élevé', 'Nouveau destinataire', 'Hors heures ouvrables'],
      status: 'INVESTIGATING',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      employeeId: employees[1]._id,
      type: 'MULTIPLE_LOGINS',
      description: 'Connexion depuis la Tunisie et le Canada en moins de 10 min',
      riskScore: 88,
      factors: ['IP suspecte', 'Distance impossible'],
      status: 'OPEN',
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    },
    {
      employeeId: employees[2]._id,
      type: 'ACCOUNT_ANOMALY',
      description: '3 tentatives de mot de passe erroné',
      riskScore: 45,
      factors: ['Brute force potentielle'],
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
    },
    {
      employeeId: employees[0]._id,
      type: 'LARGE_WITHDRAWAL',
      description: 'Retrait espèce suspect',
      riskScore: 75,
      factors: ['Montant inhabituel'],
      status: 'OPEN',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10)
    }
  ];

  await mongoose.connection.db!.collection('fraud_detections').insertMany(fraudData);

  const riskData = [
    {
      employeeId: employees[1]._id,
      type: 'CREDIT_OVERDUE',
      severity: 'HIGH',
      title: 'Retard de paiement',
      description: 'Retard de 3 mensualités consécutives',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5)
    },
    {
      employeeId: employees[2]._id,
      type: 'ACCOUNT_ANOMALY',
      severity: 'MEDIUM',
      title: 'Solde négatif prolongé',
      description: 'Compte à découvert depuis plus de 15 jours',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    },
    {
      employeeId: employees[3]._id,
      type: 'FOREIGN_TRANSACTION',
      severity: 'LOW',
      title: 'Achat international',
      description: 'Achat en devise étrangère non habituel',
      status: 'RESOLVED',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
    }
  ];

  await mongoose.connection.db!.collection('risk_alerts').insertMany(riskData);

  console.log('Seeded Security Data successfully!');
  process.exit(0);
}

seed().catch(console.error);
