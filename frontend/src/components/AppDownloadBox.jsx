import React from 'react';
import { FaGooglePlay } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function AppDownloadBox({ onDownloadClick }) {
  const { t } = useLanguage();

  return (
    <div className="w-full box-silver rounded-xl p-4 text-center shadow-md border border-[#9c9c9c] mb-4">
      {/* Title */}
      <h4 className="text-xs sm:text-sm font-black text-[#1a2b49] mb-1.5 tracking-wide">
        {t('appDownloadTitle')}
      </h4>
      <p className="text-[11px] font-bold text-gray-700 mb-3 tracking-tight">
        {t('appDownloadSub')}
      </p>

      {/* Google Play Button Badge */}
      <div className="flex justify-center">
        <button
          onClick={onDownloadClick}
          type="button"
          className="bg-black hover:bg-neutral-900 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-2 border border-neutral-700 shadow-md transition-all hover:scale-105"
        >
          {/* Google Play Icon Colors */}
          <div className="text-xl text-[#00E676] flex-shrink-0">
            <FaGooglePlay />
          </div>
          <div className="text-left leading-none">
            <div className="text-[9px] uppercase tracking-wider text-gray-300">
              GET IT ON
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              Google Play
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

