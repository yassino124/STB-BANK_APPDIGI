/**
 * Script rapide pour initialiser les templates et générer des documents pour tous les employés
 */
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/stb_bank';

// Schemas
const DocumentTemplateSchema = new mongoose.Schema({
  type: String,
  name: String,
  description: String,
  template: String,
  variables: [String],
  isActive: Boolean,
}, { timestamps: true });

const EmployeeDocumentSchema = new mongoose.Schema({
  employeeId: mongoose.Schema.Types.ObjectId,
  type: String,
  filename: String,
  filePath: String,
  status: String,
  metadata: Object,
  generatedAt: Date,
}, { timestamps: true });

const DocumentTemplate = mongoose.model('DocumentTemplate', DocumentTemplateSchema);
const EmployeeDocument = mongoose.model('EmployeeDocument', EmployeeDocumentSchema);
const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }), 'employees');

async function fixDocumentsSystem() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // 1. Initialize templates
    console.log('\n📄 Step 1: Initializing templates...');
    
    const templates = [
      {
        type: 'CONTRAT_CDI',
        name: 'Contrat de Travail à Durée Indéterminée',
        description: 'Contrat CDI standard',
        template: `CONTRAT DE TRAVAIL À DURÉE INDÉTERMINÉE

STB BANK - Société Tunisienne de Banque

Entre les soussignés :
STB BANK, représentée par son Directeur des Ressources Humaines

Et

{{nomComplet}}
Matricule : {{matricule}}
CIN : {{cin}}

IL A ÉTÉ CONVENU ET ARRÊTÉ CE QUI SUIT :

Article 1 - Engagement
L'Employeur engage le Salarié en qualité de {{poste}} au sein de la direction {{direction}}.

Article 2 - Date d'effet
Le présent contrat prendra effet à compter du {{dateEmbauche}}.

Article 3 - Rémunération
Le Salarié percevra une rémunération mensuelle brute de {{salaire}}.

Article 4 - Lieu de travail
Le lieu de travail est fixé à {{branchId}}.

Fait à Tunis, le {{dateAujourdHui}}

Pour l'Employeur                    Le Salarié`,
        variables: ['nomComplet', 'matricule', 'cin', 'poste', 'direction', 'dateEmbauche', 'salaire', 'branchId', 'dateAujourdHui'],
        isActive: true,
      },
      {
        type: 'ATTESTATION_EMBAUCHE',
        name: 'Attestation d\'Embauche',
        description: 'Attestation d\'embauche standard',
        template: `ATTESTATION D'EMBAUCHE

STB BANK - Société Tunisienne de Banque

Je soussigné, Directeur des Ressources Humaines de STB BANK, certifie que :

{{nomComplet}}
Matricule : {{matricule}}
CIN : {{cin}}

A été embauché(e) au sein de notre établissement en qualité de {{poste}} à compter du {{dateEmbauche}}.

Direction : {{direction}}
Agence : {{branchId}}
Type de contrat : Contrat à Durée Indéterminée (CDI)

Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.

Fait à Tunis, le {{dateAujourdHui}}

Le Directeur des Ressources Humaines
STB BANK`,
        variables: ['nomComplet', 'matricule', 'cin', 'poste', 'dateEmbauche', 'direction', 'branchId', 'dateAujourdHui'],
        isActive: true,
      },
      {
        type: 'ATTESTATION_TRAVAIL',
        name: 'Attestation de Travail',
        description: 'Attestation de travail standard',
        template: `ATTESTATION DE TRAVAIL

STB BANK - Société Tunisienne de Banque

Je soussigné, Directeur des Ressources Humaines de STB BANK, certifie que :

{{nomComplet}}
Matricule : {{matricule}}
CIN : {{cin}}

Est employé(e) au sein de notre établissement en qualité de {{poste}} depuis le {{dateEmbauche}}.

Cette attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.

Fait à Tunis, le {{dateAujourdHui}}

Le Directeur des Ressources Humaines
STB BANK`,
        variables: ['nomComplet', 'matricule', 'cin', 'poste', 'dateEmbauche', 'dateAujourdHui'],
        isActive: true,
      },
    ];
    
    for (const template of templates) {
      await DocumentTemplate.findOneAndUpdate(
        { type: template.type },
        template,
        { upsert: true, new: true }
      );
      console.log(`  ✅ Template ${template.type} saved`);
    }
    
    // 2. Generate documents for all employees
    console.log('\n👥 Step 2: Generating documents for employees...');
    
    const employees = await Employee.find({}).lean();
    console.log(`  Found ${employees.length} employees`);
    
    if (employees.length === 0) {
      console.log('  ⚠️  No employees found. Create some employees first!');
      await mongoose.disconnect();
      return;
    }
    
    let totalGenerated = 0;
    
    for (const emp of employees) {
      console.log(`\n  👤 ${emp.prenom} ${emp.nom} (${emp.matricule})`);
      
      // Check existing documents
      const existingDocs = await EmployeeDocument.find({ employeeId: emp._id }).lean();
      const existingTypes = existingDocs.map(d => d.type);
      
      if (existingTypes.length > 0) {
        console.log(`     Already has: ${existingTypes.join(', ')}`);
      }
      
      // Generate CONTRAT_CDI and ATTESTATION_EMBAUCHE
      const docsToGenerate = ['CONTRAT_CDI', 'ATTESTATION_EMBAUCHE'];
      
      for (const docType of docsToGenerate) {
        if (existingTypes.includes(docType)) {
          console.log(`     ⏭️  ${docType} already exists`);
          continue;
        }
        
        const filename = `${docType}_${emp.matricule}_${Date.now()}.txt`;
        const filePath = `/uploads/documents/${filename}`;
        
        await EmployeeDocument.create({
          employeeId: emp._id,
          type: docType,
          filename,
          filePath,
          status: 'GENERATED',
          metadata: {
            employeeName: `${emp.prenom} ${emp.nom}`,
            matricule: emp.matricule,
            poste: emp.poste || 'Collaborateur',
          },
          generatedAt: new Date(),
        });
        
        console.log(`     ✅ Generated ${docType}`);
        totalGenerated++;
      }
    }
    
    console.log(`\n✅ Done! Generated ${totalGenerated} documents total.`);
    console.log('\n📱 Now check the mobile app - documents should appear!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run
fixDocumentsSystem();
