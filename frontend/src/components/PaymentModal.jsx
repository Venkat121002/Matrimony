import React, { useState } from 'react';
import { FaTimes, FaCrown, FaCheckCircle, FaShieldAlt, FaLock, FaBolt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function PaymentModal({ isOpen, onClose, user, onPaymentSuccess }) {
  const { t, isTamil } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('nikah_token');
      if (!token) {
        setErrorMsg('Please log in before upgrading your subscription.');
        setLoading(false);
        return;
      }

      // 1. Create Order on Backend
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: 'annual_premium' }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || 'Could not initiate payment order.');
      }

      // 2. Load Checkout.js
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        throw new Error('Could not load the Razorpay payment window. Please check your connection and try again.');
      }

      // 3. Configure Razorpay Options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Tamil Muslim Nikkah',
        description: 'Annual Premium Membership (Unlimited Profile Views)',
        image: 'https://cdn-icons-png.flaticon.com/512/3652/3652191.png',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyRes = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              onPaymentSuccess(verifyData);
              onClose();
            } else {
              setErrorMsg(verifyData.message || 'Payment verification failed.');
            }
          } catch (verErr) {
            setErrorMsg('Error confirming payment. Please contact support.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: orderData.user?.name || user?.fullName || '',
          email: orderData.user?.email || user?.email || '',
          contact: orderData.user?.phone || user?.phone || '',
        },
        theme: {
          color: '#163828',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('[Payment Error]:', err);
      setErrorMsg(err.message || 'Payment failed to initiate.');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] py-4 px-5 flex items-center justify-between border-b-2 border-[#caa85d] text-white">
          <div className="flex items-center gap-2">
            <FaCrown className="text-amber-400 text-lg animate-bounce" />
            <h3 className="font-extrabold text-base sm:text-lg text-[#fffae6] tracking-wide">
              {isTamil ? 'பிரீமியம் சந்தா (Premium Membership)' : 'Upgrade to Premium Membership'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Plan Card */}
          <div className="bg-gradient-to-br from-[#fdfbf6] via-[#f7efdb] to-[#ede2c2] p-5 rounded-xl border-2 border-[#caa85d] shadow-md text-center relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2.5 py-0.5 bg-[#8a6d2f] text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              {isTamil ? 'சிறந்த தேர்வு' : 'Most Popular'}
            </div>

            <div className="inline-block p-2 bg-[#163828] rounded-full text-amber-300 mb-2">
              <FaCrown className="text-2xl" />
            </div>

            <h4 className="font-extrabold text-lg sm:text-xl text-[#163828]">
              {isTamil ? '1-வருட அன்லிமிடெட் பிரீமியம்' : '1-Year Unlimited Premium'}
            </h4>
            <p className="text-gray-600 text-xs mt-0.5">
              {isTamil
                ? 'அனைத்து மாவட்டங்களின் சரிபார்க்கப்பட்ட வரன்களை வரம்பின்றி பார்க்கலாம்'
                : 'Unlimited detailed profile and contact views across all districts'}
            </p>

            <div className="my-3 flex items-baseline justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#8a6d2f]">₹999</span>
              <span className="text-gray-500 line-through text-sm">₹2,499</span>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                60% OFF
              </span>
            </div>

            <p className="text-[11px] text-gray-500">
              {isTamil ? 'வரி உள்ளடங்கியது • 365 நாட்கள் செல்லுபடியாகும்' : 'Inclusive of all taxes • Valid for 365 Days'}
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-2.5 bg-white p-4 rounded-xl border border-[#dfd2ba]">
            <h5 className="font-bold text-[#163828] text-xs uppercase tracking-wider mb-2">
              {isTamil ? 'பிரீமியம் நன்மைகள் (Membership Benefits):' : 'Included in this plan:'}
            </h5>

            {/* Feature 1: Unlimited profile views */}
            <div className="flex items-start gap-2 text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{isTamil ? 'வரம்பற்ற வரன் விவரப் பார்வை:' : 'Unlimited Profile Views:'}</strong>{' '}
                {isTamil
                  ? 'இலவச கணக்கின் 5 வரன் கட்டுப்பாடு நீக்கப்பட்டு, வரம்பற்ற வரன்களின் முழு விவரங்களையும் பார்க்கலாம்.'
                  : 'View complete details of unlimited profiles without the 5-profile free tier restriction.'}
              </span>
            </div>

            {/* Feature 2: Unlimited chosen profiles */}
            <div className="flex items-start gap-2 text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{isTamil ? 'வரம்பற்ற வரன்கள் தேர்வு:' : 'Unlimited Chosen Profiles:'}</strong>{' '}
                {isTamil
                  ? 'இலவச கணக்கின் 3 வரன் தேர்வு வரம்பு நீக்கப்பட்டு, விரும்பும் அனைத்து வரன்களையும் தேர்வு செய்யலாம்.'
                  : 'Choose and shortlist unlimited prospective profiles (Free tier is capped at 3 chosen profiles).'}
              </span>
            </div>

            {/* Feature 3: Access contact details */}
            <div className="flex items-start gap-2 text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{isTamil ? 'நேரடி குடும்ப தொடர்பு எண்கள்:' : 'Direct Contact Details Access:'}</strong>{' '}
                {isTamil
                  ? 'முதன்மை & கூடுதல் தொலைபேசி எண்கள், வாட்ஸ்அப் மற்றும் பெற்றோர் எண்களை உடனடியாக அணுகலாம்.'
                  : 'Instant access to candidate and family phone numbers, WhatsApp, and parent contacts (locked on Free Tier).'}
              </span>
            </div>

            {/* Feature 4: Matching profile email alerts */}
            <div className="flex items-start gap-2 text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{isTamil ? 'புதிய பொருத்தமான வரன் மின்னஞ்சல் பரிந்துரை:' : 'Automated Match Recommendation Emails:'}</strong>{' '}
                {isTamil
                  ? 'புதிய வரன் இணையும் போது உங்கள் கணக்கிற்குப் பொருத்தமான மணமகன்/மணமகள் வரன்கள் உங்கள் மின்னஞ்சலுக்கு உடனுக்குடன் அனுப்பி வைக்கப்படும்.'
                  : 'When new users register, matching profiles are automatically sent to your email (suitable grooms for brides, suitable brides for grooms).'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Upgrade Button */}
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl btn-gold text-base font-extrabold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            <FaBolt className="text-[#163828]" />
            <span>
              {loading
                ? (isTamil ? 'பரிவர்த்தனை துவங்குகிறது...' : 'Processing...')
                : (isTamil ? '₹999 செலுத்தி உடனடியாக பிரீமியம் பெறுக (Razorpay)' : 'Pay ₹999 with Razorpay & Upgrade')}
            </span>
          </button>

          {/* Secure Payment Footer Badges */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-1">
            <span className="flex items-center gap-1">
              <FaLock className="text-gray-400" />
              <span>256-bit SSL Encrypted</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaShieldAlt className="text-gray-400" />
              <span>Razorpay Verified Gateway</span>
            </span>
            <span>•</span>
            <span>UPI / GPay / Cards / Netbanking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
