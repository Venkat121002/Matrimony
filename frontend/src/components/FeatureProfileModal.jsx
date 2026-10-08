import React, { useState, useEffect } from 'react';
import { FaTimes, FaCrown, FaCheckCircle, FaBolt, FaStar, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import DefaultAvatar from './DefaultAvatar';

export default function FeatureProfileModal({
  isOpen,
  onClose,
  currentUser,
  onOpenLogin,
  onSuccess,
  marqueeSettings,
}) {
  const { t, isTamil, translateName } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [price, setPrice] = useState(marqueeSettings?.price || 299);
  const [durationDays, setDurationDays] = useState(marqueeSettings?.durationDays || 15);

  const isAlreadyFeatured = Boolean(
    currentUser &&
    currentUser.isFeatured &&
    (!currentUser.featuredUntil || new Date(currentUser.featuredUntil) > new Date())
  );

  useEffect(() => {
    if (marqueeSettings?.price) setPrice(marqueeSettings.price);
    if (marqueeSettings?.durationDays) setDurationDays(marqueeSettings.durationDays);
  }, [marqueeSettings]);

  if (!isOpen) return null;

  // Load Cashfree dynamically
  const loadCashfreeScript = () => {
    return new Promise((resolve) => {
      if (window.Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const verifyAndFeature = async (token, payload) => {
    try {
      const verifyRes = await fetch('/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        if (onSuccess) onSuccess(verifyData);
        onClose();
      } else {
        setErrorMsg(
          verifyData.message ||
            (isTamil ? 'Cashfree கட்டண சரிபார்ப்பு தோல்வியடைந்தது.' : 'Payment verification failed on Cashfree.')
        );
      }
    } catch (verErr) {
      setErrorMsg(
        isTamil
          ? 'கட்டணத்தை உறுதிப்படுத்துவதில் பிழை ஏற்பட்டது. தயவுசெய்து ஆதரவைத் தொடர்பு கொள்ளவும்.'
          : 'Error confirming payment with Cashfree. Please contact support.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    if (isAlreadyFeatured) {
      setErrorMsg(
        isTamil
          ? 'உங்கள் வரன் ஏற்கனவே முகப்பு ஓடும் பட்டியில் செயலில் உள்ளது.'
          : 'Your profile is already featured in the Running Marquee Bar.'
      );
      return;
    }

    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      onClose();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('nikah_token');
      if (!token) {
        setErrorMsg(isTamil ? 'மேம்படுத்த முன் உள்நுழையவும்.' : 'Please log in before featuring your profile.');
        setLoading(false);
        return;
      }

      // 1. Create Order on Backend for 'featured_marquee'
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: 'featured_marquee' }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(
          orderData.message ||
            (isTamil
              ? 'Cashfree கட்டண போர்ட்டலை துவக்க முடியவில்லை.'
              : 'Could not initiate Cashfree payment order.')
        );
      }

      if (!orderData.paymentSessionId) {
        throw new Error(
          isTamil
            ? 'Cashfree கட்டண அமர்வு கிடைக்கவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
            : 'Cashfree payment session is unavailable. Please try again later.'
        );
      }

      // 2. Load Cashfree SDK
      const scriptLoaded = await loadCashfreeScript();

      if (!scriptLoaded || !window.Cashfree) {
        throw new Error(
          isTamil
            ? 'Cashfree கட்டண போர்ட்டலை ஏற்ற முடியவில்லை. உங்கள் இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
            : 'Could not open Cashfree payment portal. Please check your internet connection and try again.'
        );
      }

      // 3. Configure Cashfree Checkout
      const cashfree = window.Cashfree({
        mode: orderData.environment || 'sandbox',
      });

      cashfree
        .checkout({
          paymentSessionId: orderData.paymentSessionId,
          redirectTarget: '_modal',
        })
        .then(async (result) => {
          if (result.error) {
            console.warn('[Cashfree Modal Result]:', result.error);
            setErrorMsg(
              result.error.message ||
                (isTamil ? 'கட்டணம் செலுத்தப்படவில்லை அல்லது ரத்து செய்யப்பட்டது.' : 'Payment was not completed.')
            );
            setLoading(false);
            return;
          }

          // Modal checkout succeeded
          await verifyAndFeature(token, {
            orderId: orderData.orderId,
            paymentSessionId: orderData.paymentSessionId,
          });
        })
        .catch((checkoutErr) => {
          console.error('[Cashfree SDK Checkout Exception]:', checkoutErr);
          setErrorMsg(
            isTamil
              ? 'Cashfree கட்டண போர்ட்டலை திறக்க முடியவில்லை. இணைய இணைப்பை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
              : 'Unable to open Cashfree payment portal. Please try again.'
          );
          setLoading(false);
        });
    } catch (err) {
      console.error('[Feature Payment Error]:', err);
      setErrorMsg(err.message || (isTamil ? 'விளம்பரம் துவங்குவதில் தோல்வி.' : 'Failed to initiate promotion.'));
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] text-white p-4 flex items-center justify-between border-b-2 border-[#caa85d] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#163828] flex items-center justify-center font-bold text-lg shadow-sm">
              <FaStar className="text-amber-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-100 flex items-center gap-1.5 font-cinzel">
                <span>{isTamil ? 'ஓடும் பட்டியில் முன்னிலைப்படுத்த' : 'Feature in Top Running Bar'}</span>
              </h3>
              <p className="text-[11px] text-amber-200/80">
                {isTamil ? `${durationDays} நாட்கள் பிரத்யேக காட்சி முன்னுரிமை` : `${durationDays} Days Top Priority Visibility`}
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

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 text-gray-800 overflow-y-auto">
          {/* Already Featured Notice */}
          {isAlreadyFeatured && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-start gap-3 text-emerald-950 shadow-sm">
              <FaCheckCircle className="text-emerald-600 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-900">
                  {isTamil ? '✓ ஏற்கனவே ஓடும் பட்டியில் காட்சிப்படுத்தப்பட்டுள்ளது!' : '✓ Already Featured & Active'}
                </h4>
                <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                  {isTamil
                    ? 'உங்கள் வரன் ஏற்கனவே முகப்பு ஓடும் பட்டியில் முன்னிலைப்படுத்தப்பட்டு நேரலையில் உள்ளது.'
                    : 'Your profile is currently active in the top running marquee bar.'}
                </p>
                {currentUser?.featuredUntil && (
                  <p className="text-[11px] font-bold text-emerald-900 mt-1">
                    {isTamil ? 'செல்லுபடியாகும் காலம்:' : 'Active until:'}{' '}
                    {new Date(currentUser.featuredUntil).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
                      dateStyle: 'medium',
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-800 text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* User Preview Card */}
          {currentUser ? (
            <div className="p-3 bg-white rounded-xl border border-[#dfd2ba] flex items-center gap-3 shadow-xs">
              <div className="w-12 h-14 rounded-lg overflow-hidden border border-amber-300 flex-shrink-0 bg-gray-100">
                {currentUser.photos?.[0] ? (
                  <img
                    src={currentUser.photos[0]}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <DefaultAvatar size="card" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs text-[#163828] truncate">
                    {translateName(!isTamil ? (currentUser.fullNameEn || currentUser.fullName || currentUser.name) : (currentUser.fullName || currentUser.name))}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-200">
                    {currentUser.nikahId}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {currentUser.district || currentUser.location} • {currentUser.age} {isTamil ? 'வயது' : 'Yrs'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-1">
                  <FaBolt className="text-[9px]" />
                  <span>{isTamil ? 'முகப்பு உச்சியில் ஓடிக்கொண்டிருக்கும்' : 'Runs live at top of homepage'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900">
              {isTamil ? 'வரனை விளம்பரப்படுத்த முதலில் உள்நுழையவும்.' : 'Please log in to promote your profile.'}
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-2 bg-[#fdfaf3] p-3.5 rounded-xl border border-[#caa85d]/60 text-xs">
            <h4 className="font-extrabold text-[#163828] text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <FaCrown className="text-amber-600" />
              <span>{isTamil ? 'ஓடும் பட்டியின் நன்மைகள்:' : 'Marquee Promotion Benefits:'}</span>
            </h4>
            <ul className="space-y-1.5 text-gray-700">
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-700 text-xs flex-shrink-0 mt-0.5" />
                <span>
                  {isTamil
                    ? 'வலைதள முகப்பின் மிக முக்கியமான உச்சியில் உங்கள் வரன் தொடர்ந்து ஓடிக்கொண்டிருக்கும்.'
                    : 'Your biodata continuously scrolls across the top banner of the site.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-700 text-xs flex-shrink-0 mt-0.5" />
                <span>
                  {isTamil
                    ? '10 மடங்கு கூடுதல் பார்வையாளர்களை ஈர்க்கும் சிறப்பு வரன் அடையாளம் (Featured Gold Badge).'
                    : 'Featured Gold Badge attracts up to 10x more prospective inquiries.'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <FaCheckCircle className="text-emerald-700 text-xs flex-shrink-0 mt-0.5" />
                <span>
                  {isTamil
                    ? 'பார்வையாளர்கள் சுட்டியை வைத்தால் ஓட்டம் நின்று வரனின் முழு விவரங்களை உடனடியாகத் தேர்வு செய்ய இயலும்.'
                    : 'Hover pauses scroll allowing viewers to view details & choose directly.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Pricing Box */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-amber-400/25 to-amber-500/15 rounded-xl border-2 border-amber-400 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-wider block">
                {isTamil ? 'விளம்பரக் கட்டணம்' : 'Promotion Fee'}
              </span>
              <span className="font-extrabold text-xs text-[#163828]">
                {durationDays} {isTamil ? 'நாட்கள் செல்லுபடியாகும்' : 'Days Validity'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-[#163828]">₹{price}</div>
              <span className="text-[10px] text-gray-500 font-semibold">
                {isTamil ? 'வரிகள் உள்ளடக்கம்' : 'All taxes incl.'}
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2">
            {isAlreadyFeatured ? (
              <div className="space-y-1">
                <button
                  type="button"
                  disabled
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-sm"
                >
                  <FaCheckCircle className="text-emerald-700" />
                  <span>
                    {isTamil
                      ? 'ஏற்கனவே கட்டணம் செலுத்தப்பட்டது (Already Paid)'
                      : 'Already Paid & Running in Marquee'}
                  </span>
                </button>
                <p className="text-[10px] text-center text-gray-500">
                  {isTamil
                    ? 'உங்கள் வரன் தற்போது செயலில் உள்ளதால் கூடுதல் கட்டணம் செலுத்த தேவையில்லை.'
                    : 'No payment needed — profile is actively featured.'}
                </p>
              </div>
            ) : (
              <button
                type="button"
                disabled={loading || !currentUser}
                onClick={handlePromote}
                className="w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-gray-950 border border-amber-300 shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <FaCrown className="text-[#163828]" />
                <span>
                  {loading
                    ? (isTamil ? 'Cashfree வாயில் துவங்குகிறது...' : 'Connecting to Cashfree...')
                    : (isTamil ? `₹${price} செலுத்தி வரனை முன்னிலைப்படுத்துக (Cashfree)` : `Pay ₹${price} & Feature Profile Now`)}
                </span>
              </button>
            )}
            <p className="text-[10px] text-center text-gray-500 mt-2 flex items-center justify-center gap-1">
              <FaShieldAlt className="text-emerald-700" />
              <span>{isTamil ? 'Cashfree 100% பாதுகாப்பான கட்டண முறை' : 'Cashfree 100% Safe & Secure Transaction'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
