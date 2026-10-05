import React, { useEffect } from 'react';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <FaCheckCircle className="text-emerald-400 text-lg flex-shrink-0" />,
    info: <FaInfoCircle className="text-amber-300 text-lg flex-shrink-0" />,
    warning: <FaExclamationTriangle className="text-yellow-400 text-lg flex-shrink-0" />,
  };

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-fadeIn">
      <div className="bg-[#163828] text-white border-2 border-[#caa85d] p-3.5 rounded-xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icons[toast.type] || icons.info}
          <p className="text-xs sm:text-sm font-semibold leading-tight">
            {toast.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition p-1"
          aria-label="Close"
        >
          <FaTimes className="text-xs" />
        </button>
      </div>
    </div>
  );
}
