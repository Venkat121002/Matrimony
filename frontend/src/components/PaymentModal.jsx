import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaCrown,
  FaCheckCircle,
  FaShieldAlt,
  FaLock,
  FaBolt,
  FaCalendarAlt,
  FaQrcode,
  FaUpload,
  FaTrash,
  FaDownload,
  FaReceipt,
  FaInfoCircle,
  FaClock,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useModalBackdrop } from '../hooks/useModalBackdrop';
import ZohoCheckoutButton from './ZohoCheckoutButton';

export default function PaymentModal({ isOpen, onClose, user, onPaid }) {
  const { t, isTamil } = useLanguage();
  const { backdropProps, modalContentProps } = useModalBackdrop(onClose);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('annual'); // 'monthly' | 'annual'
  const [annualPrice, setAnnualPrice] = useState(999);
  const [monthlyPrice, setMonthlyPrice] = useState(199);

  // Manual QR & Proof Upload State
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);
  const [existingPendingProof, setExistingPendingProof] = useState(null);
  const [showNewUploadForm, setShowNewUploadForm] = useState(false);

  const isAlreadySubscribed = Boolean(
    user &&
    user.subscriptionStatus === 'premium' &&
    (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())
  );

  const currentPrice = selectedPlan === 'monthly' ? monthlyPrice : annualPrice;
  const validityText =
    selectedPlan === 'monthly'
      ? (isTamil ? '30 நாட்கள் (1 மாதம்) செல்லுபடியாகும்' : 'Valid for 30 Days (1 Month)')
      : (isTamil ? '365 நாட்கள் (1 வருடம்) செல்லுபடியாகும்' : 'Valid for 365 Days (1 Year)');

  // Fetch prices and existing proof on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setTransactionId('');
      setNotes('');
      setSubmittedSuccessfully(false);
      setShowNewUploadForm(false);

      // Fetch pricing settings
      fetch('/api/profiles/subscription-settings')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) {
            if (data.settings.subscriptionPrice) {
              setAnnualPrice(data.settings.subscriptionPrice);
            }
            if (data.settings.monthlySubscriptionPrice) {
              setMonthlyPrice(data.settings.monthlySubscriptionPrice);
            }
          }
        })
        .catch((err) => console.warn(err));

      // Fetch user's existing payment proofs
      const token = localStorage.getItem('nikah_token');
      if (token) {
        fetch('/api/payment/my-proofs', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.latestPendingProof) {
              setExistingPendingProof(data.latestPendingProof);
            } else {
              setExistingPendingProof(null);
            }
          })
          .catch((err) => console.warn('Could not fetch user proofs:', err));
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedMimes.includes(file.mimetype) && !file.type.startsWith('image/')) {
      setErrorMsg(
        isTamil
          ? 'தயவுசெய்து செல்லுபடியாகும் படம் (JPG, PNG, WEBP) அல்லது PDF கோப்பை பதிவேற்றவும்.'
          : 'Please select a valid image (JPG, PNG, WEBP) or PDF file.'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(
        isTamil
          ? 'கோப்பு அளவு 10MB-க்கு குறைவாக இருக்க வேண்டும்.'
          : 'File size must be less than 10MB.'
      );
      return;
    }

    setErrorMsg('');
    setScreenshotFile(file);
    if (file.type.startsWith('image/')) {
      setScreenshotPreview(URL.createObjectURL(file));
    } else {
      setScreenshotPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setScreenshotFile(null);
    if (screenshotPreview) {
      URL.revokeObjectURL(screenshotPreview);
      setScreenshotPreview(null);
    }
  };

  const handleSubmitProof = async (e) => {
    e?.preventDefault();

    if (!screenshotFile) {
      setErrorMsg(
        isTamil
          ? 'கட்டணம் செலுத்தியதற்கான ஸ்கிரீன்ஷாட் சான்றை பதிவேற்றுவது கட்டாயமாகும்.'
          : 'Payment screenshot proof is mandatory. Please attach your payment screenshot before submitting.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('nikah_token');
      if (!token) {
        setErrorMsg(
          isTamil
            ? 'சான்றை சமர்ப்பிக்க முதலில் உள்நுழையவும்.'
            : 'Please log in before submitting payment proof.'
        );
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('screenshot', screenshotFile);
      formData.append(
        'planId',
        selectedPlan === 'monthly' ? 'monthly_subscription' : 'annual_subscription'
      );
      formData.append('amount', currentPrice);
      if (transactionId.trim()) formData.append('transactionId', transactionId.trim());
      if (notes.trim()) formData.append('notes', notes.trim());

      const res = await fetch('/api/payment/submit-proof', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            (isTamil ? 'சான்று சமர்ப்பிப்பதில் தோல்வி.' : 'Failed to submit payment proof.')
        );
      }

      setSubmittedSuccessfully(true);
      setSuccessMsg(
        isTamil
          ? `அல்ஹம்துலில்லாஹ்! ₹${currentPrice} கட்டண சான்று வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. நிர்வாகி சரிபார்த்தவுடன் உங்கள் பிரீமியம் உறுப்பினர் உடனடியாக செயல்படுத்தப்படும்.`
          : `Alhamdulillah! Your payment proof of ₹${currentPrice} has been submitted. Our administrative team will verify your screenshot and activate your Premium Membership shortly.`
      );

      if (onPaymentSuccess) onPaymentSuccess(data);
    } catch (err) {
      console.error('[Submit Proof Error]:', err);
      setErrorMsg(err.message || (isTamil ? 'கட்டண சான்றை சமர்ப்பிப்பதில் பிழை.' : 'An error occurred while submitting payment proof.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      {...backdropProps}
    >
      <div
        className="w-full max-w-xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative max-h-[94vh] flex flex-col"
        {...modalContentProps}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] py-3.5 px-5 flex items-center justify-between border-b-2 border-[#caa85d] text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#163828] flex items-center justify-center font-bold text-sm shadow">
              <FaCrown />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-100 font-cinzel">
                {isTamil ? 'பிரீமியம் சந்தா கட்டணம் (UPI QR முறை)' : 'Premium Membership (UPI QR Payment)'}
              </h3>
              <p className="text-[11px] text-amber-200/80">
                {isTamil ? 'வரம்பற்ற வரன்கள் பார்வை மற்றும் நேரடி தொடர்பு' : 'Unlimited Views & Direct Contacts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer text-base"
          >
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Already Subscribed Notice */}
          {isAlreadySubscribed && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-start gap-3 text-emerald-950 shadow-sm">
              <FaCheckCircle className="text-emerald-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-900">
                  {isTamil ? '👑 நீங்கள் ஏற்கனவே பிரீமியம் சந்தாதாரர்!' : '👑 Active Premium Member'}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {isTamil
                    ? 'உங்கள் கணக்கில் பிரீமியம் சந்தா செயலில் உள்ளது. அனைத்து வரன்களின் தொடர்புகளையும் நீங்கள் வரம்பின்றி அணுகலாம்.'
                    : 'You already have an active Premium Membership. You can view all contacts and details without limits.'}
                </p>
                {user?.premiumExpiresAt && (
                  <p className="text-[11px] font-bold text-emerald-900 mt-1">
                    {isTamil ? 'செல்லுபடியாகும் காலம்:' : 'Valid until:'}{' '}
                    {new Date(user.premiumExpiresAt).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
                      dateStyle: 'medium',
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Existing Pending Proof Banner */}
          {existingPendingProof && !submittedSuccessfully && !showNewUploadForm && (
            <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl space-y-2">
              <div className="flex items-start gap-2.5">
                <FaClock className="text-amber-600 text-lg flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                    {isTamil
                      ? '⏳ கட்டண சான்று நிர்வாகி பரிசீலனையில் உள்ளது'
                      : '⏳ Payment Proof Under Administrative Verification'}
                  </h4>
                  <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                    {isTamil
                      ? `நீங்கள் சமர்ப்பித்த ${existingPendingProof.planName || 'சந்தா'} கட்டண சான்று (₹${existingPendingProof.amount ? existingPendingProof.amount / 100 : currentPrice}) தற்போது சரிபார்க்கப்பட்டு வருகிறது. நிர்வாகி சரிபார்த்ததும் உங்கள் சந்தா செயல்படுத்தப்படும்.`
                      : `Your submitted proof for ${existingPendingProof.planName || 'Membership'} (₹${existingPendingProof.amount ? existingPendingProof.amount / 100 : currentPrice}) is pending verification. Feature will be enabled once verified by admin.`}
                  </p>
                  {existingPendingProof.createdAt && (
                    <p className="text-[11px] text-amber-800 font-mono mt-1">
                      {isTamil ? 'சமர்ப்பிக்கப்பட்ட நேரம்:' : 'Submitted on:'}{' '}
                      {new Date(existingPendingProof.createdAt).toLocaleString(isTamil ? 'ta-IN' : 'en-IN')}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewUploadForm(true)}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                >
                  {isTamil ? '+ புதிய கட்டண சான்று சமர்ப்பிக்க' : '+ Submit a New Proof'}
                </button>
              </div>
            </div>
          )}

          {/* Submission Success Screen */}
          {submittedSuccessfully ? (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3.5 shadow-md">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg">
                <FaCheckCircle />
              </div>
              <h4 className="font-extrabold text-base sm:text-lg text-emerald-950 font-cinzel">
                {isTamil ? 'அல்ஹம்துலில்லாஹ்! கட்டண சான்று பெறப்பட்டது' : 'Alhamdulillah! Payment Proof Received'}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed max-w-md mx-auto">
                {successMsg}
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-300 text-xs text-emerald-950 font-medium inline-block">
                <span>{isTamil ? 'நிர்வாகி சரிபார்ப்பு நிலை: ' : 'Admin Status: '}</span>
                <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {isTamil ? 'பரிசீலனையில் (Pending)' : 'Under Review'}
                </span>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#163828] to-[#24583f] text-[#edd48e] font-black text-xs sm:text-sm shadow hover:brightness-110 cursor-pointer"
                >
                  {isTamil ? 'சரி (மூடுக)' : 'Done (Close)'}
                </button>
              </div>
            </div>
          ) : (!existingPendingProof || showNewUploadForm) && !isAlreadySubscribed ? (
            <>
              {/* Step 1: Choose Duration */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#163828] uppercase tracking-wider">
                  {isTamil ? '1. சந்தா கால அளவைத் தேர்ந்தெடுக்கவும்:' : '1. Choose Membership Duration:'}
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {/* Monthly Plan Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPlan === 'monthly'
                        ? 'border-[#caa85d] bg-gradient-to-br from-[#fffdf7] to-[#fbf4e2] ring-2 ring-[#caa85d] shadow-md'
                        : 'border-[#dfd2ba] bg-white hover:border-[#caa85d]/60 opacity-80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-[#163828]">
                        {isTamil ? 'மாதாந்திர சந்தா' : 'Monthly Plan'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold">
                        {isTamil ? '1 மாதம்' : '30 Days'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-[#8a6d2f]">₹{monthlyPrice}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {isTamil ? '30 நாட்கள் வரம்பற்ற பார்வை' : '30 days full unlimited access'}
                    </p>
                  </button>

                  {/* Annual Plan Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('annual')}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer relative ${
                      selectedPlan === 'annual'
                        ? 'border-[#caa85d] bg-gradient-to-br from-[#fffdf7] to-[#fbf4e2] ring-2 ring-[#caa85d] shadow-md'
                        : 'border-[#dfd2ba] bg-white hover:border-[#caa85d]/60 opacity-80'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 font-black text-[9px] shadow border border-amber-200">
                      {isTamil ? 'சிறந்த தேர்வு (60% சேமிப்பு)' : 'Best Value (60% OFF)'}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs text-[#163828]">
                        {isTamil ? 'வருடாந்திர சந்தா' : 'Annual Plan'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                        {isTamil ? '1 வருடம்' : '365 Days'}
                      </span>
                    </div>
                    <div className="text-xl font-black text-[#8a6d2f]">₹{annualPrice}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {isTamil ? 'முழு ஆண்டு வரம்பற்ற சேவை' : 'Full year uninterrupted service'}
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: QR Code Scan & Pay Card */}
              <div className="bg-gradient-to-b from-[#fffef9] to-[#f7f0df] border-2 border-[#caa85d] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-[#163828]">
                  <FaQrcode className="text-base text-[#8a6d2f]" />
                  <span>{isTamil ? '2. UPI QR குறியீட்டை ஸ்கேன் செய்து செலுத்தவும்' : '2. Scan UPI QR Code to Pay'}</span>
                </div>

                {/* Amount Highlight */}
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/60 rounded-xl py-2 px-3 inline-block">
                  <span className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mr-2">
                    {isTamil ? 'செலுத்த வேண்டிய தொகை:' : 'Amount to Pay:'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#163828]">
                    ₹{currentPrice}
                  </span>
                  <span className="text-[11px] text-gray-600 block mt-0.5">
                    ({selectedPlan === 'monthly' ? (isTamil ? 'மாதாந்திர சந்தா' : 'Monthly Plan') : (isTamil ? 'வருடாந்திர சந்தா' : 'Annual Plan')})
                  </span>
                </div>

                {/* The QR Image */}
                <div className="flex flex-col items-center justify-center pt-1">
                  <div className="p-2.5 bg-white border-2 border-[#caa85d] rounded-2xl shadow-md inline-block relative group">
                    <img
                      src="/payment_qr.jpg"
                      alt="UPI Payment QR Code"
                      className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                      loading="eager"
                    />
                    <div className="mt-1.5 flex items-center justify-center gap-2">
                      <a
                        href="/payment_qr.jpg"
                        download="TamilMuslimNikkah_Payment_QR.jpg"
                        className="text-[11px] font-bold text-[#163828] hover:text-[#8a6d2f] flex items-center gap-1 bg-amber-100/70 hover:bg-amber-200/80 px-2 py-0.5 rounded-md transition"
                        title={isTamil ? 'QR குறியீட்டை பதிவிறக்குக' : 'Download QR Image'}
                      >
                        <FaDownload className="text-[10px]" />
                        <span>{isTamil ? 'QR பதிவிறக்குக' : 'Download QR'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* UPI Apps & Instructions */}
                <div className="text-xs text-gray-700 space-y-1 pt-1">
                  <p className="font-extrabold text-[#163828]">
                    {isTamil
                      ? 'Google Pay, PhonePe, Paytm, BHIM அல்லது எந்த ஒரு UPI செயலி மூலமும் ஸ்கேன் செய்து செலுத்தலாம்.'
                      : 'Scan using Google Pay, PhonePe, Paytm, BHIM, Cred or any UPI app.'}
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {isTamil
                      ? 'கட்டணம் செலுத்திய பிறகு வரும் உறுதிப்படுத்தல் திரையை (Screenshot) கண்டிப்பாகப் புகைப்படம் எடுக்கவும்.'
                      : 'After completing payment, take a screenshot of the successful payment confirmation.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Mandatory Screenshot Proof Upload */}
              <div className="bg-white border-2 border-[#caa85d]/80 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#163828] uppercase tracking-wider flex items-center gap-1.5">
                    <FaUpload className="text-[#8a6d2f]" />
                    <span>
                      {isTamil
                        ? '3. கட்டண ஸ்கிரீன்ஷாட் சான்றை பதிவேற்றவும் (கட்டாயம்)'
                        : '3. Upload Payment Screenshot Proof (Mandatory)'}
                    </span>
                    <span className="text-red-600 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                    {isTamil ? 'கட்டாய சான்று' : 'Required'}
                  </span>
                </div>

                {/* Upload Box / Dropzone */}
                {!screenshotFile ? (
                  <label className="border-2 border-dashed border-[#caa85d] hover:border-[#163828] bg-[#fbf9f3] hover:bg-[#f6efe1] rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition text-center">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-11 h-11 rounded-full bg-amber-100 text-[#8a6d2f] flex items-center justify-center text-lg shadow-xs">
                      <FaUpload />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-[#163828]">
                        {isTamil
                          ? 'இங்கே கிளிக் செய்து ஸ்கிரீன்ஷாட்டைத் தேர்ந்தெடுக்கவும்'
                          : 'Click here to choose payment screenshot'}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {isTamil
                          ? 'JPG, PNG, WEBP அல்லது PDF (அதிகபட்சம் 10MB)'
                          : 'Supports JPG, PNG, WEBP or PDF (Max 10MB)'}
                      </p>
                    </div>
                  </label>
                ) : (
                  <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {screenshotPreview ? (
                        <img
                          src={screenshotPreview}
                          alt="Screenshot Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-emerald-300 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          PDF DOC
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <FaCheckCircle className="text-emerald-600 text-xs flex-shrink-0" />
                          <p className="font-extrabold text-xs text-emerald-950 truncate">
                            {screenshotFile.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          {(screenshotFile.size / 1024).toFixed(1)} KB •{' '}
                          <span className="font-bold text-emerald-700">
                            {isTamil ? 'சான்று இணைக்கப்பட்டது' : 'Proof Attached'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title={isTamil ? 'நீக்குக' : 'Remove'}
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                )}

                {/* Optional UTR / Reference ID Field */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isTamil ? 'UPI பரிவர்த்தனை எண் / UTR (விருப்பத்தேர்வு):' : 'UPI Ref / UTR No. (Optional):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isTamil ? 'எ.கா: 4289XXXXXXXX' : 'e.g., 4289XXXXXXXX (12 digits)'}
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#caa85d] bg-[#fbf9f3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163828]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      {isTamil ? 'கூடுதல் குறிப்பு (விருப்பத்தேர்வு):' : 'Additional Notes (Optional):'}
                    </label>
                    <input
                      type="text"
                      placeholder={isTamil ? 'எ.கா: GPay மூலம் செலுத்தப்பட்டது' : 'e.g., Paid via GPay'}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#caa85d] bg-[#fbf9f3] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#163828]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleSubmitProof}
                  disabled={loading || !screenshotFile}
                  className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    !screenshotFile
                      ? 'bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] text-[#edd48e] border-2 border-[#caa85d] hover:brightness-110 active:scale-98'
                  }`}
                >
                  <FaBolt className={screenshotFile ? 'text-amber-400' : 'text-gray-400'} />
                  <span>
                    {loading
                      ? (isTamil ? 'சான்று பதிவேற்றப்படுகிறது...' : 'Uploading Payment Proof...')
                      : !screenshotFile
                      ? (isTamil ? 'ஸ்கிரீன்ஷாட்டை பதிவேற்றவும் (கட்டாயம்)' : 'Upload Screenshot to Proceed')
                      : (isTamil
                          ? `₹${currentPrice} கட்டண சான்றை சமர்ப்பிக்கவும்`
                          : `Submit Payment Proof (₹${currentPrice})`)}
                  </span>
                </button>
                <p className="text-[11px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
                  <FaShieldAlt className="text-emerald-700" />
                  <span>
                    {isTamil
                      ? 'நிர்வாகியால் சரிபார்க்கப்பட்டு உங்கள் பிரீமியம் வசதிகள் உடனே செயல்படுத்தப்படும்.'
                      : 'Admin verifies the screenshot and enables your subscription promptly.'}
                  </span>
                </p>
              </div>
            </>
          ) : null}

          {/* Benefits Summary */}
          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#dfd2ba]">
            <h5 className="font-bold text-[#163828] text-xs uppercase tracking-wider mb-1">
              {isTamil ? 'பிரீமியம் நன்மைகள் (Membership Benefits):' : 'Included in this plan:'}
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-800">
              <div className="flex items-start gap-1.5">
                <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-xs" />
                <span>{isTamil ? 'வரம்பற்ற வரன் விவர பார்வை' : 'Unlimited Profile Views'}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-xs" />
                <span>{isTamil ? 'நேரடி குடும்ப தொடர்பு எண்கள்' : 'Direct Family Contact Numbers'}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-xs" />
                <span>{isTamil ? 'வரம்பற்ற வரன்கள் தேர்வு' : 'Unlimited Chosen Profiles'}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-xs" />
                <span>{isTamil ? 'புதிய வரன் மின்னஞ்சல் பரிந்துரை' : 'Match Recommendation Emails'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
