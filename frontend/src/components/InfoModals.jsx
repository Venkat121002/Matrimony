import React, { useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export function AboutModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3 px-4 flex items-center justify-between border-b-2 border-[#caa85d]">
          <div className="flex items-center gap-2">
            <FaInfoCircle className="text-[#ecd08c]" />
            <h3 className="font-extrabold text-base text-[#fffae6]">
              {t('modalAboutTitle')}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <FaTimes />
          </button>
        </div>

        <div className="p-5 text-xs sm:text-sm text-[#35250c] space-y-3 leading-relaxed">
          <h4 className="font-extrabold text-[#163828] text-base">
            {t('siteTitle')}
          </h4>
          <p>
            {t('modalAboutText1')}
          </p>
          <div className="bg-[#f0e7d5] p-3 rounded-lg border border-[#caa85d]/40">
            <h5 className="font-bold text-[#7A1414] mb-1">{t('modalOurPolicy')}</h5>
            <ul className="list-disc pl-5 space-y-1">
              <li>{t('modalPolicy1')}</li>
              <li>{t('modalPolicy2')}</li>
              <li>{t('modalPolicy3')}</li>
            </ul>
          </div>
          <div className="pt-2 flex justify-center">
            <button onClick={onClose} className="btn-gold px-6 py-1.5 rounded-lg font-bold">
              {t('modalClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactModal({ isOpen, onClose }) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3 px-4 flex items-center justify-between border-b-2 border-[#caa85d]">
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-[#ecd08c]" />
            <h3 className="font-extrabold text-base text-[#fffae6]">
              {t('modalContactTitle')}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <FaTimes />
          </button>
        </div>

        <div className="p-5 text-xs sm:text-sm text-[#35250c] space-y-3.5">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#c5b597] shadow-sm">
            <FaMapMarkerAlt className="text-[#b85a00] text-base" />
            <div>
              <div className="text-[11px] text-gray-500 font-bold">{t('modalWorkHoursLabel')}</div>
              <p className="font-bold text-[#35250c]">
                {t('modalWorkHoursVal')}
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <button onClick={onClose} className="btn-gold px-6 py-1.5 rounded-lg font-bold">
              {t('modalClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

