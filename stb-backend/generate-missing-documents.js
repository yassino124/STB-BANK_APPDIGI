/**
 * Script pour générer les documents manquants pour tous les employés existants
 */
const { MongoClient, ObjectId } = require('mongodb');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'stb_bank';

async function generateMissingDocuments() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const employeesCollection = db.collection('employees');
    const documentsCollection = db.collection('employeedocuments');
    const templatesCollection = db.collection('documenttemplates');
    
    // Get all employees
    const employees = await employeesCollection.find({}).toArray();
    console.log(`👥 Found ${employees.length} employees`);
    
    // Get all templates
    const templates = await templatesCollection.find({ isActive: true }).toArray();
    console.log(`📄 Found ${templates.length} templates`);
    
    if (templates.length === 0) {
      console.log('⚠️  No templates found! Initialize them first.');
      return;
    }
    
    // Documents directory
    const docsDir = path.join(__dirname, 'uploads', 'documents');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    let totalGenerated = 0;
    
    for (const emp of employees) {
      console.log(`\n👤 Processing ${emp.prenom} ${emp.nom} (${emp.matricule})...`);
      
      // Check what documents already exist
      const existingDocs = await documentsCollection.find({
        employeeId: emp._id
      }).toArray();
      
      const existingTypes = existingDocs.map(d => d.type);
      console.log(`  📋 Already has: ${existingTypes.join(', ') || 'none'}`);
      
      // Generate missing onboarding documents
      const onboardingTypes = ['CONTRAT_CDI', 'ATTESTATION_EMBAUCHE'];
      
      for (const docType of onboardingTypes) {
        if (existingTypes.includes(docType)) {
          console.log(`  ⏭️  Skipping ${docType} (already exists)`);
          continue;
        }
        
        const template = templates.find(t => t.type === docType);
        if (!template) {
          console.log(`  ⚠️  Template ${docType} not found`);
          continue;
        }
        
        try {
          // Generate PDF
          const filename = `${docType}_${emp.matricule}_${Date.now()}.pdf`;
          const filePath = path.join(docsDir, filename);
          
          // Create simple PDF with employee data
          const doc = new PDFDocument();
          const writeStream = fs.createWriteStream(filePath);
          doc.pipe(writeStream);
          
          // Add logo if exists
          const logoPath = path.join(__dirname, 'public', 'logo for splash.png');
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, 50, 45, { width: 80 });
          }
          
          // Title
          doc.fontSize(20).text('STB BANK', 200, 50);
          doc.fontSize(16).text(template.name, 200, 80);
          
          // Replace variables in template
          let content = template.template;
          const variables = {
            nomComplet: `${emp.prenom} ${emp.nom}`,
            matricule: emp.matricule,
            cin: emp.cin || '00000000',
            poste: emp.poste || 'Collaborateur',
            direction: emp.direction || 'N/A',
            branchId: emp.branchId || 'Siège',
            salaire: `${emp.salaireBase || 0} TND`,
            dateEmbauche: emp.dateEmbauche ? new Date(emp.dateEmbauche).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'),
            dateAujourdHui: new Date().toLocaleDateString('fr-FR'),
            adresse: emp.adresse || 'N/A',
          };
          
          for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
          }
          
          // Add content
          doc.fontSize(11).text(content, 50, 150, {
            width: 500,
            align: 'left',
          });
          
          doc.end();
          
          await new Promise((resolve) => writeStream.on('finish', resolve));
          
          // Save to database
          await documentsCollection.insertOne({
            employeeId: emp._id,
            type: docType,
            filename,
            filePath: `/uploads/documents/${filename}`,
            status: 'GENERATED',
            metadata: {},
            generatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          
          console.log(`  ✅ Generated ${docType}`);
          totalGenerated++;
          
        } catch (error) {
          console.error(`  ❌ Failed to generate ${docType}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Done! Generated ${totalGenerated} documents total.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

// Run the script
generateMissingDocuments().catch(console.error);
