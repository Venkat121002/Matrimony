import React, { useEffect, useState } from 'react';
import { FaTimes, FaPlay, FaPause, FaVolumeUp, FaVideo } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function VideoModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(true);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#163828] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0f261b] py-2.5 px-4 flex items-center justify-between border-b border-[#caa85d]/60">
          <div className="flex items-center gap-2">
            <FaVideo className="text-[#ecd08c] text-sm" />
            <h3 className="font-extrabold text-sm sm:text-base text-[#fffae6] tracking-wide font-tamil">
              {t('modalVideoTitle')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Video Player Display Container */}
        <div className="p-4 bg-black text-white">
          <div className="relative aspect-video bg-gradient-to-br from-neutral-900 via-neutral-800 to-black rounded-lg overflow-hidden flex flex-col items-center justify-center border border-neutral-700 shadow-inner">
            {/* Animated mockup screen */}
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#caa85d]/20 border-2 border-[#caa85d] flex items-center justify-center mx-auto mb-3 cursor-pointer hover:scale-110 transition shadow-lg"
                   onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? (
                  <FaPause className="text-[#caa85d] text-xl" />
                ) : (
                  <FaPlay className="text-[#caa85d] text-xl ml-1" />
                )}
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#f5e2b0] mb-1">
                {t('siteTitle')}
              </h4>
              <p className="text-xs text-neutral-300 max-w-sm mx-auto">
                {t('modalVideoStep1')}<br/>
                {t('modalVideoStep2')}<br/>
                {t('modalVideoStep3')}
              </p>
            </div>

            {/* Video Controls bar */}
            <div className="absolute bottom-0 inset-x-0 bg-neutral-900/90 p-2 flex items-center justify-between text-xs text-neutral-300 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="hover:text-white transition"
                >
                  {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <span>01:15 / 03:40</span>
              </div>
              <div className="flex items-center gap-2">
                <FaVolumeUp />
                <div className="w-16 bg-neutral-700 h-1 rounded-full overflow-hidden">
                  <div className="bg-[#caa85d] h-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={onClose}
              className="btn-gold px-6 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow"
            >
              {t('modalClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

