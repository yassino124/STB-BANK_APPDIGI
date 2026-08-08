/**
 * Script pour corriger les salaires des employés existants
 * 
 * Problème: Les employés créés avant avaient salaireBase = 1200 DT par défaut
 * Solution: Attribuer des salaires réalistes selon le poste
 * 
 * Usage: node scripts/fix-employee-salaries.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/stb_db';

// Mapping poste → salaire réaliste
const SALARY_BY_ROLE = {
  // Direction & Management
  'Directeur Général': 8000,
  'Directeur': 6000,
  'Directeur Adjoint': 5000,
  'Chef de Département': 4500,
  'Chef de Service': 3500,
  'Manager': 3200,
  'Responsable': 3000,
  
  // IT & Tech
  'Développeur Senior': 3500,
  'Développeur': 2500,
  'Développeur Junior': 1800,
  'Tech Lead': 4000,
  'Architecte': 4500,
  'DevOps': 3200,
  'Administrateur Système': 3000,
  
  // Finance & Banque
  'Analyste Financier': 3200,
  'Comptable': 2200,
  'Auditeur': 3000,
  'Conseiller Financier': 2800,
  'Agent de Crédit': 2500,
  'Caissier': 1600,
  
  // RH
  'Responsable RH': 3500,
  'Gestionnaire RH': 2500,
  'Assistant RH': 1800,
  
  // Commercial & Vente
  'Responsable Commercial': 3800,
  'Commercial': 2200,
  'Chargé de Clientèle': 2000,
  
  // Support & Administration
  'Assistant': 1500,
  'Secrétaire': 1600,
  'Agent Administratif': 1700,
  'Technicien': 2000,
  
  // Default
  'Employé': 1800,
  'default': 2000, // Si poste inconnu
};

// Function pour trouver le salaire selon le poste
function getSalaryForPosition(poste, roles) {
  if (!poste) {
    // Basé sur les rôles
    if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) return 7000;
    if (roles.includes('DIRECTOR')) return 6000;
    if (roles.includes('MANAGER')) return 3500;
    if (roles.includes('RH')) return 3000;
    if (roles.includes('FINANCE')) return 3200;
    if (roles.includes('AGENCE')) return 2800;
    return 2000; // EMPLOYEE default
  }
  
  const posteLower = poste.toLowerCase();
  
  // Exact match
  for (const [key, salary] of Object.entries(SALARY_BY_ROLE)) {
    if (posteLower === key.toLowerCase()) {
      return salary;
    }
  }
  
  // Partial match (contains)
  for (const [key, salary] of Object.entries(SALARY_BY_ROLE)) {
    if (posteLower.includes(key.toLowerCase()) || key.toLowerCase().includes(posteLower)) {
      return salary;
    }
  }
  
  // Default based on role
  if (roles.includes('ADMIN')) return 7000;
  if (roles.includes('DIRECTOR')) return 6000;
  if (roles.includes('MANAGER')) return 3500;
  if (roles.includes('RH')) return 3000;
  if (roles.includes('FINANCE')) return 3200;
  if (roles.includes('AGENCE')) return 2800;
  
  return SALARY_BY_ROLE.default;
}

async function fixEmployeeSalaries() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false, collection: 'employees' }));
    
    // Récupérer tous les employés
    const employees = await Employee.find({});
    console.log(`📊 ${employees.length} employés trouvés\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const emp of employees) {
      const currentSalary = emp.salaireBase || 0;
      
      // Si salaire déjà > 1200, on skip (déjà configuré)
      if (currentSalary > 1200) {
        console.log(`⏭️  ${emp.matricule} - ${emp.prenom} ${emp.nom} - Salaire déjà configuré: ${currentSalary} TND`);
        skipped++;
        continue;
      }
      
      // Calculer nouveau salaire
      const newSalary = getSalaryForPosition(emp.poste, emp.roles || ['EMPLOYEE']);
      
      // Update
      await Employee.updateOne(
        { _id: emp._id },
        { $set: { salaireBase: newSalary } }
      );
      
      console.log(`✅ ${emp.matricule} - ${emp.prenom} ${emp.nom} [${emp.poste || 'N/A'}] - ${currentSalary} → ${newSalary} TND`);
      updated++;
    }
    
    console.log(`\n📈 Résumé:`);
    console.log(`   ✅ ${updated} employés mis à jour`);
    console.log(`   ⏭️  ${skipped} employés ignorés (salaire > 1200)`);
    console.log(`   📊 Total: ${employees.length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Script terminé avec succès!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run
fixEmployeeSalaries();
