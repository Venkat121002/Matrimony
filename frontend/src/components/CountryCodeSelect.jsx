import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaChevronDown, FaSearch, FaTimes, FaCheck } from 'react-icons/fa';
import {
  COUNTRY_CALLING_CODES,
  POPULAR_OVERSEAS_COUNTRIES,
  getCountryByDialCode,
} from '../data/countryCodes';

export default function CountryCodeSelect({
  value = '+65',
  onChange,
  disabled = false,
  id,
  className = '',
  isTamil = false,
  preferredOverseas = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected country
  const selectedCountry = useMemo(() => {
    return getCountryByDialCode(value);
  }, [value]);

  // Filtered countries
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^\+/, '');
    if (!q) {
      if (preferredOverseas) {
        // Return sorted with priority 1 (overseas hotspots) first
        return [...COUNTRY_CALLING_CODES].sort((a, b) => (a.priority || 99) - (b.priority || 99));
      }
      return COUNTRY_CALLING_CODES;
    }
    return COUNTRY_CALLING_CODES.filter((c) => {
      const dialClean = c.dialCode.replace(/^\+/, '');
      return (
        dialClean.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.nameTa && c.nameTa.toLowerCase().includes(q)) ||
        c.code.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, preferredOverseas]);

  // Handle open/close and focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (country) => {
    if (onChange) {
      onChange(country.dialCode, country);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={selectedCountry?.name || 'Country Calling Code'}
        className={`h-full min-h-[38px] px-2.5 py-1.5 bg-gradient-to-b from-[#fbf8f2] to-[#f4ebe1] hover:from-[#f6f0e4] hover:to-[#efe3d3] border border-[#c5b597] hover:border-[#8a6d2f] text-gray-900 rounded-md shadow-sm transition flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'ring-2 ring-[#8a6d2f] border-[#8a6d2f]' : ''}`}
      >
        <span className="text-base leading-none select-none" aria-hidden="true">
          {selectedCountry?.flag || '🌐'}
        </span>
        <span className="font-extrabold text-[#163828] tracking-tight">
          {selectedCountry?.dialCode || value}
        </span>
        <FaChevronDown
          className={`text-[10px] text-amber-800 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#8a6d2f]' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 left-0 top-full mt-1.5 w-72 sm:w-80 bg-white border-2 border-[#caa85d] rounded-xl shadow-2xl overflow-hidden animate-fadeIn text-left"
          style={{ maxHeight: '360px' }}
        >
          {/* Header & Search */}
          <div className="p-2.5 bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] border-b border-[#caa85d] text-white space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-200">
              <span>{isTamil ? 'நாட்டின் அழைப்புக் குறியீடு (Country Code)' : 'Select Country Code'}</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-0.5 rounded transition"
                aria-label="Close"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-2.5 top-2.5 text-gray-400 text-xs" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isTamil ? 'நாடு அல்லது குறியீடு (+65, +971, UK...)' : 'Search country or code (+65, +971, UK)...'}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white text-gray-900 rounded-md border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          {/* Quick-Pick Popular Countries Chips (When search is empty) */}
          {!searchQuery && (
            <div className="px-2.5 py-2 bg-amber-50/70 border-b border-amber-200/80">
              <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider mb-1.5">
                {isTamil ? '⚡ விரைவு தேர்வு (Popular Countries)' : '⚡ Popular Overseas Countries'}
              </p>
              <div className="flex flex-wrap gap-1">
                {POPULAR_OVERSEAS_COUNTRIES.slice(0, 8).map((pc) => (
                  <button
                    key={pc.code}
                    type="button"
                    onClick={() => {
                      const found = COUNTRY_CALLING_CODES.find((c) => c.dialCode === pc.dialCode);
                      handleSelect(found || { dialCode: pc.dialCode, name: pc.code, flag: pc.flag });
                    }}
                    className={`px-2 py-0.5 text-[11px] rounded font-semibold transition flex items-center gap-1 border ${
                      value === pc.dialCode
                        ? 'bg-[#163828] text-amber-300 border-[#caa85d] font-bold shadow-xs'
                        : 'bg-white text-gray-800 border-amber-200 hover:bg-amber-100/70'
                    }`}
                  >
                    <span>{pc.flag}</span>
                    <span>{pc.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scrollable List of All Countries */}
          <div
            className="overflow-y-auto max-h-52 divide-y divide-gray-100 text-xs custom-scrollbar"
            role="listbox"
          >
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">
                {isTamil ? 'நாடு கிடைக்கவில்லை' : 'No country matching search'}
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.dialCode === c.dialCode && (selectedCountry?.code === c.code || !c.code);
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left transition hover:bg-amber-50/80 cursor-pointer ${
                      isSelected ? 'bg-amber-100/70 font-bold text-[#163828]' : 'text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-lg leading-none flex-shrink-0" aria-hidden="true">
                        {c.flag}
                      </span>
                      <div className="truncate">
                        <span className="font-semibold text-xs text-gray-900 block truncate">
                          {c.name}
                        </span>
                        {c.nameTa && (
                          <span className="text-[10px] text-gray-500 block truncate">
                            {c.nameTa}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="font-mono font-bold text-xs text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {c.dialCode}
                      </span>
                      {isSelected && (
                        <FaCheck className="text-green-700 text-xs ml-1" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
