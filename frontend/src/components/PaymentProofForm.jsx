import React, { useState, useEffect, useRef } from 'react';
import { FaCheckCircle, FaClock, FaCloudUploadAlt, FaDownload, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

const isMarqueePlan = (planId) => planId === 'featured_marquee';

/**
 * Manual UPI payment: show the GPay/UPI QR, collect the payment screenshot and send it to the
 * admin for review. The plan is activated by an admin, so this only submits the proof.
 */
export default function PaymentProofForm({ planId, amount, onSubmitted }) {
  const { isTamil } = useLanguage();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [requests, setRequests] = useState([]);

  const token = () => localStorage.getItem('nikah_token');

  const loadRequests = async () => {
    const t = token();
    if (!t) return;
    try {
      const res = await fetch('/api/payment/my-requests', { headers: { Authorization: `Bearer ${t}` } });
      const data = await res.json();
      if (data.success) setRequests(data.requests || []);
    } catch (err) {
      console.warn('Could not load payment requests:', err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Only requests of the same kind (membership vs. running bar) block / inform this form.
  const sameKind = requests.filter((r) => isMarqueePlan(r.planId) === isMarqueePlan(planId));
  const pending = sameKind.find((r) => r.status === 'pending');
  const lastRejected = !pending && sameKind[0]?.status === 'rejected' ? sameKind[0] : null;

  const handleFile = (e) => {
    const picked = e.target.files?.[0];
    setErrorMsg('');
    if (!picked) return;
    if (!ACCEPTED.includes(picked.type)) {
      setErrorMsg(isTamil ? 'JPG, PNG அல்லது WEBP படத்தை மட்டும் பதிவேற்றவும்.' : 'Please upload a JPG, PNG or WEBP screenshot.');
      e.target.value = '';
      return;
    }
    if (picked.size > MAX_BYTES) {
      setErrorMsg(isTamil ? 'படம் 8MB க்கு மிகாமல் இருக்க வேண்டும்.' : 'Screenshot must be smaller than 8 MB.');
      e.target.value = '';
      return;
    }
    setFile(picked);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    const t = token();
    if (!t) {
      setErrorMsg(isTamil ? 'முதலில் உள்நுழையவும்.' : 'Please log in first.');
      return;
    }
    if (!file) {
      setErrorMsg(isTamil ? 'கட்டண ஸ்கிரீன்ஷாட்டை பதிவேற்றவும்.' : 'Please upload your payment screenshot.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const form = new FormData();
      form.append('planId', planId);
      form.append('screenshot', file);
      if (transactionRef.trim()) form.append('transactionRef', transactionRef.trim());

      const res = await fetch('/api/payment/submit-proof', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || (isTamil ? 'ஸ்கிரீன்ஷாட்டை அனுப்ப முடியவில்லை.' : 'Could not submit your screenshot.'));
      }
      clearFile();
      setTransactionRef('');
      await loadRequests();
      if (onSubmitted) onSubmitted(data);
    } catch (err) {
      setErrorMsg(err.message || (isTamil ? 'ஸ்கிரீன்ஷாட்டை அனுப்ப முடியவில்லை.' : 'Could not submit your screenshot.'));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = isTamil
    ? [
        `GPay / PhonePe / Paytm போன்ற எந்த UPI செயலியிலும் கீழுள்ள QR ஐ ஸ்கேன் செய்து சரியாக ₹${amount} செலுத்தவும்.`,
        'கட்டணம் வெற்றி பெற்ற திரையை ஸ்கிரீன்ஷாட் எடுக்கவும்.',
        'அந்த ஸ்கிரீன்ஷாட்டை கீழே பதிவேற்றவும். சரிபார்த்த பின் நிர்வாகி உங்கள் திட்டத்தை செயல்படுத்துவார்.',
      ]
    : [
        `Scan the QR below with GPay / PhonePe / Paytm (any UPI app) and pay exactly ₹${amount}.`,
        'Take a screenshot of the payment-success screen.',
        'Upload that screenshot below. Our admin verifies it and activates your plan.',
      ];

  return (
    <div className="space-y-3">
      {/* Pending review notice */}
      {pending && (
        <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-start gap-3 text-amber-950">
          <FaClock className="text-amber-600 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-sm">
              {isTamil ? 'சரிபார்ப்பில் உள்ளது' : 'Payment under review'}
            </h4>
            <p className="text-xs mt-0.5 leading-relaxed">
              {isTamil
                ? `உங்கள் ₹${pending.amount / 100} கட்டண ஸ்கிரீன்ஷாட் நிர்வாகியிடம் சரிபார்ப்புக்கு அனுப்பப்பட்டது. உறுதி செய்யப்பட்டதும் உங்கள் திட்டம் தானாக செயல்படும்.`
                : `Your ₹${pending.amount / 100} screenshot was sent to our admin. Your plan activates as soon as it is verified.`}
            </p>
            <p className="text-[11px] font-semibold mt-1 text-amber-800">
              {isTamil ? 'அனுப்பிய நேரம்:' : 'Submitted:'}{' '}
              {new Date(pending.createdAt).toLocaleString(isTamil ? 'ta-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
        </div>
      )}

      {/* Last request was rejected */}
      {lastRejected && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-start gap-2.5 text-red-800">
          <FaExclamationTriangle className="text-red-600 text-sm flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong>{isTamil ? 'முந்தைய கட்டணம் ஏற்கப்படவில்லை.' : 'Your previous payment was not accepted.'}</strong>{' '}
            {lastRejected.rejectionReason}{' '}
            {isTamil ? 'தயவுசெய்து சரியான ஸ்கிரீன்ஷாட்டை மீண்டும் அனுப்பவும்.' : 'Please submit a correct screenshot again.'}
          </div>
        </div>
      )}

      {!pending && (
        <>
          {/* How to pay */}
          <ol className="space-y-1.5 text-xs text-gray-800 bg-white p-3.5 rounded-xl border border-[#dfd2ba]">
            {steps.map((text, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#163828] text-[#edd48e] text-[11px] font-black flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="pt-0.5">{text}</span>
              </li>
            ))}
          </ol>

          {/* QR */}
          <div className="flex flex-col items-center gap-2 bg-white p-3.5 rounded-xl border-2 border-[#caa85d]">
            <img
              src="/payment-qr.jpg"
              alt={isTamil ? 'UPI கட்டண QR குறியீடு' : 'UPI payment QR code'}
              className="w-52 h-52 sm:w-56 sm:h-56 object-contain rounded-lg border border-[#dfd2ba]"
            />
            <div className="text-center">
              <div className="text-lg font-black text-[#8a6d2f]">₹{amount}</div>
              <p className="text-[11px] text-gray-600">
                {isTamil ? 'மேலுள்ள தொகையை சரியாக செலுத்தவும்' : 'Please pay the exact amount shown'}
              </p>
            </div>
            <a
              href="/payment-qr.jpg"
              download="swordnex-nikah-payment-qr.jpg"
              className="text-[11px] font-bold text-[#163828] hover:underline flex items-center gap-1"
            >
              <FaDownload className="text-[10px]" />
              <span>
                {isTamil ? 'மொபைலில் இருந்தால் QR ஐ பதிவிறக்கி UPI செயலியில் ஸ்கேன் செய்யவும்' : 'On mobile? Download the QR and scan it from your gallery in your UPI app'}
              </span>
            </a>
          </div>

          {/* Screenshot upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#163828] uppercase tracking-wider">
              {isTamil ? 'கட்டண ஸ்கிரீன்ஷாட்' : 'Payment screenshot'}
            </label>

            {file ? (
              <div className="flex items-center gap-3 p-2.5 bg-white border border-[#caa85d] rounded-xl">
                <img src={previewUrl} alt="Screenshot preview" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                <div className="min-w-0 flex-1 text-xs">
                  <div className="font-bold text-[#163828] truncate">{file.name}</div>
                  <div className="text-gray-500">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="p-1.5 text-gray-500 hover:text-red-600 cursor-pointer"
                  aria-label="Remove screenshot"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-5 px-4 border-2 border-dashed border-[#caa85d] rounded-xl bg-[#fffdf7] hover:bg-[#fbf4e2] text-[#163828] text-xs font-bold flex flex-col items-center gap-1.5 cursor-pointer transition"
              >
                <FaCloudUploadAlt className="text-2xl text-[#8a6d2f]" />
                <span>{isTamil ? 'ஸ்கிரீன்ஷாட்டை தேர்ந்தெடுக்க தட்டவும்' : 'Tap to choose your screenshot'}</span>
                <span className="text-[10px] font-medium text-gray-500">JPG, PNG, WEBP • max 8 MB</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />

            <input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              maxLength={60}
              placeholder={isTamil ? 'UPI பரிவர்த்தனை எண் (விருப்பம்)' : 'UPI transaction ID (optional)'}
              className="w-full px-3 py-2 text-xs bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#caa85d] text-gray-900"
            />
          </div>
        </>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-xs font-semibold">⚠️ {errorMsg}</div>
      )}

      {!pending && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !file}
          className="w-full py-3 px-4 rounded-xl btn-gold text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FaCheckCircle className="text-[#163828]" />
          <span>
            {submitting
              ? isTamil
                ? 'அனுப்பப்படுகிறது...'
                : 'Submitting...'
              : isTamil
              ? 'செலுத்தினேன் - ஸ்கிரீன்ஷாட் அனுப்புக'
              : "I've Paid - Submit Screenshot"}
          </span>
        </button>
      )}
    </div>
  );
}
