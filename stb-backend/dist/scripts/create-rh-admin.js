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
    const existing = await empColl.findOne({ matricule: 'RH002' });
    if (existing) {
        console.log('⚠️  RH002 already exists!');
        await mongoose_1.default.disconnect();
        return;
    }
    const password = 'Admin123!';
    const pin = '9999';
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS);
    const newAdmin = {
        matricule: 'RH002',
        nom: 'SuperAdmin',
        prenom: 'RH',
        cin: '99999999',
        dateNaissance: new Date('1990-01-01'),
        telephone: '+21699999999',
        email: 'rhadmin@stb.tn',
        role: 'SUPER_ADMIN',
        roles: ['EMPLOYEE', 'RH', 'ADMIN', 'SUPER_ADMIN'],
        departement: 'Direction Générale',
        poste: 'Directeur Général RH',
        dateEmbauche: new Date('2020-01-01'),
        soldeConge: 30,
        soldeMaladie: 15,
        soldeExceptionnel: 10,
        status: 'ACTIVE',
        isActivated: true,
        password: hashedPassword,
        pin: hashedPin,
        biometricEnabled: false,
        faceEnabled: false,
        fingerEnabled: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
        passwordChangedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    await empColl.insertOne(newAdmin);
    console.log('\n🎉 NEW RH ADMIN CREATED!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 MATRICULE:     RH002');
    console.log('🔐 PASSWORD:      Admin123!');
    console.log('🔢 PIN:           9999');
    console.log('📧 EMAIL:         rhadmin@stb.tn');
    console.log('🔑 CIN:           99999999');
    console.log('📅 DATE NAISS:    01/01/1990');
    console.log('📱 TÉLÉPHONE:     +21699999999');
    console.log('👑 ROLE:          SUPER_ADMIN');
    console.log('═══════════════════════════════════════\n');
    console.log('✅ Account activated and ready!\n');
    const created = await empColl.findOne({ matricule: 'RH002' });
    if (created) {
        const pwdMatch = await bcrypt.compare(password, created.password);
        const pinMatch = await bcrypt.compare(pin, created.pin);
        console.log('🔍 Verification:');
        console.log('   Password match:', pwdMatch ? '✅' : '❌');
        console.log('   PIN match:', pinMatch ? '✅' : '❌');
    }
    await mongoose_1.default.disconnect();
}
main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
//# sourceMappingURL=create-rh-admin.js.map