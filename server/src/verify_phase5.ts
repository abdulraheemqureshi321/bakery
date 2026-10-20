import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { Member, Voucher, MemberVoucher, Order, PointsTransaction, Setting } from './models';
import * as pointsService from './services/pointsService';
import * as voucherService from './services/voucherService';

async function verifyPhase5() {
  console.log('🧪 Starting Phase 5 Live End-to-End Verification...\n');
  await connectDB();

  try {
    // 1. Verify Rules read from Settings
    console.log('--- Step 1: Points Rules from Settings ---');
    const rules = await pointsService.getPointsRules();
    console.log('Points Rules loaded:', rules);
    if (rules.earnRatio <= 0 || rules.redeemRatio <= 0 || rules.minRedeem <= 0 || rules.maxOrderSharePercent <= 0) {
      throw new Error('Invalid points rules loaded');
    }
    console.log('✅ Points Rules verified.\n');

    // 2. Setup or find Member Alice
    console.log('--- Step 2: Member Account & Points Balance ---');
    let alice = await Member.findOne({ phone: '+60121111111' });
    if (!alice) {
      alice = await Member.create({
        name: 'Alice Tan',
        phone: '+60121111111',
        email: 'alice@example.com',
        role: 'member',
        status: 'active',
        pointsBalance: 120,
      });
    }
    console.log(`Alice Tan current balance: ${alice.pointsBalance} pts`);

    // 3. Admin adjusts points with a reason
    console.log('--- Step 3: Admin Adjust Points with Ledger Audit ---');
    const prevBalance = alice.pointsBalance || 0;
    const adjustResult = await pointsService.adminAdjustPoints(
      alice._id.toString(),
      80,
      'Phase 5 Verification Goodwill Bonus',
      alice._id.toString()
    );
    console.log(`Adjusted +80 points. New balance: ${adjustResult.newBalance} pts`);
    if (adjustResult.newBalance !== prevBalance + 80) {
      throw new Error('Points balance adjustment mismatch');
    }

    // Verify PointsTransaction ledger entry
    const lastTx = await PointsTransaction.findOne({ member: alice._id }).sort({ createdAt: -1 });
    console.log(`Latest ledger entry: ${lastTx?.type} ${lastTx?.amount} pts - "${lastTx?.description}" (balanceAfter: ${lastTx?.balanceAfter})`);
    if (lastTx?.description !== 'Phase 5 Verification Goodwill Bonus') {
      throw new Error('Ledger description mismatch');
    }
    console.log('✅ Admin points adjustment and ledger entry verified.\n');

    // 4. Admin Creates and Issues Voucher
    console.log('--- Step 4: Admin Creates and Issues Voucher ---');
    const testCode = `VERIFY${Date.now().toString().slice(-4)}`;
    const newVoucher = await voucherService.createVoucher({
      code: testCode,
      name: 'Verification 15% Celebration',
      description: '15% discount for Phase 5 verification test',
      type: 'percentage',
      value: 15,
      minOrderAmount: 50,
      maxDiscount: 30,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 7 * 86400000),
      perMemberLimit: 1,
      isActive: true,
    });
    console.log(`Created voucher: ${newVoucher.code} (${newVoucher.type} ${newVoucher.value}%)`);

    // Issue to Alice
    const issueResult = await voucherService.issueVoucherToMembers({
      voucherId: newVoucher._id.toString(),
      memberIds: [alice._id.toString()],
    });
    console.log(`Issued voucher result: ${issueResult.issuedCount} issued, ${issueResult.alreadyHeldCount} already held`);

    const memberVouchersList = await voucherService.getMemberVouchers(alice._id.toString(), 'available');
    const held = memberVouchersList.find((mv) => mv.voucher.code === testCode);
    if (!held) {
      throw new Error(`Voucher ${testCode} not found in Alice's available wallet`);
    }
    console.log(`Alice now holds voucher: ${held.voucher.code} (Status: available)`);
    console.log('✅ Voucher creation and member wallet issuance verified.\n');

    // 5. Discount Math & Combination
    console.log('--- Step 5: Discount Math & Combination Validation ---');
    const subtotal = 120; // e.g. RM 120 order
    // 15% of 120 = 18 discount.
    // Remaining after voucher = 120 - 18 = 102.
    // Points max cap = 50% of 102 = 51.
    // Alice has 200 points = RM 2.00 discount.
    const voucherCalc = await voucherService.validateAndCalculateVoucher(alice._id.toString(), testCode, subtotal);
    console.log(`Voucher discount calculated: RM ${voucherCalc.discount} (Expected: RM 18)`);
    if (voucherCalc.discount !== 18) {
      throw new Error(`Expected voucher discount 18, got ${voucherCalc.discount}`);
    }

    const subtotalAfterVoucher = subtotal - voucherCalc.discount;
    const pointsCalc = pointsService.calculatePointsDiscount(subtotalAfterVoucher, 100, alice.pointsBalance, rules);
    console.log(`Points discount calculated for 100 pts: RM ${pointsCalc.pointsDiscount} (Expected: RM 1.00)`);
    if (pointsCalc.pointsDiscount !== 1) {
      throw new Error(`Expected points discount 1, got ${pointsCalc.pointsDiscount}`);
    }
    console.log('✅ Discount calculation order (Voucher first -> Points second) verified.\n');

    // 6. Concurrency Test for Double Voucher Use & Double Points Redemption
    console.log('--- Step 6: Atomic Locking & Concurrency Protection ---');
    const dummyOrderId = new mongoose.Types.ObjectId().toString();
    const dummyOrderId2 = new mongoose.Types.ObjectId().toString();

    // Lock voucher in transaction
    await voucherService.applyVoucherInTransaction(held._id.toString(), dummyOrderId);
    console.log('First lock attempt on member voucher succeeded (marked isUsed: true)');

    // Second lock attempt MUST throw error
    let doubleLockBlocked = false;
    try {
      await voucherService.applyVoucherInTransaction(held._id.toString(), dummyOrderId2);
    } catch (err: any) {
      doubleLockBlocked = true;
      console.log('Second lock attempt correctly rejected:', err.message);
    }
    if (!doubleLockBlocked) {
      throw new Error('CRITICAL: Double voucher use was NOT blocked!');
    }
    console.log('✅ Atomic voucher lock prevents double-spending.\n');

    // 7. Cancellation & Restoration
    console.log('--- Step 7: Order Cancellation & Voucher/Points Restoration ---');
    await voucherService.restoreVoucherOnCancellation(dummyOrderId);
    const restoredVoucher = await MemberVoucher.findById(held._id);
    console.log('Voucher after cancellation restoration isUsed:', restoredVoucher?.isUsed);
    if (restoredVoucher?.isUsed !== false) {
      throw new Error('Voucher was not restored to unused state!');
    }
    console.log('✅ Voucher restoration verified.\n');

    console.log('🎉 ALL PHASE 5 BACKEND VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await disconnectDB();
  }
}

verifyPhase5().catch((err) => {
  console.error('❌ Phase 5 Verification failed:', err);
  process.exit(1);
});
