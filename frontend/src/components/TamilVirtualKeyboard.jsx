import React from 'react';
import { FaTimes, FaBackspace, FaKeyboard } from 'react-icons/fa';

export default function TamilVirtualKeyboard({ isOpen, onClose, onInsertChar, onBackspace, onClear }) {
  if (!isOpen) return null;

  const vowels = ['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ', 'ஃ'];
  const consonants = [
    'க', 'ங', 'ச', 'ஞ', 'ட', 'ண', 'த', 'ந', 'ப', 'ம',
    'ய', 'ர', 'ல', 'வ', 'ழ', 'ள', 'ற', 'ன', 'ஜ', 'ஷ',
    'ஸ', 'ஹ', 'க்ஷ'
  ];
  const signs = ['்', 'ா', 'ி', 'ீ', 'ு', 'ூ', 'ெ', 'ே', 'ை', 'ொ', 'ோ', 'ௌ'];

  return (
    <div className="bg-[#f6f1e3] border-2 border-[#caa85d] rounded-xl p-3 shadow-xl text-xs space-y-2.5 animate-fadeIn select-none mt-2">
      {/* Keyboard Header */}
      <div className="flex items-center justify-between border-b border-[#caa85d]/50 pb-1.5">
        <div className="flex items-center gap-1.5 text-[#163828] font-bold">
          <FaKeyboard className="text-[#8a6d2f] text-sm" />
          <span>தமிழ் விசைப்பலகை (Tamil Virtual Keyboard)</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-800 p-0.5 rounded hover:bg-black/5"
          title="Close Keyboard"
        >
          <FaTimes />
        </button>
      </div>

      {/* Row 1: Vowels (உயிர் எழுத்துக்கள்) */}
      <div>
        <div className="text-[10px] font-bold text-[#654e20] mb-1">உயிர் எழுத்துக்கள் (Vowels):</div>
        <div className="flex flex-wrap gap-1">
          {vowels.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onInsertChar(char)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold bg-white text-gray-900 border border-[#caa85d] rounded shadow-xs hover:bg-[#caa85d] hover:text-white active:scale-95 transition"
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Vowel Signs (உயிர்மெய் குறிகள்) */}
      <div>
        <div className="text-[10px] font-bold text-[#654e20] mb-1">துணை குறிகள் (Signs & Pulli):</div>
        <div className="flex flex-wrap gap-1">
          {signs.map((sign, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onInsertChar(sign)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-extrabold bg-[#edd48e]/50 text-[#163828] border border-[#caa85d] rounded shadow-xs hover:bg-[#8a6d2f] hover:text-white active:scale-95 transition"
            >
              {sign}
            </button>
          ))}
        </div>
      </div>

      {/* Row 3: Consonants (மெய் எழுத்துக்கள்) */}
      <div>
        <div className="text-[10px] font-bold text-[#654e20] mb-1">மெய் எழுத்துக்கள் (Consonants):</div>
        <div className="flex flex-wrap gap-1">
          {consonants.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => onInsertChar(char)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-bold bg-white text-gray-800 border border-[#caa85d]/80 rounded shadow-xs hover:bg-[#163828] hover:text-amber-300 active:scale-95 transition"
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#caa85d]/40">
        <button
          type="button"
          onClick={() => onInsertChar(' ')}
          className="flex-1 py-1 px-3 bg-white border border-[#c5b597] rounded text-gray-700 font-bold hover:bg-gray-100 shadow-xs"
        >
          இடைவெளி (Space)
        </button>
        <button
          type="button"
          onClick={onBackspace}
          className="py-1 px-3 bg-[#fce8e6] border border-[#e0a8a3] text-red-700 font-bold rounded flex items-center gap-1 hover:bg-[#fad2ce] shadow-xs"
        >
          <FaBackspace />
          <span>அழி (Del)</span>
        </button>
        <button
          type="button"
          onClick={onClear}
          className="py-1 px-2.5 bg-gray-200 border border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-300 text-[11px]"
        >
          முழுதும் நீக்கு
        </button>
      </div>
    </div>
  );
}
