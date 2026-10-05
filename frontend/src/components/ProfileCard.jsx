import React, { useState } from 'react';
import { FaLock, FaStar, FaRegStar, FaTimes, FaUndoAlt, FaCheckCircle, FaMicrophone } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import DefaultAvatar from './DefaultAvatar';

export default function ProfileCard({
  profile,
  isShortlisted,
  onToggleShortlist,
  onOpenLogin,
  onViewDetails,
  currentUser,
}) {
  const { t, translateValue, translateName, isTamil } = useLanguage();
  const [isRejected, setIsRejected] = useState(false);
  const [, setIsHoveredPhoto] = useState(false);

  const titleText =
    profile.gender === 'bride'
      ? t('brideDetails')
      : t('groomDetails');

  const rows = [
    {
      label: t('labelName'),
      value: translateName(!isTamil ? (profile.nameEn || profile.fullNameEn || profile.name || profile.fullName) : (profile.name || profile.fullName || profile.nameEn || profile.fullNameEn)),
    },
    { label: t('labelAge'), value: `${profile.age} ${isTamil ? 'வயது' : 'Years'}` },
    {
      label: t('labelEducation'),
      value: !isTamil
        ? (profile.educationEn || translateValue(profile.education))
        : translateValue(profile.education || profile.educationEn),
    },
    {
      label: t('labelMarital'),
      value: !isTamil
        ? (profile.maritalStatusEn || translateValue(profile.maritalStatus))
        : translateValue(profile.maritalStatus || profile.maritalStatusEn),
    },
    {
      label: t('labelNative'),
      value: !isTamil
        ? (profile.locationEn || profile.nativePlaceEn || translateValue(profile.location || profile.nativePlace || profile.district))
        : translateValue(profile.location || profile.nativePlace || profile.district),
    },
    ...(profile.workplace ? [{
      label: isTamil ? 'பணியிடம்' : 'Workplace',
      value: translateValue(profile.workplace || profile.workplaceEn),
    }] : []),

    {
      label: t('labelHeight'),
      value: !isTamil
        ? (profile.heightEn || translateValue(profile.height))
        : translateValue(profile.height || profile.heightEn),
    },
    {
      label: t('labelIncome'),
      value: !isTamil
        ? (profile.incomeEn || profile.monthlyIncomeEn || translateValue(profile.income || profile.monthlyIncome))
        : translateValue(profile.income || profile.monthlyIncome || profile.incomeEn || profile.monthlyIncomeEn),
    },
    {
      label: t('labelProperty'),
      value: !isTamil
        ? (profile.propertyEn || profile.propertiesEn || translateValue(profile.property || profile.properties))
        : translateValue(profile.property || profile.properties || profile.propertyEn || profile.propertiesEn),
    },
  ];



  if (isRejected) {
    return (
      <div className="w-full bg-[#f3ece0] border-2 border-dashed border-gray-400 p-3 rounded-lg mb-4 text-center flex items-center justify-between text-xs sm:text-sm text-gray-600 transition-all">
        <span className="font-semibold text-gray-500">
          ID: {profile.id} - {translateName(!isTamil ? (profile.nameEn || profile.name) : profile.name)} {t('rejectedNotice')}
        </span>
        <button
          onClick={() => setIsRejected(false)}
          className="px-2.5 py-1 text-xs rounded bg-white hover:bg-gray-100 border border-gray-400 font-bold flex items-center gap-1 text-[#163828] shadow-sm transition"
        >
          <FaUndoAlt className="text-[10px]" />
          <span>{t('showAgain')}</span>
        </button>
      </div>
    );
  }

  const defaultRequirement = profile.gender === 'bride' ? t('suitableGroomReq') : t('suitableBrideReq');
  const requirementText = !isTamil
    ? (profile.requirementEn || translateValue(profile.requirement) || defaultRequirement)
    : (translateValue(profile.requirement) || defaultRequirement);

  return (
    <>
      <article
        className="w-full bg-[#fbf9f2] rounded-xl border border-[#c4b598] shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden mb-4"
        id={`profile-${profile.id}`}
      >
        {/* Green Header Bar */}
        <div className="bar-green px-3 py-2 flex items-center justify-between font-bold text-xs sm:text-sm">
          {/* Choose Button */}
          <button
            onClick={() => onToggleShortlist(profile.id)}
            className="flex items-center gap-1.5 text-white/90 hover:text-white hover:underline transition font-bold"
            title={t('shortlist')}
          >
            {isShortlisted ? (
              <FaStar className="text-yellow-300 text-sm drop-shadow" />
            ) : (
              <FaRegStar className="text-white/80 text-sm" />
            )}
            <span>{t('shortlist')}</span>
          </button>

          {/* Center Title */}
          <div className="flex items-center gap-2">
            <h3 className="text-center font-extrabold text-sm sm:text-base text-[#fffae6] tracking-wide drop-shadow">
              {titleText}
            </h3>
          </div>

          {/* Reject Button */}
          <button
            onClick={() => setIsRejected(true)}
            className="flex items-center gap-1 text-red-200 hover:text-red-100 hover:underline transition font-bold"
            title={t('reject')}
          >
            <FaTimes className="text-xs" />
            <span>{t('reject')}</span>
          </button>
        </div>

        {/* Card Content Body */}
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
          {/* Left Side: Photo Box + ID */}
          <div className="w-full sm:w-44 flex flex-col items-center flex-shrink-0">
            {/* Gold Cursor / Login to view Instruction Bar */}
            <div
              onClick={!currentUser ? onOpenLogin : () => onViewDetails && onViewDetails(profile)}
              className={`w-full text-center py-1 px-2 rounded-t-md text-[10px] sm:text-[11px] font-bold tracking-tight mb-1 shadow-sm cursor-pointer transition ${
                !currentUser
                  ? 'bg-[#4e1b1b] hover:bg-[#682424] text-[#ffe6e6] border border-red-400/50'
                  : 'badge-gold'
              }`}
            >
              {!currentUser ? (
                <span className="flex items-center justify-center gap-1.5">
                  <FaLock className="text-[10px] text-amber-300" />
                  <span>{t('photoLogin')}</span>
                </span>
              ) : (
                t('photoCursor')
              )}
            </div>

            {/* Photo Box – Requires login to view image */}
            {!currentUser ? (
              <div
                onClick={() => onOpenLogin && onOpenLogin()}
                className="w-36 h-44 sm:w-40 sm:h-48 rounded-md shadow-md overflow-hidden border-2 border-[#caa85d] cursor-pointer hover:border-[#edd48e] transition relative group bg-gradient-to-b from-[#2a1d13] via-[#1c130b] to-[#120c07] flex flex-col items-center justify-center p-3 text-center"
                title={t('photoLogin')}
              >
                <div className="w-12 h-12 rounded-full bg-[#caa85d]/20 border border-[#caa85d] flex items-center justify-center text-[#edd48e] mb-2 group-hover:scale-110 group-hover:bg-[#caa85d]/30 transition shadow">
                  <FaLock className="text-xl" />
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#f5efe1] leading-tight mb-1">
                  {isTamil ? 'புகைப்படம் பார்க்க' : 'Login to'}
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-[#edd48e] underline decoration-[#caa85d]">
                  {isTamil ? 'உள்நுழைக' : 'see image'}
                </p>
                <span className="mt-2.5 text-[10px] font-bold text-amber-200 bg-[#caa85d]/20 px-2 py-0.5 rounded-full border border-[#caa85d]/40 group-hover:bg-[#caa85d] group-hover:text-[#163828] transition">
                  {t('clickHere')}
                </span>
              </div>
            ) : profile.photos && profile.photos.length > 0 ? (
              <div
                onClick={() => onViewDetails && onViewDetails(profile)}
                className="w-36 h-44 sm:w-40 sm:h-48 rounded-md shadow-md overflow-hidden border-2 border-[#b5a58b] cursor-pointer hover:border-[#8a6d2f] transition relative group bg-gray-100"
                title={isTamil ? 'முழு விவரங்கள் காண கிளிக் செய்க' : 'Click to view full profile'}
              >
                <img
                  src={profile.photos[0]}
                  alt={translateName(profile.name)}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none select-none"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{ display: 'none' }} className="w-full h-full">
                  <DefaultAvatar gender={profile.gender} size="card" />
                </div>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <span className="px-2 py-1 bg-black/70 text-white rounded text-[10px] font-bold">
                    {isTamil ? 'விவரங்கள்' : 'View Full'}
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => onViewDetails && onViewDetails(profile)}
                className="w-36 h-44 sm:w-40 sm:h-48 rounded-md shadow-md overflow-hidden border-2 border-[#b5a58b] cursor-pointer hover:border-[#8a6d2f] transition relative group bg-[#fdf9f2]"
                title={isTamil ? 'முழு விவரங்கள் காண கிளிக் செய்க' : 'Click to view details'}
              >
                <DefaultAvatar gender={profile.gender} size="card" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <span className="px-2 py-1 bg-black/70 text-white rounded text-[10px] font-bold">
                    {isTamil ? 'விவரங்கள்' : 'View Full'}
                  </span>
                </div>
              </div>
            )}

            {/* Profile ID and Badges */}
            <div className="mt-2 text-center space-y-1">
              <span className="font-extrabold text-sm sm:text-base text-[#1b2b20] tracking-wider block">
                ID:{profile.nikahId || profile.id}
              </span>

              {/* Verified Badge (✓ Verified / சரிபார்க்கப்பட்டது) */}
              {profile.isVerified !== false && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-800 text-white rounded-full font-bold text-[10px] sm:text-[11px] border border-amber-300 shadow-xs">
                  <FaCheckCircle className="text-amber-300 text-[10px]" />
                  <span>{isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified'}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Side: Details Key-Value Table */}
          <div className="flex-1 w-full flex flex-col justify-between min-h-[220px]">
            {/* Key Value Rows */}
            <div className="grid grid-cols-1 gap-1 text-xs sm:text-sm">
              {rows.map((row, idx) => (
                <div
                  key={idx}
                  className={`flex items-baseline py-0.5 border-b border-[#eee4cf]/70 hover:bg-[#f3edd9]/60 px-1 rounded transition-colors ${
                    row.highlight ? 'bg-[#fff5e3] font-bold text-[#7a1b1b]' : ''
                  }`}
                >
                  <div className="w-28 sm:w-32 flex-shrink-0 font-bold text-[#35250c]">
                    {row.label}
                  </div>
                  <div className="w-4 text-center font-bold text-[#35250c] flex-shrink-0">
                    :
                  </div>
                  <div className={`flex-1 pl-1 break-words ${row.highlight ? 'font-black text-[#8a1c1c]' : 'font-semibold text-[#181818]'}`}>
                    {row.value || '-'}
                  </div>
                </div>
              ))}
            </div>

            {/* Playable Voice Note & Maroon Requirement Note */}
            <div className="mt-2.5 space-y-2">
              {(profile.audioClip?.url || profile.audioUrl) && (
                <div className="p-2 bg-[#fcf8ed] rounded-lg border border-[#caa85d]/60 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#163828] mb-1">
                    <FaMicrophone className="text-rose-600 text-xs" />
                    <span>{isTamil ? 'குரல் பதிவு (Voice Note):' : "Candidate's Voice Note:"}</span>
                  </div>
                  <audio
                    controls
                    src={profile.audioClip?.url || profile.audioUrl}
                    className="w-full h-8"
                    preload="none"
                  />
                </div>
              )}
              <p className="text-[#7A1414] font-black text-xs sm:text-sm tracking-wide text-center sm:text-left">
                {requirementText}
              </p>
            </div>

            {/* Action Button: View Details Only */}
            <div className="mt-2 pt-2 border-t border-[#dfd2ba] flex items-center justify-end">
              <button
                type="button"
                onClick={currentUser ? () => onViewDetails && onViewDetails(profile) : onOpenLogin}
                className="px-4 py-1.5 rounded-md text-xs sm:text-sm font-bold bg-[#163828] text-[#edd48e] hover:bg-[#24583f] flex items-center gap-1.5 shadow-sm transition border border-[#caa85d]"
              >
                <span>{isTamil ? 'முழு விவரங்கள்' : 'View Details'}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
