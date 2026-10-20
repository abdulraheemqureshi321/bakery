import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore
}

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import env from '../config/env';
import { Member } from '../models';
import { generateReferralCode } from '../utils/helpers';
import { normalizePhone } from '../utils/phone';

/**
 * Production-ready script to bootstrap the initial System Administrator.
 * Can be run via CLI arguments or environment variables:
 *
 * Usage:
 *   npx tsx src/scripts/createAdmin.ts <phone> <password> <name>
 * Or with env variables:
 *   ADMIN_PHONE=+60123456789 ADMIN_PASSWORD=StrongAdminPassword! ADMIN_NAME="Master Admin" npx tsx src/scripts/createAdmin.ts
 */
async function bootstrapAdmin() {
  const args = process.argv.slice(2);
  const rawPhone = args[0] || process.env.ADMIN_PHONE || '+60123456789';
  const password = args[1] || process.env.ADMIN_PASSWORD || 'SoulTalkAdmin2024!';
  const name = args[2] || process.env.ADMIN_NAME || 'SoulTalk System Admin';

  const defaultCountryCode = '+60';
  const normalizedPhone = normalizePhone(rawPhone, defaultCountryCode);

  console.log('--- SoulTalk Pastry Initial Admin Provisioning ---');
  console.log(`Connecting to MongoDB at: ${env.MONGODB_URI ? env.MONGODB_URI.split('@')[1] || 'Cluster' : 'Unknown'}`);
  await mongoose.connect(env.MONGODB_URI);

  // Check if member already exists
  let member = await Member.findOne({ phone: normalizedPhone });

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  if (member) {
    console.log(`User with phone ${normalizedPhone} already exists. Elevating to Administrator...`);
    member.role = 'admin';
    member.passwordHash = passwordHash;
    member.isActive = true;
    member.status = 'active';
    if (!member.referralCode) {
      member.referralCode = generateReferralCode();
    }
    await member.save();
    console.log(`✅ Successfully updated ${member.name} (${member.phone}) to Administrator role.`);
  } else {
    console.log(`Creating new Administrator account for ${name} (${normalizedPhone})...`);
    member = await Member.create({
      name,
      phone: normalizedPhone,
      passwordHash,
      role: 'admin',
      isActive: true,
      status: 'active',
      pointsBalance: 0,
      referralCode: generateReferralCode(),
    });
    console.log(`✅ Successfully created Administrator account: ${member.name} (${member.phone})`);
  }

  console.log('\n--- Administrator Access Details ---');
  console.log(`Phone (Login ID): ${member.phone}`);
  console.log(`Role:             ${member.role}`);
  console.log(`Admin Portal:     ${env.CLIENT_URL || 'http://localhost:5173'}/admin`);
  console.log('------------------------------------');

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

bootstrapAdmin().catch((err) => {
  console.error('Failed to provision administrator:', err);
  process.exit(1);
});
