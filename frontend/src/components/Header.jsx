import React, { useState } from 'react';
import { FaGlobe, FaChevronDown, FaUser, FaSignOutAlt, FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function Header({
  onOpenContact,
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onOpenOverseasRegister,
  onOpenAdmin,
  onOpenUpgrade,
  onOpenSupport,
  onLogout,
  isProfilePage = false,
}) {
  const { language, setLanguage, t, translateName } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const isOnProfilePage =
    isProfilePage ||
    (typeof window !== 'undefined' &&
      (window.location.pathname === '/profile' ||
        window.location.pathname.startsWith('/profile')));

  const languages = [
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'en', label: 'English' },
  ];

  const currentLangLabel = language === 'en' ? 'English' : 'தமிழ் (Tamil)';
  const isTamil = language === 'ta';

  return (
    <header className="w-full bg-[#163828] border-b-2 border-[#caa85d] shadow-lg">
      {/* Top Banner with Islamic Green & Gold Motif */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Website Logo Emblem */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-[112px] lg:h-[112px] flex-shrink-0 flex items-center justify-center p-0.5 rounded-full bg-gradient-to-b from-[#caa85d] via-[#f7e4a8] to-[#74551c] shadow-xl border-2 border-[#e6d08f] cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-105"
            onClick={() => { window.location.href = '/'; }}
            title="Tamil Muslim Nikkah"
          >
            <img
              src="/logo.png"
              alt="Tamil Muslim Nikkah Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Site Title and Tagline */}
          <div className="text-center md:text-left">
            <h1
              className="font-cinzel text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide uppercase cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #fff7d6 0%, #ecd08c 30%, #caa146 70%, #906f23 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8))',
                letterSpacing: '0.04em'
              }}
              onClick={() => { window.location.href = '/'; }}
              title="Go to Home"
            >
              Tamil Muslim Nikkah
            </h1>
            <p className="text-[#ecd08c] font-tamil text-xs sm:text-sm md:text-base font-medium mt-0.5 tracking-normal drop-shadow">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Top Right User Controls & Actions */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs">
          {currentUser ? (
            <div className="flex flex-col items-center md:items-end gap-1.5 p-1">
              {/* User Name & Subscription Status Badge above View Profile button */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#fff7d6] text-xs sm:text-sm drop-shadow tracking-wide">
                  {translateName(!isTamil ? (currentUser.fullNameEn || currentUser.fullName || currentUser.name) : (currentUser.fullName || currentUser.name))}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold border ${currentUser.subscriptionStatus === 'premium' || currentUser.isSubscribed
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 border-amber-300 shadow-sm'
                      : 'bg-[#163828]/80 text-[#ecd08c] border-[#caa85d]/60 shadow-xs'
                    }`}
                >
                  {currentUser.subscriptionStatus === 'premium' || currentUser.isSubscribed
                    ? (isTamil ? 'சந்தா (Subscribed)' : 'Subscribed')
                    : (isTamil ? 'இலவச பயனர் (Free Tier)' : 'Free Tier')}
                </span>
              </div>

              {/* View Profile Button (hidden when on view profile page) and Logout Button beside it */}
              <div className="flex items-center gap-2">
                {!isOnProfilePage && (
                  <a
                    href="/profile"
                    className="px-3.5 py-1.5 rounded-full btn-gold font-bold shadow-md flex items-center gap-1.5 text-xs sm:text-sm transition-transform hover:scale-105"
                  >
                    <FaUser className="text-[#163828] text-xs" />
                    <span>{isTamil ? 'புரொபைல் பார்க்க' : 'View Profile'}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-full bg-red-700 hover:bg-red-800 text-white font-bold shadow-md flex items-center gap-1.5 text-xs transition-transform hover:scale-105 border border-red-500 cursor-pointer"
                  title={isTamil ? 'வெளியேறு' : 'Logout'}
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>{isTamil ? 'வெளியேறு' : 'Logout'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-md btn-gold font-bold shadow text-xs"
              >
                {t('loginBtn')}
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-3 py-1.5 rounded-md bg-[#25583f] hover:bg-[#317051] text-[#fff7d6] border border-[#caa85d] font-bold text-xs shadow"
              >
                {isTamil ? 'பதிவு' : 'Register'}
              </button>
              {onOpenOverseasRegister && (
                <button
                  type="button"
                  onClick={onOpenOverseasRegister}
                  className="px-2.5 py-1.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-amber-400 text-gray-950 border border-amber-200 font-extrabold text-xs shadow flex items-center gap-1 transition-transform hover:scale-105"
                  title={isTamil ? 'வெளிநாட்டு வரன்களுக்கான தனி பதிவு' : 'Register for Foreign / Overseas candidates'}
                >
                  <span>🌍</span>
                  <span>{isTamil ? 'வெளிநாட்டு பதிவு' : 'Overseas Register'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenSupport}
                className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[#edd48e] border border-[#caa85d]/50 font-bold text-xs"
              >
                {isTamil ? 'உதவி மையம்' : 'Help Desk'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gold Strip */}
      <div className="w-full bg-gradient-to-r from-[#8a6d2f] via-[#edd48e] to-[#8a6d2f] py-1 px-3 border-t border-[#f4e2ab] text-[#2b1b04] font-medium text-xs sm:text-sm shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Work Hours & WhatsApp */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 font-bold text-xs sm:text-sm">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#163828] animate-pulse"></span>
              <span>{t('workHours')}</span>
            </div>
            <span className="text-[#644917] hidden sm:inline">•</span>
            <a
              href="https://wa.me/919171896625"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#163828] hover:bg-[#204e38] text-white hover:text-amber-200 transition shadow-xs text-xs font-bold border border-[#caa85d]/60"
              title="WhatsApp: 9171896625"
            >
              <FaWhatsapp className="text-emerald-400 text-sm" />
              <span>WhatsApp : 9171896625</span>
            </a>
          </div>

          {/* Select Language */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="bg-white/90 hover:bg-white text-[#333] border border-[#a88235] rounded px-2.5 py-0.5 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition"
              title={t('selectLanguage')}
              type="button"
            >
              <FaGlobe className="text-[#1a73e8] text-xs" />
              <span>{currentLangLabel}</span>
              <FaChevronDown className="text-[10px] text-gray-500" />
            </button>

            {showLangMenu && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-[#a88235] rounded shadow-xl py-1 w-44">
                <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
                  {t('selectLanguage')}
                </div>
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#fff7e6] transition flex items-center justify-between ${language === lang.code ? 'font-bold text-[#8a6d2f] bg-[#fbf5e6]' : 'text-gray-800'
                      }`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
