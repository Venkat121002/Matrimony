import React from 'react';
import { FaGlobeAmericas, FaPassport, FaCheckCircle, FaUserPlus } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function OverseasSectionBanner({
  activeCountry,
  onSelectCountry,
  onOpenOverseasRegister,
}) {
  const { t, isTamil } = useLanguage();

  const countries = [
    { code: 'all', label: isTamil ? 'அனைத்து நாடுகள்' : 'All Countries', flag: '🌐' },
    { code: 'UK', citizenLabel: 'UK Citizen', label: 'UK (லண்டன்)', flag: '🇬🇧' },
    { code: 'USA', citizenLabel: 'US Citizen', label: 'USA (அமெரிக்கா)', flag: '🇺🇸' },
    { code: 'UAE', citizenLabel: 'UAE Citizen', label: 'UAE (அமீரகம் / துபாய்)', flag: '🇦🇪' },
    { code: 'Canada', citizenLabel: 'Canadian Citizen', label: 'Canada (கனடா)', flag: '🇨🇦' },
    { code: 'Australia', citizenLabel: 'Australian Citizen', label: 'Australia (ஆஸ்திரேலியா)', flag: '🇦🇺' },
    { code: 'Other', citizenLabel: 'Other Foreign Citizen', label: isTamil ? 'பிற நாடுகள் (சிங்கப்பூர்)' : 'Other (Singapore/etc)', flag: '🌏' },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-[#2c0e0e] via-[#4d1616] to-[#2c0e0e] border-2 border-[#caa85d] rounded-2xl p-4 sm:p-5 text-white shadow-xl mb-6 relative overflow-hidden">
      {/* Decorative background watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
        <FaGlobeAmericas className="text-white text-9xl" />
      </div>

      <div className="relative z-10">
        {/* Header with Title and Registration Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#caa85d]/40 pb-3.5 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-amber-300 text-2xl flex-shrink-0 shadow-inner">
              <FaPassport />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-gray-950 font-black text-[10px] uppercase tracking-wider">
                  {isTamil ? 'பிரத்யேக பகுதி' : 'Exclusive Section'}
                </span>
                <span className="text-xs text-amber-200 font-semibold">
                  {isTamil ? 'UK • USA • UAE • Canada • Australia • Other' : 'UK • USA • UAE • Canada • Australia • Other'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#fff5db] tracking-wide mt-0.5">
                {t('overseasSectionTitle')}
              </h2>
              <p className="text-xs text-gray-300 mt-0.5">
                {t('overseasSubtitle')}
              </p>
            </div>
          </div>

          {/* Direct CTA: Register as Overseas Tamil */}
          <div className="flex-shrink-0">
            <button
              onClick={onOpenOverseasRegister}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-gray-900 border border-amber-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <FaUserPlus className="text-xs" />
              <span>{isTamil ? 'அயல்நாட்டு வரன் பதிவு' : 'Register Overseas Profile'}</span>
            </button>
          </div>
        </div>

        {/* Citizenship Notice Box */}
        <div className="bg-[#1e0808]/70 border border-amber-500/40 rounded-lg p-2.5 mb-3 flex items-start gap-2 text-xs text-amber-100">
          <FaCheckCircle className="text-amber-400 text-sm mt-0.5 flex-shrink-0" />
          <p className="leading-snug">
            <strong className="text-amber-300">
              {isTamil ? 'குடியுரிமை விதிமுறை: ' : 'Citizenship Rule: '}
            </strong>
            {t('overseasOnlyNotice')}
          </p>
        </div>

        {/* Country of Citizenship Badges Filter */}
        <div>
          <span className="block text-[11px] font-bold text-amber-200 mb-2 uppercase tracking-wide">
            {t('filterByCountry')}
          </span>
          <div className="flex flex-wrap gap-2">
            {countries.map((c) => {
              const isSelected = activeCountry === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => onSelectCountry(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-amber-400 text-gray-950 border border-white font-black shadow-md scale-105'
                      : 'bg-[#1f0a0a] text-gray-200 border border-amber-600/40 hover:bg-[#381111] hover:text-white'
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.label}</span>
                  {c.citizenLabel && (
                    <span className="text-[10px] opacity-75 hidden sm:inline">
                      ({c.citizenLabel})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
