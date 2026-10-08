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
import OverseasSectionBanner from './components/OverseasSectionBanner';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import FeaturedMarqueeBar from './components/FeaturedMarqueeBar';
import FeatureProfileModal from './components/FeatureProfileModal';
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
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

  // Foreign / Overseas View State
  const [isForeignView, setIsForeignView] = useState(false);
  const [foreignCitizenshipFilter, setForeignCitizenshipFilter] = useState('all');
  const [isRegisterOverseasMode, setIsRegisterOverseasMode] = useState(false);

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

  const [currentPage, setCurrentPage] = useState(1);
  const [subscriptionSettings, setSubscriptionSettings] = useState(null);
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
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isFeatureProfileOpen, setIsFeatureProfileOpen] = useState(false);
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
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('nikah_token');
        localStorage.removeItem('nikah_user');
        setCurrentUser(null);
        return;
      }
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
        if (sRes.status === 401 || sRes.status === 403) return;
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
      if (isForeignView) {
        params.append('isOverseas', 'true');
        if (foreignCitizenshipFilter && foreignCitizenshipFilter !== 'all') {
          params.append('citizenship', foreignCitizenshipFilter);
        }
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
          isOverseas: Boolean(u.isOverseas),
          citizenship: u.citizenship || '',
          countryOfResidence: u.countryOfResidence || '',
          workingYearsInTitleLocation: u.workingYearsInTitleLocation || '',
          familyDetails: u.familyDetails || {},
          workPreferences: u.workPreferences || {},
          workPreference: u.workPreference || u.workPreferences?.brideWorkStatus || u.workPreferences?.groomWorkPreference || '',
        }));
        setProfiles(mapped);
      }
    } catch (err) {
      console.warn('[App] Backend profiles fetch failed:', err.message);
    }
  }, [filters, searchId, currentUser, isForeignView, foreignCitizenshipFilter]);

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

  // Fetch subscription settings (price, free limits, feature toggles)
  useEffect(() => {
    fetch('/api/profiles/subscription-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSubscriptionSettings(data.settings);
        }
      })
      .catch((err) => console.warn('Could not load subscription settings:', err));
  }, []);

  // Synchronize Gender Radio Bar with FilterBox gender (prevented when logged in)
  const handleGenderChange = (val) => {
    if (currentUser && currentUser.gender) {
      return; // Logged in user cannot switch between groom and bride
    }
    setSelectedGender(val);
    setFilters((prev) => ({ ...prev, gender: val }));
    setCurrentPage(1);
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
    setCurrentPage(1);
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
    setCurrentPage(1);
    showToast(isTamil ? 'வடிகட்டிகள் மீட்டமைக்கப்பட்டன' : 'Filters have been reset', 'info');
  };

  const handleToggleShortlist = (idOrProfile) => {
    if (!idOrProfile) return;
    const id = typeof idOrProfile === 'object' && idOrProfile !== null
      ? (idOrProfile.nikahId || idOrProfile.id || idOrProfile._id)
      : idOrProfile;
    if (!id) return;

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
    const FREE_CHOSEN_LIMIT = Number(subscriptionSettings?.freeTierLimits?.maxShortlistProfiles ?? 3);

    setShortlistedIds((prev) => {
      const exists = prev.includes(id);

      if (!exists) {
        // Enforce chosen profiles limit on Free Tier
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

  const handleOpenRegistration = (isOverseas = false) => {
    setIsRegisterOverseasMode(Boolean(isOverseas));
    setIsRegisterOpen(true);
  };
  const handleOpenStandardRegistration = () => handleOpenRegistration(false);
  const handleOpenOverseasRegistration = () => handleOpenRegistration(true);

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

      // 0. Foreign Only View Filter
      if (isForeignView) {
        const isForeignCandidate =
          p.isOverseas === true ||
          (p.citizenship && p.citizenship !== 'Indian Citizen') ||
          (p.countryOfResidence && p.countryOfResidence !== 'India');
        if (!isForeignCandidate) {
          return false;
        }

        if (foreignCitizenshipFilter && foreignCitizenshipFilter !== 'all') {
          const target = foreignCitizenshipFilter.toLowerCase();
          const matchCitizen =
            (p.citizenship && p.citizenship.toLowerCase().includes(target)) ||
            (p.countryOfResidence && p.countryOfResidence.toLowerCase().includes(target)) ||
            (p.location && p.location.toLowerCase().includes(target));
          if (!matchCitizen) {
            return false;
          }
        }
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
  }, [profiles, selectedGender, searchId, filters, currentUser, isForeignView, foreignCitizenshipFilter]);

  const PROFILES_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * PROFILES_PER_PAGE;
  const displayedProfiles = filteredProfiles.slice(startIndex, startIndex + PROFILES_PER_PAGE);

  const goToPage = (pageNumber) => {
    const target = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(target);
    const resultsElem = document.getElementById('profiles-list-section');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5efe1] text-gray-800 font-sans selection:bg-[#caa85d] selection:text-[#163828]">
      {/* 1. Islamic & Gold Header */}
      <Header
        onOpenContact={() => setIsContactOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenRegister={handleOpenStandardRegistration}
        onOpenOverseasRegister={handleOpenOverseasRegistration}
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
          isForeignView={isForeignView}
          onToggleForeignView={(val) => {
            setIsForeignView(val);
            setForeignCitizenshipFilter('all');
            setCurrentPage(1);
          }}
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
              onForgotPassword={() => setIsForgotPasswordOpen(true)}
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
            {/* Overseas Section Banner or Prompt Switcher */}
            {isForeignView ? (
              <OverseasSectionBanner
                activeCountry={foreignCitizenshipFilter}
                onSelectCountry={(countryCode) => {
                  setForeignCitizenshipFilter(countryCode);
                  setVisibleCount(6);
                }}
                onOpenOverseasRegister={handleOpenOverseasRegistration}
                onCloseOverseasView={() => {
                  setIsForeignView(false);
                  setForeignCitizenshipFilter('all');
                  setVisibleCount(6);
                }}
              />
            ) : (
              <div className="bg-gradient-to-r from-[#173d2b] via-[#24583f] to-[#173d2b] border-2 border-[#caa85d] rounded-2xl p-3.5 sm:p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center text-lg flex-shrink-0 shadow-md">
                    🌍
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-gray-950 font-black text-[10px] uppercase tracking-wider">
                        {isTamil ? 'பிரத்யேக பகுதி' : 'Exclusive'}
                      </span>
                      <span className="text-[11px] text-amber-200 font-semibold">
                        {isTamil
                          ? 'சிங்கப்பூர் • மலேசியா • துபாய் • UK • USA'
                          : 'Singapore • Malaysia • UAE • Saudi • UK • USA'}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-amber-100 tracking-wide mt-0.5">
                      {isTamil
                        ? 'வெளிநாட்டு / அயல்நாட்டு வரன்களை மட்டும் பார்க்க வேண்டுமா?'
                        : 'Looking for Foreign Citizens / Overseas Profiles Only?'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForeignView(true);
                      setForeignCitizenshipFilter('all');
                      setVisibleCount(6);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 border border-amber-200 shadow-md transition-all hover:scale-105 flex items-center justify-center gap-1.5"
                  >
                    <span>🌍 {isTamil ? 'வெளிநாட்டு வரன்கள் மட்டும் பார்க்க' : 'View Foreign Only'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 🌟 Running Horizontal Profile Bar (Featured Brides & Grooms) */}
            <FeaturedMarqueeBar
              onViewDetails={handleViewDetails}
              onOpenPromoteModal={() => setIsFeatureProfileOpen(true)}
              currentUser={currentUser}
              onToggleShortlist={handleToggleShortlist}
              shortlistedIds={shortlistedIds}
            />

            {/* Registration Banner: Hidden after user logs in */}
            {!currentUser && !isForeignView && (
              <div className="w-full">
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
            <div id="profiles-list-section" className="flex items-center justify-between px-2 py-1 text-xs text-gray-700 font-semibold border-b border-[#dfd2ba]">
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

            {/* Pagination Controls (Max 6 Profiles per page) */}
            {totalPages > 1 && (
              <div className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#dfd2ba]/70">
                <div className="text-xs font-bold text-gray-700">
                  {isTamil
                    ? `பக்கம் ${safeCurrentPage} / ${totalPages} (மொத்தம் ${filteredProfiles.length} வரன்கள்)`
                    : `Page ${safeCurrentPage} of ${totalPages} (${filteredProfiles.length} profiles)`}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      safeCurrentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                        : 'bg-[#faf7ef] hover:bg-[#eedfb9] text-[#163828] border border-[#caa85d] shadow-sm cursor-pointer'
                    }`}
                    title={isTamil ? 'முந்தைய பக்கம்' : 'Previous Page'}
                  >
                    <FaChevronLeft className="text-[10px]" />
                    <span>{isTamil ? 'முந்தைய' : 'Prev'}</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Show compact window of pages if totalPages is large
                    if (
                      totalPages > 7 &&
                      pageNum !== 1 &&
                      pageNum !== totalPages &&
                      Math.abs(pageNum - safeCurrentPage) > 1
                    ) {
                      if (pageNum === 2 && safeCurrentPage > 3) {
                        return (
                          <span key="ellipsis-start" className="px-1 text-gray-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      if (pageNum === totalPages - 1 && safeCurrentPage < totalPages - 2) {
                        return (
                          <span key="ellipsis-end" className="px-1 text-gray-400 text-xs">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    const isActive = pageNum === safeCurrentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => goToPage(pageNum)}
                        className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-extrabold transition shadow-xs cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-[#caa85d] via-[#edd48e] to-[#caa85d] text-[#163828] border-2 border-[#8a6d2f] shadow'
                            : 'bg-[#faf7ef] hover:bg-[#eedfb9] text-gray-800 border border-[#c5b597]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      safeCurrentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                        : 'bg-[#faf7ef] hover:bg-[#eedfb9] text-[#163828] border border-[#caa85d] shadow-sm cursor-pointer'
                    }`}
                    title={isTamil ? 'அடுத்த பக்கம்' : 'Next Page'}
                  >
                    <span>{isTamil ? 'அடுத்த' : 'Next'}</span>
                    <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
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
                onForgotPassword={() => setIsForgotPasswordOpen(true)}
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
        onForgotPassword={() => {
          setIsLoginOpen(false);
          setIsForgotPasswordOpen(true);
        }}
        initialUsername={loginPrefillUsername}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        initialIsOverseas={isRegisterOverseasMode}
        onClose={() => {
          setIsRegisterOpen(false);
          setIsRegisterOverseasMode(false);
        }}
        onRegisterSuccess={(newUser) => {
          setIsRegisterOverseasMode(false);
          handleRegisterSuccess(newUser);
        }}
        onOpenLogin={(identifier) => {
          setIsRegisterOpen(false);
          setIsRegisterOverseasMode(false);
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

      {/* Cashfree Subscription Upgrade Modal */}
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
        onToggleShortlist={handleToggleShortlist}
        isShortlisted={Boolean(
          selectedDetailProfile &&
            (shortlistedIds.includes(selectedDetailProfile.nikahId) ||
              shortlistedIds.includes(selectedDetailProfile.id) ||
              shortlistedIds.includes(selectedDetailProfile._id))
        )}
        onOpenUpgrade={() => {
          setIsDetailsOpen(false);
          setIsPaymentOpen(true);
        }}
      />

      {/* Floating Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Email OTP Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onOpenLogin={(identifier) => {
          setIsForgotPasswordOpen(false);
          if (identifier) setLoginPrefillUsername(identifier);
          setIsLoginOpen(true);
        }}
      />

      {/* Feature Profile in Running Marquee Bar Modal */}
      <FeatureProfileModal
        isOpen={isFeatureProfileOpen}
        onClose={() => setIsFeatureProfileOpen(false)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        marqueeSettings={subscriptionSettings?.featuredMarquee}
        onSuccess={() => {
          refreshCurrentUser();
          fetchProfiles();
          showToast(
            isTamil
              ? 'வாழ்த்துகள்! உங்கள் வரன் ஓடும் பட்டியில் வெற்றிகரமாக சேர்க்கப்பட்டது! 🌟'
              : 'Congratulations! Your profile is now featured in the Running Marquee Bar! 🌟',
            'success'
          );
        }}
      />
    </div>
  );
}
