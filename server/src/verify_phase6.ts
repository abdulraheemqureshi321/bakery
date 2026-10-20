import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore
}

import mongoose from 'mongoose';
import env from './config/env';
import { Member, Setting, ReferralRecord, Order, PointsTransaction } from './models';
import * as referralService from './services/referralService';
import * as pointsService from './services/pointsService';

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to Atlas successfully.');

  // 1. Ensure all members have unique referral codes
  console.log('\n--- 1. Checking / Generating Referral Codes for Existing Members ---');
  const countAssigned = await referralService.ensureAllMembersHaveReferralCodes();
  console.log(`Generated referral codes for ${countAssigned} members without one.`);

  // 2. Find or create a test referrer member
  let referrer = await Member.findOne({ phone: '+60120000001' });
  if (!referrer) {
    referrer = await Member.create({
      name: 'Referrer Hero',
      phone: '+60120000001',
      role: 'member',
      pointsBalance: 100,
      referralCode: 'HERO777',
      isActive: true,
    });
  } else if (!referrer.referralCode) {
    referrer.referralCode = 'HERO777';
    await referrer.save();
  }
  console.log(`Referrer: ${referrer.name} (${referrer.phone}) Code: ${referrer.referralCode}`);

  // 3. Test Self-Referral Prevention
  console.log('\n--- 2. Self-Referral Guard Test ---');
  const selfAttr = await referralService.createReferralAttribution(referrer._id, referrer.referralCode);
  console.log('Self referral result (expected null):', selfAttr === null ? 'REJECTED (PASSED)' : 'FAILED');

  // 4. Test Invalid Code Handling (Never blocks)
  console.log('\n--- 3. Invalid Referral Code Test ---');
  const invalidAttr = await referralService.createReferralAttribution(referrer._id, 'NONEXISTENT999');
  console.log('Invalid referral code result (expected null):', invalidAttr === null ? 'HANDLED SILENTLY (PASSED)' : 'FAILED');

  // 5. Test Valid Attribution on Registration
  console.log('\n--- 4. Valid Attribution on Registration ---');
  const testPhone = `+6012${Math.floor(1000000 + Math.random() * 9000000)}`;
  const referee = await Member.create({
    name: 'New Referee User',
    phone: testPhone,
    role: 'member',
    referralCode: 'REF' + Math.floor(100000 + Math.random() * 900000),
    pointsBalance: 0,
    isActive: true,
  });

  const record = await referralService.createReferralAttribution(referee._id, referrer.referralCode);
  console.log('Attribution record created:', record ? `ID: ${record._id}, Status: ${record.rewardStatus}` : 'FAILED');

  // Refresh referee to check referredBy
  const updatedReferee = await Member.findById(referee._id);
  console.log('Referee referredBy field:', updatedReferee?.referredBy?.toString() === referrer._id.toString() ? 'LINKED CORRECTLY (PASSED)' : 'FAILED');

  // 6. Test Duplicate Attribution Prevention
  console.log('\n--- 5. Duplicate Attribution Guard Test ---');
  const duplicateAttr = await referralService.createReferralAttribution(referee._id, referrer.referralCode);
  console.log('Duplicate attribution result (expected null):', duplicateAttr === null ? 'REJECTED (PASSED)' : 'FAILED');

  // 7. Test Reward-Once Guarantee
  console.log('\n--- 6. Exact-Once Reward Granting Guarantee ---');
  if (record) {
    const grant1 = await referralService.grantReferralReward(record._id);
    console.log('First reward grant execution:', grant1?.rewardStatus === 'granted' ? 'GRANTED (PASSED)' : 'FAILED');

    const grant2 = await referralService.grantReferralReward(record._id);
    console.log('Second reward grant execution (duplicate attempt):', grant2 === null ? 'BLOCKED/NOOP (PASSED)' : 'FAILED');
  }

  // 8. Test Member Referral Overview
  console.log('\n--- 7. Member Referral Hub Overview ---');
  const overview = await referralService.getMemberReferralOverview(referrer._id);
  console.log('Referrer Overview:', {
    code: overview.referralCode,
    referralLink: overview.referralLink,
    totalReferrals: overview.stats.totalReferrals,
    successfulReferrals: overview.stats.successfulReferrals,
    referralsCount: overview.referrals.length,
    sampleReferral: overview.referrals[0] ? {
      name: overview.referrals[0].refereeName,
      maskedPhone: overview.referrals[0].refereePhone,
      status: overview.referrals[0].rewardStatus,
    } : null,
  });

  // 9. Test Admin Referrals & Stats
  console.log('\n--- 8. Admin Referral Stats & Leaderboard ---');
  const adminStats = await referralService.getAdminReferralStats();
  console.log('Admin Stats:', {
    overview: adminStats.overview,
    topReferrers: adminStats.topReferrers.map((t) => ({ name: t.name, count: t.totalReferrals, granted: t.grantedReferrals })),
  });

  // Clean up test documents
  await ReferralRecord.deleteMany({ referee: referee._id });
  await Member.deleteOne({ _id: referee._id });
  console.log('\nCleanup completed.');

  await mongoose.disconnect();
  console.log('MongoDB connection closed. Verification complete!');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
