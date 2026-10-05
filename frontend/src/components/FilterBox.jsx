import React, { useState } from 'react';
import { FaFilter, FaSearch, FaRedo, FaChevronDown, FaChevronUp, FaBriefcase, FaSlidersH } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function FilterBox({
  filters,
  searchId,
  onSearchId,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
}) {
  const { t, translateValue, isTamil } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearchId, setLocalSearchId] = useState(searchId || '');

  const maritalStatusOptions = [
    { value: 'அனைத்தும்', label: t('allOptions') },
    { value: 'திருமணம் ஆகாதவர்', label: translateValue('திருமணம் ஆகாதவர்') },
    { value: 'விவாகரத்து ஆனவர்', label: translateValue('விவாகரத்து ஆனவர்') },
    { value: 'மறுமணம்', label: translateValue('மறுமணம்') },
  ];

  const languageOptions = [
    { value: 'அனைத்தும்', label: t('allOptions') },
    { value: 'தமிழ்-முஸ்லிம்', label: translateValue('தமிழ்-முஸ்லிம்') },
    { value: 'உருது-முஸ்லிம்', label: translateValue('உருது-முஸ்லிம்') },
  ];

  const employmentOptions = [
    { value: 'all', label: t('allEmploymentStatus') },
    { value: 'it_software', label: isTamil ? 'மென்பொருள் / ஐடி (Software / IT)' : 'Software / IT' },
    { value: 'govt_bank', label: isTamil ? 'அரசு பணி / வங்கி (Govt / Banking)' : 'Government / Banking' },
    { value: 'business', label: isTamil ? 'சொந்த தொழில் / வணிகம் (Business)' : 'Own Business / Trade' },
    { value: 'medical', label: isTamil ? 'மருத்துவம் / நர்சிங் (Medical / Healthcare)' : 'Doctor / Medical / Nursing' },
    { value: 'teacher', label: isTamil ? 'ஆசிரியர் / கல்வி (Teaching / Education)' : 'Teacher / Professor' },
    { value: 'private', label: isTamil ? 'தனியார் பணி (Private Company)' : 'Private Sector' },
    { value: 'homemaker', label: isTamil ? 'இல்லத்தரசி (Homemaker)' : 'Homemaker' },
  ];

  const minHeightOptions = [
    { value: 'all', label: t('allHeights') },
    { value: '5.0', label: '5.0 ft (152 cm) +' },
    { value: '5.2', label: '5.2 ft (158 cm) +' },
    { value: '5.4', label: '5.4 ft (165 cm) +' },
    { value: '5.6', label: '5.6 ft (170 cm) +' },
    { value: '5.8', label: '5.8 ft (175 cm) +' },
    { value: '5.10', label: '5.10 ft (178 cm) +' },
  ];

  const minSalaryOptions = [
    { value: 'all', label: t('allSalaries') },
    { value: '25000', label: '₹25,000 / month +' },
    { value: '40000', label: '₹40,000 / month +' },
    { value: '60000', label: '₹60,000 / month +' },
    { value: '100000', label: '₹1,00,000 / month +' },
    { value: 'foreign', label: isTamil ? 'அயல்நாட்டு வருமானம் (Foreign Salary)' : 'Foreign Currency / High Income' },
  ];

  const ageList = [];
  for (let a = 18; a <= 60; a++) {
    ageList.push(a);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchId(localSearchId.trim());
    onApplyFilters();
  };

  const handleReset = () => {
    setLocalSearchId('');
    onSearchId('');
    onResetFilters();
  };

  return (
    <div className="w-full bg-[#fbf9f2] rounded-xl border border-[#c4b598] shadow-md overflow-hidden mb-4 transition-all duration-200">
      {/* Green Header Bar */}
      <div
        className="bar-green px-4 py-2.5 flex items-center justify-between font-bold text-xs sm:text-sm cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <FaFilter className="text-[#ecd08c] text-xs" />
          <h3 className="font-extrabold text-xs sm:text-sm text-[#fffae6] tracking-wide">
            {t('filterBoxTitle')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAdvanced(!showAdvanced);
            }}
            className="text-[11px] font-bold text-[#ecd08c] hover:text-white flex items-center gap-1 underline decoration-dotted"
          >
            <FaSlidersH className="text-[10px]" />
            <span>{showAdvanced ? (isTamil ? 'சுருக்கமான தேடல்' : 'Basic Search') : (isTamil ? 'முழுமையான தேடல்' : 'Advanced Search')}</span>
          </button>
          <button
            type="button"
            className="p-1 rounded text-white/90 hover:text-white transition"
            aria-label="Toggle Filter Box"
          >
            {isOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Filter Body */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-3 text-xs space-y-2.5">
          {/* Quick Search ID */}
          <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
            <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
              {t('searchIdLabel')}
            </label>
            <input
              type="text"
              value={localSearchId}
              onChange={(e) => setLocalSearchId(e.target.value)}
              placeholder={t('searchIdPlaceholder')}
              className="w-full bg-white border border-[#c4b599] rounded px-2.5 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
            />
          </div>

          {/* Core Basic Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {/* பாலினம் (Gender) */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                {t('genderLabel')}
              </label>
              <select
                value={filters.gender}
                onChange={(e) => onFilterChange('gender', e.target.value)}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              >
                <option value="all">{t('allGendersOption')}</option>
                <option value="groom">{t('groom')}</option>
                <option value="bride">{t('bride')}</option>
              </select>
            </div>

            {/* 1. Employment Status */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px] flex items-center gap-1">
                <FaBriefcase className="text-[#8a6d2f] text-[10px]" />
                <span>1. {t('employmentFilterLabel')}</span>
              </label>
              <select
                value={filters.employmentStatus || 'all'}
                onChange={(e) => onFilterChange('employmentStatus', e.target.value)}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              >
                {employmentOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Native Location (சொந்த ஊர் / இருப்பிடம்) */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                2. {isTamil ? 'சொந்த ஊர் / இருப்பிடம் (Native Location)' : 'Native Location'}
              </label>
              <input
                type="text"
                value={filters.nativePlace || ''}
                onChange={(e) => onFilterChange('nativePlace', e.target.value)}
                placeholder={isTamil ? 'எ.கா: சென்னை / மதுரை / ராமநாதபுரம்' : 'e.g. Chennai / Madurai / Ramanathapuram'}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              />
            </div>

            {/* 3. Workplace Location (பணிபுரியும் இடம்) - Typable */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px] flex items-center gap-1">
                <FaBriefcase className="text-[#8a6d2f] text-[10px]" />
                <span>3. {isTamil ? 'பணிபுரியும் இடம் (Workplace)' : 'Workplace Location'}</span>
              </label>
              <input
                type="text"
                value={filters.workplace || ''}
                onChange={(e) => onFilterChange('workplace', e.target.value)}
                placeholder={isTamil ? 'எ.கா: சென்னை / துபாய் / பெங்களூரு' : 'e.g. Chennai / Dubai / Bangalore'}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              />
            </div>

            {/* 4. Age Range (From - To) */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                4. {t('ageRangeLabel')}
              </label>
              <div className="flex items-center gap-1.5">
                <select
                  value={filters.ageFrom}
                  onChange={(e) => onFilterChange('ageFrom', Number(e.target.value))}
                  className="w-1/2 bg-white border border-[#c4b599] rounded px-1.5 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
                >
                  {ageList.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
                <span className="font-bold text-gray-600 text-xs">{t('from')}</span>
                <select
                  value={filters.ageTo}
                  onChange={(e) => onFilterChange('ageTo', Number(e.target.value))}
                  className="w-1/2 bg-white border border-[#c4b599] rounded px-1.5 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
                >
                  {ageList.map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Height (Minimum Height) */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                5. {t('minHeightLabel')}
              </label>
              <select
                value={filters.minHeight || 'all'}
                onChange={(e) => onFilterChange('minHeight', e.target.value)}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              >
                {minHeightOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Salary / Income */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                6. {t('minSalaryLabel')}
              </label>
              <select
                value={filters.minSalary || 'all'}
                onChange={(e) => onFilterChange('minSalary', e.target.value)}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              >
                {minSalaryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. Other Partner Preferences / Keyword Search */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                7. {t('partnerPrefKeywordLabel')}
              </label>
              <input
                type="text"
                value={filters.partnerPrefKeyword || ''}
                onChange={(e) => onFilterChange('partnerPrefKeyword', e.target.value)}
                placeholder={t('partnerPrefKeywordPlaceholder')}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              />
            </div>

            {/* Additional Standard Filters: Marital Status & Location */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                {t('maritalStatusLabel')}
              </label>
              <select
                value={filters.maritalStatus}
                onChange={(e) => onFilterChange('maritalStatus', e.target.value)}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              >
                {maritalStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* மொழி (Language) */}
            <div className="bg-[#f4eedf] p-2 rounded-lg border border-[#dfd2ba]">
              <label className="block font-bold text-[#35250c] mb-1 text-[11px]">
                {t('languageLabel')}
              </label>
              <select
                value={filters.language}
                onChange={(e) => onFilterChange('language', e.target.value)}
                className="w-full bg-white border border-[#c4b599] rounded px-2 py-1 text-gray-800 text-xs focus:outline-none focus:ring-1 focus:ring-[#8a6d2f] shadow-inner font-medium"
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* End of filter inputs */}
          </div>

          {/* Action Buttons: Search & Reset */}
          <div className="mt-3 pt-2.5 border-t border-[#dfd2ba] flex items-center justify-center gap-2">
            <button
              type="submit"
              className="btn-gold px-5 py-1.5 rounded-md text-xs font-extrabold shadow flex items-center gap-1.5"
            >
              <FaSearch className="text-[10px]" />
              <span>{t('searchBtn')}</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-md text-[11px] font-bold bg-[#eae1d0] hover:bg-[#ded1bc] text-[#35250c] border border-[#bfae8e] transition flex items-center gap-1 shadow-sm"
            >
              <FaRedo className="text-[9px]" />
              <span>{t('resetBtn')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
