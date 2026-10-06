import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function SearchIdBox({ searchId, onSearchId }) {
  const [localInput, setLocalInput] = useState(searchId || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearchId(localInput.trim());
  };

  const handleClear = () => {
    setLocalInput('');
    onSearchId('');
  };

  return (
    <div className="w-full bg-[#fcf8ed] border-2 border-[#caa85d] rounded-xl shadow-md overflow-hidden mb-4">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#8a6d2f] via-[#edd48e] to-[#8a6d2f] py-1.5 px-4 text-center border-b border-[#caa85d]">
        <h3 className="font-extrabold text-sm sm:text-base text-[#281802] tracking-wider">
          Search ID
        </h3>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <label htmlFor="search-id-input" className="text-xs sm:text-sm font-extrabold text-[#38270b] whitespace-nowrap">
          Enter ID:
        </label>
        <div className="relative w-full sm:w-64">
          <input
            id="search-id-input"
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="எ.கா: 100001"
            className="w-full px-3 py-1.5 text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
          />
          {localInput && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
            >
              <FaTimes />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-gold px-6 py-1.5 rounded-md text-xs sm:text-sm font-bold shadow flex items-center gap-1.5"
          >
            <FaSearch className="text-xs" />
            <span>Search</span>
          </button>
          {searchId && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
            >
              அனைத்தும்
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
