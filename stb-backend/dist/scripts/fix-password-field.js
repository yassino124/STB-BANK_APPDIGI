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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';
async function main() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    const empColl = mongoose_1.default.connection.collection('employees');
    const employees = await empColl.find({ password: { $exists: true } }).toArray();
    console.log(`📋 Found ${employees.length} employees with 'password' field`);
    if (employees.length === 0) {
        console.log('✅ No migration needed - all fields already correct!');
        await mongoose_1.default.disconnect();
        return;
    }
    for (const emp of employees) {
        const updates = {};
        if (emp.password) {
            updates.passwordHash = emp.password;
            updates.$unset = { password: '' };
        }
        if (emp.pin) {
            updates.pinHash = emp.pin;
            if (!updates.$unset)
                updates.$unset = {};
            updates.$unset.pin = '';
        }
        if (Object.keys(updates).length > 0) {
            const unsetFields = updates.$unset;
            delete updates.$unset;
            await empColl.updateOne({ _id: emp._id }, {
                $set: updates,
                ...(unsetFields && { $unset: unsetFields })
            });
            console.log(`✅ Migrated ${emp.matricule}`);
        }
    }
    console.log('\n🎉 Migration completed successfully!');
    console.log('Field names updated:');
    console.log('  password → passwordHash');
    console.log('  pin → pinHash\n');
    await mongoose_1.default.disconnect();
}
main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
//# sourceMappingURL=fix-password-field.js.map