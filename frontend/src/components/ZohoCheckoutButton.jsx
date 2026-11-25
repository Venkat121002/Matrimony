import React, { useState } from 'react';
import { FaLock, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const ZOHO_SCRIPT = 'https://static.zohocdn.com/zpay/zpay-js/v1/zpayments.js';

let scriptPromise = null;
const loadZohoScript = () => {
  if (window.ZPayments) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = ZOHO_SCRIPT;
      s.async = true;
      s.onload = () => resolve(Boolean(window.ZPayments));
      s.onerror = () => {
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(s);
    });
  }
  return scriptPromise;
};

/**
 * Pay for a plan with Zoho Payments (UPI, cards, net banking) in Zoho's checkout popup.
 * The server creates the session and re-checks the result with Zoho before activating the
 * plan; `onPaid(data)` receives { user, planId, expiresAt } once the plan is active.
 */
export default function ZohoCheckoutButton({ planId, amount, label, onPaid }) {
  const { isTamil } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const pay = async () => {
    const token = localStorage.getItem('nikah_token');
    if (!token) {
      setErrorMsg(isTamil ? 'பணம் செலுத்த முதலில் உள்நுழையவும்.' : 'Please log in to pay.');
      return;
    }
    setBusy(true);
    setErrorMsg('');
    setInfoMsg('');
    const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    let instance = null;
    try {
      const [loaded, sessionRes] = await Promise.all([
        loadZohoScript(),
        fetch('/api/payment/create-session', { method: 'POST', headers: authHeaders, body: JSON.stringify({ planId }) }),
      ]);
      const session = await sessionRes.json();
      if (!session.success) throw new Error(session.message || 'Could not start the payment.');
      if (!loaded) throw new Error('Could not load the Zoho payment window. Please check your connection and try again.');

      instance = new window.ZPayments({
        account_id: session.accountId,
        domain: 'IN',
        otherOptions: { api_key: session.apiKey },
      });

      const result = await instance.requestPaymentMethod({
        amount: String(session.amount),
        currency_code: 'INR',
        currency_symbol: '₹',
        payments_session_id: session.paymentsSessionId,
        business: 'Tamil Muslim Nikkah',
        description: session.description,
        reference_number: session.referenceNumber,
        address: session.prefill,
      });

      if (!result?.payment_id) throw new Error('Payment was not completed.');

      // The server confirms with Zoho; never activate based on the widget alone.
      const confirmRes = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ paymentsSessionId: session.paymentsSessionId }),
      });
      const confirmed = await confirmRes.json();
      if (confirmed.success) {
        if (onPaid) onPaid(confirmed);
      } else if (confirmed.pending) {
        setInfoMsg(confirmed.message);
      } else {
        throw new Error(confirmed.message || 'Payment could not be confirmed.');
      }
    } catch (err) {
      if (err?.code !== 'widget_closed') {
        setErrorMsg(err?.message || (isTamil ? 'பணம் செலுத்துவதில் பிழை.' : 'Payment failed. Please try again.'));
      }
    } finally {
      try {
        if (instance) await instance.close();
      } catch {
        /* widget already closed */
      }
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-xs font-semibold flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {infoMsg && (
        <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold">{infoMsg}</div>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="w-full py-3 px-4 rounded-xl btn-gold font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-60 disabled:cursor-wait"
      >
        <FaLock />
        <span>
          {busy
            ? isTamil ? 'செயலாக்கப்படுகிறது...' : 'Processing...'
            : label || (isTamil ? `₹${amount} செலுத்தவும்` : `Pay ₹${amount}`)}
        </span>
      </button>

      <p className="text-[11px] text-center text-gray-500 leading-relaxed">
        {isTamil ? 'கட்டணம் செலுத்துவதன் மூலம் ' : 'By paying you agree to our '}
        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#163828]">
          {isTamil ? 'சேவை விதிமுறைகள்' : 'Terms of Service'}
        </a>
        ,{' '}
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#163828]">
          {isTamil ? 'தனியுரிமைக் கொள்கை' : 'Privacy Policy'}
        </a>
        {isTamil ? ' மற்றும் ' : ' and '}
        <a href="/refund-cancellation-policy" target="_blank" rel="noopener noreferrer" className="font-bold underline text-[#163828]">
          {isTamil ? 'பணம் திரும்பப் பெறுதல் & ரத்து கொள்கை' : 'Refund & Cancellation Policy'}
        </a>
        {isTamil ? ' ஆகியவற்றை ஏற்கிறீர்கள்.' : '.'}
      </p>
    </div>
  );
}
