import React, { useState, useRef, useCallback } from 'react';
import { FaKeyboard, FaLanguage } from 'react-icons/fa';
import { ReactTransliterate, getTransliterateSuggestions } from '@sarthak1407/react-transliterate';
import '@sarthak1407/react-transliterate/dist/index.css';
import TamilVirtualKeyboard from './TamilVirtualKeyboard';
import { useLanguage } from '../context/LanguageContext';
import useTamilTransliteration from '../utils/useTamilTransliteration';
import { nameDictionaryEnToTa, transliterateWord } from '../utils/tamilTransliterate';

const NAME_TRANSLITERATIONS = {
  siddiq: ['சித்தீக்', 'சித்திக்'],
  siddique: ['சித்தீக்', 'சித்திக்'],
  farooq: ['பாரூக்', 'பரூக்'],
  faruk: ['பாரூக்', 'பரூக்'],
  farook: ['பாரூக்', 'பரூக்'],
};

export default function TamilInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  isTextArea = false,
  rows = 3,
  className = '',
  helperText,
  maxLength,
  list,
  lockTamil = false, // When true, locked in Tamil only (no option to switch to English)
  showModeSwitcher = true,
  showInputTools = true,
  onBlur: externalOnBlur,
  ...rest
}) {
  const { isTamil } = useLanguage();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);

  // Check if this input is designated for a Tamil name
  const isNameInput = Boolean(
    name === 'name' ||
    name === 'fullName' ||
    rest.isNameInput ||
    rest.transliterate
  );

  // Fallback transliteration hook for non-name inputs
  const {
    handleChange: handleLegacyChange,
    handleBlur: handleTamilBlur,
    setValue: setLegacyValue,
  } = useTamilTransliteration({
    value,
    onChange,
    isTamil,
    name,
    inputRef,
  });

  const setValue = (newVal) => {
    if (isNameInput) {
      if (onChange) {
        onChange({ target: { name, value: newVal } });
      }
    } else {
      setLegacyValue(newVal);
    }
  };

  // Convert any pending phonetic English word on blur for legacy inputs
  const handleBlur = (e) => {
    handleTamilBlur(e);
    if (externalOnBlur) {
      externalOnBlur(e);
    }
  };

  // Transliteration suggestions fetcher for Tamil names
  const fetchTamilSuggestions = useCallback(async (word) => {
    const clean = (word || '').toLowerCase().trim();
    if (!clean) return [];

    let apiSuggestions = [];
    try {
      const res = await getTransliterateSuggestions(clean, { lang: 'ta', numOptions: 5 });
      apiSuggestions = Array.isArray(res) ? res : (res?.suggestions || []);
    } catch (e) {
      // Fallback if network unavailable
    }

    const custom = NAME_TRANSLITERATIONS[clean] || (nameDictionaryEnToTa[clean] ? [nameDictionaryEnToTa[clean]] : []);
    const combined = [...custom, ...apiSuggestions];
    if (combined.length === 0 && clean) {
      const fallbackWord = transliterateWord(clean);
      if (fallbackWord) combined.push(fallbackWord);
    }
    return Array.from(new Set(combined)).slice(0, 6);
  }, []);

  // Handlers for ReactTransliterate to ensure `name` is always preserved in e.target
  const handleTransliterateChangeText = (newVal) => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: newVal,
        },
      });
    }
  };

  const handleTransliterateChange = (e) => {
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...(e?.target || {}),
          name,
          value: e?.target?.value ?? '',
        },
      });
    }
  };

  const handleTransliterateBlur = (e) => {
    if (externalOnBlur) {
      externalOnBlur(e);
    }
  };

  // Virtual keyboard insertions
  const handleInsertChar = (char) => {
    const el = inputRef.current;
    if (!el) {
      setValue((value || '') + char);
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';
    const newVal = currentVal.substring(0, start) + char + currentVal.substring(end);
    setValue(newVal);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  const handleBackspace = () => {
    const el = inputRef.current;
    if (!el) {
      setValue((value || '').slice(0, -1));
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';
    if (start === end && start > 0) {
      const newVal = currentVal.substring(0, start - 1) + currentVal.substring(end);
      setValue(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start - 1, start - 1);
      }, 10);
    } else if (start !== end) {
      const newVal = currentVal.substring(0, start) + currentVal.substring(end);
      setValue(newVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start);
      }, 10);
    }
  };

  const handleClear = () => {
    setValue('');
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="flex flex-col h-full space-y-1">
      {/* Label and Tamil Input Switcher Bar */}
      {label && (
        <div className="min-h-[42px] flex items-end justify-between gap-1 pb-1">
          <label className="block text-xs font-bold text-[#44351b] leading-tight">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          {showInputTools && (
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] flex-shrink-0 self-end">
              {/* Mode Switcher */}
              {lockTamil || !showModeSwitcher ? (
                <span
                  className={`px-1.5 py-0.5 rounded font-bold text-[10px] sm:text-[11px] border flex items-center gap-1 cursor-default select-none whitespace-nowrap ${
                    isTamil
                      ? 'bg-[#163828] text-[#edd48e] border-[#163828]'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  title={isTamil ? 'Tamil input follows the selected site language' : 'English input follows the selected site language'}
                >
                  <FaLanguage className="text-xs" />
                  <span>{isTamil ? 'தமிழ்' : 'English'}</span>
                </span>
              ) : (
                <span
                  className={`px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border whitespace-nowrap text-[10px] sm:text-[11px] ${
                    isTamil
                      ? 'bg-[#163828] text-[#edd48e] border-[#163828]'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  title="Input language follows the site language"
                >
                  <FaLanguage className="text-xs" />
                  <span>{isTamil ? 'தமிழ்' : 'English'}</span>
                </span>
              )}

              {/* Virtual Keyboard Toggle */}
              <button
                type="button"
                onClick={() => setShowKeyboard(!showKeyboard)}
                className={`px-1.5 py-0.5 rounded font-bold transition flex items-center gap-1 border whitespace-nowrap text-[10px] sm:text-[11px] ${
                  showKeyboard
                    ? 'bg-[#8a6d2f] text-white border-[#8a6d2f]'
                    : 'bg-[#f4ebd0] text-[#4e3c1a] border-[#caa85d] hover:bg-[#edd48e]'
                }`}
                title="Toggle Tamil on-screen virtual keyboard"
              >
                <FaKeyboard className="text-xs" />
                <span>விசைப்பலகை</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input Field */}
      <div className="relative mt-auto">
        {isTextArea ? (
          <textarea
            ref={inputRef}
            name={name}
            value={value}
            onChange={handleLegacyChange}
            onBlur={handleBlur}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner ${className}`}
            {...rest}
          />
        ) : isNameInput ? (
          <ReactTransliterate
            value={value || ''}
            onChangeText={handleTransliterateChangeText}
            onChange={handleTransliterateChange}
            onBlur={handleTransliterateBlur}
            lang="ta"
            fetchSuggestions={fetchTamilSuggestions}
            maxOptions={6}
            containerClassName="w-full relative"
            suggestionsClassName="!z-[99999] shadow-2xl rounded-md border border-[#c5b597] bg-white text-gray-900 overflow-hidden py-1 min-w-[140px]"
            itemClassName="px-3 py-1.5 hover:bg-[#f4ebd0] cursor-pointer text-xs sm:text-sm text-gray-800 transition-colors"
            activeItemClassName="!bg-[#163828] !text-[#edd48e] font-semibold"
            renderComponent={(inputProps) => {
              const { ref: rtRef, ...restInputProps } = inputProps;
              return (
                <input
                  {...restInputProps}
                  ref={(node) => {
                    if (typeof rtRef === 'function') {
                      rtRef(node);
                    } else if (rtRef && typeof rtRef === 'object') {
                      rtRef.current = node;
                    }
                    inputRef.current = node;
                  }}
                  name={name}
                  placeholder={placeholder}
                  required={required}
                  maxLength={maxLength}
                  list={list}
                  className={`w-full h-[42px] px-3 py-2 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner ${className}`}
                  {...rest}
                />
              );
            }}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            name={name}
            value={value}
            onChange={handleLegacyChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            maxLength={maxLength}
            list={list}
            className={`w-full h-[42px] px-3 py-2 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner ${className}`}
            {...rest}
          />
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-gray-500 italic">{helperText}</p>
      )}

      {/* Virtual Keyboard */}
      {showInputTools && (
        <TamilVirtualKeyboard
          isOpen={showKeyboard}
          onClose={() => setShowKeyboard(false)}
          onInsertChar={handleInsertChar}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />
      )}
    </div>
  );
}
