import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GenderRadioBar from './components/GenderRadioBar';
import ProfileCard from './components/ProfileCard';
import LoginBox from './components/LoginBox';
import AppDownloadBox from './components/AppDownloadBox';
import RegistrationBanner from './components/RegistrationBanner';
import MenuDropdown from './components/MenuDropdown';
import FilterBox from './components/FilterBox';
import WarningBoxes from './components/WarningBoxes';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import RegistrationSuccessModal from './components/RegistrationSuccessModal';
import VideoModal from './components/VideoModal';
import { AboutModal, ContactModal } from './components/InfoModals';
import Toast from './components/Toast';
import AdminDashboard from './components/AdminDashboard';
import PaymentModal from './components/PaymentModal';
import SupportModal from './components/SupportModal';
import ProfileDetailsModal from './components/ProfileDetailsModal';
import {
  FaChevronDown,
  FaHeart,
  FaUserCheck,
  FaExclamationTriangle,
  FaShieldAlt,
  FaCrown,
} from 'react-icons/fa';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t, isTamil, translateName } = useLanguage();

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nikah_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [profiles, setProfiles] = useState([]);
  const [selectedGender, setSelectedGender] = useState(() => {
    try {
      const saved = localStorage.getItem('nikah_user');
      const u = saved ? JSON.parse(saved) : null;
      if (u && u.gender) {
        return u.gender === 'groom' ? 'bride' : (u.gender === 'bride' ? 'groom' : 'all');
      }
    } catch {
      // ignore
    }
    return 'all';
  });
  const [searchId, setSearchId] = useState('');

  const [filters, setFilters] = useState(() => {
    let initialGen = 'all';
    try {
      const saved = localStorage.getItem('nikah_user');
      const u = saved ? JSON.parse(saved) : null;
      if (u && u.gender) {
        initialGen = u.gender === 'groom' ? 'bride' : (u.gender === 'bride' ? 'groom' : 'all');
      }
    } catch {
      // ignore
    }
    return {
      gender: initialGen,
      employmentStatus: 'all',
      nativePlace: '',
      workplace: '',
      ageFrom: 18,
      ageTo: 60,
      minHeight: 'all',
      minSalary: 'all',
      partnerPrefKeyword: '',
      maritalStatus: 'அனைத்தும்',
      language: 'அனைத்தும்',
      educationFrom: 'அனைத்தும்',
      educationTo: 'அனைத்தும்',
    };
  });

  const [visibleCount, setVisibleCount] = useState(6);
  const [shortlistedIds, setShortlistedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shortlisted_nikah_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [regSuccessUser, setRegSuccessUser] = useState(null);
  const [loginPrefillUsername, setLoginPrefillUsername] = useState('');

  // Profile Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState(null);
  const [detailViewStats, setDetailViewStats] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // 1. Refresh authenticated user from /api/auth/me to sync view quotas & verification status
  const refreshCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('nikah_token');
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('nikah_user', JSON.stringify(data.user));
      }

      // Sync shortlist from backend
      try {
        const sRes = await fetch('/api/profiles/my-shortlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sData = await sRes.json();
        if (sData.success && Array.isArray(sData.profiles)) {
          const ids = sData.profiles.map((p) => p.nikahId || p._id || p.id);
          setShortlistedIds(ids);
          localStorage.setItem('shortlisted_nikah_ids', JSON.stringify(ids));
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.warn('[App] Could not refresh user session:', err.message);
    }
  }, []);

  // 2. Fetch profiles from backend /api/profiles with strict gating (only verified profiles returned)
  const fetchProfiles = useCallback(async () => {
    try {
      // Pagination is client-side (visibleCount), so ask for everything; the API defaults to 20.
      const params = new URLSearchParams({ limit: '1000' });
      const targetGender = currentUser && currentUser.gender
        ? (currentUser.gender === 'groom' ? 'bride' : (currentUser.gender === 'bride' ? 'groom' : null))
        : (filters.gender && filters.gender !== 'all' ? filters.gender : null);

      if (targetGender) {
        params.append('gender', targetGender);
      }
      if (filters.nativePlace && filters.nativePlace.trim()) {
        params.append('nativePlace', filters.nativePlace.trim());
      }
      if (filters.workplace && filters.workplace.trim()) {
        params.append('workplace', filters.workplace.trim());
      }
      if (filters.ageFrom) params.append('ageMin', filters.ageFrom);
      if (filters.ageTo) params.append('ageMax', filters.ageTo);
      if (filters.maritalStatus && filters.maritalStatus !== 'அனைத்தும்') {
        params.append('maritalStatus', filters.maritalStatus);
      }
      if (filters.citizenship && filters.citizenship !== 'all') {
        params.append('citizenship', filters.citizenship);
      }
      if (searchId.trim()) {
        params.append('searchId', searchId.trim());
      }

      const res = await fetch(`/api/profiles?${params.toString()}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.profiles)) {
        // Map backend User documents to UI profile representation
        const mapped = data.profiles.map((u) => ({
          ...u,
          id: u.nikahId || u._id,
          name: u.fullName,
          nameEn: u.fullNameEn || u.fullName,
          age: u.age,
          gender: u.gender,
          location: u.location || u.district,
          locationEn: u.location || u.district,
          nativePlace: u.location || u.nativePlace || u.district,
          workplace: u.workplace || '',
          profession: u.occupation,
          professionEn: u.occupation,
          income: u.monthlyIncome || u.income,
          incomeEn: u.monthlyIncome || u.income,
          property: u.property || u.properties,
          requirement: u.description || u.bio || u.requirement,
          requirementEn: u.description || u.bio || u.requirement,
          isVerified: u.isVerified,
          verificationStatus: u.verificationStatus,
        }));
        setProfiles(mapped);
      }
    } catch (err) {
      console.warn('[App] Backend profiles fetch failed:', err.message);
    }
  }, [filters, searchId, currentUser]);

  useEffect(() => {
    refreshCurrentUser();
  }, [refreshCurrentUser]);

  // Synchronize gender lock whenever currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.gender) {
      const opp = currentUser.gender === 'groom' ? 'bride' : (currentUser.gender === 'bride' ? 'groom' : null);
      if (opp) {
        setSelectedGender(opp);
        setFilters((prev) => (prev.gender === opp ? prev : { ...prev, gender: opp }));
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  // Save shortlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shortlisted_nikah_ids', JSON.stringify(shortlistedIds));
    } catch (e) {
      console.error(e);
    }
  }, [shortlistedIds]);

  // Synchronize Gender Radio Bar with FilterBox gender (prevented when logged in)
  const handleGenderChange = (val) => {
    if (currentUser && currentUser.gender) {
      return; // Logged in user cannot switch between groom and bride
    }
    setSelectedGender(val);
    setFilters((prev) => ({ ...prev, gender: val }));
    setVisibleCount(6);
  };

  const handleFilterChange = (field, val) => {
    if (field === 'gender' && currentUser && currentUser.gender) {
      return; // Gender is locked for logged-in accounts
    }
    setFilters((prev) => {
      const next = { ...prev, [field]: val };
      if (field === 'gender') {
        setSelectedGender(val);
      }
      return next;
    });
    setVisibleCount(6);
  };

  const handleResetFilters = () => {
    const lockedGender = currentUser && currentUser.gender
      ? (currentUser.gender === 'groom' ? 'bride' : (currentUser.gender === 'bride' ? 'groom' : 'all'))
      : 'all';
    setSelectedGender(lockedGender);
    setSearchId('');
    setFilters({
      gender: lockedGender,
      employmentStatus: 'all',
      nativePlace: '',
      workplace: '',
      ageFrom: 18,
      ageTo: 60,
      minHeight: 'all',
      minSalary: 'all',
      partnerPrefKeyword: '',
      maritalStatus: 'அனைத்தும்',
      language: 'அனைத்தும்',
      educationFrom: 'அனைத்தும்',
      educationTo: 'அனைத்தும்',
    });
    setVisibleCount(6);
    showToast(isTamil ? 'வடிகட்டிகள் மீட்டமைக்கப்பட்டன' : 'Filters have been reset', 'info');
  };

  const handleToggleShortlist = (id) => {
    if (!currentUser) {
      showToast(
        isTamil
          ? 'வரன்களை தேர்வு செய்ய தயவுசெய்து உள்நுழையவும்.'
          : 'Please log in to choose and shortlist profiles.',
        'info'
      );
      setIsLoginOpen(true);
      return;
    }

    const isPremium = currentUser.subscriptionStatus === 'premium' || currentUser.role === 'admin';
    const FREE_CHOSEN_LIMIT = 3;

    setShortlistedIds((prev) => {
      const exists = prev.includes(id);

      if (!exists) {
        // Enforce 3 chosen profiles limit on Free Tier
        if (!isPremium && prev.length >= FREE_CHOSEN_LIMIT) {
          showToast(
            isTamil
              ? `இலவச கணக்கில் அதிகபட்சம் ${FREE_CHOSEN_LIMIT} வரன்களை மட்டுமே தேர்வு செய்ய முடியும். வரம்பற்ற வரன்களைத் தேர்வு செய்ய பிரீமியத்திற்கு மேம்படுத்துங்கள்! 👑`
              : `With free tier, you can choose only up to ${FREE_CHOSEN_LIMIT} profiles. Upgrade to Premium to choose unlimited profiles! 👑`,
            'warning'
          );
          setIsPaymentOpen(true);
          return prev;
        }

        const updated = [...prev, id];
        showToast(
          isTamil
            ? `ID:${id} வரன் விருப்பப்பட்டியலில் தேர்வு செய்யப்பட்டது! ⭐`
            : `ID:${id} added to your chosen profiles! ⭐`,
          'success'
        );

        // Sync with backend
        const token = localStorage.getItem('nikah_token');
        if (token) {
          fetch(`/api/profiles/shortlist/toggle/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(console.error);
        }

        return updated;
      } else {
        const updated = prev.filter((item) => item !== id);
        showToast(
          isTamil
            ? `ID:${id} தேர்வுப் பட்டியலிலிருந்து நீக்கப்பட்டது`
            : `ID:${id} removed from chosen profiles`,
          'info'
        );

        // Sync with backend
        const token = localStorage.getItem('nikah_token');
        if (token) {
          fetch(`/api/profiles/shortlist/toggle/${id}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          }).catch(console.error);
        }

        return updated;
      }
    });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(
      isTamil
        ? `அஸ்ஸலாமு அலைக்கும், ${translateName(user.fullName || user)}! நிக்காஹ் தளத்திற்கு நல்வரவு.`
        : `Welcome back, ${translateName(user.fullName || user)}! Logged in successfully.`,
      'success'
    );
    refreshCurrentUser();
  };

  const handleLogout = () => {
    localStorage.removeItem('nikah_token');
    localStorage.removeItem('nikah_user');
    setCurrentUser(null);
    setSelectedGender('all');
    setFilters((prev) => ({ ...prev, gender: 'all' }));
    showToast(isTamil ? 'வெற்றிகரமாக வெளியேறிவிட்டீர்கள்.' : 'Logged out successfully.', 'info');
  };

  const handleRegisterSuccess = (newUser) => {
    // Strictly DO NOT auto login
    setRegSuccessUser(newUser);
    fetchProfiles();
  };

  const handleOpenRegistration = () => {
    setIsRegisterOpen(true);
  };
  const handleOpenStandardRegistration = handleOpenRegistration;

  // 4. View Details Handler (Enforces 5 profiles/month on Free Trial)
  const handleViewDetails = async (profile) => {
    if (!currentUser) {
      showToast(
        isTamil
          ? 'முழு வரன் விவரங்களை காண தயவுசெய்து உள்நுழையவும் அல்லது பதிவு செய்யவும்.'
          : 'Please log in to view detailed profile and family contact information.',
        'info'
      );
      setIsLoginOpen(true);
      return;
    }

    const token = localStorage.getItem('nikah_token');
    const profileIdentifier = profile._id || profile.nikahId || profile.id;

    try {
      const res = await fetch(`/api/profiles/${profileIdentifier}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 403 && data.limitReached) {
        // Free view limit exceeded or trial expired
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
        refreshCurrentUser();
      } else {
        // Fallback open local profile
        setSelectedDetailProfile(profile);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      console.warn('API detail fetch error, opening preview directly:', err);
      setSelectedDetailProfile(profile);
      setIsDetailsOpen(true);
    }
  };

  // Payment Upgrade Success Handler
  const handlePaymentSuccess = (verifyData) => {
    showToast(
      isTamil
        ? 'அல்ஹம்துலில்லாஹ்! பிரீமியம் சந்தா வெற்றிகரமாக செயல்படுத்தப்பட்டது. வரம்பற்ற வரன்களை பார்க்கலாம்! 👑'
        : 'Payment Successful! Annual Premium Activated. You now have unlimited profile access! 👑',
      'success'
    );
    refreshCurrentUser();
  };

  // Matrimonial Search & Filter Logic (Client-side fallback & fast filtering)
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // Filter out unverified profiles strictly
      if (p.isVerified === false && currentUser?.role !== 'admin') {
        return false;
      }
      
      // Filter out the user's own profile
      if (currentUser && (p.id === currentUser.id || p.nikahId === currentUser.nikahId || p._id === currentUser._id)) {
        return false;
      }

      // 1. Search ID filter
      if (searchId.trim()) {
        const query = searchId.trim().toLowerCase();
        const pid = (p.nikahId || p.id || '').toLowerCase();
        if (!pid.includes(query)) {
          return false;
        }
      }

      // 2. Gender Filter (Strictly locked to opposite gender for logged-in accounts)
      if (currentUser && currentUser.gender) {
        const targetGender = currentUser.gender === 'groom' ? 'bride' : (currentUser.gender === 'bride' ? 'groom' : null);
        if (targetGender && p.gender !== targetGender) {
          return false;
        }
      } else if (selectedGender !== 'all') {
        if (p.gender !== selectedGender) {
          return false;
        }
      }

      // 3. Native Location Filter (typable)
      if (filters.nativePlace && filters.nativePlace.trim()) {
        const queryTerm = filters.nativePlace.trim().toLowerCase();
        const pLoc = `${p.location || ''} ${p.nativePlace || ''} ${p.district || ''}`.toLowerCase();
        if (!pLoc.includes(queryTerm)) {
          return false;
        }
      }

      // 4. Workplace Filter (typable)
      if (filters.workplace && filters.workplace.trim()) {
        const queryTerm = filters.workplace.trim().toLowerCase();
        const pWork = (p.workplace || '').toLowerCase();
        if (!pWork.includes(queryTerm)) {
          return false;
        }
      }

      // 5. Employment / Occupation Filter
      if (filters.employmentStatus && filters.employmentStatus !== 'all') {
        const empQuery = filters.employmentStatus.toLowerCase();
        const pOcc = (p.occupation || p.profession || '').toLowerCase();
        if (empQuery === 'homemaker' && !pOcc.includes('இல்லத்தரசி') && !pOcc.includes('homemaker')) return false;
        if (empQuery === 'it_software' && !pOcc.includes('software') && !pOcc.includes('it') && !pOcc.includes('மென்பொருள்') && !pOcc.includes('developer')) return false;
        if (empQuery === 'govt_bank' && !pOcc.includes('govt') && !pOcc.includes('bank') && !pOcc.includes('அரசு')) return false;
        if (empQuery === 'business' && !pOcc.includes('business') && !pOcc.includes('வணிகம்') && !pOcc.includes('தொழில்')) return false;
        if (empQuery === 'medical' && !pOcc.includes('doctor') && !pOcc.includes('nurse') && !pOcc.includes('medical') && !pOcc.includes('மருத்துவம்')) return false;
        if (empQuery === 'teacher' && !pOcc.includes('teacher') && !pOcc.includes('professor') && !pOcc.includes('ஆசிரியர்')) return false;
      }

      // 6. Age Range
      if (filters.ageFrom && p.age < Number(filters.ageFrom)) return false;
      if (filters.ageTo && p.age > Number(filters.ageTo)) return false;

      // 7. Marital Status
      if (filters.maritalStatus && filters.maritalStatus !== 'அனைத்தும்') {
        if (p.maritalStatus !== filters.maritalStatus) return false;
      }

      // 8. Language Filter
      if (filters.language && filters.language !== 'அனைத்தும்') {
        if (p.language && p.language !== filters.language) return false;
      }

      return true;
    });
  }, [profiles, selectedGender, searchId, filters, currentUser]);

  const displayedProfiles = filteredProfiles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProfiles.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5efe1] text-gray-800 font-sans selection:bg-[#caa85d] selection:text-[#163828]">
      {/* 1. Islamic & Gold Header */}
      <Header
        onOpenContact={() => setIsContactOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={handleOpenStandardRegistration}
        onOpenUpgrade={() => setIsPaymentOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onLogout={handleLogout}
      />

      {/* 2. Top Gender Radio Bar (completely removed once logged in) */}
      {!currentUser && (
        <GenderRadioBar
          selectedGender={selectedGender}
          onChangeGender={handleGenderChange}
          onGenderChange={handleGenderChange}
          currentUser={currentUser}
        />
      )}

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 py-4 space-y-4">
        {/* Mobile Sidebar Trigger Menu & Quick Controls */}
        <div className="lg:hidden space-y-3">
          {!currentUser && (
            <LoginBox
              onLoginSuccess={handleLoginSuccess}
              onOpenVideo={() => setIsVideoOpen(true)}
              onOpenRegister={handleOpenStandardRegistration}
              onForgotPassword={() =>
                showToast(isTamil ? 'கடவுச்சொல் மீட்பு சேவைக்கு உதவி மையத்தை அணுகவும்.' : 'Please contact support desk for password reset.', 'info')
              }
            />
          )}

          <MenuDropdown
            onGoHome={() => {
              handleResetFilters();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenRegister={handleOpenRegistration}
            onOpenLogin={() => setIsLoginOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
          />

          <FilterBox
            filters={filters}
            searchId={searchId}
            onSearchId={(id) => {
              setSearchId(id);
              setVisibleCount(6);
            }}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onApplyFilters={() => {
              showToast(isTamil ? `வடிகட்டப்பட்டது: ${filteredProfiles.length} வரன்கள் உள்ளன` : `Filtered: ${filteredProfiles.length} profiles available`, 'info');
            }}
          />

          <WarningBoxes />
          <AppDownloadBox
            onDownloadClick={() => showToast(isTamil ? 'Google Play செயலியை பதிவிறக்கம் செய்ய கிளிக் செய்யப்பட்டது.' : 'Google Play app download clicked.', 'info')}
          />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Registration Banner, KYC Verification Notice & Profiles */}
          <div className="lg:col-span-8 space-y-4">
            {/* Desktop Registration Banner: Hidden after user logs in */}
            {!currentUser && (
              <div className="hidden lg:block">
                <RegistrationBanner
                  onOpenRegister={handleOpenRegistration}
                />
              </div>
            )}

            {/* ⚠️ Identity Verification Pending Notice Banner for Logged-in User */}
            {currentUser && currentUser.verificationStatus === 'pending' && (
              <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-xl shadow-md text-amber-900 flex items-start gap-3 animate-fadeIn">
                <FaExclamationTriangle className="text-amber-600 text-2xl flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 text-xs sm:text-sm">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm sm:text-base text-amber-900">
                      {isTamil ? 'கணக்கு சரிபார்ப்பு நிலுவையில் உள்ளது' : 'Account Verification Pending Approval'}
                    </h4>
                    <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-extrabold text-[10px] rounded-full uppercase">
                      Under Review
                    </span>
                  </div>
                  <p className="mt-1 text-gray-700 leading-relaxed">
                    {isTamil
                      ? `அஸ்ஸலாமு அலைக்கும் ${translateName(currentUser.fullName)}, உங்கள் கணக்கு தற்போது நிர்வாகியின் சரிபார்ப்பில் உள்ளது. நிர்வாகியால் சரிபார்க்கப்பட்ட பின்னரே உங்கள் வரன் பொது மாவட்ட தேடலில் தோன்றும்.`
                      : `Assalamu Alaikum ${translateName(currentUser.fullName)}, your account is currently undergoing administrative verification and will appear in public district searches once verified.`}
                  </p>
                  <div className="mt-2 text-[11px] text-amber-800 font-semibold flex flex-wrap items-center gap-2">
                    <span>⏱️ சரிபார்ப்பு நேரம்: 2 - 4 மணி நேரத்திற்குள்</span>
                    <span>•</span>
                    <button
                      onClick={() => setIsSupportOpen(true)}
                      className="underline font-bold hover:text-amber-950"
                    >
                      உதவி மையத்தை தொடர்பு கொள்ள
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Results Count & Shortlist Quick Status */}
            <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-700 font-semibold border-b border-[#dfd2ba]">
              <span>
                {t('totalProfiles')}{' '}
                <strong className="text-[#163828] text-sm">{filteredProfiles.length}</strong>
                {searchId && <span className="ml-1 text-amber-800">(ID: {searchId})</span>}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-[#8a6d2f] font-bold">
                <FaHeart className="text-red-500" />
                <span>{t('shortlistedProfiles')} {shortlistedIds.length}</span>
              </div>
            </div>

            {/* Profile Cards Listing (Strictly Verified Profiles) */}
            <div className="space-y-4 pt-1">
              {displayedProfiles.length > 0 ? (
                displayedProfiles.map((profile) => (
                  <ProfileCard
                    key={profile.id || profile.nikahId || profile._id}
                    profile={profile}
                    isShortlisted={shortlistedIds.includes(profile.id || profile.nikahId)}
                    onToggleShortlist={handleToggleShortlist}
                    onOpenLogin={() => setIsLoginOpen(true)}
                    onViewDetails={handleViewDetails}
                    currentUser={currentUser}
                  />
                ))
              ) : (
                <div className="bg-[#fcf8f0] border-2 border-dashed border-[#caa85d] p-8 rounded-xl text-center">
                  <p className="text-base font-bold text-[#44351b] mb-2">
                    {t('noProfilesFound')}
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    {t('adjustFilters')}
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="btn-gold px-6 py-2 rounded-lg text-xs font-bold"
                  >
                    {t('showAllBtn')}
                  </button>
                </div>
              )}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-3 pb-2">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-6 py-2 rounded-lg btn-gold text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2 mx-auto"
                >
                  <span>{t('viewMore')}</span>
                  <FaChevronDown className="text-xs" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-4">
            {!currentUser && (
              <LoginBox
                onLoginSuccess={handleLoginSuccess}
                onOpenVideo={() => setIsVideoOpen(true)}
                onOpenRegister={handleOpenStandardRegistration}
                onForgotPassword={() =>
                  showToast(isTamil ? 'கடவுச்சொல் மீட்பு சேவைக்கு உதவி மையத்தை அணுகவும்.' : 'Please contact support desk for password reset.', 'info')
                }
              />
            )}

            <MenuDropdown
              onGoHome={() => {
                handleResetFilters();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenRegister={handleOpenRegistration}
              onOpenLogin={() => setIsLoginOpen(true)}
              onOpenAbout={() => setIsAboutOpen(true)}
              onOpenContact={() => setIsContactOpen(true)}
            />

            <FilterBox
              filters={filters}
              searchId={searchId}
              onSearchId={(id) => {
                setSearchId(id);
                setVisibleCount(6);
              }}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onApplyFilters={() => {
                showToast(isTamil ? `வடிகட்டப்பட்டது: ${filteredProfiles.length} வரன்கள் உள்ளன` : `Filtered: ${filteredProfiles.length} profiles available`, 'info');
              }}
            />

            <WarningBoxes />
            <AppDownloadBox
              onDownloadClick={() => showToast(isTamil ? 'Google Play செயலியை பதிவிறக்கம் செய்ய கிளிக் செய்யப்பட்டது.' : 'Google Play app download clicked.', 'info')}
            />


          </aside>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenRegister={handleOpenRegistration}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* MODALS */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => {
          setIsLoginOpen(false);
          setLoginPrefillUsername('');
        }}
        onLoginSuccess={handleLoginSuccess}
        onOpenRegister={handleOpenRegistration}
        onOpenVideo={() => setIsVideoOpen(true)}
        initialUsername={loginPrefillUsername}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
        }}
        onRegisterSuccess={handleRegisterSuccess}
        onOpenLogin={(identifier) => {
          setIsRegisterOpen(false);
          setLoginPrefillUsername(identifier || '');
          setIsLoginOpen(true);
        }}
      />

      <RegistrationSuccessModal
        isOpen={!!regSuccessUser}
        user={regSuccessUser}
        onClose={() => setRegSuccessUser(null)}
        onOpenLogin={(identifier) => {
          setRegSuccessUser(null);
          setLoginPrefillUsername(identifier || '');
          setIsLoginOpen(true);
        }}
      />

      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* Razorpay Subscription Upgrade Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        user={currentUser}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Customer Support Desk Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        user={currentUser}
      />

      {/* Detailed Profile View Modal (Enforces 5 view limits) */}
      <ProfileDetailsModal
        profile={selectedDetailProfile}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onOpenLogin={() => setIsLoginOpen(true)}
        currentUser={currentUser}
        viewStats={detailViewStats}
        onOpenUpgrade={() => {
          setIsDetailsOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
