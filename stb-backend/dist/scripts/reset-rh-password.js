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
    const rhAccount = await empColl.findOne({ matricule: 'RH001' });
    if (!rhAccount) {
        console.log('❌ RH account not found!');
        await mongoose_1.default.disconnect();
        return;
    }
    console.log('📋 Found RH account:');
    console.log('   Matricule:', rhAccount.matricule);
    console.log('   CIN:', rhAccount.cin);
    console.log('   Email:', rhAccount.email);
    console.log('   Date Naissance:', rhAccount.dateNaissance);
    console.log('   Activated:', rhAccount.isActivated);
    const newPassword = 'StbRH2024!';
    const newPin = '1234';
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const hashedPin = await bcrypt.hash(newPin, SALT_ROUNDS);
    await empColl.updateOne({ matricule: 'RH001' }, {
        $set: {
            password: hashedPassword,
            pin: hashedPin,
            isActivated: true,
            status: 'ACTIVE',
            failedLoginAttempts: 0,
            lockedUntil: null,
            updatedAt: new Date(),
        }
    });
    console.log('\n✅ Password reset successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 MATRICULE:     RH001');
    console.log('🔐 NEW PASSWORD:  StbRH2024!');
    console.log('🔢 NEW PIN:       1234');
    console.log('📧 EMAIL:         ' + rhAccount.email);
    console.log('🔑 CIN:           ' + rhAccount.cin);
    console.log('═══════════════════════════════════════\n');
    const updated = await empColl.findOne({ matricule: 'RH001' });
    if (updated) {
        const passwordMatch = await bcrypt.compare(newPassword, updated.password);
        const pinMatch = await bcrypt.compare(newPin, updated.pin);
        console.log('🔍 Verification:');
        console.log('   Password match:', passwordMatch ? '✅' : '❌');
        console.log('   PIN match:', pinMatch ? '✅' : '❌');
    }
    await mongoose_1.default.disconnect();
}
main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
//# sourceMappingURL=reset-rh-password.js.map