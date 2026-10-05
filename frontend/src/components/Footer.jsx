import React from 'react';
import { FaPhoneAlt, FaWhatsapp, FaClock, FaShieldAlt, FaCheckCircle, FaMosque, FaHeart } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ onOpenRegister, onOpenLogin, onOpenAbout, onOpenContact }) {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#122e21] border-t-2 border-[#caa85d] text-[#e8dfce] shadow-2xl mt-8">
      {/* Upper Footer: 4 Grid Columns */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-xs sm:text-sm">
        
        {/* Column 1: About the Service */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#caa85d] to-[#8a6d2f] p-1 flex items-center justify-center text-[#163828]">
              <FaMosque className="text-base" />
            </div>
            <h4 className="font-cinzel text-base sm:text-lg font-bold text-[#f5e2b0] tracking-wide">
              {t('siteTitle')}
            </h4>
          </div>
          <p className="text-[#d5cabb] leading-relaxed">
            {t('footerAbout')}
          </p>
          <div className="pt-1 flex items-center gap-2 text-xs text-[#eed48e] font-semibold">
            <FaCheckCircle className="text-emerald-400" />
            <span>{t('footerVerified')}</span>
          </div>
        </div>

        {/* Column 2: Service Details */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm sm:text-base text-[#f5e2b0] border-b border-[#caa85d]/40 pb-1.5 flex items-center gap-2">
            <FaShieldAlt className="text-[#caa85d]" />
            <span>{t('footerServicesTitle')}</span>
          </h4>
          <ul className="space-y-2 text-[#d5cabb]">
            <li className="flex items-start gap-2">
              <span className="text-[#caa85d] font-bold">✓</span>
              <span>{t('footerService1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#caa85d] font-bold">✓</span>
              <span>{t('footerService2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#caa85d] font-bold">✓</span>
              <span>{t('footerService3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#caa85d] font-bold">✓</span>
              <span>{t('footerService4')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#caa85d] font-bold">✓</span>
              <span>{t('footerService5')}</span>
            </li>
          </ul>
        </div>

        {/* Column 3: Contact & Timings */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm sm:text-base text-[#f5e2b0] border-b border-[#caa85d]/40 pb-1.5 flex items-center gap-2">
            <FaClock className="text-[#caa85d]" />
            <span>{t('footerTimingsTitle')}</span>
          </h4>
          <div className="space-y-2.5 text-[#d5cabb]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#1e4a35] flex items-center justify-center text-[#eed48e] flex-shrink-0">
                <FaClock className="text-xs" />
              </div>
              <div>
                <div className="text-[11px] text-[#eed48e] font-bold">{t('workHours').split(':')[0]}:</div>
                <div className="font-semibold text-white">9.00 am - 9.00 pm</div>
                <div className="text-[10px] text-gray-400">{t('footerAllDays')}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#1e4a35] flex items-center justify-center text-[#eed48e] flex-shrink-0">
                <FaPhoneAlt className="text-xs" />
              </div>
              <div>
                <div className="text-[11px] text-[#eed48e] font-bold">{t('footerHelpDesk')}</div>
                <a href="tel:9171896625" className="font-bold text-white hover:text-[#eed48e] transition">
                  9171896625
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-[#25D366] flex items-center justify-center text-white flex-shrink-0">
                <FaWhatsapp className="text-sm" />
              </div>
              <div>
                <div className="text-[11px] text-[#eed48e] font-bold">WhatsApp:</div>
                <a
                  href="https://wa.me/919171896625"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-300 hover:text-emerald-200 transition"
                >
                  +91 91718 96625
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Islamic Guidelines */}
        <div className="space-y-3">
          <h4 className="font-extrabold text-sm sm:text-base text-[#f5e2b0] border-b border-[#caa85d]/40 pb-1.5 flex items-center gap-2">
            <FaHeart className="text-red-400" />
            <span>{t('footerGuidelinesTitle')}</span>
          </h4>
          
          <div className="bg-[#1b4331] p-3 rounded-lg border border-[#caa85d]/30 space-y-2">
            <div className="border-l-2 border-[#caa85d] pl-2 text-[11px] text-[#fff0c8] leading-tight font-medium">
              <strong className="text-yellow-400 block mb-0.5">{t('warningTitle')}</strong>
              {t('dowryWarning')}
            </div>
            
            <div className="border-l-2 border-emerald-400 pl-2 text-[11px] text-[#d6f5df] leading-tight font-medium">
              <strong className="text-emerald-300 block mb-0.5">{t('delayTitle')}</strong>
              {t('delayWarning')}
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-2">
            <button
              onClick={onOpenRegister}
              className="btn-gold px-3 py-1 rounded text-xs font-bold"
            >
              {t('footerFreeRegBtn')}
            </button>
            <button
              onClick={onOpenAbout}
              className="px-3 py-1 rounded text-xs font-semibold bg-[#1e4a35] hover:bg-[#286347] border border-[#caa85d]/50 text-white transition"
            >
              {t('aboutUs')}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="w-full bg-[#0a1b13] border-t border-[#caa85d]/40 py-3.5 px-4 text-center text-xs font-medium text-[#c4b598]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Tamil Muslim Nikkah | {t('contactNum')}</p>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={onOpenAbout} className="hover:text-white transition">{t('footerTerms')}</button>
            <span>•</span>
            <button onClick={onOpenContact} className="hover:text-white transition">{t('contact')}</button>
            <span>•</span>
            <button onClick={onOpenLogin} className="hover:text-white transition">{t('footerLogin')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

