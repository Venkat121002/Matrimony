import React, { useState, useRef } from 'react';
import { FaKeyboard, FaLanguage } from 'react-icons/fa';
import TamilVirtualKeyboard from './TamilVirtualKeyboard';
import { transliterateSentence } from '../utils/tamilTransliterate';

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
  ...rest
}) {
  const [isTamilMode, setIsTamilMode] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);

  const activeTamilMode = lockTamil ? true : isTamilMode;

  // Handle typing with phonetic transliteration
  const handleInputChange = (e) => {
    let val = e.target.value;
    if (activeTamilMode) {
      // If ends with space or punctuation, transliterate the latest token
      val = transliterateSentence(val);
    }
    onChange({ target: { name, value: val } });
  };

  // Convert any pending phonetic English word on blur
  const handleBlur = (e) => {
    if (activeTamilMode && value && /[a-zA-Z]/.test(value)) {
      const converted = transliterateSentence(value);
      if (converted !== value) {
        onChange({ target: { name, value: converted } });
      }
    }
    if (rest.onBlur) {
      rest.onBlur(e);
    }
  };

  // Virtual keyboard insertions
  const handleInsertChar = (char) => {
    const el = inputRef.current;
    if (!el) {
      onChange({ target: { name, value: (value || '') + char } });
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';
    const newVal = currentVal.substring(0, start) + char + currentVal.substring(end);
    onChange({ target: { name, value: newVal } });

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + char.length, start + char.length);
    }, 10);
  };

  const handleBackspace = () => {
    const el = inputRef.current;
    if (!el) {
      onChange({ target: { name, value: (value || '').slice(0, -1) } });
      return;
    }
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const currentVal = value || '';
    if (start === end && start > 0) {
      const newVal = currentVal.substring(0, start - 1) + currentVal.substring(end);
      onChange({ target: { name, value: newVal } });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start - 1, start - 1);
      }, 10);
    } else if (start !== end) {
      const newVal = currentVal.substring(0, start) + currentVal.substring(end);
      onChange({ target: { name, value: newVal } });
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start);
      }, 10);
    }
  };

  const handleClear = () => {
    onChange({ target: { name, value: '' } });
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="space-y-1">
      {/* Label and Tamil Input Switcher Bar */}
      <div className="flex items-end justify-between gap-1 min-h-[38px] sm:min-h-[42px] pb-1">
        <label className="block text-xs font-bold text-[#44351b] leading-tight">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] flex-shrink-0 self-end">
          {/* Mode Switcher */}
          {lockTamil || !showModeSwitcher ? (
            <span
              className="px-1.5 py-0.5 rounded font-bold text-[10px] sm:text-[11px] bg-[#163828] text-[#edd48e] border border-[#163828] flex items-center gap-1 cursor-default select-none whitespace-nowrap"
              title="Locked in Tamil"
            >
              <FaLanguage className="text-xs" />
              <span>தமிழ்</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setIsTamilMode(!isTamilMode)}
              className={`px-1.5 py-0.5 rounded font-bold transition flex items-center gap-1 border whitespace-nowrap text-[10px] sm:text-[11px] ${
                isTamilMode
                  ? 'bg-[#163828] text-[#edd48e] border-[#163828]'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
              title="Toggle phonetic transliteration"
            >
              <FaLanguage className="text-xs" />
              <span>{isTamilMode ? 'தமிழ்' : 'English'}</span>
            </button>
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
      </div>

      {/* Input Field */}
      <div className="relative">
        {isTextArea ? (
          <textarea
            ref={inputRef}
            name={name}
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            required={required}
            className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner ${className}`}
            {...rest}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            name={name}
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            required={required}
            maxLength={maxLength}
            list={list}
            className={`w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner h-[38px] sm:h-[40px] ${className}`}
            {...rest}
          />
        )}
      </div>

      {helperText && (
        <p className="text-[11px] text-gray-500 italic">{helperText}</p>
      )}

      {/* Virtual Keyboard */}
      <TamilVirtualKeyboard
        isOpen={showKeyboard}
        onClose={() => setShowKeyboard(false)}
        onInsertChar={handleInsertChar}
        onBackspace={handleBackspace}
        onClear={handleClear}
      />
    </div>
  );
}
