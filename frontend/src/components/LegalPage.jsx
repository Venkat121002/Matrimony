import React, { useEffect, useState } from 'react';
import { FaChevronLeft } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import Header from './Header';
import Footer from './Footer';
import SupportModal from './SupportModal';
import { LEGAL_PAGES, LEGAL_LINKS, LAST_UPDATED } from '../content/legalContent';

// Reads the signed-in member (if any) so the shared header shows the right buttons.
const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('nikah_user') || 'null');
  } catch {
    return null;
  }
};

const Paragraph = ({ text }) =>
  text.startsWith('• ') ? (
    <li className="ml-5 list-disc pl-1">{text.slice(2)}</li>
  ) : (
    <p>{text}</p>
  );

/** Privacy Policy / Terms & Conditions / Refund Policy, chosen by `pageKey`. */
export default function LegalPage({ pageKey }) {
  const { isTamil } = useLanguage();
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const currentUser = readStoredUser();
  const page = LEGAL_PAGES[pageKey];
  const lang = isTamil ? 'ta' : 'en';

  useEffect(() => {
    document.title = `${page.title.en} - Tamil Muslim Nikkah`;
    window.scrollTo(0, 0);
  }, [page]);

  const handleLogout = () => {
    localStorage.removeItem('nikah_token');
    localStorage.removeItem('nikah_user');
    window.location.href = '/';
  };

  const goHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5efe1] text-gray-800 font-sans">
      <Header currentUser={currentUser} onLogout={handleLogout} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <a href="/" className="inline-flex items-center gap-2 text-[#8a6d2f] font-bold hover:underline">
          <FaChevronLeft />
          {isTamil ? 'முகப்பு பக்கத்திற்குச் செல்ல' : 'Back to Home'}
        </a>

        <article className="bg-white border-2 border-[#caa85d] rounded-2xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] px-5 sm:px-8 py-5 border-b-2 border-[#caa85d]">
            <h1 className="font-cinzel text-xl sm:text-3xl font-extrabold text-[#fff7d6]">{page.title[lang]}</h1>
            <p className="text-xs sm:text-sm text-[#ebd7af] mt-1">
              {isTamil ? 'கடைசியாகப் புதுப்பித்தது:' : 'Last updated:'} {LAST_UPDATED}
            </p>
          </div>

          <div className="px-5 sm:px-8 py-6 space-y-6 text-sm sm:text-base leading-relaxed">
            <p>{page.intro[lang]}</p>

            {page.sections.map((section, index) => (
              <section key={section.title.en} className="space-y-2">
                <h2 className="font-extrabold text-base sm:text-lg text-[#163828]">
                  {index + 1}. {section.title[lang]}
                </h2>
                <div className="space-y-2 text-gray-700">
                  {section.body[lang].map((text, i) => (
                    <Paragraph key={i} text={text} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="px-5 sm:px-8 py-4 bg-[#f5efe1] border-t border-[#dfd2ba] flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
            {LEGAL_LINKS.filter((l) => l.key !== pageKey).map((l) => (
              <a key={l.key} href={l.path} className="text-[#8a6d2f] hover:underline">
                {LEGAL_PAGES[l.key].title[lang]}
              </a>
            ))}
          </div>
        </article>
      </main>

      <Footer
        onOpenRegister={goHome}
        onOpenLogin={goHome}
        onOpenAbout={goHome}
        onOpenContact={() => setIsSupportOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />

      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} user={currentUser} />
    </div>
  );
}
