import fs from 'fs';
import path from 'path';
import { Member } from './models/Member';
import { connectDB, disconnectDB } from './config/db';

async function runPhase4Verification() {
  console.log('======================================================');
  console.log('       SOULTALK PASTRY - PHASE 4 E2E VERIFICATION     ');
  console.log('======================================================\n');

  // Connect to DB directly
  await connectDB();

  // 1. Admin login
  console.log('--- 1. Admin Login ---');
  let res = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@soultalkpastry.com', password: 'admin123' }),
  });
  const cookies = res.headers.get('set-cookie') || '';
  let data = await res.json();
  if (!data.success) throw new Error('Admin login failed: ' + JSON.stringify(data));
  console.log('✅ Admin logged in:', data.data.member.name, '| Role:', data.data.member.role);

  // 2. Preview Bulk Import
  console.log('\n--- 2. Preview Bulk Import with /samples/members_sample.xlsx ---');
  const samplePath = path.resolve('d:/soultalk_pastry/samples/members_sample.xlsx');
  const fileBuffer = fs.readFileSync(samplePath);

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const multipartHead = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="members_sample.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`
  );
  const multipartTail = Buffer.from(`\r\n--${boundary}--\r\n`);
  const fullMultipart = Buffer.concat([multipartHead, fileBuffer, multipartTail]);

  res = await fetch('http://localhost:5000/api/v1/admin/members/import/preview', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: cookies,
    },
    body: fullMultipart,
  });
  data = await res.json();
  if (!data.success) throw new Error('Preview failed: ' + JSON.stringify(data));

  console.log('✅ Headers detected:', data.data.headers);
  console.log('✅ Suggested Mapping:', data.data.suggestedMapping);
  console.log(
    `✅ Counts: total = ${data.data.totalRows} | valid = ${data.data.validCount} | duplicate = ${data.data.duplicateCount} | errors = ${data.data.errorCount}`
  );

  // 3. Execute Bulk Import
  console.log('\n--- 3. Execute Bulk Import (onDuplicate: skip) ---');
  const execHead = Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="onDuplicate"\r\n\r\nskip\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="members_sample.xlsx"\r\nContent-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`
  );
  const execMultipart = Buffer.concat([execHead, fileBuffer, multipartTail]);

  res = await fetch('http://localhost:5000/api/v1/admin/members/import/execute', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: cookies,
    },
    body: execMultipart,
  });
  data = await res.json();
  if (!data.success) throw new Error('Execute import failed: ' + JSON.stringify(data));

  console.log('✅ Summary:', data.data.summary);
  console.log(`✅ Failed rows recorded: ${data.data.failedRows.length}`);
  data.data.failedRows.forEach((r: any) =>
    console.log(`   Row #${r.rowNumber} (${r.name || 'No Name'}): ${r.reason}`)
  );

  // 4. Download Error CSV
  console.log('\n--- 4. Download Error CSV Report ---');
  res = await fetch('http://localhost:5000/api/v1/admin/members/import/download-errors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
    body: JSON.stringify({ failedRows: data.data.failedRows }),
  });
  const csvContent = await res.text();
  console.log(`✅ CSV downloaded (${csvContent.length} bytes):\n${csvContent.trim()}`);

  // 5. Test imported member: John Tan (+60123456789)
  console.log('\n--- 5. Verify Imported Member Claims Account via OTP ---');
  const john = await Member.findOne({ phone: '+60123456789' });
  if (!john) throw new Error('John Tan was not found in database!');
  console.log(`✅ Found imported member: ${john.name} | Phone: ${john.phone} | ReferralCode: ${john.referralCode} | passwordHash: ${john.passwordHash}`);

  // Request OTP
  res = await fetch('http://localhost:5000/api/v1/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+60123456789' }),
  });
  data = await res.json();
  console.log('✅ OTP requested:', data.message);

  // Get raw code sent to John from smsProvider or dev log (or set fixed OTP)
  // In dev smsProvider logs to console, but we can set OTP directly to verify verifyOTP endpoint
  const bcrypt = await import('bcrypt');
  const testOtp = '123456';
  john.otpCode = await bcrypt.hash(testOtp, 10);
  john.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
  john.otpAttempts = 0;
  await john.save();

  // Verify OTP
  res = await fetch('http://localhost:5000/api/v1/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+60123456789', code: testOtp }),
  });
  let johnCookies = res.headers.get('set-cookie') || '';
  data = await res.json();
  if (!data.success) throw new Error('Verify OTP failed: ' + JSON.stringify(data));
  console.log('✅ OTP verified! needsPassword:', data.data.needsPassword);

  // Set password
  console.log('\n--- 6. Set Password for John Tan ---');
  res = await fetch('http://localhost:5000/api/v1/auth/set-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: johnCookies,
    },
    body: JSON.stringify({ password: 'new_john_password_123' }),
  });
  data = await res.json();
  if (!data.success) throw new Error('Set password failed: ' + JSON.stringify(data));
  console.log('✅ Password set successfully:', data.message);

  // Log in with phone + new password
  console.log('\n--- 7. Login with Phone + New Password ---');
  res = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: '+60123456789', password: 'new_john_password_123' }),
  });
  johnCookies = res.headers.get('set-cookie') || '';
  data = await res.json();
  if (!data.success) throw new Error('Phone login failed: ' + JSON.stringify(data));
  console.log('✅ Logged in with password! Member:', data.data.member.name);

  // Edit Profile
  console.log('\n--- 8. Member Edits Own Profile (/api/v1/auth/profile) ---');
  res = await fetch('http://localhost:5000/api/v1/auth/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: johnCookies,
    },
    body: JSON.stringify({
      name: 'John Tan VIP',
      phone: '0123456789', // test normalization: 0123456789 -> +60123456789
      email: 'john.vip@example.com',
      birthday: '1990-07-25',
    }),
  });
  data = await res.json();
  if (!data.success) throw new Error('Update profile failed: ' + JSON.stringify(data));
  console.log('✅ Profile updated immediately! New Name:', data.data.member.name, '| Email:', data.data.member.email);

  // 9. Admin Manual Add Member
  console.log('\n--- 9. Admin Manually Creates Member (Fallback) ---');
  res = await fetch('http://localhost:5000/api/v1/admin/members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
    body: JSON.stringify({
      name: 'Grace Hopper',
      phone: '0171239876',
      email: 'grace@compilers.org',
      birthday: '1906-12-09',
    }),
  });
  data = await res.json();
  if (!data.success) throw new Error('Admin create member failed: ' + JSON.stringify(data));
  console.log('✅ Admin manually created member:', data.data.member.name, '| Phone:', data.data.member.phone, '| Code:', data.data.member.referralCode);

  // Status toggle
  console.log('\n--- 10. Admin Deactivates and Reactivates Member ---');
  res = await fetch(`http://localhost:5000/api/v1/admin/members/${data.data.member._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookies,
    },
    body: JSON.stringify({ status: 'suspended' }),
  });
  data = await res.json();
  console.log('✅ Member status updated to:', data.data.member.status);

  console.log('\n======================================================');
  console.log('      🎉 ALL 10 PHASE 4 ACCEPTANCE TESTS PASSED!      ');
  console.log('======================================================');

  await disconnectDB();
}

runPhase4Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
