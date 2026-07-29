/**
 * SEED SCRIPT — Role-Permission Mapping
 * Usage: npx ts-node src/scripts/seed-role-permissions.ts
 */
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stb_db';

const ROLE_PERMISSIONS: Record<string, string[]> = {
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
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB:', MONGO_URI.replace(/\/\/.*@/, '//<credentials>@'));

  const roleColl = mongoose.connection.collection('roles');
  const permissionColl = mongoose.connection.collection('permissions');

  // Create permissions
  const allPermissions = new Set<string>();
  Object.values(ROLE_PERMISSIONS).forEach((perms) => {
    perms.forEach((p) => {
      if (p !== '*') allPermissions.add(p);
    });
  });

  for (const permName of allPermissions) {
    const [resource, action] = permName.split(':');
    await permissionColl.updateOne(
      { name: permName },
      {
        $setOnInsert: {
          name: permName,
          resource,
          action,
          description: `Permission to ${action} ${resource}`,
          isActive: true,
        },
      },
      { upsert: true },
    );
  }
  console.log(`✅ Permissions seeded: ${allPermissions.size}`);

  // Update roles with permissions
  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const permDocs = await permissionColl.find({ name: { $in: permissions.filter((p) => p !== '*') } }).toArray();
    const permIds = permDocs.map((p: any) => p._id);

    await roleColl.updateOne(
      { name: roleName },
      {
        $set: {
          permissions: permIds,
          isActive: true,
        },
        $setOnInsert: {
          description: `${roleName} role`,
          isSystem: true,
        },
      },
      { upsert: true },
    );
    console.log(`✅ Role ${roleName} updated with ${permIds.length} permissions`);
  }

  console.log('✅ Role-permission seeding completed');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});