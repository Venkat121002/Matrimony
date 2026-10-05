import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE END-TO-END INTEGRATION TEST SUITE');
  console.log('   (Free Tier Limits, Premium Upgrades, Contact Gating & Matching Emails)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Health check & UTF-8 Tamil
  try {
    const healthRes = await fetch(`${API_BASE}/health`).then((r) => r.json());
    assert(healthRes.status === 'ok', 'Server health check returns ok');
    assert(healthRes.utf8Test.includes('தமிழ்'), 'Server supports UTF-8 Tamil encoding');
  } catch (e) {
    assert(false, `Health check failed: ${e.message}`);
  }

  // 2. Register New User with Tamil Name
  let registeredUser = null;
  let userToken = null;
  const testPhone = `9840${Math.floor(100000 + Math.random() * 900000)}`;
  const testEmail = `tamil.user.${Date.now()}@example.com`;

  try {
    const formData = new FormData();
    formData.append('fullName', 'அப்துல் காதர்');
    formData.append('fullNameEn', 'Abdul Khader');
    formData.append('email', testEmail);
    formData.append('password', 'Pass@123');
    formData.append('phone', testPhone);
    formData.append('gender', 'groom');
    formData.append('age', '28');
    formData.append('maritalStatus', 'திருமணம் ஆகாதவர்');
    formData.append('district', 'Madurai');
    formData.append('state', 'Tamil Nadu');
    formData.append('education', 'B.Tech IT');
    formData.append('occupation', 'மென்பொருள் பொறியாளர்');

    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: formData,
    });
    const regData = await regRes.json();

    assert(regData.success === true, 'User registration succeeds');
    assert(regData.user.isVerified === false, 'New user defaults to isVerified: false (Gated)');
    assert(regData.user.verificationStatus === 'pending', 'New user defaults to verificationStatus: pending');
    assert(regData.user.subscriptionStatus === 'free_trial', 'New user defaults to Free Tier (free_trial)');
    assert(regData.user.fullName === 'அப்துல் காதர்', 'Tamil UTF-8 name stored accurately in MongoDB');

    registeredUser = regData.user;
    userToken = regData.token;
  } catch (e) {
    assert(false, `Registration failed: ${e.message}`);
  }

  // 3. Strict Gatekeeping: verify unverified profile does NOT appear in public profiles feed
  try {
    const publicProfilesRes = await fetch(`${API_BASE}/profiles?searchId=${registeredUser.nikahId}`).then((r) => r.json());
    assert(
      publicProfilesRes.count === 0,
      `Strict Gatekeeping Verified: Unverified user (${registeredUser.nikahId}) is filtered out of public search results`
    );
  } catch (e) {
    assert(false, `Public profile gate check failed: ${e.message}`);
  }

  // 4. Admin Authentication
  let adminKey = 'nikah-admin-secret-2026';
  try {
    const adminLoginRes = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'Admin@TamilNikah2026!',
        portalType: 'admin',
      }),
    }).then((r) => r.json());

    assert(adminLoginRes.success === true, 'Admin login succeeds');
    assert(adminLoginRes.adminUser.role === 'admin', 'Admin user has role: admin');
    adminKey = adminLoginRes.adminKey || 'nikah-admin-secret-2026';
  } catch (e) {
    assert(false, `Admin login failed: ${e.message}`);
  }

  // 5. Admin Approves Profile
  try {
    const approveRes = await fetch(`${API_BASE}/admin/verifications/${registeredUser._id}/approve`, {
      method: 'PUT',
      headers: { 'X-Admin-Key': adminKey },
    }).then((r) => r.json());

    assert(approveRes.success === true, 'Admin approves user verification');
    assert(approveRes.user.isVerified === true, 'Profile is now isVerified: true');
    assert(approveRes.user.verificationStatus === 'verified', 'Profile status is verified');

    // Re-check public feed: User MUST NOW appear in public profiles!
    const publicNowRes = await fetch(`${API_BASE}/profiles?searchId=${registeredUser.nikahId}`).then((r) => r.json());
    assert(publicNowRes.count === 1, `Gatekeeper allows profile post-approval: User ${registeredUser.nikahId} now visible in public search`);
  } catch (e) {
    assert(false, `Admin approval failed: ${e.message}`);
  }

  // 6. Free Tier: Profile Detail View Limitation (Max 5 profiles) & Contact Details Gating
  let sampleProfiles = [];
  try {
    const allProfiles = await fetch(`${API_BASE}/profiles?limit=15`).then((r) => r.json());
    sampleProfiles = (allProfiles.profiles || []).filter((p) => p.nikahId !== registeredUser.nikahId);

    // Ensure we have at least 6 candidate profiles so we can thoroughly test:
    // 5 allowed views + 6th blocked, 3 allowed shortlists + 4th blocked
    while (sampleProfiles.length < 6) {
      const idx = sampleProfiles.length + 1;
      const testPPhone = `9840${Math.floor(100000 + Math.random() * 900000)}`;
      const testPEmail = `candidate.profile.${idx}.${Date.now()}@example.com`;
      const candFd = new FormData();
      candFd.append('fullName', `மணமகள் ${idx}`);
      candFd.append('fullNameEn', `Bride Candidate ${idx}`);
      candFd.append('email', testPEmail);
      candFd.append('password', 'Pass@123');
      candFd.append('phone', testPPhone);
      candFd.append('gender', 'bride');
      candFd.append('age', '24');
      candFd.append('maritalStatus', 'திருமணம் ஆகாதவர்');
      candFd.append('district', 'Chennai');
      candFd.append('education', 'B.Sc');
      candFd.append('occupation', 'Teacher');

      const candReg = await fetch(`${API_BASE}/auth/register`, { method: 'POST', body: candFd }).then((r) => r.json());
      if (candReg.success && candReg.user) {
        await fetch(`${API_BASE}/admin/verifications/${candReg.user._id}/approve`, {
          method: 'PUT',
          headers: { 'X-Admin-Key': adminKey },
        });
        sampleProfiles.push(candReg.user);
      } else {
        break;
      }
    }

    console.log(`\nTesting monthly view limits & contact gating with Free Tier user (${sampleProfiles.length} candidates available)...`);
    let viewSuccessCount = 0;
    let limitBlocked = false;
    let contactDetailsBlocked = true;

    for (let i = 0; i < Math.min(6, sampleProfiles.length); i++) {
      const target = sampleProfiles[i];
      const viewRes = await fetch(`${API_BASE}/profiles/${target._id}`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const viewData = await viewRes.json();

      if (viewRes.ok && viewData.success) {
        viewSuccessCount++;
        // Check that contact details are locked for free tier user!
        if (viewData.profile.phone !== null || viewData.profile.isContactLocked !== true) {
          contactDetailsBlocked = false;
        }
      } else if (viewRes.status === 403 && viewData.limitReached) {
        limitBlocked = true;
      }
    }

    assert(viewSuccessCount === 5, `Free Tier user allowed exactly 5 unique profile views (Observed: ${viewSuccessCount})`);
    assert(limitBlocked === true, '6th profile view attempt successfully BLOCKED with HTTP 403 limitReached: true');
    assert(contactDetailsBlocked === true, 'Contact details (phone/email) are LOCKED (null) for Free Tier user');
  } catch (e) {
    assert(false, `View limit and contact gating test failed: ${e.message}`);
  }

  // 7. Free Tier: Chosen Profiles Limitation (Max 3 profiles)
  try {
    console.log(`\nTesting Chosen Profiles limit with Free Tier user (Max 3 allowed)...`);
    let chosenSuccessCount = 0;
    let fourthBlocked = false;

    for (let i = 0; i < Math.min(4, sampleProfiles.length); i++) {
      const target = sampleProfiles[i];
      const chooseRes = await fetch(`${API_BASE}/profiles/shortlist/toggle/${target._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const chooseData = await chooseRes.json();

      if (chooseRes.ok && chooseData.success && chooseData.isShortlisted) {
        chosenSuccessCount++;
      } else if (chooseRes.status === 403 && chooseData.limitReached) {
        fourthBlocked = true;
      }
    }

    assert(chosenSuccessCount === 3, `Free Tier user allowed exactly 3 chosen profiles (Observed: ${chosenSuccessCount})`);
    assert(fourthBlocked === true, '4th profile choose attempt successfully BLOCKED with HTTP 403 limitReached: true');
  } catch (e) {
    assert(false, `Chosen profiles limit test failed: ${e.message}`);
  }

  // 8. Razorpay Payment: Create Order & Upgrade to Premium
  try {
    console.log(`\nTesting Razorpay Order Creation and Premium Upgrade...`);
    const orderRes = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ planId: 'annual_premium' }),
    }).then((r) => r.json());

    assert(orderRes.success === true, 'Razorpay order created successfully');
    assert(orderRes.amount === 99900, 'Order amount is ₹999 (99900 paise)');

    // Verify payment and upgrade user
    const verifyRes = await fetch(`${API_BASE}/payment/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        razorpayOrderId: orderRes.orderId,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: 'demo_verified_signature',
      }),
    }).then((r) => r.json());

    assert(verifyRes.success === true, 'Payment verified successfully');
    assert(verifyRes.subscriptionStatus === 'premium', 'User upgraded to Premium Membership');
    assert(verifyRes.user.subscriptionStatus === 'premium', 'Upgraded user object returned in verify response');
  } catch (e) {
    assert(false, `Payment upgrade failed: ${e.message}`);
  }

  // 9. Premium Benefits Verification:
  // - Unlimited profile views (6th profile can now be viewed)
  // - Contact details unlocked
  // - Unlimited chosen profiles (4th profile can now be chosen)
  try {
    console.log(`\nTesting Premium Account Unlocked Benefits...`);
    const sixthProfile = sampleProfiles[5] || sampleProfiles[sampleProfiles.length - 1];

    // Unlimited views test
    const premiumViewRes = await fetch(`${API_BASE}/profiles/${sixthProfile._id}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const premiumViewData = await premiumViewRes.json();

    assert(
      premiumViewRes.ok && premiumViewData.success === true,
      'Premium member has UNLIMITED profile views (6th profile viewed successfully)'
    );

    // Contact details unlocked test
    assert(
      premiumViewData.profile.isContactLocked === false,
      'Premium member has Contact Details UNLOCKED (isContactLocked: false)'
    );
    assert(
      premiumViewData.viewStats.canAccessContacts === true,
      'ViewStats confirms canAccessContacts: true for Premium member'
    );

    // Unlimited chosen profiles test (4th profile)
    const fourthProfile = sampleProfiles[3];
    const chooseFourthRes = await fetch(`${API_BASE}/profiles/shortlist/toggle/${fourthProfile._id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const chooseFourthData = await chooseFourthRes.json();

    assert(
      chooseFourthRes.ok && chooseFourthData.success === true && chooseFourthData.isShortlisted === true,
      'Premium member can CHOOSE UNLIMITED profiles (4th profile chosen successfully)'
    );
    assert(
      chooseFourthData.count >= 4,
      `Chosen profile count is now ${chooseFourthData.count} (exceeds free limit of 3)`
    );
  } catch (e) {
    assert(false, `Premium benefits verification failed: ${e.message}`);
  }

  // 10. Automated Matching Email Alerts for Premium Users
  try {
    console.log(`\nTesting Matching Profile Recommendation Feature for Premium accounts...`);

    // A. Register a Premium Bride account
    const bridePhone = `9840${Math.floor(100000 + Math.random() * 900000)}`;
    const brideEmail = `premium.bride.${Date.now()}@example.com`;
    const brideFd = new FormData();
    brideFd.append('fullName', 'பாத்திமா பேகம்');
    brideFd.append('fullNameEn', 'Fathima Begum');
    brideFd.append('email', brideEmail);
    brideFd.append('password', 'Pass@123');
    brideFd.append('phone', bridePhone);
    brideFd.append('gender', 'bride');
    brideFd.append('age', '24');
    brideFd.append('maritalStatus', 'திருமணம் ஆகாதவர்');
    brideFd.append('district', 'Madurai');

    const brideReg = await fetch(`${API_BASE}/auth/register`, { method: 'POST', body: brideFd }).then((r) => r.json());
    assert(brideReg.success === true, 'Test Bride account registered');

    // Upgrade Bride to Premium
    const brideOrder = await fetch(`${API_BASE}/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${brideReg.token}` },
      body: JSON.stringify({ planId: 'annual_premium' }),
    }).then((r) => r.json());

    await fetch(`${API_BASE}/payment/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${brideReg.token}` },
      body: JSON.stringify({
        razorpayOrderId: brideOrder.orderId,
        razorpayPaymentId: `pay_test_${Date.now()}`,
        razorpaySignature: 'demo_verified_signature',
      }),
    });

    // B. Now a new suitable Groom joins (Age 27, Never married)
    const newGroomPhone = `9840${Math.floor(100000 + Math.random() * 900000)}`;
    const newGroomFd = new FormData();
    newGroomFd.append('fullName', 'முகமது அலி');
    newGroomFd.append('fullNameEn', 'Mohamed Ali');
    newGroomFd.append('email', `mohamed.ali.${Date.now()}@example.com`);
    newGroomFd.append('password', 'Pass@123');
    newGroomFd.append('phone', newGroomPhone);
    newGroomFd.append('gender', 'groom');
    newGroomFd.append('age', '27');
    newGroomFd.append('maritalStatus', 'திருமணம் ஆகாதவர்');
    newGroomFd.append('district', 'Madurai');
    newGroomFd.append('education', 'B.E Computer Science');
    newGroomFd.append('occupation', 'Software Engineer');

    const newGroomReg = await fetch(`${API_BASE}/auth/register`, { method: 'POST', body: newGroomFd }).then((r) => r.json());
    assert(newGroomReg.success === true, 'New Groom profile created');

    // Admin can also trigger matches explicitly to verify recommendation matching
    const matchDispatchRes = await fetch(`${API_BASE}/admin/verifications/${newGroomReg.user._id}/trigger-matches`, {
      method: 'POST',
      headers: { 'X-Admin-Key': adminKey },
    }).then((r) => r.json());

    assert(matchDispatchRes.success === true, 'Matching service executed successfully for new Groom profile');
    assert(
      matchDispatchRes.matchResult.count >= 1,
      `Premium Bride account (${brideEmail}) successfully received match recommendation email`
    );
  } catch (e) {
    assert(false, `Matching email recommendation test failed: ${e.message}`);
  }

  // 11. Customer Support Ticket Desk
  try {
    const ticketRes = await fetch(`${API_BASE}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'ஜமால் முஹம்மது',
        email: 'jamal@example.com',
        phone: '9840112233',
        subject: 'District Search Assistance',
        message: 'Need help finding bride profiles in Ramanathapuram district.',
      }),
    }).then((r) => r.json());

    assert(ticketRes.success === true, 'Customer support ticket submitted');

    // Admin lists tickets
    const adminTicketsRes = await fetch(`${API_BASE}/admin/tickets`, {
      headers: { 'X-Admin-Key': adminKey },
    }).then((r) => r.json());

    const ticketFound = adminTicketsRes.tickets.some((t) => t.email === 'jamal@example.com');
    assert(ticketFound, 'Support ticket appears in Admin Support Desk');
  } catch (e) {
    assert(false, `Support ticket test failed: ${e.message}`);
  }

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
