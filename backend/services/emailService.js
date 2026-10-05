import nodemailer from 'nodemailer';

// Create nodemailer transporter with configurable SMTP or fallback
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }

  // Fallback: Test ethereal or console logger transport
  return null;
};

const transporter = createTransporter();

const sendMailHelper = async ({ to, subject, html, text }) => {
  const from = process.env.EMAIL_FROM || '"Tamil Muslim Nikkah" <no-reply@tamilnikah.com>';

  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, text, html });
      console.log(`[Email] Sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[Email Error] Failed to send email to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  } else {
    // In development or when SMTP is not configured, log nicely
    console.log('\n=================== 📧 EMAIL NOTIFICATION (DEV MOCK) ===================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Summary: ${text || subject}`);
    console.log('=========================================================================\n');
    return { success: true, mocked: true };
  }
};

/**
 * 1. Welcome / Registration Confirmation Email
 */
export const sendWelcomeEmail = async (user) => {
  const subject = `Welcome to Tamil Muslim Nikkah - Registration Received (ID: ${user.nikahId})`;
  const text = `Assalamu Alaikum ${user.fullName}, Welcome to Tamil Muslim Nikkah! Your profile ID is ${user.nikahId}. Your account is currently undergoing administrative verification and will appear in public district searches once verified.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf7ef; border: 2px solid #caa85d; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #163828, #21543c); padding: 25px; text-align: center; border-bottom: 3px solid #caa85d;">
        <h1 style="color: #ecd08c; margin: 0; font-size: 24px; letter-spacing: 1px;">தமிழ் முஸ்லிம் நிக்காஹ்</h1>
        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px;">Tamil Muslim Nikkah Matrimonial</p>
      </div>
      <div style="padding: 30px; color: #2e261a; line-height: 1.6;">
        <h2 style="color: #163828; margin-top: 0;">Assalamu Alaikum, ${user.fullName}!</h2>
        <p>Alhamdulillah! Your matrimonial profile registration has been successfully received.</p>
        
        <div style="background-color: #f1e9d2; border-left: 4px solid #caa85d; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #163828;">Profile ID: <span style="color: #8a6d2f; font-size: 18px;">${user.nikahId}</span></p>
          <p style="margin: 5px 0 0 0; font-size: 13px;">District: <strong>${user.district}</strong> | Gender: <strong>${user.gender === 'groom' ? 'மணமகன் (Groom)' : 'மணமகள் (Bride)'}</strong></p>
          <p style="margin: 5px 0 0 0; font-size: 13px;">1-Month Free Trial: <strong>Active (5 detailed profile views)</strong></p>
        </div>

        <h3 style="color: #8a6d2f; margin-bottom: 8px;">📋 Account Verification in Progress</h3>
        <p style="font-size: 14px; margin-top: 0;">
          Your account is currently undergoing administrative verification to ensure maximum safety and trust for all families.
        </p>
        <p style="font-size: 14px;">Once verified by our administrators, your profile will receive a <strong>Verified Badge (சரிபார்க்கப்பட்டது)</strong> and appear in public district searches.</p>

        <p style="margin-top: 25px; font-size: 13px; color: #665b49;">
          Need assistance? Contact our matrimonial support helpline at <strong>+91 9171896625</strong> or reply to this email.
        </p>
      </div>
      <div style="background-color: #163828; color: #eed89f; padding: 15px; text-align: center; font-size: 12px;">
        © ${new Date().getFullYear()} Tamil Muslim Nikkah. All rights reserved.
      </div>
    </div>
  `;

  return sendMailHelper({ to: user.email, subject, html, text });
};

/**
 * 2. Verification Status Update (Approved / Rejected)
 */
export const sendVerificationStatusEmail = async (user, isApproved, rejectionReason = '') => {
  const subject = isApproved
    ? `Congratulations! Your Profile ID ${user.nikahId} is Now Verified ✓`
    : `Update on your Tamil Muslim Nikkah Verification (ID: ${user.nikahId})`;

  const text = isApproved
    ? `Assalamu Alaikum ${user.fullName}, Congratulations! Your identity verification has been approved. Your profile is now live and featured with the Verified Badge.`
    : `Assalamu Alaikum ${user.fullName}, We reviewed your KYC document. Unfortunately, it could not be approved due to: ${rejectionReason}. Please re-upload a clear copy.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf7ef; border: 2px solid #caa85d; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #163828, #21543c); padding: 25px; text-align: center; border-bottom: 3px solid #caa85d;">
        <h1 style="color: #ecd08c; margin: 0; font-size: 24px;">தமிழ் முஸ்லிம் நிக்காஹ்</h1>
        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px;">Identity Verification Notification</p>
      </div>
      <div style="padding: 30px; color: #2e261a; line-height: 1.6;">
        <h2 style="color: #163828; margin-top: 0;">Assalamu Alaikum, ${user.fullName}!</h2>
        
        ${
          isApproved
            ? `
          <div style="background-color: #e8f5e9; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <div style="font-size: 40px; color: #2e7d32;">✓</div>
            <h3 style="color: #2e7d32; margin: 5px 0;">Profile Verified Successfully!</h3>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #1b5e20;">
              Your profile (ID: <strong>${user.nikahId}</strong>) has been officially verified by the administration.
            </p>
          </div>
          <p>Your profile is now active on the search feed with the authentic <strong>Verified Badge</strong>, allowing genuine bride and groom families to connect with confidence.</p>
        `
            : `
          <div style="background-color: #ffebee; border: 1px solid #ef5350; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #c62828; margin: 0 0 10px 0;">Verification Status: Attention Required</h3>
            <p style="margin: 0; font-size: 14px; color: #b71c1c;">
              Reason: <strong>${rejectionReason || 'The uploaded document was unclear or incomplete.'}</strong>
            </p>
          </div>
          <p>Please log in to your account and re-upload a clear copy of your Aadhaar, PAN, or Passport so our verification team can re-assess your profile promptly.</p>
        `
        }

        <p style="margin-top: 25px; font-size: 13px; color: #665b49;">
          For questions, reach out to admin support via WhatsApp/Call at <strong>+91 9171896625</strong>.
        </p>
      </div>
      <div style="background-color: #163828; color: #eed89f; padding: 15px; text-align: center; font-size: 12px;">
        © ${new Date().getFullYear()} Tamil Muslim Nikkah. All rights reserved.
      </div>
    </div>
  `;

  return sendMailHelper({ to: user.email, subject, html, text });
};

/**
 * 3. Payment Receipt / Premium Activation Email
 */
export const sendPaymentReceiptEmail = async (user, payment) => {
  const subject = `Payment Confirmed - Premium Nikah Membership Activated (ID: ${user.nikahId})`;
  const text = `Assalamu Alaikum ${user.fullName}, Thank you for your payment of ₹${(payment.amount / 100).toFixed(2)}. Your Premium Annual Membership is now active with unlimited profile views!`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf7ef; border: 2px solid #caa85d; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #163828, #21543c); padding: 25px; text-align: center; border-bottom: 3px solid #caa85d;">
        <h1 style="color: #ecd08c; margin: 0; font-size: 24px;">தமிழ் முஸ்லிம் நிக்காஹ்</h1>
        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px;">Official Payment Receipt & Membership Activation</p>
      </div>
      <div style="padding: 30px; color: #2e261a; line-height: 1.6;">
        <h2 style="color: #163828; margin-top: 0;">Jazakallahu Khair, ${user.fullName}!</h2>
        <p>We have successfully received your membership payment. Your account has been upgraded to <strong>Premium Membership</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f7f1e1; border-radius: 8px; overflow: hidden;">
          <tr style="border-bottom: 1px solid #dfd2ba;">
            <td style="padding: 12px 15px; font-weight: bold; color: #163828;">Plan</td>
            <td style="padding: 12px 15px; color: #2e261a;">${payment.planName || 'Annual Premium Membership'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #dfd2ba;">
            <td style="padding: 12px 15px; font-weight: bold; color: #163828;">Amount Paid</td>
            <td style="padding: 12px 15px; font-weight: bold; color: #8a6d2f;">₹${(payment.amount / 100).toFixed(2)} INR</td>
          </tr>
          <tr style="border-bottom: 1px solid #dfd2ba;">
            <td style="padding: 12px 15px; font-weight: bold; color: #163828;">Order ID</td>
            <td style="padding: 12px 15px; font-family: monospace; font-size: 12px;">${payment.razorpayOrderId}</td>
          </tr>
          <tr style="border-bottom: 1px solid #dfd2ba;">
            <td style="padding: 12px 15px; font-weight: bold; color: #163828;">Payment ID</td>
            <td style="padding: 12px 15px; font-family: monospace; font-size: 12px;">${payment.razorpayPaymentId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 12px 15px; font-weight: bold; color: #163828;">Benefits</td>
            <td style="padding: 12px 15px; color: #163828; font-weight: bold;">Unlimited Profile Views & Direct Family Contacts</td>
          </tr>
        </table>

        <p style="font-size: 14px;">You can now view detailed family information, contact numbers, and horoscopes/preferences without any monthly limits.</p>

        <p style="margin-top: 25px; font-size: 13px; color: #665b49;">
          Need support? Our customer care is available at <strong>+91 9171896625</strong>.
        </p>
      </div>
      <div style="background-color: #163828; color: #eed89f; padding: 15px; text-align: center; font-size: 12px;">
        © ${new Date().getFullYear()} Tamil Muslim Nikkah. All rights reserved.
      </div>
    </div>
  `;

  return sendMailHelper({ to: user.email, subject, html, text });
};

/**
 * 4. Premium Member Match Recommendation Email
 * Sent to Premium Bride accounts when a matching Groom joins,
 * and to Premium Groom accounts when a matching Bride joins.
 */
export const sendMatchingProfileRecommendationEmail = async (premiumUser, newProfile) => {
  const isGroom = newProfile.gender === 'groom';
  const candidateTypeEn = isGroom ? 'Groom' : 'Bride';
  const candidateTypeTamil = isGroom ? 'மணமகன்' : 'மணமகள்';
  const recipientRole = premiumUser.gender === 'bride' ? 'மணமகள்' : 'மணமகன்';

  const subject = `🔔 புதிய ${candidateTypeTamil} வரன் பரிந்துரை: ${newProfile.fullName} (ID: ${newProfile.nikahId}) - Tamil Muslim Nikkah`;

  const text = `Assalamu Alaikum ${premiumUser.fullName}, A new matching ${candidateTypeEn} has joined Tamil Muslim Nikkah!
Candidate: ${newProfile.fullName} (ID: ${newProfile.nikahId})
Age: ${newProfile.age} | District: ${newProfile.district} | Education: ${newProfile.education} | Occupation: ${newProfile.occupation}
As a Premium member, you have direct contact access:
Phone: ${newProfile.phone || 'Available online'}
Login to your account to view complete details and family background.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #faf7ef; border: 2px solid #caa85d; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #163828, #21543c); padding: 25px; text-align: center; border-bottom: 3px solid #caa85d;">
        <h1 style="color: #ecd08c; margin: 0; font-size: 24px; letter-spacing: 1px;">தமிழ் முஸ்லிம் நிக்காஹ்</h1>
        <p style="color: #ffffff; margin: 5px 0 0 0; font-size: 14px;">👑 Premium Match Recommendation Alert</p>
      </div>

      <div style="padding: 30px; color: #2e261a; line-height: 1.6;">
        <h2 style="color: #163828; margin-top: 0;">Assalamu Alaikum, ${premiumUser.fullName}!</h2>
        <p>
          Alhamdulillah! A newly registered <strong>${candidateTypeTamil} (${candidateTypeEn})</strong> matches your profile preferences on Tamil Muslim Nikkah.
        </p>

        <!-- Recommended Profile Card -->
        <div style="background-color: #f7f1e1; border: 2px solid #caa85d; border-radius: 10px; padding: 20px; margin: 20px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #dfd2ba; padding-bottom: 10px; margin-bottom: 12px;">
            <h3 style="margin: 0; color: #163828; font-size: 18px;">
              ${newProfile.fullName}
            </h3>
            <span style="background-color: #163828; color: #ecd08c; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 13px;">
              ID: ${newProfile.nikahId}
            </span>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold; width: 40%;">வகை / Role:</td>
              <td style="padding: 6px 0; color: #163828; font-weight: bold;">${candidateTypeTamil} (${candidateTypeEn})</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold;">வயது / Age:</td>
              <td style="padding: 6px 0; color: #2e261a;">${newProfile.age} ஆண்டுகள் (Years)</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold;">மாவட்டம் / District:</td>
              <td style="padding: 6px 0; color: #2e261a;">${newProfile.district || newProfile.location || 'Tamil Nadu'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold;">கல்வி / Education:</td>
              <td style="padding: 6px 0; color: #2e261a;">${newProfile.education || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold;">பணி / Profession:</td>
              <td style="padding: 6px 0; color: #2e261a;">${newProfile.occupation || '—'} ${newProfile.workplace ? `(${newProfile.workplace})` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold;">மாத வருமானம்:</td>
              <td style="padding: 6px 0; color: #2e261a;">${newProfile.monthlyIncome || '—'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6e5927; font-weight: bold;">திருமண நிலை:</td>
              <td style="padding: 6px 0; color: #2e261a;">${newProfile.maritalStatus || 'திருமணம் ஆகாதவர்'}</td>
            </tr>
          </table>

          <!-- Direct Contact Information (Unlocked for Premium User) -->
          <div style="margin-top: 15px; padding: 12px; background-color: #e9f5ed; border: 1px solid #7bc698; border-radius: 8px;">
            <p style="margin: 0 0 6px 0; font-weight: bold; color: #163828; font-size: 13px;">
              👑 பிரீமியம் நேரடி தொடர்பு விவரங்கள் (Direct Contacts):
            </p>
            <p style="margin: 4px 0; font-size: 15px; color: #1b5e20; font-weight: bold;">
              📞 தொலைபேசி: <a href="tel:${newProfile.phone}" style="color: #1b5e20; text-decoration: none;">${newProfile.phone || '—'}</a>
            </p>
            ${
              newProfile.additionalPhones && newProfile.additionalPhones.length > 0
                ? `<p style="margin: 4px 0; font-size: 13px; color: #2e261a;">
                     கூடுதல் எண்கள்: <strong>${newProfile.additionalPhones.join(', ')}</strong>
                   </p>`
                : ''
            }
          </div>
        </div>

        <div style="text-align: center; margin: 25px 0;">
          <a
            href="http://localhost:5173/?searchId=${newProfile.nikahId}"
            style="background: linear-gradient(135deg, #caa85d, #a88235); color: #163828; font-weight: 800; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; display: inline-block; box-shadow: 0 3px 6px rgba(0,0,0,0.15);"
          >
            முழு வரன் விவரங்களை காண (View Full Profile) →
          </a>
        </div>

        <p style="margin-top: 20px; font-size: 13px; color: #665b49; border-top: 1px solid #e0d4be; pt: 15px;">
          * நீங்கள் பிரீமியம் சந்தாதாரர் என்பதால், புதிய பொருத்தமான வரன் இணையும்போது உடனுக்குடன் இந்த பிரத்யேக மின்னஞ்சல் பரிந்துரை அனுப்பி வைக்கப்படுகிறது.
        </p>
      </div>

      <div style="background-color: #163828; color: #eed89f; padding: 15px; text-align: center; font-size: 12px;">
        © ${new Date().getFullYear()} Tamil Muslim Nikkah. All rights reserved.
      </div>
    </div>
  `;

  return sendMailHelper({ to: premiumUser.email, subject, html, text });
};

