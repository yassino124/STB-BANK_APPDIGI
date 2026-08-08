/**
 * Script pour mettre à jour tous les soldes de congés de 90 jours à 30 jours
 * Usage: node update-leave-balance-to-30.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connecté à MongoDB\n');

    const LeaveBalance = mongoose.connection.collection('leavebalances');

    // 1. Compter les soldes actuels à 90 jours
    const count90 = await LeaveBalance.countDocuments({ soldeAnnuel: 90 });
    console.log(`📊 Soldes actuellement à 90 jours : ${count90}`);

    if (count90 === 0) {
      console.log('✅ Aucun solde à mettre à jour.');
      await mongoose.connection.close();
      return;
    }

    // 2. Mettre à jour tous les soldes de 90 → 30
    const result = await LeaveBalance.updateMany(
      { soldeAnnuel: 90 },
      { $set: { soldeAnnuel: 30 } }
    );

    console.log(`✅ ${result.modifiedCount} solde(s) mis à jour de 90 → 30 jours\n`);

    // 3. Afficher quelques exemples
    const samples = await LeaveBalance.find({}).limit(5).toArray();
    console.log('📋 Exemples de soldes après mise à jour :');
    samples.forEach(s => {
      const disponible = s.soldeAnnuel - s.soldeUtilise + (s.soldeReporte || 0);
      console.log(`  - Employé ${s.employeeId}: ${s.soldeAnnuel} jours annuels, ${s.soldeUtilise} utilisés, ${disponible} disponibles`);
    });

    console.log('\n✅ Mise à jour terminée avec succès !');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur :', error);
    process.exit(1);
  }
}

main();
