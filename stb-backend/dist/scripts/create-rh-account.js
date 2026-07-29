"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt = __importStar(require("bcrypt"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';
const SALT_ROUNDS = 12;
async function main() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const empColl = mongoose_1.default.connection.collection('employees');
    const existing = await empColl.findOne({ matricule: 'RH001' });
    if (existing) {
        console.log('⚠️  RH account already exists!');
        console.log('📋 Matricule: RH001');
        console.log('🔑 CIN: 12345678');
        console.log('📅 Date de naissance: 1990-01-01');
        console.log('📧 Email: rh@stb.tn');
        console.log('📱 Téléphone: +21612345678');
        if (existing.isActivated) {
            console.log('✅ Compte activé');
            console.log('🔐 Password: StbRH2024!');
            console.log('🔢 PIN: 1234');
        }
        else {
            console.log('⚠️  Compte non activé - Utilisez l\'app pour l\'activer');
        }
        await mongoose_1.default.disconnect();
        return;
    }
    const hashedPassword = await bcrypt.hash('StbRH2024!', SALT_ROUNDS);
    const hashedPin = await bcrypt.hash('1234', SALT_ROUNDS);
    const rhAccount = {
        matricule: 'RH001',
        nom: 'Admin',
        prenom: 'RH',
        cin: '12345678',
        dateNaissance: new Date('1990-01-01'),
        telephone: '+21612345678',
        email: 'rh@stb.tn',
        role: 'RH',
        departement: 'Ressources Humaines',
        poste: 'Responsable RH',
        dateEmbauche: new Date('2020-01-01'),
        soldeConge: 30,
        soldeMaladie: 15,
        soldeExceptionnel: 10,
        status: 'ACTIVE',
        isActivated: true,
        password: hashedPassword,
        pin: hashedPin,
        biometricEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await empColl.insertOne(rhAccount);
    console.log('\n🎉 RH Account créé avec succès!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 MATRICULE:     RH001');
    console.log('🔐 PASSWORD:      StbRH2024!');
    console.log('🔢 PIN:           1234');
    console.log('📧 EMAIL:         rh@stb.tn');
    console.log('🔑 CIN:           12345678');
    console.log('📅 DATE NAISS:    01/01/1990');
    console.log('📱 TÉLÉPHONE:     +21612345678');
    console.log('═══════════════════════════════════════\n');
    console.log('✅ Compte activé et prêt à utiliser!');
    console.log('🚀 Connectez-vous avec matricule + password\n');
    await mongoose_1.default.disconnect();
}
main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
//# sourceMappingURL=create-rh-account.js.map