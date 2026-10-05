import React from 'react';
import { FaUserTie, FaFemale, FaUsers } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function GenderRadioBar({ selectedGender, onChangeGender, onGenderChange, currentUser }) {
  // If user is logged in, completely remove the selection navbar as required
  if (currentUser) {
    return null;
  }

  const { t, language } = useLanguage();
  const isTamil = language === 'ta';
  const handleChange = onChangeGender || onGenderChange || (() => {});

  const options = [
    { value: 'all', label: t('allGenders'), icon: FaUsers },
    { value: 'groom', label: t('groom'), icon: FaUserTie },
    { value: 'bride', label: t('bride'), icon: FaFemale },
  ];

  return (
    <div className="w-full bg-[#1b4331] border-y-2 sm:border-2 sm:rounded-lg border-[#caa85d] py-2 px-3 sm:px-6 shadow-md mb-4">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-white font-bold text-xs sm:text-sm">
        <div className="flex items-center gap-2 border-r-2 border-[#caa85d]/60 pr-3 sm:pr-4">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#eccf89] animate-pulse"></span>
          <span className="font-extrabold text-[#f3dd9b] whitespace-nowrap">{t('genderLabel')}</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 flex-wrap flex-1 justify-center sm:justify-start">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedGender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'bg-[#caa85d] text-[#163828] font-black shadow-md'
                    : 'text-gray-200 hover:text-white hover:bg-white/10 font-medium'
                }`}
              >
                <Icon className={`text-xs ${isSelected ? 'text-[#163828]' : 'text-gray-300'}`} />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
