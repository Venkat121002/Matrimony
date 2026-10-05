import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer';
import ProfileDetailsModal from './ProfileDetailsModal';
import EditProfileForm from './EditProfileForm';
import DefaultAvatar from './DefaultAvatar';
import PaymentModal from './PaymentModal';
import Toast from './Toast';
import { useLanguage } from '../context/LanguageContext';
import {
  FaUser,
  FaHeart,
  FaEdit,
  FaChevronLeft,
  FaPhoneAlt,
  FaGraduationCap,
  FaCheckCircle,
  FaCrown,
  FaLock,
  FaBolt,
  FaEnvelopeOpenText,
  FaInfinity,
  FaShieldAlt,
} from 'react-icons/fa';

export default function UserProfilePage() {
  const { t, isTamil, translateName, translateValue } = useLanguage();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nikah_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [shortlistedProfiles, setShortlistedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Modals state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState(null);
  const [detailViewStats, setDetailViewStats] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Fetch freshest user data on mount
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('nikah_token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('nikah_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Error refreshing current user profile:', err);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch Chosen / Shortlisted Profiles
  useEffect(() => {
    if (!currentUser) {
      window.location.href = '/';
      return;
    }

    const fetchShortlisted = async () => {
      try {
        const token = localStorage.getItem('nikah_token');
        let ids = [];

        // Try backend my-shortlist first
        if (token) {
          try {
            const bRes = await fetch('/api/profiles/my-shortlist', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const bData = await bRes.json();
            if (bData.success && Array.isArray(bData.profiles)) {
              const mapped = bData.profiles.map((u) => ({
                ...u,
                id: u.nikahId || u._id,
                name: u.fullName,
                nameEn: u.fullNameEn || u.fullName,
                age: u.age,
                gender: u.gender,
                location: u.location || u.nativePlace || u.district,
                locationEn: u.location || u.nativePlace || u.district,
                workplace: u.workplace || '',
                profession: u.occupation,
                professionEn: u.occupation,
                income: u.monthlyIncome,
                incomeEn: u.monthlyIncome,
                property: u.property,
                requirement: u.requirement || u.bio,
                requirementEn: u.requirement || u.bio,
              }));
              setShortlistedProfiles(mapped);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Backend shortlist sync fallback:', e);
          }
        }

        // Fallback to localStorage
        const savedIds = localStorage.getItem('shortlisted_nikah_ids');
        ids = savedIds ? JSON.parse(savedIds) : [];

        if (ids.length === 0) {
          setShortlistedProfiles([]);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/profiles?limit=1000');
        const data = await res.json();

        if (data.success && data.profiles) {
          const mapped = data.profiles
            .filter((u) => ids.includes(u.nikahId) || ids.includes(u._id))
            .map((u) => ({
              ...u,
              id: u.nikahId || u._id,
              name: u.fullName,
              nameEn: u.fullNameEn || u.fullName,
              age: u.age,
              gender: u.gender,
              location: u.location || u.nativePlace || u.district,
              locationEn: u.location || u.nativePlace || u.district,
              workplace: u.workplace || '',
              profession: u.occupation,
              professionEn: u.occupation,
              income: u.monthlyIncome,
              incomeEn: u.monthlyIncome,
              property: u.property,
              requirement: u.requirement || u.bio,
              requirementEn: u.requirement || u.bio,
            }));
          setShortlistedProfiles(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShortlisted();
  }, [currentUser?.nikahId]);

  const handleLogout = () => {
    localStorage.removeItem('nikah_token');
    localStorage.removeItem('nikah_user');
    window.location.href = '/';
  };

  const handleRemoveShortlist = async (id) => {
    // Sync with backend
    const token = localStorage.getItem('nikah_token');
    if (token) {
      fetch(`/api/profiles/shortlist/toggle/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    }

    // Sync with localStorage
    const saved = localStorage.getItem('shortlisted_nikah_ids');
    let ids = saved ? JSON.parse(saved) : [];
    ids = ids.filter((item) => item !== id);
    localStorage.setItem('shortlisted_nikah_ids', JSON.stringify(ids));
    setShortlistedProfiles((prev) => prev.filter((p) => p.id !== id && p.nikahId !== id));

    showToast(isTamil ? 'வரன் தேர்விலிருந்து நீக்கப்பட்டது' : 'Profile removed from chosen list', 'info');
  };

  const handleViewDetails = async (profile) => {
    const token = localStorage.getItem('nikah_token');
    const profileIdentifier = profile._id || profile.nikahId || profile.id;

    try {
      const res = await fetch(`/api/profiles/${profileIdentifier}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 403 && data.limitReached) {
        showToast(data.message, 'warning');
        setIsPaymentOpen(true);
        return;
      }

      if (data.success && data.profile) {
        setSelectedDetailProfile({
          ...profile,
          ...data.profile,
          id: data.profile.nikahId || profile.id,
          name: data.profile.fullName || profile.name,
        });
        setDetailViewStats(data.viewStats);
        setIsDetailsOpen(true);
        refreshUser();
      } else {
        setSelectedDetailProfile(profile);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      console.warn('API detail fetch error:', err);
      setSelectedDetailProfile(profile);
      setIsDetailsOpen(true);
    }
  };

  const handlePaymentSuccess = (verifyData) => {
    if (verifyData.user) {
      setCurrentUser(verifyData.user);
      localStorage.setItem('nikah_user', JSON.stringify(verifyData.user));
    } else {
      setCurrentUser((prev) => ({
        ...prev,
        subscriptionStatus: 'premium',
        premiumExpiresAt: verifyData.premiumExpiresAt,
      }));
    }
    refreshUser();
    showToast(
      isTamil
        ? 'அல்ஹம்துலில்லாஹ்! பிரீமியம் சந்தா வெற்றிகரமாக செயல்படுத்தப்பட்டது! வரம்பற்ற வசதிகளைப் பயன்படுத்தலாம்! 👑'
        : 'Alhamdulillah! Premium membership activated successfully! Unlimited features unlocked! 👑',
      'success'
    );
  };

  if (!currentUser) return null;

  const isPremium = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';
  const viewsUsed = Number(currentUser.monthlyViewsCount) || 0;
  const freeViewsLimit = 5;
  const freeChosenLimit = 3;
  const isBride = currentUser.gender === 'bride';

  return (
    <div className="min-h-screen flex flex-col bg-[#f5efe1] text-gray-800 font-sans">
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        isProfilePage={true}
        onOpenUpgrade={() => setIsPaymentOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-6">
        <a href="/" className="inline-flex items-center gap-2 text-[#8a6d2f] font-bold hover:underline mb-2">
          <FaChevronLeft />
          {isTamil ? 'முகப்பு பக்கத்திற்குச் செல்ல' : 'Back to Home'}
        </a>

        {/* User Summary Top Bar */}
        <div className="bg-white rounded-2xl shadow-md border border-[#caa85d] p-5 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentUser.photos && currentUser.photos.length > 0 ? (
                <img
                  src={currentUser.photos[0]}
                  alt={currentUser.fullName}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#caa85d] shadow select-none"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#163828] text-[#edd48e] flex items-center justify-center text-3xl font-bold shadow">
                  <FaUser />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#163828]">
                    {translateName(!isTamil ? (currentUser.fullNameEn || currentUser.fullName) : currentUser.fullName)}
                  </h1>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1 ${
                      isPremium
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-gray-950 border-amber-400 shadow-sm'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {isPremium ? <FaCrown className="text-amber-800" /> : null}
                    <span>
                      {isPremium
                        ? (isTamil ? 'பிரீமியம் சந்தாதாரர் (Premium Member)' : 'Premium Member')
                        : (isTamil ? 'இலவச திட்டம் (Free Tier)' : 'Free Tier')}
                    </span>
                  </span>
                </div>
                <p className="text-gray-600 font-medium text-xs sm:text-sm mt-1">
                  ID: <span className="font-mono font-bold text-[#163828]">{currentUser.nikahId}</span> •{' '}
                  {isBride ? (isTamil ? 'மணமகள்' : 'Bride') : (isTamil ? 'மணமகன்' : 'Groom')} •{' '}
                  {currentUser.district || currentUser.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 md:flex-none px-4 py-2 bg-[#8a6d2f] hover:bg-[#6f5623] text-white font-bold rounded-lg flex items-center justify-center gap-2 transition shadow text-xs sm:text-sm cursor-pointer"
                >
                  <FaEdit />
                  <span>{isTamil ? 'சுயவிவரத்தை திருத்த' : 'Edit Profile'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 🌟 MEMBERSHIP & PLAN UPGRADE SECTION (Highlighted for User Side) 🌟 */}
        <div className="bg-gradient-to-br from-[#fdfbf6] via-[#faf4e6] to-[#f4e8cc] rounded-2xl border-2 border-[#caa85d] p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfd2ba] pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${isPremium ? 'bg-emerald-800 text-amber-300' : 'bg-[#caa85d] text-[#163828]'}`}>
                <FaCrown className="text-2xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#163828]">
                    {isTamil ? 'சந்தா திட்டம் & பயன்பாட்டு விவரங்கள்' : 'Membership Plan & Usage Status'}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      isPremium
                        ? 'bg-emerald-700 text-white border border-emerald-500'
                        : 'bg-amber-200 text-amber-900 border border-amber-400'
                    }`}
                  >
                    {isPremium ? (isTamil ? 'செயலில் உள்ளது ✓' : 'Active Premium ✓') : (isTamil ? 'இலவசம் (வரம்பிற்கு உட்பட்டது)' : 'Free Tier (Limited)')}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  {isPremium
                    ? (isTamil
                        ? `உங்கள் பிரீமியம் சந்தா செல்லுபடியாகும் நாள்: ${
                            currentUser.premiumExpiresAt
                              ? new Date(currentUser.premiumExpiresAt).toLocaleDateString(isTamil ? 'ta-IN' : 'en-IN', {
                                  dateStyle: 'medium',
                                })
                              : '1 ஆண்டு'
                          }`
                        : `Your annual membership is active until: ${
                            currentUser.premiumExpiresAt
                              ? new Date(currentUser.premiumExpiresAt).toLocaleDateString('en-IN', {
                                  dateStyle: 'medium',
                                })
                              : '1 Year'
                          }`)
                    : (isTamil
                        ? 'இலவச கணக்கில் 5 வரன் விவரங்கள் மற்றும் 3 வரன்கள் மட்டுமே தேர்வு செய்ய முடியும்.'
                        : 'Free tier permits viewing up to 5 profiles and choosing up to 3 profiles.')}
                </p>
              </div>
            </div>

            {/* Upgrade CTA / Renew Button */}
            {!isPremium ? (
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="btn-gold py-2.5 px-5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <FaBolt className="text-[#163828]" />
                <span>{isTamil ? 'பிரீமியத்திற்கு மேம்படுத்த (₹999)' : 'Upgrade to Premium (₹999)'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow transition cursor-pointer"
              >
                <FaCrown className="text-amber-300" />
                <span>{isTamil ? 'சந்தாவை நீட்டிக்க' : 'Renew / Extend Membership'}</span>
              </button>
            )}
          </div>

          {/* 4 Feature Usage Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Card 1: Profile Views Limit */}
            <div className="bg-white p-4 rounded-xl border border-[#dfd2ba] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#163828]">
                <span>{isTamil ? '1. வரன் விவரப் பார்வை' : '1. Profile Views'}</span>
                {isPremium ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <FaInfinity /> {isTamil ? 'வரம்பற்றது' : 'Unlimited'}
                  </span>
                ) : (
                  <span className="text-amber-800 font-extrabold">
                    {viewsUsed} / {freeViewsLimit}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isPremium ? 'bg-emerald-600' : 'bg-amber-600'}`}
                  style={{ width: isPremium ? '100%' : `${Math.min(100, (viewsUsed / freeViewsLimit) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-500">
                {isPremium
                  ? (isTamil ? 'அனைத்து வரன்களையும் வரம்பின்றி பார்க்கலாம்.' : 'Unlimited full profiles across all districts.')
                  : (isTamil
                      ? `இலவச கணக்கில் 5 வரன்கள் மட்டுமே. எஞ்சியது: ${Math.max(0, freeViewsLimit - viewsUsed)}.`
                      : `Free tier limit: 5 profiles. Remaining: ${Math.max(0, freeViewsLimit - viewsUsed)}.`)}
              </p>
            </div>

            {/* Card 2: Chosen Profiles Limit */}
            <div className="bg-white p-4 rounded-xl border border-[#dfd2ba] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#163828]">
                <span>{isTamil ? '2. தேர்வு செய்த வரன்கள்' : '2. Chosen Profiles'}</span>
                {isPremium ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <FaInfinity /> {isTamil ? 'வரம்பற்றது' : 'Unlimited'}
                  </span>
                ) : (
                  <span className="text-amber-800 font-extrabold">
                    {shortlistedProfiles.length} / {freeChosenLimit}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isPremium ? 'bg-emerald-600' : 'bg-amber-600'}`}
                  style={{ width: isPremium ? '100%' : `${Math.min(100, (shortlistedProfiles.length / freeChosenLimit) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-500">
                {isPremium
                  ? (isTamil ? 'எத்தனை வரன்களை வேண்டுமானாலும் தேர்வு செய்யலாம்.' : 'Choose and shortlist unlimited profiles.')
                  : (isTamil
                      ? `இலவச கணக்கில் 3 வரன்கள் மட்டுமே. எஞ்சியது: ${Math.max(0, freeChosenLimit - shortlistedProfiles.length)}.`
                      : `Free tier limit: 3 chosen profiles. Left: ${Math.max(0, freeChosenLimit - shortlistedProfiles.length)}.`)}
              </p>
            </div>

            {/* Card 3: Contact Details Access */}
            <div className="bg-white p-4 rounded-xl border border-[#dfd2ba] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#163828]">
                <span>{isTamil ? '3. தொடர்பு எண்கள்' : '3. Contact Details'}</span>
                {isPremium ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <FaCheckCircle className="text-xs" /> {isTamil ? 'அன்லாக்' : 'Unlocked'}
                  </span>
                ) : (
                  <span className="text-rose-700 font-extrabold flex items-center gap-1">
                    <FaLock className="text-[10px]" /> {isTamil ? 'லாக் செய்யப்பட்டுள்ளது' : 'Locked'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 mt-1">
                {isPremium
                  ? (isTamil ? 'பெற்றோர் & வரனின் தொலைபேசி எண்கள் உடனே கிடைக்கும்.' : 'Direct parent & candidate phone and WhatsApp numbers.')
                  : (isTamil ? 'இலவச கணக்கில் தொடர்பு எண்களைப் பார்க்க இயலாது.' : 'Contact numbers cannot be accessed on Free Tier.')}
              </p>
              {!isPremium && (
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="text-[11px] font-bold text-[#8a6d2f] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <FaCrown className="text-[10px]" />
                  <span>{isTamil ? 'அன்லாக் செய்ய கிளிக் செய்க' : 'Upgrade to Unlock'}</span>
                </button>
              )}
            </div>

            {/* Card 4: Automated Matching Email Alerts */}
            <div className="bg-white p-4 rounded-xl border border-[#dfd2ba] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#163828]">
                <span>{isTamil ? '4. புதிய வரன் மின்னஞ்சல்' : '4. Match Emails'}</span>
                {isPremium ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <FaCheckCircle className="text-xs" /> {isTamil ? 'செயலில் உள்ளது' : 'Active'}
                  </span>
                ) : (
                  <span className="text-rose-700 font-extrabold flex items-center gap-1">
                    <FaLock className="text-[10px]" /> {isTamil ? 'முடக்கப்பட்டுள்ளது' : 'Locked'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 mt-1">
                {isPremium
                  ? (isTamil
                      ? `புதிய பொருத்தமான ${isBride ? 'மணமகன்' : 'மணமகள்'} வரன்கள் உடனுக்குடன் உங்கள் மின்னஞ்சலுக்கு வரும்.`
                      : `Newly registered matching ${isBride ? 'groom' : 'bride'} profiles delivered to your email.`)
                  : (isTamil
                      ? `புதிய பொருத்தமான ${isBride ? 'மணமகன்' : 'மணமகள்'} வரன்களின் மின்னஞ்சல் பரிந்துரை பெற பிரீமியம் தேவை.`
                      : `Automated ${isBride ? 'groom' : 'bride'} recommendation emails are exclusive to Premium.`)}
              </p>
              {!isPremium && (
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(true)}
                  className="text-[11px] font-bold text-[#8a6d2f] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                >
                  <FaCrown className="text-[10px]" />
                  <span>{isTamil ? 'செயல்படுத்த கிளிக் செய்க' : 'Activate with Premium'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Value proposition highlight for Free Tier */}
          {!isPremium && (
            <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] text-white p-4 rounded-xl shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#caa85d]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FaCrown className="text-amber-400" />
                  <h4 className="font-extrabold text-sm sm:text-base text-[#fff5d0]">
                    {isTamil ? 'பிரீமியம் மெம்பர்ஷிப் சலுகை: ₹999 / ஆண்டு' : 'Upgrade to Annual Premium Membership: ₹999 / Year'}
                  </h4>
                </div>
                <p className="text-xs text-white/90">
                  {isTamil
                    ? 'வரம்பற்ற வரன் பார்வை • வரம்பற்ற வரன்கள் தேர்வு • நேரடி குடும்ப எண்கள் • புதிய வரன் மின்னஞ்சல் பரிந்துரைகள்.'
                    : 'Unlimited profile views • Unlimited chosen profiles • Direct phone & WhatsApp contacts • Automated new match email alerts.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="btn-gold py-2 px-4 rounded-lg font-bold text-xs sm:text-sm flex-shrink-0 shadow hover:scale-105 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <FaBolt className="text-[#163828]" />
                <span>{isTamil ? 'உடனடியாக மேம்படுத்துங்கள்' : 'Upgrade Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <EditProfileForm
            currentUser={currentUser}
            onCancel={() => setIsEditing(false)}
            onSave={(updatedUser) => {
              setCurrentUser(updatedUser);
              localStorage.setItem('nikah_user', JSON.stringify(updatedUser));
              setIsEditing(false);
              showToast(isTamil ? 'சுயவிவரம் வெற்றிகரமாக சேமிக்கப்பட்டது' : 'Profile updated successfully', 'success');
            }}
          />
        )}

        {/* Shortlisted Profiles Section */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <FaHeart className="text-red-500 text-xl" />
              <h2 className="text-lg sm:text-xl font-bold text-[#163828]">
                {isTamil ? 'நீங்கள் தேர்ந்தெடுத்த வரன்கள்' : 'Your Chosen Profiles'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#ede4d1] border border-[#d6ba7c] text-[#163828]">
                {isPremium
                  ? `${shortlistedProfiles.length} ${isTamil ? 'வரன்கள் (வரம்பற்றது)' : 'Profiles (Unlimited)'}`
                  : `${shortlistedProfiles.length} / ${freeChosenLimit} ${isTamil ? 'வரன்கள் (இலவச திட்டம்)' : 'Profiles (Free Tier)'}`}
              </span>
            </div>

            {!isPremium && shortlistedProfiles.length >= freeChosenLimit && (
              <button
                type="button"
                onClick={() => setIsPaymentOpen(true)}
                className="px-3 py-1 rounded-lg btn-gold font-bold text-xs flex items-center gap-1 shadow cursor-pointer"
              >
                <FaCrown className="text-xs" />
                <span>{isTamil ? 'வரம்பற்ற வரன்களை தேர்வு செய்ய மேம்படுத்துங்கள்' : 'Upgrade for Unlimited Choices'}</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#caa85d] mx-auto"></div>
            </div>
          ) : shortlistedProfiles.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-[#caa85d]">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#ede4d1] border-b border-[#dfd2ba] text-[#35250c] font-bold uppercase">
                    <th className="py-3 px-4">Nikah ID</th>
                    <th className="py-3 px-4">{isTamil ? 'பெயர்' : 'Name'}</th>
                    <th className="py-3 px-4">{isTamil ? 'சொந்த ஊர்' : 'Native Location'}</th>
                    <th className="py-3 px-4">{isTamil ? 'பணிபுரியும் இடம்' : 'Workplace'}</th>
                    <th className="py-3 px-4 text-right">{isTamil ? 'செயல்கள்' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd2ba]">
                  {shortlistedProfiles.map((profile) => (
                    <tr key={profile.id || profile.nikahId} className="hover:bg-[#f6efe1] transition duration-150">
                      <td className="py-3 px-4 font-mono font-bold text-[#163828]">
                        <span className="px-2 py-0.5 rounded bg-[#ebd7af] border border-[#d6bb85] text-xs">
                          {profile.nikahId}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#163828]">
                        {isTamil ? profile.fullName : (profile.fullNameEn || profile.fullName)}
                        <span className="block text-[11px] text-gray-500 font-normal">
                          {profile.age} {isTamil ? 'வயது' : 'yrs'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {translateValue(profile.location || profile.nativePlace || profile.district) || '—'}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {translateValue(profile.workplace) || '—'}
                      </td>
                      <td className="py-3 px-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(profile)}
                          className="px-3 py-1.5 bg-[#25583f] hover:bg-[#317051] text-[#fff7d6] rounded-md text-xs font-bold transition shadow cursor-pointer"
                        >
                          {isTamil ? 'பார்க்க' : 'View'}
                        </button>
                        <button
                          onClick={() => handleRemoveShortlist(profile.id || profile.nikahId)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-bold transition shadow cursor-pointer"
                        >
                          {isTamil ? 'நீக்கு' : 'Remove'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-[#caa85d] rounded-xl p-10 text-center">
              <FaHeart className="text-gray-300 text-4xl mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">
                {isTamil
                  ? 'நீங்கள் இன்னும் எந்த வரன்களையும் தேர்வு செய்யவில்லை.'
                  : 'You have not chosen any profiles yet.'}
              </p>
              <a
                href="/"
                className="inline-block mt-3 px-4 py-2 bg-[#163828] hover:bg-[#25583f] text-[#edd48e] rounded-lg text-xs font-bold transition shadow"
              >
                {isTamil ? 'வரன்களைத் தேடவும்' : 'Browse Profiles'}
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Profile Details Modal */}
      <ProfileDetailsModal
        profile={selectedDetailProfile}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        currentUser={currentUser}
        viewStats={detailViewStats}
        onOpenUpgrade={() => {
          setIsDetailsOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      {/* Razorpay Subscription Upgrade Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        user={currentUser}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Toast Notification */}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
