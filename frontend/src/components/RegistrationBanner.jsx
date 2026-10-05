import React from 'react';
import { FaUserPlus } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function RegistrationBanner({ onOpenRegister }) {
  const { t } = useLanguage();

  return (
    <div className="w-full bg-[#184a32] border-2 border-[#caa85d] rounded-xl p-3.5 sm:p-4 text-center shadow-md mb-4 text-white">
      <p className="text-xs sm:text-sm md:text-base font-bold leading-relaxed max-w-2xl mx-auto drop-shadow-sm">
        {t('bannerText')}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={onOpenRegister}
          className="btn-orange px-6 sm:px-7 py-2 rounded-lg text-xs sm:text-sm font-extrabold tracking-wide uppercase shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
        >
          <FaUserPlus className="text-xs" />
          <span>{t('bannerBtn')}</span>
        </button>
      </div>
    </div>
  );
}
