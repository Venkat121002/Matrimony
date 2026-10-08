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
        {/* Left: Kaaba, Dome & Floral Emblem */}
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center p-1 rounded-full bg-gradient-to-b from-[#caa85d] to-[#74551c] shadow-md border border-[#e6d08f]">
            {/* SVG Islamic Emblem: Mosque Dome, Minaret & Kaaba with floral accents */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffae0" />
                  <stop offset="50%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#8a6d2f" />
                </linearGradient>
                <linearGradient id="domeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2ec27e" />
                  <stop offset="60%" stopColor="#126b41" />
                  <stop offset="100%" stopColor="#0a3d24" />
                </linearGradient>
                <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b8b" />
                  <stop offset="100%" stopColor="#c71545" />
                </linearGradient>
              </defs>

              {/* Background badge circle */}
              <circle cx="50" cy="50" r="46" fill="#0d291c" stroke="url(#goldGrad)" strokeWidth="2" />

              {/* Kaaba Silhouette */}
              <rect x="24" y="44" width="22" height="26" fill="#111111" rx="1" />
              {/* Kiswah gold belt */}
              <line x1="24" y1="51" x2="46" y2="51" stroke="url(#goldGrad)" strokeWidth="1.5" />
              <line x1="24" y1="54" x2="46" y2="54" stroke="url(#goldGrad)" strokeWidth="0.8" />

              {/* Green Dome of Prophet's Mosque */}
              <path d="M 52 70 L 76 70 C 76 56 68 45 64 38 C 60 45 52 56 52 70 Z" fill="url(#domeGrad)" />
              {/* Dome Crescent & Finial */}
              <line x1="64" y1="38" x2="64" y2="30" stroke="url(#goldGrad)" strokeWidth="1.5" />
              <path d="M 64 29 A 3.5 3.5 0 1 1 66 33 A 2.5 2.5 0 1 0 64 29 Z" fill="url(#goldGrad)" />

              {/* Minaret on Left */}
              <rect x="18" y="32" width="4" height="38" fill="#e8dfce" />
              <polygon points="16,32 20,22 24,32" fill="url(#goldGrad)" />
              {/* Minaret on Right */}
              <rect x="80" y="30" width="4.5" height="40" fill="#e8dfce" />
              <polygon points="78,30 82.2,19 86.5,30" fill="url(#goldGrad)" />

              {/* Left Rose Garland */}
              <circle cx="14" cy="58" r="4.5" fill="url(#roseGrad)" />
              <circle cx="12" cy="50" r="4" fill="url(#roseGrad)" />
              <circle cx="16" cy="65" r="3.5" fill="url(#roseGrad)" />
              <path d="M 12 55 Q 8 60 14 68" stroke="#38a169" strokeWidth="1.5" fill="none" />

              {/* Right Rose Garland */}
              <circle cx="88" cy="58" r="4.5" fill="url(#roseGrad)" />
              <circle cx="90" cy="50" r="4" fill="url(#roseGrad)" />
              <circle cx="86" cy="65" r="3.5" fill="url(#roseGrad)" />
              <path d="M 88 55 Q 92 60 86 68" stroke="#38a169" strokeWidth="1.5" fill="none" />

              {/* Base floral curve */}
              <path d="M 22 73 Q 50 82 78 73" stroke="url(#goldGrad)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>

          {/* Site Title and Tagline */}
          <div className="text-center md:text-left">
            <h1 className="font-cinzel text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-wide uppercase"
              style={{
                background: 'linear-gradient(180deg, #fff7d6 0%, #ecd08c 30%, #caa146 70%, #906f23 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8))',
                letterSpacing: '0.04em'
              }}>
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
