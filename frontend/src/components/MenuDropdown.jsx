import React, { useState } from 'react';
import { FaHome, FaUserPlus, FaSignInAlt, FaInfoCircle, FaPhoneAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function MenuDropdown({
  onGoHome,
  onOpenRegister,
  onOpenLogin,
  onOpenAbout,
  onOpenContact,
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: t('home'), icon: FaHome, action: () => { onGoHome(); setIsOpen(false); } },
    { label: t('register'), icon: FaUserPlus, action: () => { onOpenRegister(); setIsOpen(false); } },
    { label: 'Login', icon: FaSignInAlt, action: () => { onOpenLogin(); setIsOpen(false); } },
    { label: t('aboutUs'), icon: FaInfoCircle, action: () => { onOpenAbout(); setIsOpen(false); } },
    { label: t('contact'), icon: FaPhoneAlt, action: () => { onOpenContact(); setIsOpen(false); } },
  ];

  return (
    <div className="w-full flex flex-col items-center mb-4">
      {/* Glossy Red-Orange 3D Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-menu-glossy px-8 py-2 rounded-xl text-sm sm:text-base font-extrabold tracking-wider uppercase flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
        <span>{t('menu')}</span>
      </button>

      {/* Slide-Down Navigation Menu */}
      {isOpen && (
        <div className="w-full max-w-md mt-2 bg-[#fdfaf3] border-2 border-[#caa85d] rounded-xl shadow-xl overflow-hidden animate-fadeIn transition-all z-20">
          <div className="bg-gradient-to-r from-[#163828] to-[#255e43] py-2 px-4 text-center">
            <span className="text-white text-xs font-bold uppercase tracking-wider">
              {t('mainMenu')}
            </span>
          </div>

          <div className="p-2 divide-y divide-[#eee0c9]">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.action}
                  className={`w-full px-4 py-2.5 text-left text-sm font-bold flex items-center gap-3 transition-colors rounded ${
                    item.highlight
                      ? 'bg-[#fdf2e9] text-[#8a1c1c] hover:bg-[#faebd0]'
                      : 'text-[#301f05] hover:bg-[#faebd0] hover:text-[#163828]'
                  }`}
                >
                  <Icon className={`${item.highlight ? 'text-red-700' : 'text-[#8a6d2f]'} text-base`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
