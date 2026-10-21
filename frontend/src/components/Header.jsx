import React, { useState, useRef, useEffect } from 'react';
import { FaGlobe, FaChevronDown, FaUser, FaSignOutAlt, FaWhatsapp, FaBars, FaTimes } from 'react-icons/fa';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [mobileMenuOpen]);

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
      {/* Top Bismillah Strip in Tamil (slightly reduced size) */}
      <div className="w-full pt-2 pb-0.5 px-3 text-center">
        <p
          className="text-xs sm:text-sm md:text-base font-semibold tracking-wide select-none"
          style={{
            fontFamily: "'Noto Sans Tamil', system-ui, -apple-system, sans-serif",
            background: 'linear-gradient(180deg, #fff7d6 0%, #edd48e 40%, #caa85d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))',
          }}
          title="பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்"
        >
          பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்
        </p>
      </div>

      {/* Top Banner with Islamic Green & Gold Motif */}
      <div className="max-w-6xl mx-auto px-2 sm:px-4 pb-3 sm:pb-4 pt-1 flex items-center justify-between gap-3 sm:gap-6 relative">
        {/* Left: Website Logo Emblem & Straight-Line Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div
            className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-22 lg:h-22 flex-shrink-0 flex items-center justify-center p-0.5 rounded-full bg-gradient-to-b from-[#caa85d] via-[#f7e4a8] to-[#74551c] shadow-xl border-2 border-[#e6d08f] cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-105"
            onClick={() => { window.location.href = '/'; }}
            title="Tamil Muslim Nikkah"
          >
            <img
              src="/logo.png"
              alt="Tamil Muslim Nikkah Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Site Title (straight line) and Tagline (wraps gracefully) */}
          <div className="min-w-0">
            <h1
              className="font-cinzel text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[32px] font-extrabold tracking-wide uppercase cursor-pointer whitespace-nowrap select-none"
              style={{
                background: 'linear-gradient(180deg, #fff7d6 0%, #ecd08c 30%, #caa146 70%, #906f23 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8))',
                letterSpacing: '0.025em'
              }}
              onClick={() => { window.location.href = '/'; }}
              title="Tamil Muslim Nikkah"
            >
              Tamil Muslim Nikkah
            </h1>
            <p className="text-[#ecd08c] font-tamil text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-medium mt-0.5 tracking-normal drop-shadow leading-tight sm:leading-snug max-w-[210px] xs:max-w-[260px] sm:max-w-sm md:max-w-md break-words">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Desktop: Top Right User Controls & 4 Actions (md: and up) */}
        <div className="hidden md:flex items-center justify-end gap-2 text-xs flex-shrink-0">
          {currentUser ? (
            <div className="flex flex-col items-end gap-1.5 p-1">
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

              {/* View Profile Button and Logout Button beside it */}
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
                className="px-3 py-1.5 rounded-md btn-gold font-bold shadow text-xs cursor-pointer hover:brightness-105 whitespace-nowrap"
              >
                {t('loginBtn')}
              </button>
              <button
                type="button"
                onClick={onOpenRegister}
                className="px-3 py-1.5 rounded-md bg-[#25583f] hover:bg-[#317051] text-[#fff7d6] border border-[#caa85d] font-bold text-xs shadow cursor-pointer whitespace-nowrap"
              >
                {isTamil ? 'பதிவு' : 'Register'}
              </button>
              {onOpenOverseasRegister && (
                <button
                  type="button"
                  onClick={onOpenOverseasRegister}
                  className="px-2.5 py-1.5 rounded-md bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-amber-400 text-gray-950 border border-amber-200 font-extrabold text-xs shadow flex items-center gap-1 transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                  title={isTamil ? 'வெளிநாட்டு வரன்களுக்கான தனி பதிவு' : 'Register for Foreign / Overseas candidates'}
                >
                  <span>🌍</span>
                  <span>{isTamil ? 'வெளிநாட்டு வரன் பதிவு' : 'Overseas Register'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onOpenSupport}
                className="px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-[#edd48e] border border-[#caa85d]/50 font-bold text-xs cursor-pointer whitespace-nowrap"
              >
                {isTamil ? 'உதவி மையம்' : 'Help Desk'}
              </button>
            </div>
          )}
        </div>

        {/* Mobile: Hamburger Bar Button in the right corner */}
        <div className="md:hidden flex items-center flex-shrink-0 relative" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-b from-[#caa85d] via-[#edd48e] to-[#9c772c] text-[#163828] hover:text-black font-extrabold shadow-lg border border-[#f5e2ab] transition-all active:scale-95 cursor-pointer"
            aria-label="Navigation Menu"
            title="Menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-lg" />}
          </button>

          {/* Mobile Dropdown Menu for Action Buttons */}
          {mobileMenuOpen && (
            <div className="absolute right-0 top-full mt-2.5 z-50 w-64 bg-gradient-to-b from-[#143625] to-[#0c2317] border-2 border-[#caa85d] rounded-xl shadow-2xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-[#caa85d]/40 pb-2 px-1">
                <span className="text-[11px] font-bold text-[#eed48e] uppercase tracking-wider">
                  {isTamil ? 'முதன்மை மெனு' : 'Menu Options'}
                </span>
                <span className="text-[10px] text-[#caa85d]">Tamil Muslim Nikkah</span>
              </div>

              {currentUser ? (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#1a4430] border border-[#caa85d]/30 text-xs">
                    <p className="font-extrabold text-[#fff7d6] truncate">
                      {translateName(!isTamil ? (currentUser.fullNameEn || currentUser.fullName || currentUser.name) : (currentUser.fullName || currentUser.name))}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] text-amber-300 font-bold">
                      {currentUser.subscriptionStatus === 'premium' || currentUser.isSubscribed
                        ? (isTamil ? 'சந்தா பயனர் (Subscribed)' : 'Subscribed User')
                        : (isTamil ? 'இலவச பயனர் (Free Tier)' : 'Free Tier User')}
                    </span>
                  </div>

                  {!isOnProfilePage && (
                    <a
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 px-3 rounded-lg btn-gold font-bold text-xs flex items-center justify-center gap-2 shadow"
                    >
                      <FaUser className="text-[#163828] text-xs" />
                      <span>{isTamil ? 'புரொபைல் பார்க்க' : 'View Profile'}</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSupport && onOpenSupport();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-[#edd48e] border border-[#caa85d]/50 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{isTamil ? 'உதவி மையம்' : 'Help Desk'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout && onLogout();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow border border-red-500 transition cursor-pointer"
                  >
                    <FaSignOutAlt className="text-xs" />
                    <span>{isTamil ? 'வெளியேறு' : 'Logout'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  {/* Login Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenLogin && onOpenLogin();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg btn-gold font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-98 cursor-pointer"
                  >
                    <span>{t('loginBtn')}</span>
                  </button>

                  {/* Register Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenRegister && onOpenRegister();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#25583f] hover:bg-[#317051] text-[#fff7d6] border border-[#caa85d] font-bold text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-98 cursor-pointer"
                  >
                    <span>{isTamil ? 'இலவச பதிவு (Register)' : 'Register'}</span>
                  </button>

                  {/* Overseas Register Button */}
                  {onOpenOverseasRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenOverseasRegister();
                      }}
                      className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 border border-amber-200 font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
                    >
                      <span>🌍</span>
                      <span>{isTamil ? 'வெளிநாட்டு குடியுரிமை வரன் பதிவு' : 'Overseas Register'}</span>
                    </button>
                  )}

                  {/* Help Desk Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenSupport && onOpenSupport();
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-[#edd48e] border border-[#caa85d]/50 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <span>{isTamil ? 'உதவி மையம்' : 'Help Desk'}</span>
                  </button>
                </div>
              )}
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
              href="https://wa.me/919344511158"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#163828] hover:bg-[#204e38] text-white hover:text-amber-200 transition shadow-xs text-xs font-bold border border-[#caa85d]/60"
              title="WhatsApp: 9344511158"
            >
              <FaWhatsapp className="text-emerald-400 text-sm" />
              <span>WhatsApp : 9344511158</span>
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
