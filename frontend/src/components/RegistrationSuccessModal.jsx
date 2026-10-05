import React, { useState } from 'react';
import { FaCheckCircle, FaCopy, FaCheck, FaLock, FaSignInAlt, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function RegistrationSuccessModal({
  isOpen,
  user,
  onClose,
  onOpenLogin,
}) {
  const { isTamil, translateName } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyNikahId = () => {
    if (user.nikahId) {
      navigator.clipboard.writeText(user.nikahId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleGoToLogin = () => {
    onClose();
    if (onOpenLogin) {
      onOpenLogin(user.phone || user.nikahId || '');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] py-4 px-6 flex items-center justify-between border-b-2 border-[#caa85d] text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-300">
              <FaCheckCircle className="text-2xl" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#fffae6] tracking-wide font-cinzel">
                {isTamil ? 'பதிவு வெற்றிகரமாக முடிந்தது!' : 'REGISTRATION SUCCESSFUL!'}
              </h3>
              <p className="text-xs text-[#ecd08c]">
                {isTamil ? 'அல்ஹம்துலில்லாஹ்' : 'Alhamdulillah'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition text-lg"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-gray-800 text-sm">
          {/* Success Banner */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-center space-y-1">
            <p className="font-bold text-amber-950 text-sm sm:text-base">
              {isTamil
                ? 'உங்கள் வரன் சுயவிவரம் வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது! 👍'
                : 'Your matrimony profile has been registered successfully! 👍'}
            </p>
            <p className="text-xs text-amber-800 font-medium">
              {isTamil
                ? 'நிர்வாகியின் சரிபார்ப்பிற்குப் பிறகு (Admin Verification), உங்கள் வரன் தளத்தில் அனைவருக்கும் தெரியும் வகையில் வெளியிடப்படும்.'
                : 'Your profile will be publicly displayed on the website once verified by the admin.'}
            </p>
          </div>

          {/* Details Card */}
          <div className="bg-white border border-[#c5b597]/70 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs text-gray-500 font-semibold">
                {isTamil ? 'வரன் எண் (Nikah ID)' : 'Nikah ID'}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-lg text-amber-950 font-extrabold text-base tracking-wider">
                  {user.nikahId || '100001'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyNikahId}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border border-gray-300 flex items-center gap-1 font-semibold transition"
                  title={isTamil ? 'நகலெடு' : 'Copy'}
                >
                  {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                  <span>{copied ? (isTamil ? 'நகலெடுக்கப்பட்டது!' : 'Copied!') : (isTamil ? 'நகல்' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-gray-500 font-semibold">
                {isTamil ? 'பதிவு செய்யப்பட்ட பெயர்' : 'Candidate Name'}
              </span>
              <span className="font-bold text-gray-900 text-sm">
                {translateName(user.fullName || user.name || '-')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-gray-500 font-semibold">
                {isTamil ? 'மொபைல் எண் (Login Mobile)' : 'Mobile Number'}
              </span>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {user.phone || '-'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-gray-500 font-semibold">
                {isTamil ? 'வரன் வகை' : 'Profile Type'}
              </span>
              <span className="px-2 py-0.5 rounded font-semibold text-xs bg-[#163828]/10 text-[#163828]">
                {user.gender === 'bride'
                  ? (isTamil ? 'மணமகள் (Bride)' : 'Bride')
                  : (isTamil ? 'மணமகன் (Groom)' : 'Groom')}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGoToLogin}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#163828] via-[#24583f] to-[#163828] hover:from-[#1b4330] hover:to-[#1b4330] text-[#edd48e] font-extrabold text-sm sm:text-base tracking-wide border-2 border-[#caa85d] shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition"
            >
              <FaSignInAlt className="text-base" />
              <span>{isTamil ? 'இப்போது உள்நுழையவும்' : 'Log In Now'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="sm:w-32 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm border border-gray-300 shadow-sm transition text-center"
            >
              {isTamil ? 'மூடுக' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
