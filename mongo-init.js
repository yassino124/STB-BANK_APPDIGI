// MongoDB initialization script
// Run automatically when the MongoDB container starts for the first time

db = db.getSiblingDB('stb_db');

// Create application user with read/write access to stb_db
db.createUser({
  user: 'stb_app',
  pwd: 'stb_app_password_2024',
  roles: [
    { role: 'readWrite', db: 'stb_db' },
  ],
});

// Create initial collections with validators
db.createCollection('employees', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['matricule', 'cin', 'nom', 'prenom', 'email'],
      properties: {
        matricule: { bsonType: 'string' },
        cin: { bsonType: 'string' },
        nom: { bsonType: 'string' },
        prenom: { bsonType: 'string' },
        email: { bsonType: 'string' },
      }
    }
  }
});

db.createCollection('sessions');
db.createCollection('devices');
db.createCollection('auditlogs');
db.createCollection('otps');

print('✅ STB Database initialized successfully');
print('📊 Collections created: employees, sessions, devices, auditlogs, otps');
