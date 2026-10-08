/**
 * WhatsApp Messaging Service using Meta Cloud API
 * For sending OTPs and verification messages.
 */

export const formatPhoneForWhatsApp = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return '';

  // If 10 digits, assume standard Indian mobile number (+91)
  if (digits.length === 10) {
    return `91${digits}`;
  }

  // If starts with 0 and 11 digits (e.g., 09876543210 in India), drop leading 0 and add 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.slice(1)}`;
  }

  return digits;
};

/**
 * Send OTP via Meta Cloud WhatsApp API
 * @param {string} rawPhone - Recipient phone number
 * @param {string} otp - 6-digit numeric OTP code
 * @param {string} [name='Candidate'] - Candidate name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export const sendWhatsAppOtp = async (rawPhone, otp, name = 'User') => {
  const recipient = formatPhoneForWhatsApp(rawPhone);
  const phoneNumberId = process.env.WHATSAPP_META_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_META_ACCESS_TOKEN;

  console.log(`[WhatsApp OTP] Dispatching password reset OTP to ${rawPhone} (Target: ${recipient})...`);

  if (!phoneNumberId || !accessToken) {
    console.warn('[WhatsApp] WHATSAPP_META_PHONE_NUMBER_ID or WHATSAPP_META_ACCESS_TOKEN missing in environment.');
    return {
      success: false,
      error: 'WhatsApp API credentials not configured',
    };
  }

  const messageText = `Assalamu Alaikum,\n\nYour Tamil Muslim Nikkah password reset OTP is:\n\n*${otp}*\n\nThis OTP is valid for 10 minutes. For your security, please do not share this code with anyone.\n\n— Tamil Muslim Nikkah Support`;

  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipient,
        type: 'text',
        text: {
          preview_url: false,
          body: messageText,
        },
      }),
    });

    const data = await response.json();

    if (response.ok && data.messages && data.messages.length > 0) {
      console.log(`[WhatsApp] OTP successfully dispatched to ${recipient}. Message ID: ${data.messages[0].id}`);
      return {
        success: true,
        messageId: data.messages[0].id,
      };
    } else {
      console.error('[WhatsApp Error response]:', data);
      return {
        success: false,
        error: data.error?.message || 'Failed to send WhatsApp message',
        details: data.error,
      };
    }
  } catch (err) {
    console.error('[WhatsApp Network Exception]:', err);
    return {
      success: false,
      error: err.message || 'Network exception while contacting WhatsApp API',
    };
  }
};

/**
 * Direct wa.me WhatsApp link to receive OTP in WhatsApp
 */
export const createWhatsAppDirectLink = (otp, identifier, targetPhone = '') => {
  const recipient = formatPhoneForWhatsApp(targetPhone || '919171896625');
  const text = encodeURIComponent(
    `*தமிழ் முஸ்லிம் நிக்காஹ் (Tamil Muslim Nikkah)*\n\nஉங்கள் கடவுச்சொல் மீட்பு OTP குறியீடு:\n*${otp}*\n\n(Account: ${identifier || 'User'})\nஇந்த OTP 10 நிமிடங்கள் மட்டுமே செல்லுபடியாகும். யாருடனும் பகிர வேண்டாம்.`
  );
  return `https://wa.me/${recipient}?text=${text}`;
};

