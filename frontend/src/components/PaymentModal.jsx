import React, { useState, useEffect } from 'react';
import { FaTimes, FaCrown, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { useModalBackdrop } from '../hooks/useModalBackdrop';
import PaymentProofForm from './PaymentProofForm';

export default function PaymentModal({ isOpen, onClose, user, onPaymentSubmitted }) {
  const { t, isTamil } = useLanguage();
  const { backdropProps, modalContentProps } = useModalBackdrop(onClose);
  const [selectedPlan, setSelectedPlan] = useState('annual'); // 'monthly' | 'annual'
  const [annualPrice, setAnnualPrice] = useState(999);
  const [monthlyPrice, setMonthlyPrice] = useState(199);

  const isAlreadySubscribed = Boolean(
    user &&
    user.subscriptionStatus === 'premium' &&
    (!user.premiumExpiresAt || new Date(user.premiumExpiresAt) > new Date())
  );

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentPrice = selectedPlan === 'monthly' ? monthlyPrice : annualPrice;
  const validityText =
    selectedPlan === 'monthly'
      ? (isTamil ? '30 நாட்கள் (1 மாதம்) செல்லுபடியாகும்' : 'Valid for 30 Days (1 Month)')
      : (isTamil ? '365 நாட்கள் (1 வருடம்) செல்லுபடியாகும்' : 'Valid for 365 Days (1 Year)');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
      {...backdropProps}
    >
      <div
        className="w-full max-w-lg bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col"
        {...modalContentProps}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] py-4 px-5 flex items-center justify-between border-b-2 border-[#caa85d] text-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#163828] flex items-center justify-center font-bold text-sm shadow">
              <FaCrown />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-100 font-cinzel">
                {isTamil ? 'பிரீமியம் உறுப்பினர் சந்தா' : 'Premium Membership Plans'}
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
                    ? `உங்கள் கணக்கில் பிரீமியம் சந்தா செயலில் உள்ளது. அனைத்து வரன்களின் தொடர்புகளையும் நீங்கள் வரம்பின்றி அணுகலாம்.`
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

          {/* Plan Selector Toggle (Monthly vs Yearly) */}
          {!isAlreadySubscribed && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#163828] uppercase tracking-wider">
                {isTamil ? 'சந்தா கால அளவைத் தேர்ந்தெடுக்கவும்:' : 'Choose Membership Duration:'}
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
          )}

          {/* Pricing Highlight Banner */}
          <div className="bg-gradient-to-b from-[#f9f4e6] to-[#f2e7cc] border border-[#caa85d] rounded-xl p-3.5 text-center">
            <h4 className="font-extrabold text-xs sm:text-sm text-[#163828] font-cinzel">
              {selectedPlan === 'monthly'
                ? (isTamil ? '1 மாத வரம்பற்ற பிரீமியம் உறுப்பினர்' : '1 Month Unlimited Premium Access')
                : (isTamil ? '1 வருட வரம்பற்ற பிரீமியம் உறுப்பினர்' : 'Annual Unlimited Premium Access')}
            </h4>
            <div className="my-2 flex items-baseline justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-black text-[#8a6d2f]">₹{currentPrice}</span>
              {selectedPlan === 'annual' && (
                <>
                  <span className="text-gray-500 line-through text-sm">₹{Math.round(annualPrice * 2.5)}</span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">60% OFF</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-600 font-medium">
              {validityText} • {isTamil ? 'வரி உள்ளடங்கியது' : 'All taxes inclusive'}
            </p>
          </div>

          {/* Benefits List */}
          <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#dfd2ba]">
            <h5 className="font-bold text-[#163828] text-xs uppercase tracking-wider mb-1.5">
              {isTamil ? 'பிரீமியம் நன்மைகள் (Membership Benefits):' : 'Included in this plan:'}
            </h5>

            <div className="flex items-start gap-2 text-xs text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-sm" />
              <span>
                <strong>{isTamil ? 'வரம்பற்ற வரன் விவரப் பார்வை:' : 'Unlimited Profile Views:'}</strong>{' '}
                {isTamil
                  ? 'இலவச கணக்கின் 5 வரன் கட்டுப்பாடு நீக்கப்பட்டு, வரம்பற்ற வரன்களின் முழு விவரங்களையும் பார்க்கலாம்.'
                  : 'View complete details of unlimited profiles without the 5-profile restriction.'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-sm" />
              <span>
                <strong>{isTamil ? 'வரம்பற்ற வரன்கள் தேர்வு:' : 'Unlimited Chosen Profiles:'}</strong>{' '}
                {isTamil
                  ? 'இலவச கணக்கின் 3 வரன் தேர்வு வரம்பு நீக்கப்பட்டு, விரும்பும் அனைத்து வரன்களையும் தேர்வு செய்யலாம்.'
                  : 'Choose and shortlist unlimited prospective profiles.'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-sm" />
              <span>
                <strong>{isTamil ? 'நேரடி குடும்ப தொடர்பு எண்கள்:' : 'Direct Contact Details Access:'}</strong>{' '}
                {isTamil
                  ? 'முதன்மை & கூடுதல் தொலைபேசி எண்கள், வாட்ஸ்அப் மற்றும் பெற்றோர் எண்களை உடனடியாக அணுகலாம்.'
                  : 'Instant access to candidate and family phone numbers, WhatsApp, and parent contacts.'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-800">
              <FaCheckCircle className="text-green-600 flex-shrink-0 mt-0.5 text-sm" />
              <span>
                <strong>{isTamil ? 'புதிய வரன் மின்னஞ்சல் பரிந்துரை:' : 'Match Recommendation Emails:'}</strong>{' '}
                {isTamil
                  ? 'புதிய வரன் இணையும் போது பொருத்தமான வரன்கள் மின்னஞ்சலுக்கு தானாகவே அனுப்பப்படும்.'
                  : 'Automated match recommendations delivered straight to your email.'}
              </span>
            </div>
          </div>

          {/* Already subscribed: nothing to pay */}
          {isAlreadySubscribed ? (
            <div className="space-y-1">
              <button
                type="button"
                disabled
                className="w-full py-3 px-4 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-sm font-extrabold flex items-center justify-center gap-2 cursor-not-allowed opacity-90 shadow-sm"
              >
                <FaCheckCircle className="text-emerald-700" />
                <span>
                  {isTamil ? 'ஏற்கனவே பிரீமியம் சந்தாதாரர் (Already Subscribed)' : 'Already Subscribed (Plan Active)'}
                </span>
              </button>
              <p className="text-[11px] text-center text-gray-500">
                {isTamil
                  ? 'உங்கள் தற்போதைய சந்தா செயலில் உள்ளதால் கூடுதல் கட்டணம் செலுத்த தேவையில்லை.'
                  : 'No payment needed — your subscription is active.'}
              </p>
            </div>
          ) : !user ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center text-xs text-amber-900">
              {isTamil ? 'பணம் செலுத்த முதலில் உள்நுழையவும்.' : 'Please log in to pay and upgrade.'}
            </div>
          ) : (
            <PaymentProofForm
              key={selectedPlan}
              planId={selectedPlan === 'monthly' ? 'monthly_premium' : 'annual_premium'}
              amount={currentPrice}
              onSubmitted={(data) => {
                if (onPaymentSubmitted) onPaymentSubmitted(data);
              }}
            />
          )}

          <p className="text-[11px] text-center text-gray-500 pt-1 flex items-center justify-center gap-1">
            <FaShieldAlt className="text-gray-400" />
            <span>
              {isTamil
                ? 'UPI / GPay மூலம் நேரடியாக செலுத்தவும் • நிர்வாகி சரிபார்த்த பின் செயல்படுத்தப்படும்'
                : 'Pay directly via UPI / GPay • Activated after admin verification'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
