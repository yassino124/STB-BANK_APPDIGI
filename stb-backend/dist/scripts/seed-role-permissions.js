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
const ROLE_PERMISSIONS = {
    EMPLOYEE: [
        'leave:create',
        'leave:read:own',
        'avance:create',
        'avance:read:own',
        'credit:read:own',
        'document:read:own',
        'profile:read:own',
        'absence:create',
        'absence:read:own',
    ],
    MANAGER: [
        'leave:create',
        'leave:read:own',
        'leave:read:team',
        'leave:approve:team',
        'leave:reject:team',
        'avance:create',
        'avance:read:own',
        'credit:read:own',
        'document:read:own',
        'profile:read:own',
        'absence:create',
        'absence:read:own',
        'absence:read:team',
        'absence:approve:team',
        'absence:reject:team',
        'team:view',
        'hierarchy:view',
    ],
    RH: [
        'leave:read:all',
        'leave:read:pending-rh',
        'leave:approve:rh',
        'leave:reject:rh',
        'employee:read:all',
        'employee:create',
        'employee:update',
        'employee:delete',
        'document:read:all',
        'document:generate',
        'payroll:read:all',
        'payroll:generate',
        'avance:read:all',
        'avance:approve:all',
        'absence:read:all',
        'absence:read:pending-rh',
        'absence:approve:rh',
        'absence:reject:rh',
        'department:read',
        'branch:read',
        'report:read',
        'attendance:read',
    ],
    AGENCE: [
        'account:read:all',
        'account:create',
        'account:update',
        'card:read:all',
        'card:update',
        'credit:read:all',
        'credit:approve',
        'credit:reject',
        'avance:read:pending',
        'avance:approve',
        'avance:reject',
        'risk:read',
        'analytics:read',
        'report:read',
    ],
    FINANCE: [
        'payroll:read:all',
        'payroll:generate',
        'payroll:update',
        'budget:read:all',
        'budget:create',
        'budget:update',
        'budget:approve',
        'investment:read:all',
        'investment:create',
        'investment:update',
        'investment:approve',
        'avance:read:pending',
        'avance:approve',
        'avance:reject',
        'report:read',
        'analytics:read',
    ],
    ADMIN: [
        '*',
    ],
    SUPER_ADMIN: [
        '*',
    ],
};
async function main() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'));
    const roleColl = mongoose_1.default.connection.collection('roles');
    const permissionColl = mongoose_1.default.connection.collection('permissions');
    const allPermissions = new Set();
    Object.values(ROLE_PERMISSIONS).forEach((perms) => {
        perms.forEach((p) => {
            if (p !== '*')
                allPermissions.add(p);
        });
    });
    for (const permName of allPermissions) {
        const [resource, action] = permName.split(':');
        await permissionColl.updateOne({ name: permName }, {
            $setOnInsert: {
                name: permName,
                resource,
                action,
                description: `Permission to ${action} ${resource}`,
                isActive: true,
            },
        }, { upsert: true });
    }
    console.log(`✅ Permissions seeded: ${allPermissions.size}`);
    for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
        const permDocs = await permissionColl.find({ name: { $in: permissions.filter((p) => p !== '*') } }).toArray();
        const permIds = permDocs.map((p) => p._id);
        await roleColl.updateOne({ name: roleName }, {
            $set: {
                permissions: permIds,
                isActive: true,
            },
            $setOnInsert: {
                description: `${roleName} role`,
                isSystem: true,
            },
        }, { upsert: true });
        console.log(`✅ Role ${roleName} updated with ${permIds.length} permissions`);
    }
    console.log('✅ Role-permission seeding completed');
    await mongoose_1.default.disconnect();
}
main().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed-role-permissions.js.map