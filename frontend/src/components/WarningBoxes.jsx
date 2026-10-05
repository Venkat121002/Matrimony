import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function WarningBoxes() {
  const { t } = useLanguage();

  return (
    <div className="w-full space-y-4 mb-4">
      {/* 1. Yellow Box: எச்சரிக்கை! (Dowry Warning) */}
      <div className="w-full rounded-xl overflow-hidden shadow-md border-2 border-[#8B0000]">
        <div className="bg-[#7A1414] py-1.5 px-4 text-center">
          <h4 className="font-extrabold text-sm sm:text-base text-white tracking-wider">
            {t('warningTitle')}
          </h4>
        </div>
        <div className="bg-[#ffeb3b] p-3 text-center border-t border-[#8B0000]/30">
          <p className="font-extrabold text-xs sm:text-sm text-[#7A1414] leading-relaxed">
            {t('dowryWarning')}
          </p>
        </div>
      </div>

      {/* 2. Light Green Box: தாமதிக்காதீர்! (Marriage Delay Warning) */}
      <div className="w-full rounded-xl overflow-hidden shadow-md border-2 border-[#d9822b]">
        <div className="bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#d97706] py-1.5 px-4 text-center">
          <h4 className="font-extrabold text-sm sm:text-base text-white tracking-wider">
            {t('delayTitle')}
          </h4>
        </div>
        <div className="bg-[#e8f7dc] p-3 text-center border-t border-[#d9822b]/30">
          <p className="font-extrabold text-xs sm:text-sm text-[#5a1b1b] leading-relaxed">
            {t('delayWarning')}
          </p>
        </div>
      </div>
    </div>
  );
}

