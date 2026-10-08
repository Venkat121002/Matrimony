import React, { useEffect, useState, useRef } from 'react';
import {
  FaTimes,
  FaPhoneAlt,
  FaCheckCircle,
  FaCrown,
  FaCamera,
  FaMicrophone,
  FaUserTie,
  FaUser,
  FaGraduationCap,
  FaBriefcase,
  FaUsers,
  FaGlobeAmericas,
  FaStar,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import DefaultAvatar from './DefaultAvatar';

export default function ProfileDetailsModal({
  profile,
  isOpen,
  onClose,
  onOpenLogin,
  currentUser,
  viewStats,
  onOpenUpgrade,
  onToggleShortlist,
  isShortlisted,
}) {
  const { t, isTamil, translateValue, translateName, translateWorkPreference } = useLanguage();
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const mouseDownTargetRef = useRef(null);

  const handleBackdropMouseDown = (e) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
      onClose();
    }
  };

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

  if (!isOpen || !profile) return null;

  const rawCandidateName = !isTamil
    ? (profile.nameEn && profile.nameEn !== profile.name ? profile.nameEn : (profile.fullNameEn || profile.nameEn || profile.fullName || profile.name))
    : (profile.fullName || profile.name || profile.fullNameEn || profile.nameEn);
  const candidateName = translateName(rawCandidateName);
  const audioUrl = profile.audioClip?.url || profile.audioUrl;
  const isGroom = profile.gender === 'groom';
  const isSelf =
    currentUser &&
    (currentUser._id === profile._id ||
      currentUser.nikahId === profile.nikahId ||
      currentUser.id === profile.id);
  const isPremiumUser =
    currentUser &&
    (currentUser.subscriptionStatus === 'premium' ||
      currentUser.role === 'admin' ||
      isSelf);
  const canAccessContacts = Boolean(isPremiumUser && !profile.isContactLocked && profile.phone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3 px-4 flex items-center justify-between border-b-2 border-[#caa85d] flex-shrink-0 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded bg-amber-400 text-gray-900 font-extrabold text-xs flex-shrink-0">
              ID: {profile.nikahId || profile.id}
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-[#fffae6] tracking-wide font-cinzel truncate">
              {isGroom ? t('groomDetails') : t('brideDetails')} - {candidateName}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onToggleShortlist && !isSelf && (
              <button
                type="button"
                onClick={() => onToggleShortlist(profile.id || profile._id || profile.nikahId)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
                  isShortlisted
                    ? 'bg-amber-400 text-gray-950 font-black border border-amber-200'
                    : 'bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40'
                }`}
                title={isShortlisted ? (isTamil ? 'தேர்வு நீக்குக' : 'Remove from Chosen') : (isTamil ? 'வரனைத் தேர்வு செய்க' : 'Choose Profile')}
              >
                <FaStar className={isShortlisted ? 'text-amber-900' : 'text-amber-300'} />
                <span>
                  {isShortlisted
                    ? (isTamil ? 'தேர்வு செய்யப்பட்டது' : 'Chosen Profile')
                    : (isTamil ? 'வரனைத் தேர்வு செய்க' : 'Choose Profile')}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition p-1 text-base rounded-md hover:bg-white/10"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Content Body: ONLY showing details provided in the registration form */}
        <div className="overflow-y-auto p-4 sm:p-5 text-xs sm:text-sm space-y-4">
          {/* View Quota Banner for Free Trial / Premium */}
          {viewStats && (
            <div className="flex items-center justify-between p-2.5 bg-[#f5eddb] border border-[#caa85d] rounded-lg text-xs">
              {viewStats.isPremium ? (
                <span className="flex items-center gap-1.5 text-purple-900 font-extrabold">
                  <FaCrown className="text-amber-500" />
                  <span>{isTamil ? 'பிரீமியம் வரம்பற்ற பார்வை செயலில் உள்ளது' : 'Premium Unlimited Access Active'}</span>
                </span>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[#4b3a1a] font-bold">
                    {isTamil
                      ? `இலவச வரன் பார்வை: ${viewStats.viewsRemaining ?? 0} / ${viewStats.limit ?? 5} எஞ்சியுள்ளது`
                      : `Free Trial: ${viewStats.viewsRemaining ?? 0} of ${viewStats.limit ?? 5} views remaining this month`}
                  </span>
                  {onOpenUpgrade && (
                    <button
                      type="button"
                      onClick={onOpenUpgrade}
                      className="px-2.5 py-1 bg-[#8a6d2f] text-white font-extrabold rounded text-[11px] hover:bg-[#6c5523] transition flex items-center gap-1"
                    >
                      <FaCrown className="text-amber-300" />
                      <span>{isTamil ? 'அன்லிமிடெட் பெறுக' : 'Upgrade to Unlimited'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Profile Summary Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#ede4d1] rounded-xl border border-[#c8b594]">
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-[#163828]">
                {candidateName}
              </span>
              <span className="text-xs font-bold text-gray-700">
                ({profile.age} {isTamil ? 'வயது' : 'Years'} • {isGroom ? (isTamil ? 'மணமகன்' : 'Groom') : (isTamil ? 'மணமகள்' : 'Bride')})
              </span>
            </div>

            {profile.isVerified !== false && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-800 text-white rounded-full font-bold text-[11px] border border-amber-300 shadow-xs">
                <FaCheckCircle className="text-amber-300 text-[10px]" />
                <span>{isTamil ? 'சரிபார்க்கப்பட்டது' : 'Verified Profile'}</span>
              </span>
            )}
          </div>

          {/* Section 1: Candidate Basic & Demographic Details */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
            <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
              <FaUser className="text-[#caa85d]" />
              <span>1. {isTamil ? 'வரன் தனிநபர் விவரங்கள்' : 'Candidate Details'}</span>
            </h4>
            <NeatDetailRow label={isTamil ? 'பெயர்' : 'Full Name'} value={candidateName} />
            <NeatDetailRow
              label={isTamil ? 'வரன் வகை' : 'Profile For'}
              value={isGroom ? (isTamil ? 'மணமகன்' : 'Groom') : (isTamil ? 'மணமகள்' : 'Bride')}
            />
            <NeatDetailRow label={isTamil ? 'வயது' : 'Age'} value={`${profile.age} ${isTamil ? 'வயது' : 'Years'}`} />
            <NeatDetailRow label={isTamil ? 'திருமண நிலை' : 'Marital Status'} value={translateValue(profile.maritalStatus || profile.maritalStatusEn) || '—'} />
            <NeatDetailRow label={isTamil ? 'மொழி & இனம்' : 'Language'} value={translateValue(profile.language) || (isTamil ? 'தமிழ்-முஸ்லிம்' : 'Tamil-Muslim')} />
            <NeatDetailRow label={isTamil ? 'சொந்த இருப்பிடம்' : 'Native Location'} value={translateValue(profile.location || profile.nativePlace || profile.district) || '—'} />
            <NeatDetailRow label={isTamil ? 'பணிபுரியும் இடம்' : 'Workplace Location'} value={translateValue(profile.workplace || profile.workplaceEn) || '—'} />
            <NeatDetailRow label={isTamil ? 'உயரம்' : 'Height'} value={translateValue(profile.height || profile.heightEn) || '—'} />
            {Boolean(profile.isOverseas || profile.citizenship) && (
              <NeatDetailRow
                label={isTamil ? 'குடியுரிமை (Citizenship)' : 'Citizenship'}
                value={`🌍 ${profile.citizenship || (isTamil ? 'வெளிநாடு' : 'Overseas')}`}
              />
            )}
            {Boolean(profile.countryOfResidence) && (
              <NeatDetailRow
                label={isTamil ? 'வசிக்கும் நாடு' : 'Country of Residence'}
                value={profile.countryOfResidence}
              />
            )}
          </div>

          {/* Section 2: Contact Numbers & Publisher Info */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-2">
            <div className="flex items-center justify-between border-b border-[#dfd2ba] pb-1.5 mb-2">
              <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5">
                <FaPhoneAlt className="text-[#caa85d]" />
                <span>2. {isTamil ? 'தொடர்பு & பதிவு செய்பவர் விவரங்கள்' : 'Contact & Publisher Info'}</span>
              </h4>
              {currentUser && !canAccessContacts && (
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] flex items-center gap-1">
                  <span>🔒 {isTamil ? 'பிரீமியம் மட்டும்' : 'Premium Only'}</span>
                </span>
              )}
              {canAccessContacts && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10px]">
                  ✓ {isTamil ? 'தொடர்பு அன்லாக்' : 'Contact Unlocked'}
                </span>
              )}
            </div>

            {/* If Free Tier, show prominent upgrade prompt */}
            {currentUser && !canAccessContacts && (
              <div className="p-3 bg-gradient-to-r from-[#f7efdc] to-[#f4e7c7] border border-[#d6ba7c] rounded-xl text-xs space-y-2 shadow-xs">
                <div className="flex items-start gap-2">
                  <FaCrown className="text-amber-600 text-base flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-extrabold text-[#163828]">
                      {isTamil
                        ? 'இலவச கணக்கில் தொடர்பு எண்களைப் பார்க்க இயலாது'
                        : 'Contact details cannot be accessed with Free Tier'}
                    </h5>
                    <p className="text-gray-700 text-[11px] mt-0.5">
                      {isTamil
                        ? 'வரனின் நேரடி தொலைபேசி எண், வாட்ஸ்அப் மற்றும் பெற்றோர் எண்களைப் பார்க்க பிரீமியம் திட்டத்திற்கு மேம்படுத்துங்கள்.'
                        : 'Upgrade to Premium to instantly unlock direct phone numbers, WhatsApp chat, and parent/guardian contacts.'}
                    </p>
                  </div>
                </div>
                {onOpenUpgrade && (
                  <button
                    type="button"
                    onClick={onOpenUpgrade}
                    className="w-full py-1.5 px-3 rounded-lg btn-gold font-extrabold text-xs flex items-center justify-center gap-1.5 shadow hover:scale-[1.01] transition cursor-pointer"
                  >
                    <FaCrown className="text-[#163828]" />
                    <span>{isTamil ? '₹999 செலுத்தி தொடர்பு எண்களை அன்லாக் செய்க' : 'Upgrade to Premium (₹999) to Unlock Contacts'}</span>
                  </button>
                )}
              </div>
            )}

            <NeatDetailRow
              label={isTamil ? 'முதன்மை மொபைல் எண்' : 'Primary Phone'}
              value={
                canAccessContacts
                  ? (profile.phone || '—')
                  : currentUser
                  ? (isTamil ? '•••••••••• (பிரீமியம் தேவை)' : '•••••••••• (Premium Required)')
                  : (isTamil ? '•••••••••• (பார்க்க உள்நுழையவும்)' : '•••••••••• (Login to view)')
              }
              isMono
            />
            <NeatDetailRow
              label={isTamil ? 'கூடுதல் மொபைல் எண்கள்' : 'Additional Phones'}
              value={
                canAccessContacts
                  ? (Array.isArray(profile.additionalPhones) && profile.additionalPhones.filter(Boolean).length > 0
                      ? profile.additionalPhones.filter(Boolean).join(', ')
                      : (isTamil ? 'இல்லை' : 'None'))
                  : '••••••••••'
              }
              isMono
            />
            <NeatDetailRow
              label={isTamil ? 'மின்னஞ்சல்' : 'Email'}
              value={
                canAccessContacts
                  ? (profile.email && !profile.email.endsWith('@tamilnikah.com')
                      ? profile.email
                      : (isTamil ? 'வழங்கப்படவில்லை' : 'Not provided'))
                  : '••••••@•••••'
              }
            />
            <NeatDetailRow
              label={isTamil ? 'பதிவு செய்தவர்' : 'Publisher Name'}
              value={translateName(profile.publisher?.name || profile.publisherName || candidateName || (isTamil ? 'சுய பதிவு' : 'Self'))}
            />
            <NeatDetailRow
              label={isTamil ? 'வரனுடன் உறவுமுறை' : 'Relationship'}
              value={translateValue(profile.publisher?.relationship || profile.publisherRelationship || (isTamil ? 'சுய பதிவு' : 'Self'))}
            />
            <NeatDetailRow
              label={isTamil ? 'பதிவு செய்த நாள்' : 'Registration Date'}
              value={
                profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
                      dateStyle: 'medium',
                    })
                  : '—'
              }
            />
          </div>

          {/* Section 3: Education, Occupation, Income & Properties */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
            <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
              <FaGraduationCap className="text-[#caa85d]" />
              <span>3. {isTamil ? 'கல்வி, தொழில் & சொத்துக்கள்' : 'Education, Career & Assets'}</span>
            </h4>
            <NeatDetailRow label={isTamil ? 'கல்வித் தகுதி' : 'Education Qualification'} value={translateValue(profile.education || profile.educationEn) || '—'} />
            <NeatDetailRow label={isTamil ? 'தொழில் / பணி' : 'Occupation'} value={translateValue(profile.occupation || profile.profession || profile.professionEn) || '—'} />
            <NeatDetailRow label={isTamil ? 'பணிபுரியும் இடம்' : 'Workplace Location'} value={translateValue(profile.workplace || profile.workplaceEn) || '—'} />
            {Boolean(profile.workingYearsInTitleLocation) && (
              <NeatDetailRow
                label={isTamil ? 'இப்பதவியில் பணி அனுபவம்' : 'Years in Title & Location'}
                value={`${profile.workingYearsInTitleLocation} ${isTamil ? 'ஆண்டுகள் (இப்பணியிடத்தில்)' : 'Years (In this location)'}`}
              />
            )}
            <NeatDetailRow label={isTamil ? 'மாத வருமானம்' : 'Monthly Income'} value={translateValue(profile.monthlyIncome || profile.income || profile.incomeEn) || '—'} />
            <NeatDetailRow label={isTamil ? 'சொத்துக்கள்' : 'Properties'} value={translateValue(profile.property || profile.properties || profile.propertyEn || profile.propertiesEn) || '—'} />
          </div>

          {/* Section 4: Work Preferences (பணி விருப்பங்கள்) */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-2">
            <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
              <FaBriefcase className="text-[#caa85d]" />
              <span>4. {isTamil ? 'பணி விருப்பங்கள்' : 'Work Preferences'}</span>
            </h4>
            {isGroom ? (
              <NeatDetailRow
                label={isTamil ? 'மணமகள் பணிபுரிவது குறித்த விருப்பம்' : 'Preference Regarding Bride Working'}
                value={
                  translateWorkPreference(
                    profile.workPreferences?.groomWorkPreference || profile.workPreference,
                    true
                  )
                }
              />
            ) : (
              <NeatDetailRow
                label={isTamil ? 'மணமகள் பணி நிலை / விருப்பம்' : 'Bride’s Work Preference'}
                value={
                  translateWorkPreference(
                    profile.workPreferences?.brideWorkStatus || profile.workPreference,
                    false
                  )
                }
              />
            )}
            {profile.workPreferences?.notes && (
              <NeatDetailRow
                label={isTamil ? 'கூடுதல் குறிப்பு' : 'Additional Notes'}
                value={translateValue(profile.workPreferences.notes)}
              />
            )}
          </div>

          {/* Section 5: Family Details (பெற்றோர் & உடன்பிறப்புகள்) */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-3">
            <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5">
              <FaUsers className="text-[#caa85d]" />
              <span>5. {isTamil ? 'குடும்ப விவரங்கள்' : 'Family Details'}</span>
            </h4>

            {/* Parents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Father Box */}
              <div className="p-2.5 bg-white/90 rounded-lg border border-[#e2d5bd] space-y-1">
                <span className="font-extrabold text-xs text-[#163828] block border-b border-[#ebdcc4] pb-1">
                  👨 {isTamil ? 'தந்தை விவரம் (Father Details)' : 'Father Details'}
                </span>
                <div className="text-xs space-y-1 pt-1">
                  <p><span className="font-bold text-gray-700">{isTamil ? 'பெயர்' : 'Name'}:</span> <span className="font-semibold">{profile.familyDetails?.fatherName || profile.fatherName || '—'}</span></p>
                  <p><span className="font-bold text-gray-700">{isTamil ? 'வயது' : 'Age'}:</span> <span className="font-semibold">{profile.familyDetails?.fatherAge ? `${profile.familyDetails.fatherAge} ${isTamil ? 'வயது' : 'Years'}` : '—'}</span></p>
                  <p><span className="font-bold text-gray-700">{isTamil ? 'தொழில்' : 'Occupation'}:</span> <span className="font-semibold">{profile.familyDetails?.fatherOccupation || profile.fatherOccupation || '—'}</span></p>
                </div>
              </div>

              {/* Mother Box */}
              <div className="p-2.5 bg-white/90 rounded-lg border border-[#e2d5bd] space-y-1">
                <span className="font-extrabold text-xs text-[#163828] block border-b border-[#ebdcc4] pb-1">
                  👩 {isTamil ? 'தாய் விவரம் (Mother Details)' : 'Mother Details'}
                </span>
                <div className="text-xs space-y-1 pt-1">
                  <p><span className="font-bold text-gray-700">{isTamil ? 'பெயர்' : 'Name'}:</span> <span className="font-semibold">{profile.familyDetails?.motherName || profile.motherName || '—'}</span></p>
                  <p><span className="font-bold text-gray-700">{isTamil ? 'வயது' : 'Age'}:</span> <span className="font-semibold">{profile.familyDetails?.motherAge ? `${profile.familyDetails.motherAge} ${isTamil ? 'வயது' : 'Years'}` : '—'}</span></p>
                  <p><span className="font-bold text-gray-700">{isTamil ? 'தொழில்' : 'Occupation'}:</span> <span className="font-semibold">{profile.familyDetails?.motherOccupation || profile.motherOccupation || (isTamil ? 'இல்லத்தரசி (Home Maker)' : 'Home Maker')}</span></p>
                </div>
              </div>
            </div>

            {/* Siblings List */}
            <div className="pt-2 border-t border-[#dfd2ba]/70">
              <span className="font-bold text-xs text-[#163828] block mb-1.5">
                👥 {isTamil ? 'உடன்பிறப்புகள் விவரம் (Siblings Details):' : 'Siblings Details:'}
              </span>
              {Array.isArray(profile.familyDetails?.siblings) && profile.familyDetails.siblings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {profile.familyDetails.siblings.map((sib, sIdx) => {
                    const rel = String(sib.relation || '').toLowerCase();
                    const isSister = rel === 'sister' || sib.relation === 'சகோதரி';
                    const status = String(sib.maritalStatus || '').toLowerCase();
                    const isMarried = status === 'married' || sib.maritalStatus === 'திருமணமானவர்';
                    return (
                      <div
                        key={sIdx}
                        className="p-2 bg-white rounded-lg border border-[#dfd2ba] flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div>
                          <span className="font-extrabold text-[#163828] block">{sib.name || `${isTamil ? 'உடன்பிறப்பு' : 'Sibling'} ${sIdx + 1}`}</span>
                          <span className="text-[11px] text-gray-600 font-medium">
                            {isSister ? (isTamil ? 'சகோதரி (Sister)' : 'Sister') : (isTamil ? 'சகோதரர் (Brother)' : 'Brother')}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isMarried
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}
                        >
                          {isMarried ? (isTamil ? 'திருமணமானவர்' : 'Married') : (isTamil ? 'திருமணமாகாதவர்' : 'Unmarried')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : profile.familyDetails?.siblingDetails && typeof profile.familyDetails.siblingDetails === 'object' && Object.values(profile.familyDetails.siblingDetails).some(v => v && v !== 'இல்லை' && v !== '0') ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(profile.familyDetails.siblingDetails).map(([k, v]) => {
                    if (!v || v === 'இல்லை' || v === '0') return null;
                    const label = {
                      elderBrother: isTamil ? 'மூத்த சகோதரர்' : 'Elder Brother',
                      youngerBrother: isTamil ? 'இளைய சகோதரர்' : 'Younger Brother',
                      elderSister: isTamil ? 'மூத்த சகோதரி' : 'Elder Sister',
                      youngerSister: isTamil ? 'இளைய சகோதரி' : 'Younger Sister',
                    }[k] || k;
                    return (
                      <div key={k} className="p-2 bg-white rounded-lg border border-[#dfd2ba] text-xs">
                        <span className="text-gray-500 block text-[10px]">{label}</span>
                        <span className="font-extrabold text-[#163828] text-xs">{v}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic p-2 bg-white/60 rounded border border-[#e2d5bd]">
                  {isTamil ? 'உடன்பிறப்புகள் விவரம் குறிப்பிடப்படவில்லை.' : 'No sibling details listed.'}
                </p>
              )}
            </div>
          </div>

          {/* Section 6: Photos (Maximum up to 5) */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-2">
            <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5">
              <FaCamera className="text-[#caa85d]" />
              <span>6. {isTamil ? 'புகைப்படங்கள் (அதிகபட்சம் 5)' : 'Photos (Up to 5)'}</span>
            </h4>
            {profile.photos && profile.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                {profile.photos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPreviewPhotoUrl(url)}
                    className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#caa85d] shadow-sm bg-gray-100 group relative block cursor-pointer text-left"
                    title={isTamil ? 'பெரிதாகப் பார்க்க கிளிக் செய்க' : 'Click to view full size'}
                  >
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 pointer-events-none select-none"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white text-[10px] font-bold">
                      {isTamil ? 'முழு வடிவம் பார்க்க' : 'View Photo'}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-4 bg-[#f5eedf] rounded-lg border border-[#ded1bb] text-center">
                <div className="w-28 h-36 rounded-lg overflow-hidden border border-[#c5b597] mb-2 shadow-sm">
                  <DefaultAvatar size="card" />
                </div>
                <span className="text-xs text-gray-600 font-semibold">
                  {isTamil ? 'புகைப்படம் எதுவும் பதிவேற்றப்படவில்லை' : 'No photo uploaded'}
                </span>
              </div>
            )}
          </div>

          {/* Section 7: Description & Playable Audio Note */}
          <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-3">
            <div>
              <h4 className="font-extrabold text-sm text-[#163828] border-b border-[#dfd2ba] pb-1">
                7. {isTamil ? 'சுயவிவர குறிப்பு' : 'Description (Profile Bio)'}
              </h4>
              <p className="p-2.5 bg-white rounded-lg border border-[#dfd2ba] font-semibold text-gray-800 text-xs sm:text-sm mt-1.5 leading-relaxed">
                {translateValue(!isTamil ? (profile.descriptionEn || profile.description || profile.bioEn || profile.bio || profile.requirementEn || profile.requirement) : (profile.description || profile.bio || profile.requirement || profile.descriptionEn || profile.bioEn || profile.requirementEn)) || '—'}
              </p>
            </div>

            {/* Playable Audio Note placed directly under Description */}
            <div className="pt-2 border-t border-[#dfd2ba]/70">
              <h5 className="font-bold text-xs text-[#163828] flex items-center gap-1.5 mb-1.5">
                <FaMicrophone className="text-rose-600" />
                <span>{isTamil ? 'குரல் பதிவு' : 'Audio Note (Voice Recording)'}</span>
              </h5>
              {audioUrl ? (
                <div className="space-y-1 bg-[#fdfaf3] p-3 rounded-xl border border-[#caa85d]/60">
                  <p className="text-[11px] text-gray-700 font-medium">
                    {isTamil
                      ? 'குடும்பம் மற்றும் எதிர்பார்ப்புகள் குறித்த வரனின் குரல் பதிவு:'
                      : "Candidate's audio note regarding expectations & family background:"}
                  </p>
                  <audio controls src={audioUrl} className="w-full h-10 mt-1" />
                </div>
              ) : (
                <div className="p-2.5 bg-[#f5eedf] rounded-lg border border-[#ded1bb] text-center text-xs text-gray-600">
                  {isTamil
                    ? 'குரல் பதிவு எதுவும் இணைக்கப்படவில்லை.'
                    : 'No audio note uploaded.'}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer: Action Buttons (Call / WhatsApp / Upgrade / Choose / Close) */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfd2ba]">
            <div className="flex flex-wrap items-center gap-2">
              {canAccessContacts ? (
                <>
                  <a
                    href={`tel:${profile.phone}`}
                    className="btn-gold px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow"
                  >
                    <FaPhoneAlt className="text-xs" />
                    <span>{t('phoneCol')}: {profile.phone || '—'}</span>
                  </a>
                  {profile.phone && (
                    <a
                      href={`https://wa.me/91${String(profile.phone).replace(/\D/g, '').slice(-10)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#25D366] text-white hover:bg-[#20ba5a] flex items-center gap-1.5 shadow transition"
                    >
                      <span>WhatsApp</span>
                    </a>
                  )}
                </>
              ) : currentUser ? (
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="btn-gold px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow hover:scale-105 transition cursor-pointer"
                >
                  <FaCrown className="text-amber-800" />
                  <span>{isTamil ? 'தொடர்பு கொள்ள பிரீமியத்திற்கு மேம்படுத்துங்கள்' : 'Upgrade to Premium to Call & WhatsApp'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="btn-gold px-5 py-2 rounded-lg text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow"
                >
                  <FaPhoneAlt className="text-xs" />
                  <span>{t('contactCol')} {t('phoneCol')} ({isTamil ? 'உள்நுழையவும்' : 'Login'})</span>
                </button>
              )}

              {onToggleShortlist && !isSelf && (
                <button
                  type="button"
                  onClick={() => onToggleShortlist(profile.id || profile._id || profile.nikahId)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow transition cursor-pointer ${
                    isShortlisted
                      ? 'bg-amber-400 text-gray-950 border border-amber-300 ring-1 ring-amber-400'
                      : 'bg-[#163828] text-amber-200 hover:bg-[#204e38] border border-amber-400/60'
                  }`}
                >
                  <FaStar className={isShortlisted ? 'text-amber-900' : 'text-amber-300'} />
                  <span>
                    {isShortlisted
                      ? (isTamil ? '✓ தேர்ந்தெடுக்கப்பட்ட வரன்' : '✓ Chosen Profile')
                      : (isTamil ? '⭐ வரனைத் தேர்வு செய்க' : '⭐ Choose Profile')}
                  </span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#eae1d0] hover:bg-[#ded1bc] text-gray-800 border border-[#bfae8e]"
            >
              {t('closeProfile')}
            </button>
          </div>
        </div>
      </div>

      {/* In-page Lightbox / Protected Full Image Viewer */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-3 animate-fadeIn"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 text-white">
              <span className="text-xs font-bold text-amber-200">
                {candidateName} • {isTamil ? 'புகைப்படப் பார்வை' : 'Photo Viewer'}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPhotoUrl(null)}
                className="text-white hover:text-amber-300 bg-white/10 hover:bg-white/20 p-2 rounded-full text-sm transition cursor-pointer"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden border-2 border-[#caa85d] shadow-2xl bg-black/40">
              <img
                src={previewPhotoUrl}
                alt="Profile Full View"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
                className="max-h-[80vh] w-auto object-contain select-none pointer-events-none"
              />
            </div>
            <p className="text-[11px] text-amber-200/90 font-medium mt-2.5 bg-black/60 px-3 py-1 rounded-full border border-amber-400/30">
              {isTamil
                ? '🔒 பாதுகாக்கப்பட்ட பார்வை - புகைப்படங்களை பதிவிறக்கம் செய்ய இயலாது'
                : '🔒 Protected photo view - image downloading is disabled'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function NeatDetailRow({ label, value, isMono = false }) {
  return (
    <div className="flex items-baseline py-1.5 px-1 border-b border-[#eee4cf]/70 hover:bg-[#f3edd9]/40 rounded transition-colors text-xs sm:text-sm">
      <span className="w-36 sm:w-44 flex-shrink-0 font-bold text-[#35250c]">
        {label}
      </span>
      <span className="w-4 text-center font-bold text-[#35250c] flex-shrink-0">:</span>
      <span className={`flex-1 pl-1 break-words font-semibold text-gray-900 ${isMono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}
