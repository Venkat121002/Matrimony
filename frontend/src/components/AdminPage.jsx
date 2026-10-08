import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaShieldAlt,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTrashAlt,
  FaEye,
  FaEyeSlash,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaUser,
  FaRedo,
  FaTimes,
  FaExclamationTriangle,
  FaCheck,
  FaCamera,
  FaMicrophone,
  FaUserTie,
  FaGraduationCap,
  FaBriefcase,
  FaHome,
  FaLock,
  FaEnvelope,
  FaSignOutAlt,
  FaSignInAlt,
  FaGlobe,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaSlidersH,
  FaCrown,
  FaStar,
  FaCheckSquare,
  FaSave,
  FaToggleOn,
  FaToggleOff,
  FaUndo,
  FaHeadset,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import DefaultAvatar from './DefaultAvatar';

export default function AdminPage({ portalType = 'superadmin' }) {
  const { language, setLanguage, t, isTamil, translateName, translateValue, translateWorkPreference } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'en', label: 'English' },
  ];
  const currentLangLabel = language === 'en' ? 'English' : 'தமிழ் (Tamil)';

  const isSuperAdmin = portalType === 'superadmin';
  const storageKey = isSuperAdmin ? 'superadmin_auth_key' : 'admin_auth_key';
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const portalViewLabel = isSuperAdmin
    ? t('superAdminViewOnlyBadge')
    : t('adminManageBadge');
  const portalTitle = isSuperAdmin
    ? t('superAdminPortalTitle')
    : t('adminPortalTitle');
  const portalSubTitle = isSuperAdmin
    ? t('superAdminPortalSubTitle')
    : t('adminPortalSubTitle');
  const loginPrompt = isSuperAdmin
    ? t('superAdminPromptText')
    : t('adminPromptText');
  const loginBtnLabel = isSuperAdmin
    ? t('superAdminLoginBtn')
    : t('adminLoginBtn');
  const placeholderUser = isSuperAdmin ? 'superadmin' : 'admin';
  const logoutTitle = isSuperAdmin ? 'Logout from Super Admin' : 'Logout from Admin';
  const logoutToast = isSuperAdmin ? 'Logged out of Super Admin.' : 'Logged out of Admin.';
  const successToast = isSuperAdmin ? 'Super Admin access granted! Welcome.' : 'Admin access granted! Welcome.';
  const invalidMsg = isSuperAdmin ? 'Invalid Super Admin credentials.' : 'Invalid Admin credentials.';

  const renderLanguageSelector = (extraClass = '') => (
    <div className="relative">
      <button
        onClick={() => setShowLangMenu((prev) => !prev)}
        className={`bg-white/95 hover:bg-white text-[#333] border border-[#a88235] rounded px-2.5 py-1 flex items-center gap-1.5 text-xs font-bold shadow-sm transition ${extraClass}`}
        title={t('selectLanguage')}
        type="button"
      >
        <FaGlobe className="text-[#1a73e8] text-xs flex-shrink-0" />
        <span>{currentLangLabel}</span>
        <FaChevronDown className="text-[10px] text-gray-500" />
      </button>

      {showLangMenu && (
        <div className="absolute top-full mt-1.5 right-0 z-50 bg-white border border-[#a88235] rounded-md shadow-xl py-1 w-44 text-left">
          <div className="px-2.5 py-1 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
            {t('selectLanguage')}
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setShowLangMenu(false);
              }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#fff7e6] transition flex items-center justify-between ${
                language === lang.code ? 'font-bold text-[#8a6d2f] bg-[#fbf5e6]' : 'text-gray-800'
              }`}
            >
              <span>{lang.label}</span>
              {language === lang.code && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem(storageKey));
  });
  const [adminKey, setAdminKey] = useState(() => {
    return sessionStorage.getItem(storageKey) || '';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Re-sync auth state when portalType changes
  useEffect(() => {
    const key = sessionStorage.getItem(storageKey) || '';
    setAdminKey(key);
    setIsAuthenticated(Boolean(key));
    setLoginError('');
  }, [storageKey]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'verified'
  const [filters, setFilters] = useState({
    gender: 'all',
    ageFrom: '',
    ageTo: '',
    location: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Pagination State (Strictly 6 Profiles Maximum per page)
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 6;

  // Subscription & Feature Customization State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [subSettings, setSubSettings] = useState({
    subscriptionPrice: 999,
    monthlySubscriptionPrice: 199,
    freeTierLimits: {
      maxProfileViews: 5,
      maxShortlistProfiles: 3,
    },
    features: {
      directPhoneAccess: true,
      audioIntroAccess: true,
      detailedBioAccess: true,
      shortlistAccess: true,
      photoFullView: true,
      newMatchAlerts: true,
    },
    featuredMarquee: {
      enabled: true,
      price: 299,
      durationDays: 15,
      visibleFields: {
        photo: true,
        nikahId: true,
        name: true,
        age: true,
        location: true,
        education: true,
        occupation: true,
        monthlyIncome: false,
        height: false,
        maritalStatus: false,
      },
    },
  });

  const getHeaders = useCallback(
    (customKey) => ({
      'Content-Type': 'application/json',
      'X-Admin-Key': customKey || adminKey || '',
    }),
    [adminKey]
  );

  const fetchSubscriptionSettings = useCallback(async () => {
    try {
      setSettingsLoading(true);
      const res = await fetch('/api/admin/subscription-settings', {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSubSettings(data.settings);
      }
    } catch (err) {
      console.error('Failed to fetch subscription settings:', err);
    } finally {
      setSettingsLoading(false);
    }
  }, [getHeaders]);

  const handleSaveSubscriptionSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      setSettingsSaving(true);
      const res = await fetch('/api/admin/subscription-settings', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(subSettings),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setSubSettings(data.settings);
        showToast(
          isTamil
            ? 'சந்தா & அம்சங்கள் கட்டமைப்பு வெற்றிகரமாக சேமிக்கப்பட்டது! ✨'
            : 'Subscription & features customization saved successfully! ✨',
          'success'
        );
        setIsSettingsOpen(false);
      } else {
        showToast(data.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving settings', 'error');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleResetSettingsToDefault = () => {
    setSubSettings({
      subscriptionPrice: 999,
      monthlySubscriptionPrice: 199,
      freeTierLimits: {
        maxProfileViews: 5,
        maxShortlistProfiles: 3,
      },
      features: {
        directPhoneAccess: true,
        audioIntroAccess: true,
        detailedBioAccess: true,
        shortlistAccess: true,
        photoFullView: true,
        newMatchAlerts: true,
      },
      featuredMarquee: {
        enabled: true,
        price: 299,
        durationDays: 15,
        visibleFields: {
          photo: true,
          nikahId: true,
          name: true,
          age: true,
          location: true,
          education: true,
          occupation: true,
          monthlyIncome: false,
          height: false,
          maritalStatus: false,
        },
      },
    });
  };

  // Support Tickets State & Handlers (Admin Only - completely hidden on SuperAdmin side)
  const [tickets, setTickets] = useState([]);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [ticketActionLoadingId, setTicketActionLoadingId] = useState(null);

  const fetchTickets = useCallback(async () => {
    if (isSuperAdmin) return;
    try {
      setTicketsLoading(true);
      const res = await fetch('/api/admin/tickets', {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  }, [getHeaders, isSuperAdmin]);

  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin) {
      fetchTickets();
    }
  }, [isAuthenticated, isSuperAdmin, fetchTickets]);

  const openTicketsCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'open' || !t.status).length;
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (ticketFilter !== 'all' && t.status !== ticketFilter) return false;
      if (ticketSearchQuery.trim()) {
        const q = ticketSearchQuery.toLowerCase().trim();
        const name = (t.name || '').toLowerCase();
        const phone = (t.phone || '').toLowerCase();
        const email = (t.email || '').toLowerCase();
        const subject = (t.subject || '').toLowerCase();
        const message = (t.message || '').toLowerCase();
        return (
          name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          subject.includes(q) ||
          message.includes(q)
        );
      }
      return true;
    });
  }, [tickets, ticketFilter, ticketSearchQuery]);

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      setTicketActionLoadingId(ticketId);
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) =>
          prev.map((t) => (t._id === ticketId || t.id === ticketId ? { ...t, status: newStatus } : t))
        );
        showToast(
          isTamil
            ? `கோரிக்கை நிலை மாற்றப்பட்டது: ${
                newStatus === 'resolved'
                  ? 'தீர்க்கப்பட்டது'
                  : newStatus === 'in_progress'
                  ? 'பரிசீலனையில்'
                  : 'திறந்துள்ளது'
              }`
            : `Ticket status updated to ${newStatus}`,
          'success'
        );
      } else {
        showToast(data.message || 'Failed to update ticket', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error updating ticket status', 'error');
    } finally {
      setTicketActionLoadingId(null);
    }
  };

  // Delete Individual Support Ticket
  const handleDeleteTicket = async (ticketId) => {
    if (
      !window.confirm(
        isTamil
          ? 'இந்த கோரிக்கையை நிரந்தரமாக நீக்க விரும்புகிறீர்களா?'
          : 'Are you sure you want to remove this query?'
      )
    ) {
      return;
    }
    try {
      setTicketActionLoadingId(ticketId);
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t._id !== ticketId && t.id !== ticketId));
        showToast(
          isTamil ? 'கோரிக்கை வெற்றிகரமாக நீக்கப்பட்டது.' : 'Query removed successfully.',
          'success'
        );
      } else {
        showToast(data.message || 'Failed to delete ticket', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error deleting ticket', 'error');
    } finally {
      setTicketActionLoadingId(null);
    }
  };

  // Clear All Resolved Support Tickets
  const handleClearResolvedTickets = async () => {
    if (
      !window.confirm(
        isTamil
          ? 'தீர்க்கப்பட்ட அனைத்து கோரிக்கைகளையும் நீக்க விரும்புகிறீர்களா?'
          : 'Are you sure you want to remove all resolved queries?'
      )
    ) {
      return;
    }
    try {
      setTicketActionLoadingId('all-resolved');
      const res = await fetch('/api/admin/tickets/resolved/clear', {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.status !== 'resolved'));
        showToast(
          isTamil
            ? 'தீர்க்கப்பட்ட அனைத்து கோரிக்கைகளும் நீக்கப்பட்டன.'
            : 'All resolved queries removed successfully.',
          'success'
        );
      } else {
        showToast(data.message || 'Failed to clear resolved tickets', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error clearing resolved tickets', 'error');
    } finally {
      setTicketActionLoadingId(null);
    }
  };

  // Fetch all registered users
  const fetchUsers = useCallback(
    async (customKey) => {
      const activeKey = customKey || adminKey;
      if (!activeKey) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/users?limit=1000', {
          headers: getHeaders(activeKey),
        });
        const data = await res.json();
        if (res.status === 401 || res.status === 403) {
          sessionStorage.removeItem(storageKey);
          setIsAuthenticated(false);
          setAdminKey('');
          setError('Session expired. Please log in again.');
          return;
        }
        if (data.success && Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setError(data.message || 'Failed to fetch registered users.');
        }
      } catch (err) {
        console.error('[AdminPage fetchUsers error]:', err);
        setError('Could not connect to the backend server. Please verify backend is running.');
      } finally {
        setLoading(false);
      }
    },
    [adminKey, getHeaders, storageKey]
  );

  useEffect(() => {
    if (isAuthenticated && adminKey) {
      fetchUsers(adminKey);
    }
  }, [isAuthenticated, adminKey, fetchUsers]);

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Username and password are required.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
          portalType,
        }),
      });

      const data = await res.json();
      if (data.success && data.adminKey) {
        sessionStorage.setItem(storageKey, data.adminKey);
        setAdminKey(data.adminKey);
        setIsAuthenticated(true);
        setLoginUsername('');
        setLoginPassword('');
        showToast(successToast, 'success');
        fetchUsers(data.adminKey);
      } else {
        setLoginError(data.message || invalidMsg);
      }
    } catch (err) {
      console.error('[Admin Login Request Error]:', err);
      setLoginError('Network error during authentication. Please ensure server is running.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = () => {
    sessionStorage.removeItem(storageKey);
    setAdminKey('');
    setIsAuthenticated(false);
    setUsers([]);
    setSelectedUser(null);
    showToast(logoutToast, 'info');
  };

  // Handle Verify / Approve User
  const handleVerifyUser = async (user) => {
    setActionLoadingId(user._id);
    try {
      const res = await fetch(`/api/admin/verifications/${user._id}/approve`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User ${user.nikahId} (${user.fullName}) verified! Now visible on user side.`, 'success');
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id
              ? { ...u, isVerified: true, verificationStatus: 'verified' }
              : u
          )
        );
        if (selectedUser && selectedUser._id === user._id) {
          setSelectedUser((prev) => ({
            ...prev,
            isVerified: true,
            verificationStatus: 'verified',
          }));
        }
      } else {
        showToast(data.message || 'Failed to verify user.', 'error');
      }
    } catch (err) {
      console.error('[Verify error]:', err);
      showToast('Network error while verifying user.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Reject User
  const handleRejectUser = async (user) => {
    setActionLoadingId(user._id);
    try {
      const res = await fetch(`/api/admin/verifications/${user._id}/reject`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ reason: 'Rejected by admin' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User ${user.nikahId} marked as rejected and hidden from user side.`, 'info');
        setUsers((prev) =>
          prev.map((u) =>
            u._id === user._id
              ? { ...u, isVerified: false, verificationStatus: 'rejected' }
              : u
          )
        );
        if (selectedUser && selectedUser._id === user._id) {
          setSelectedUser((prev) => ({
            ...prev,
            isVerified: false,
            verificationStatus: 'rejected',
          }));
        }
      } else {
        showToast(data.message || 'Failed to reject user.', 'error');
      }
    } catch (err) {
      console.error('[Reject error]:', err);
      showToast('Network error while rejecting user.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Delete / Remove User
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const target = userToDelete;
    setUserToDelete(null);
    setActionLoadingId(target._id);

    try {
      const res = await fetch(`/api/admin/users/${target._id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`User ${target.nikahId} (${target.fullName}) has been permanently removed.`, 'success');
        setUsers((prev) => prev.filter((u) => u._id !== target._id));
        if (selectedUser && selectedUser._id === target._id) {
          setSelectedUser(null);
        }
      } else {
        showToast(data.message || 'Failed to delete user.', 'error');
      }
    } catch (err) {
      console.error('[Delete error]:', err);
      showToast('Network error while deleting user.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === 'pending' && u.verificationStatus !== 'pending') return false;
      if (activeTab === 'verified' && (!u.isVerified || u.verificationStatus !== 'verified')) return false;

      // Dropdown / Extra Filters
      if (filters.gender !== 'all' && u.gender !== filters.gender) return false;
      if (filters.ageFrom && u.age < Number(filters.ageFrom)) return false;
      if (filters.ageTo && u.age > Number(filters.ageTo)) return false;
      if (filters.location) {
        const pDist = (u.district || u.location || '').toLowerCase();
        if (!pDist.includes(filters.location.toLowerCase().trim())) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nikahId = (u.nikahId || '').toLowerCase();
        const name = (u.fullName || '').toLowerCase();
        const phone = (u.phone || '').toLowerCase();
        const district = (u.district || u.location || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        return (
          nikahId.includes(q) ||
          name.includes(q) ||
          phone.includes(q) ||
          district.includes(q) ||
          email.includes(q)
        );
      }

      return true;
    });
  }, [users, activeTab, searchQuery, filters]);

  const pendingCount = useMemo(() => {
    return users.filter((u) => u.verificationStatus === 'pending').length;
  }, [users]);

  const verifiedCount = useMemo(() => {
    return users.filter((u) => u.isVerified && u.verificationStatus === 'verified').length;
  }, [users]);

  // Reset pagination to page 1 on search, tab, or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * USERS_PER_PAGE;
  const displayedUsers = filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);

  const goToPage = (pageNumber) => {
    const target = Math.min(Math.max(1, pageNumber), totalPages);
    setCurrentPage(target);
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5efe1] p-4 text-gray-800 font-sans selection:bg-[#caa85d] selection:text-[#163828]">
        <div className="w-full max-w-md bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-5 px-6 text-center border-b-2 border-[#caa85d] text-white relative">
            {/* Language Selector in Login Header */}
            <div className="absolute top-3.5 right-3.5">
              {renderLanguageSelector('text-[11px] py-0.5 px-2')}
            </div>

            <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#caa85d] to-[#8a6d2f] p-1 flex items-center justify-center text-[#163828] shadow-md mx-auto mb-2.5">
              <FaShieldAlt className="text-2xl" />
            </div>
            <h2 className="font-cinzel text-lg sm:text-xl font-black text-[#edd48e] tracking-wide pr-14 pl-14 sm:px-0">
              {portalTitle}
            </h2>
            <p className="text-xs text-gray-300 mt-1">
              {t('adminAccessOnlyDesc')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
            <div className="bg-[#f0e7d5] p-3 rounded-lg border border-[#caa85d]/40 text-center">
              <p className="text-xs font-bold text-[#44351b]">
                {loginPrompt}
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2">
                <FaExclamationTriangle className="text-red-600 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#44351b] mb-1">
                {t('adminUsernameLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={placeholderUser}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
                  required
                  autoFocus
                />
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#44351b] mb-1">
                {t('adminPasswordLabel')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
                  required
                />
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-sm focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#163828] via-[#25583f] to-[#163828] hover:from-[#1b4330] hover:to-[#1b4330] text-[#edd48e] font-extrabold text-sm border border-[#caa85d] shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <FaRedo className="animate-spin text-xs" />
                  <span>{t('adminChecking')}</span>
                </>
              ) : (
                <>
                  <FaSignInAlt className="text-xs" />
                  <span>{loginBtnLabel}</span>
                </>
              )}
            </button>

          </form>
        </div>

        {toast && (
          <div
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 text-white border transition-all animate-bounce ${
              toast.type === 'error'
                ? 'bg-red-700 border-red-600'
                : toast.type === 'info'
                ? 'bg-[#163828] border-[#caa85d] text-[#edd48e]'
                : 'bg-emerald-800 border-emerald-600'
            }`}
          >
            {toast.type === 'error' ? <FaTimesCircle /> : <FaCheckCircle />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5efe1] text-gray-800 font-sans selection:bg-[#caa85d] selection:text-[#163828]">
      {/* ─── Top Islamic Green & Gold Header (Matching User Side) ─── */}
      <header className="bg-[#163828] border-b-2 border-[#caa85d] text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-[#caa85d] to-[#8a6d2f] p-1 flex items-center justify-center text-[#163828] shadow-md flex-shrink-0">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-base sm:text-xl font-black text-[#edd48e] tracking-wide">
                  {portalTitle}
                </h1>
              </div>
              <p className="text-xs text-gray-300">
                {portalSubTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Language Selector in Header */}
            {renderLanguageSelector()}

            <button
              type="button"
              onClick={() => fetchUsers()}
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-[#25583f] hover:bg-[#317051] text-[#fff7d6] border border-[#caa85d] text-xs font-bold flex items-center gap-1.5 transition shadow"
              title={t('adminRefreshBtn')}
            >
              <FaRedo className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>{t('adminRefreshBtn')}</span>
            </button>

            {/* Admin Exclusive Action Buttons: Help Desk Queries & Subscription Settings */}
            {!isSuperAdmin && (
              <>
                {/* Help Desk Queries (Only on Admin side, not superadmin) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsTicketsOpen(true);
                    fetchTickets();
                  }}
                  className="px-3 py-1.5 rounded-md bg-[#163828] hover:bg-[#205039] text-[#edd48e] font-black text-xs flex items-center gap-1.5 transition shadow border border-[#caa85d] cursor-pointer"
                  title={isTamil ? 'உதவி மையம் கோரிக்கைகள்' : 'Help Desk Queries'}
                >
                  <FaHeadset className="text-xs text-amber-300" />
                  <span>{isTamil ? 'உதவி மையம் கோரிக்கைகள்' : 'Help Desk Queries'}</span>
                  {openTicketsCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] rounded-full font-bold">
                      {openTicketsCount}
                    </span>
                  )}
                </button>

                {/* Customization Option for Subscription & Features (Admin Only, removed from superadmin) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(true);
                    fetchSubscriptionSettings();
                  }}
                  className="px-3 py-1.5 rounded-md bg-gradient-to-r from-[#caa85d] via-[#edd48e] to-[#caa85d] text-[#163828] font-black text-xs flex items-center gap-1.5 transition shadow border border-[#f3dd9b] hover:brightness-105 cursor-pointer"
                  title={isTamil ? 'சந்தா & அம்சங்கள் கட்டமைப்பு' : 'Subscription & Feature Customization'}
                >
                  <FaSlidersH className="text-xs" />
                  <span>{isTamil ? 'சந்தா கட்டமைப்பு' : 'Subscription Settings'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-md bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
              title={logoutTitle}
            >
              <FaSignOutAlt className="text-xs" />
              <span>{t('adminLogoutBtn')}</span>
            </button>
          </div>
        </div>

        {/* Bottom Gold Strip (Identical to User Header) */}
        <div className="w-full bg-gradient-to-r from-[#8a6d2f] via-[#edd48e] to-[#8a6d2f] py-1 px-4 border-t border-[#f4e2ab] text-[#2b1b04] font-medium text-xs shadow-inner">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs">
              <span className="inline-block w-2 h-2 rounded-full bg-[#163828] animate-pulse"></span>
              <span>{t('adminRegistryBanner')}</span>
            </div>
            <div className="text-[11px] font-extrabold text-[#163828]">
              {t('adminTotalCandidates')}: {users.length} | {t('adminPendingCount')}: {pendingCount}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full space-y-5">
        {/* Controls: Search & Tabs Card */}
        <div className="w-full bg-[#fdf9ee] border-2 border-[#caa85d] rounded-xl shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('adminSearchPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8a6d2f] text-gray-900 shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap items-center bg-white border border-[#c5b597] rounded-md shadow-inner overflow-hidden flex-1 md:flex-none">
            {/* Gender Filter */}
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="px-3 py-1.5 text-xs bg-transparent border-r border-[#c5b597] focus:outline-none focus:bg-[#f6efe1] text-gray-800"
            >
              <option value="all">{isTamil ? 'அனைத்து பாலினம்' : 'All Gender'}</option>
              <option value="groom">{isTamil ? 'மணமகன்' : 'Groom'}</option>
              <option value="bride">{isTamil ? 'மணமகள்' : 'Bride'}</option>
            </select>
            
            {/* Age Filter */}
            <div className="flex items-center gap-1 border-r border-[#c5b597] px-2 py-1.5 focus-within:bg-[#f6efe1] transition-colors">
              <span className="text-[10px] text-gray-500 font-bold px-1">{isTamil ? 'வயது:' : 'Age:'}</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.ageFrom}
                onChange={(e) => setFilters({ ...filters, ageFrom: e.target.value })}
                className="w-10 text-xs focus:outline-none text-center bg-transparent text-gray-800"
              />
              <span className="text-gray-300">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.ageTo}
                onChange={(e) => setFilters({ ...filters, ageTo: e.target.value })}
                className="w-10 text-xs focus:outline-none text-center bg-transparent text-gray-800"
              />
            </div>
            
            {/* Location Filter */}
            <input
              type="text"
              placeholder={isTamil ? 'ஊர்...' : 'Location...'}
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="w-36 px-3 py-1.5 text-xs bg-transparent focus:outline-none focus:bg-[#f6efe1] text-gray-800 transition-colors"
            />
          </div>
        </div>

        {/* Verification Info Notice */}
        <div className="bg-[#ede4d1] border border-[#caa85d] rounded-xl p-3 text-xs text-[#2e2009] flex items-center gap-2.5">
          {isSuperAdmin ? (
            <FaEye className="text-[#163828] text-base flex-shrink-0" />
          ) : (
            <FaCheckCircle className="text-[#163828] text-base flex-shrink-0" />
          )}
          <span>
            {isSuperAdmin ? t('superAdminViewNotice') : t('adminVerificationNotice')}
          </span>
        </div>

        {/* Status Navigation Bar above Candidates List */}
        <div className="w-full bg-[#163828] border-2 border-[#caa85d] rounded-xl shadow-md p-1.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#caa85d] via-[#edd48e] to-[#caa85d] text-[#163828] shadow-md border border-[#f3dd9b]'
                : 'text-[#e5d8b8] hover:text-white hover:bg-white/10'
            }`}
          >
            <FaUsers className="text-sm" />
            <span>{t('adminTabAll')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold ${
                activeTab === 'all' ? 'bg-[#163828] text-[#edd48e]' : 'bg-black/30 text-amber-200'
              }`}
            >
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-[#caa85d] via-[#edd48e] to-[#caa85d] text-[#163828] shadow-md border border-[#f3dd9b]'
                : 'text-[#e5d8b8] hover:text-white hover:bg-white/10'
            }`}
          >
            <FaClock className="text-sm" />
            <span>{t('adminTabPending')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold ${
                pendingCount > 0
                  ? 'bg-red-600 text-white animate-pulse shadow'
                  : activeTab === 'pending'
                  ? 'bg-[#163828] text-[#edd48e]'
                  : 'bg-black/30 text-amber-200'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verified')}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'verified'
                ? 'bg-gradient-to-r from-[#caa85d] via-[#edd48e] to-[#caa85d] text-[#163828] shadow-md border border-[#f3dd9b]'
                : 'text-[#e5d8b8] hover:text-white hover:bg-white/10'
            }`}
          >
            <FaCheckCircle className="text-sm" />
            <span>{t('adminTabVerified')}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold ${
                activeTab === 'verified' ? 'bg-[#163828] text-[#edd48e]' : 'bg-black/30 text-amber-200'
              }`}
            >
              {verifiedCount}
            </span>
          </button>
        </div>

        {/* Registered Users Table Card */}
        <div className="w-full bg-[#fdf9ee] border-2 border-[#caa85d] rounded-xl shadow-md overflow-hidden">
          {/* Box Header */}
          <div className="bg-gradient-to-r from-[#8a6d2f] via-[#edd48e] to-[#8a6d2f] py-2.5 px-4 flex items-center justify-between border-b border-[#caa85d]">
            <h3 className="font-extrabold text-sm sm:text-base text-[#2a1b04] tracking-wider font-cinzel">
              {t('adminTableTitle')} ({filteredUsers.length})
            </h3>
            <span className="text-[11px] font-bold text-[#3d2707]">
              {portalViewLabel}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-[#163828] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-[#44351b]">
                {isTamil ? 'பதிவு விவரங்கள் ஏற்றப்படுகின்றன...' : 'Loading candidate profiles...'}
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-2 px-4">
              <FaExclamationTriangle className="text-2xl text-red-600 mx-auto" />
              <p className="text-xs font-bold text-red-700">{error}</p>
              <button
                type="button"
                onClick={fetchUsers}
                className="btn-gold px-4 py-1 text-xs font-bold rounded"
              >
                {isTamil ? 'மீண்டும் முயற்சிக்கவும்' : 'Try Again'}
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center space-y-2 px-4">
              <FaUser className="text-2xl text-gray-400 mx-auto" />
              <p className="text-sm font-bold text-[#44351b]">
                {isTamil ? 'எந்த வரன்களும் காணப்படவில்லை' : 'No candidates found'}
              </p>
              <p className="text-xs text-gray-500">
                {searchQuery
                  ? (isTamil ? `"${searchQuery}" என்ற தேடலுக்கு முடிவுகள் இல்லை.` : `No profiles match "${searchQuery}".`)
                  : (isTamil ? 'இந்த பிரிவில் பயனர்கள் இல்லை.' : 'No candidate profiles in this category.')}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#ede4d1] border-b border-[#dfd2ba] text-[#35250c] text-xs font-bold uppercase">
                    <th className="py-2.5 px-3">{t('adminColNikahId')}</th>
                    <th className="py-2.5 px-3">{t('adminColName')}</th>
                    <th className="py-2.5 px-3">{t('adminColGenderAge')}</th>
                    <th className="py-2.5 px-3">{t('adminColPhone')}</th>
                    <th className="py-2.5 px-3">{t('adminColDistrict')}</th>
                    <th className="py-2.5 px-3">{t('adminColStatus')}</th>
                    <th className="py-2.5 px-3 text-right">
                      {isSuperAdmin ? t('adminColViewOnly') : t('adminColActions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dfd2ba]">
                  {displayedUsers.map((user) => {
                    const isPending = user.verificationStatus === 'pending';
                    const isVerified = user.isVerified && user.verificationStatus === 'verified';
                    const isGroom = user.gender === 'groom';

                    return (
                      <tr
                        key={user._id}
                        className="hover:bg-[#f6efe1] transition duration-150"
                      >
                        {/* Nikah ID */}
                        <td className="py-2.5 px-3 font-mono font-extrabold text-[#163828]">
                          <span className="px-2 py-0.5 rounded bg-[#ebd7af] border border-[#d6bb85] text-xs">
                            {user.nikahId}
                          </span>
                        </td>

                        {/* Name & Avatar */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5">
                            {user.photos && user.photos.length > 0 ? (
                              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#caa85d] shadow-xs flex-shrink-0 bg-gray-100">
                                <img
                                  src={user.photos[0]}
                                  alt={user.fullName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div style={{ display: 'none' }} className="w-full h-full">
                                  <DefaultAvatar gender={user.gender} size="sm" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#caa85d] flex-shrink-0 shadow-xs">
                                <DefaultAvatar gender={user.gender} size="sm" />
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-[#163828] block">
                                {translateName(user.fullName)}
                              </span>
                              {user.education && (
                                <span className="text-[11px] text-gray-600 block">
                                  {user.education}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Gender & Age */}
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-900 block">
                            {isGroom ? (isTamil ? 'மணமகன்' : 'Groom') : (isTamil ? 'மணமகள்' : 'Bride')}
                          </span>
                          <span className="text-[11px] text-gray-600">
                            {isTamil ? `${user.age} வயது` : `${user.age} yrs`}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-2.5 px-3 font-mono font-semibold text-gray-900">
                          {user.phone || '—'}
                        </td>

                        {/* Location */}
                        <td className="py-2.5 px-3 font-semibold text-gray-800">
                          {user.district || user.location || 'Tamil Nadu'}
                        </td>

                        {/* Verification Status */}
                        <td className="py-2.5 px-3">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                              <FaClock className="text-[10px]" />
                              <span>{t('adminStatusPending')}</span>
                            </span>
                          )}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                              <FaCheckCircle className="text-[10px]" />
                              <span>{t('adminStatusVerified')}</span>
                            </span>
                          )}
                          {!isPending && !isVerified && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300">
                              <FaTimesCircle className="text-[10px]" />
                              <span>{t('adminStatusRejected')}</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* View Details (Available on both Admin & Super Admin) */}
                            <button
                              type="button"
                              onClick={() => setSelectedUser(user)}
                              className="btn-gold px-2.5 py-1 rounded text-xs font-bold shadow-xs flex items-center gap-1"
                              title={isTamil ? "வரன் விவரங்களை பார்க்க" : "View candidate details"}
                            >
                              <FaEye className="text-xs" />
                              <span>{t('adminBtnDetails')}</span>
                            </button>

                            {/* Verify & Remove Buttons (ONLY on Admin, REMOVED from Super Admin) */}
                            {!isSuperAdmin && (
                              <>
                                {(!isVerified || isPending) && (
                                  <button
                                    type="button"
                                    disabled={actionLoadingId === user._id}
                                    onClick={() => handleVerifyUser(user)}
                                    className="px-2.5 py-1 rounded text-xs font-bold bg-[#163828] hover:bg-[#25583f] text-[#edd48e] border border-[#caa85d] flex items-center gap-1 shadow-xs transition"
                                    title={isTamil ? "சரிபார்த்து தளத்தில் வெளியிட" : "Verify and approve"}
                                  >
                                    <FaCheck className="text-[10px]" />
                                    <span>{t('adminBtnVerify')}</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={actionLoadingId === user._id}
                                  onClick={() => setUserToDelete(user)}
                                  className="px-2.5 py-1 rounded text-xs font-bold bg-red-800 hover:bg-red-700 text-white flex items-center gap-1 shadow-xs transition"
                                  title={isTamil ? "இந்த வரனை நீக்க" : "Delete user profile"}
                                >
                                  <FaTrashAlt className="text-[10px]" />
                                  <span>{t('adminBtnDelete')}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls - Strictly 6 profiles maximum per page */}
            {totalPages > 1 && (
              <div className="p-3 bg-[#ede4d1] border-t-2 border-[#dfd2ba] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="font-bold text-[#35250c]">
                  {isTamil
                    ? `பக்கம் ${safeCurrentPage} / ${totalPages} (மொத்தம் ${filteredUsers.length} வரன்கள்)`
                    : `Showing ${(safeCurrentPage - 1) * USERS_PER_PAGE + 1} - ${Math.min(safeCurrentPage * USERS_PER_PAGE, filteredUsers.length)} of ${filteredUsers.length} profiles`}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      safeCurrentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                        : 'bg-[#faf7ef] hover:bg-[#eedfb9] text-[#163828] border border-[#caa85d] shadow-xs cursor-pointer'
                    }`}
                    title={isTamil ? 'முந்தைய பக்கம்' : 'Previous Page'}
                  >
                    <FaChevronLeft className="text-[10px]" />
                    <span>{isTamil ? 'முந்தைய' : 'Prev'}</span>
                  </button>

                  {/* Numbered Page Buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
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

                  <button
                    type="button"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      safeCurrentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                        : 'bg-[#faf7ef] hover:bg-[#eedfb9] text-[#163828] border border-[#caa85d] shadow-xs cursor-pointer'
                    }`}
                    title={isTamil ? 'அடுத்த பக்கம்' : 'Next Page'}
                  >
                    <span>{isTamil ? 'அடுத்த' : 'Next'}</span>
                    <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        </div>
      </main>

      {/* ─── User Details Modal (Showing ONLY Registration Page Details) ─── */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3 px-4 flex items-center justify-between border-b-2 border-[#caa85d] flex-shrink-0 text-white">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 text-gray-900 font-extrabold text-xs">
                  ID: {selectedUser.nikahId}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-[#fffae6] tracking-wide font-cinzel">
                  {isTamil ? 'வரன் விவரங்கள்' : 'Candidate Details'} - {translateName(selectedUser.fullName)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="text-white/80 hover:text-white transition p-1 text-base"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Quick Action Strip in Modal */}
            <div className="bg-[#ede4d1] px-4 py-2.5 border-b border-[#c8b594] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#35250c]">{isTamil ? 'நிலை:' : 'Status:'}</span>
                {selectedUser.isVerified && selectedUser.verificationStatus === 'verified' ? (
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <FaCheckCircle className="text-[10px]" /> {t('adminStatusVerified')}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <FaClock className="text-[10px]" /> {t('adminStatusPending')}
                  </span>
                )}
              </div>

              {/* Action Buttons: View-only tag for Super Admin; Verify/Revoke/Delete for Admin */}
              {isSuperAdmin ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded bg-[#163828]/10 text-[#163828] border border-[#caa85d] font-bold flex items-center gap-1.5 shadow-xs">
                    <FaEye className="text-xs" />
                    <span>{t('adminSuperAdminViewOnlyTag')}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {(!selectedUser.isVerified || selectedUser.verificationStatus !== 'verified') ? (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedUser._id}
                      onClick={() => handleVerifyUser(selectedUser)}
                      className="px-3 py-1 rounded bg-[#163828] hover:bg-[#25583f] text-[#edd48e] border border-[#caa85d] font-bold flex items-center gap-1 shadow-sm transition"
                    >
                      <FaCheck />
                      <span>{t('adminBtnVerify')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={actionLoadingId === selectedUser._id}
                      onClick={() => handleRejectUser(selectedUser)}
                      className="px-3 py-1 rounded bg-amber-800 hover:bg-amber-700 text-white font-bold flex items-center gap-1 shadow-sm transition"
                    >
                      <span>{t('adminBtnRevoke')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={actionLoadingId === selectedUser._id}
                    onClick={() => {
                      setUserToDelete(selectedUser);
                    }}
                    className="px-3 py-1 rounded bg-red-800 hover:bg-red-700 text-white font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <FaTrashAlt />
                    <span>{t('adminBtnDelete')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body: Showing ALL Details from Registration Page */}
            <div className="overflow-y-auto p-4 sm:p-5 text-xs sm:text-sm space-y-4">
              {/* Section 1: Candidate Basic & Demographic Details */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
                <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
                  <FaUser className="text-[#caa85d]" />
                  <span>1. {isTamil ? 'வரன் தனிநபர் விவரங்கள்' : 'Candidate Details'}</span>
                </h4>
                <AdminNeatRow label={isTamil ? 'பெயர்' : 'Full Name'} value={translateName(selectedUser.fullName)} />
                <AdminNeatRow
                  label={isTamil ? 'வரன் வகை' : 'Profile For'}
                  value={selectedUser.gender === 'groom' ? (isTamil ? 'மணமகன்' : 'Groom') : (isTamil ? 'மணமகள்' : 'Bride')}
                />
                <AdminNeatRow label={isTamil ? 'வயது' : 'Age'} value={`${selectedUser.age} ${isTamil ? 'வயது' : 'Years'}`} />
                {selectedUser.dob && (
                  <AdminNeatRow label={isTamil ? 'பிறந்த தேதி' : 'Date of Birth'} value={selectedUser.dob} />
                )}
                <AdminNeatRow label={isTamil ? 'திருமண நிலை' : 'Marital Status'} value={translateValue(selectedUser.maritalStatus || selectedUser.maritalStatusEn) || '—'} />
                <AdminNeatRow label={isTamil ? 'மொழி & இனம்' : 'Language'} value={translateValue(selectedUser.language) || (isTamil ? 'தமிழ்-முஸ்லிம்' : 'Tamil-Muslim')} />
                {(selectedUser.caste || selectedUser.jamath || selectedUser.maslak) && (
                  <AdminNeatRow
                    label={isTamil ? 'ஜமாத் / பிரிவு' : 'Jamath / Sect'}
                    value={translateValue(selectedUser.jamath || selectedUser.maslak || selectedUser.caste) || '—'}
                  />
                )}
                <AdminNeatRow label={isTamil ? 'சொந்த இருப்பிடம்' : 'Native Location'} value={translateValue(selectedUser.location || selectedUser.nativePlace || selectedUser.district) || '—'} />
                {selectedUser.currentAddress && (
                  <AdminNeatRow label={isTamil ? 'தற்போதைய முகவரி' : 'Current Address'} value={selectedUser.currentAddress} />
                )}
                {selectedUser.livingYears && (
                  <AdminNeatRow label={isTamil ? 'இருப்பிட வாழ்வு காலம்' : 'Years Living in Location'} value={translateValue(selectedUser.livingYears)} />
                )}
                <AdminNeatRow label={isTamil ? 'பணிபுரியும் இடம்' : 'Workplace Location'} value={translateValue(selectedUser.workplace || selectedUser.workplaceEn) || '—'} />
                <AdminNeatRow label={isTamil ? 'உயரம்' : 'Height'} value={translateValue(selectedUser.height || selectedUser.heightEn) || '—'} />
                {selectedUser.weight && (
                  <AdminNeatRow label={isTamil ? 'எடை' : 'Weight'} value={translateValue(selectedUser.weight)} />
                )}
                {selectedUser.complexion && (
                  <AdminNeatRow label={isTamil ? 'நிறம்' : 'Complexion'} value={translateValue(selectedUser.complexion)} />
                )}
                {selectedUser.physicalStatus && (
                  <AdminNeatRow label={isTamil ? 'உடல் நிலை' : 'Physical Status'} value={translateValue(selectedUser.physicalStatus)} />
                )}
              </div>

              {/* Section 2: Contact Numbers & Publisher Info */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
                <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
                  <FaPhoneAlt className="text-[#caa85d]" />
                  <span>2. {isTamil ? 'தொடர்பு & பதிவு செய்பவர் விவரங்கள்' : 'Contact & Publisher Info'}</span>
                </h4>
                <AdminNeatRow
                  label={isTamil ? 'முதன்மை மொபைல் எண்' : 'Primary Phone'}
                  value={`${selectedUser.countryCode || '+91'} ${selectedUser.phone}`}
                  isMono
                />
                <AdminNeatRow
                  label={isTamil ? 'கூடுதல் மொபைல் எண்கள்' : 'Additional Phones'}
                  value={(selectedUser.additionalPhones || []).filter(Boolean).join(', ') || (isTamil ? 'இல்லை' : 'None')}
                  isMono
                />
                {selectedUser.whatsappNumber && (
                  <AdminNeatRow label={isTamil ? 'வாட்ஸ்அப் எண்' : 'WhatsApp Number'} value={selectedUser.whatsappNumber} isMono />
                )}
                <AdminNeatRow
                  label={isTamil ? 'மின்னஞ்சல்' : 'Email'}
                  value={
                    selectedUser.email && !selectedUser.email.endsWith('@tamilnikah.com')
                      ? selectedUser.email
                      : (isTamil ? 'வழங்கப்படவில்லை' : 'Not provided')
                  }
                />
                <AdminNeatRow
                  label={isTamil ? 'பதிவு செய்தவர்' : 'Publisher Name'}
                  value={translateName(selectedUser.publisher?.name || selectedUser.fullName || (isTamil ? 'சுய பதிவு' : 'Self'))}
                />
                <AdminNeatRow
                  label={isTamil ? 'வரனுடன் உறவுமுறை' : 'Relationship'}
                  value={translateValue(selectedUser.publisher?.relationship || (isTamil ? 'சுய பதிவு' : 'Self'))}
                />
                {selectedUser.publisher?.phone && (
                  <AdminNeatRow label={isTamil ? 'பதிவு செய்தவர் எண்' : 'Publisher Phone'} value={selectedUser.publisher.phone} isMono />
                )}
                <AdminNeatRow
                  label={isTamil ? 'பதிவு செய்த நாள்' : 'Registration Date'}
                  value={
                    selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleString(isTamil ? 'ta-IN' : 'en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'
                  }
                />
                {selectedUser.kycDocument && (selectedUser.kycDocument.filename || selectedUser.kycDocument.docType) && (
                  <AdminNeatRow
                    label={isTamil ? 'அடையாள ஆவணம் (KYC Proof)' : 'KYC Document'}
                    value={`${selectedUser.kycDocument.docType || 'ID Proof'}${selectedUser.kycDocument.originalName ? ` - ${selectedUser.kycDocument.originalName}` : ''}`}
                  />
                )}
              </div>

              {/* Section 3: Education, Career, Role Experience & Assets */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
                <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
                  <FaGraduationCap className="text-[#caa85d]" />
                  <span>3. {isTamil ? 'கல்வி, தொழில், அனுபவம் & சொத்துக்கள்' : 'Education, Career, Experience & Assets'}</span>
                </h4>
                <AdminNeatRow label={isTamil ? 'கல்வித் தகுதி' : 'Education'} value={translateValue(selectedUser.education || selectedUser.educationEn) || '—'} />
                {selectedUser.educationDetail && (
                  <AdminNeatRow label={isTamil ? 'விரிவான படிப்பு' : 'Education Details'} value={selectedUser.educationDetail} />
                )}
                <AdminNeatRow label={isTamil ? 'தொழில் / பணி' : 'Occupation'} value={translateValue(selectedUser.occupation || selectedUser.profession) || '—'} />
                <AdminNeatRow label={isTamil ? 'பணிபுரியும் இடம்' : 'Workplace'} value={translateValue(selectedUser.workplace || selectedUser.workplaceEn) || '—'} />
                {selectedUser.workingYearsInTitleLocation && (
                  <AdminNeatRow
                    label={isTamil ? 'இப்பதவியில் பணி அனுபவம்' : 'Years in Title & Location'}
                    value={`${selectedUser.workingYearsInTitleLocation} ${isTamil ? 'ஆண்டுகள்' : 'Years'}`}
                  />
                )}
                <AdminNeatRow label={isTamil ? 'மாத வருமானம்' : 'Monthly Income'} value={translateValue(selectedUser.monthlyIncome || selectedUser.income) || '—'} />
                <AdminNeatRow label={isTamil ? 'சொத்துக்கள்' : 'Properties'} value={translateValue(selectedUser.property || selectedUser.properties) || '—'} />
              </div>

              {/* Section 4: Work Preferences (பணி விருப்பங்கள்) */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
                <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
                  <FaBriefcase className="text-[#caa85d]" />
                  <span>4. {isTamil ? 'பணி விருப்பங்கள்' : 'Work Preferences'}</span>
                </h4>
                {selectedUser.gender === 'groom' ? (
                  <AdminNeatRow
                    label={isTamil ? 'மணமகள் பணிபுரிவது குறித்த விருப்பம்' : 'Preference Regarding Bride Working'}
                    value={
                      translateWorkPreference
                        ? translateWorkPreference(selectedUser.workPreferences?.groomWorkPreference, true)
                        : (selectedUser.workPreferences?.groomWorkPreference || '—')
                    }
                  />
                ) : (
                  <AdminNeatRow
                    label={isTamil ? 'மணமகள் பணி நிலை / விருப்பம்' : 'Bride’s Work Preference'}
                    value={
                      translateWorkPreference
                        ? translateWorkPreference(selectedUser.workPreferences?.brideWorkStatus, false)
                        : (selectedUser.workPreferences?.brideWorkStatus || '—')
                    }
                  />
                )}
                {(selectedUser.workPreferences?.notes || selectedUser.workPreferences?.preferenceText) && (
                  <AdminNeatRow
                    label={isTamil ? 'கூடுதல் குறிப்பு' : 'Additional Work Notes'}
                    value={selectedUser.workPreferences.notes || selectedUser.workPreferences.preferenceText}
                  />
                )}
                {selectedUser.requirement && (
                  <AdminNeatRow
                    label={isTamil ? 'எதிர்பார்ப்பு' : 'Partner Requirements'}
                    value={selectedUser.requirement}
                  />
                )}
              </div>

              {/* Section 5: Family Details (பெற்றோர் & உடன்பிறப்புகள்) */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-3">
                <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5">
                  <FaUsers className="text-[#caa85d]" />
                  <span>5. {isTamil ? 'குடும்ப விவரங்கள் (பெற்றோர் & உடன்பிறப்புகள்)' : 'Family Details (Parents & Siblings)'}</span>
                </h4>

                {/* Parents Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Father Box */}
                  <div className="p-2.5 bg-white rounded-lg border border-[#e2d5bd] space-y-1">
                    <span className="font-extrabold text-xs text-[#163828] block border-b border-[#ebdcc4] pb-1">
                      👨 {isTamil ? 'தந்தை விவரம் (Father Details)' : 'Father Details'}
                    </span>
                    <div className="text-xs space-y-1 pt-1">
                      <p>
                        <span className="font-bold text-gray-700">{isTamil ? 'பெயர்' : 'Name'}:</span>{' '}
                        <span className="font-semibold text-gray-900">{selectedUser.familyDetails?.fatherName || selectedUser.fatherName || '—'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">{isTamil ? 'வயது' : 'Age'}:</span>{' '}
                        <span className="font-semibold text-gray-900">{selectedUser.familyDetails?.fatherAge ? `${selectedUser.familyDetails.fatherAge} ${isTamil ? 'வயது' : 'Years'}` : '—'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">{isTamil ? 'தொழில்' : 'Occupation'}:</span>{' '}
                        <span className="font-semibold text-gray-900">{selectedUser.familyDetails?.fatherOccupation || selectedUser.fatherOccupation || '—'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Mother Box */}
                  <div className="p-2.5 bg-white rounded-lg border border-[#e2d5bd] space-y-1">
                    <span className="font-extrabold text-xs text-[#163828] block border-b border-[#ebdcc4] pb-1">
                      👩 {isTamil ? 'தாய் விவரம் (Mother Details)' : 'Mother Details'}
                    </span>
                    <div className="text-xs space-y-1 pt-1">
                      <p>
                        <span className="font-bold text-gray-700">{isTamil ? 'பெயர்' : 'Name'}:</span>{' '}
                        <span className="font-semibold text-gray-900">{selectedUser.familyDetails?.motherName || selectedUser.motherName || '—'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">{isTamil ? 'வயது' : 'Age'}:</span>{' '}
                        <span className="font-semibold text-gray-900">{selectedUser.familyDetails?.motherAge ? `${selectedUser.familyDetails.motherAge} ${isTamil ? 'வயது' : 'Years'}` : '—'}</span>
                      </p>
                      <p>
                        <span className="font-bold text-gray-700">{isTamil ? 'தொழில்' : 'Occupation'}:</span>{' '}
                        <span className="font-semibold text-gray-900">{selectedUser.familyDetails?.motherOccupation || selectedUser.motherOccupation || (isTamil ? 'இல்லத்தரசி (Home Maker)' : 'Home Maker')}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Siblings Details */}
                <div className="pt-2 border-t border-[#dfd2ba]/70">
                  <span className="font-bold text-xs text-[#163828] block mb-1.5">
                    👥 {isTamil ? 'உடன்பிறப்புகள் விவரம் (Siblings Details):' : 'Siblings Details:'}
                  </span>
                  {Array.isArray(selectedUser.familyDetails?.siblings) && selectedUser.familyDetails.siblings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedUser.familyDetails.siblings.map((sib, sIdx) => {
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
                              <span className="font-extrabold text-[#163828] block">
                                {sib.name || `${isTamil ? 'உடன்பிறப்பு' : 'Sibling'} ${sIdx + 1}`}
                              </span>
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
                  ) : selectedUser.familyDetails?.siblingDetails && typeof selectedUser.familyDetails.siblingDetails === 'object' && Object.values(selectedUser.familyDetails.siblingDetails).some(v => v && v !== 'இல்லை' && v !== '0') ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(selectedUser.familyDetails.siblingDetails).map(([k, v]) => {
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
                    <p className="text-xs text-gray-500 italic p-2 bg-white/70 rounded border border-[#e2d5bd]">
                      {isTamil ? 'உடன்பிறப்புகள் விவரம் எதுவும் குறிப்பிடப்படவில்லை.' : 'No sibling details listed.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Section 6: Overseas Registration Details (If Overseas Candidate) */}
              {(selectedUser.isOverseas || (selectedUser.citizenship && selectedUser.citizenship !== 'Indian Citizen' && selectedUser.citizenship !== 'India') || selectedUser.countryOfResidence) && (
                <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-1">
                  <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5 mb-2">
                    <FaGlobe className="text-[#caa85d]" />
                    <span>6. {isTamil ? 'வெளிநாட்டு வரன் விவரங்கள் (Overseas Registration)' : 'Overseas Registration Info'}</span>
                  </h4>
                  <AdminNeatRow label={isTamil ? 'வெளிநாட்டு வரன்' : 'Overseas Profile'} value={isTamil ? 'ஆம் (Overseas)' : 'Yes (Overseas)'} />
                  <AdminNeatRow label={isTamil ? 'குடியுரிமை' : 'Citizenship'} value={selectedUser.citizenship || '—'} />
                  <AdminNeatRow label={isTamil ? 'வசிக்கும் நாடு' : 'Country of Residence'} value={selectedUser.countryOfResidence || '—'} />
                  {selectedUser.visaType && (
                    <AdminNeatRow label={isTamil ? 'விசா வகை' : 'Visa Type'} value={selectedUser.visaType} />
                  )}
                </div>
              )}

              {/* Section 7: Photos (Maximum up to 5) */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-2">
                <h4 className="font-extrabold text-sm text-[#163828] flex items-center gap-1.5 border-b border-[#dfd2ba] pb-1.5">
                  <FaCamera className="text-[#caa85d]" />
                  <span>7. {isTamil ? 'புகைப்படங்கள் (அதிகபட்சம் 5)' : 'Photos (Up to 5)'}</span>
                </h4>
                {selectedUser.photos && selectedUser.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
                    {selectedUser.photos.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPreviewPhotoUrl(url)}
                        className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#caa85d] shadow-sm bg-gray-100 group relative block cursor-pointer text-left"
                        title={isTamil ? 'பெரிதாகப் பார்க்க கிளிக் செய்க' : 'Click to view full size'}
                      >
                        <img
                          src={url}
                          alt={`Uploaded Photo ${i + 1}`}
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
                  <div className="flex flex-col items-center justify-center p-3 bg-[#f5eedf] rounded-lg border border-[#ded1bb] text-center">
                    <div className="w-28 h-36 rounded-lg overflow-hidden border border-[#c5b597] mb-2 shadow-sm">
                      <DefaultAvatar size="card" />
                    </div>
                    <span className="text-xs text-gray-600 font-semibold">
                      {isTamil ? 'புகைப்படம் எதுவும் பதிவேற்றப்படவில்லை' : 'No photo uploaded'}
                    </span>
                  </div>
                )}
              </div>

              {/* Section 8: Description & Playable Audio Note */}
              <div className="bg-[#fbf9f2] p-3.5 rounded-xl border border-[#dfd2ba] space-y-3">
                <div>
                  <h4 className="font-extrabold text-sm text-[#163828] border-b border-[#dfd2ba] pb-1">
                    8. {isTamil ? 'சுயவிவர குறிப்பு & குரல் பதிவு' : 'Profile Bio & Audio Note'}
                  </h4>
                  <p className="p-2.5 bg-white rounded-lg border border-[#dfd2ba] font-semibold text-gray-800 text-xs sm:text-sm mt-1.5 leading-relaxed">
                    {selectedUser.description || selectedUser.bio || '—'}
                  </p>
                </div>

                {/* Audio Clip Placed Under Description */}
                <div className="pt-2 border-t border-[#dfd2ba]/70">
                  <h5 className="font-bold text-xs text-[#163828] flex items-center gap-1.5 mb-1">
                    <FaMicrophone className="text-rose-600" />
                    <span>{isTamil ? 'குரல் பதிவு' : 'Audio Note'}</span>
                  </h5>
                  {selectedUser.audioClip?.url ? (
                    <div className="space-y-1">
                      <p className="text-[11px] text-gray-600">
                        {isTamil ? 'குடும்பம் மற்றும் எதிர்பார்ப்புகள் குறித்த குரல் பதிவு:' : "Candidate's audio note regarding expectations & family background:"}
                      </p>
                      <audio controls src={selectedUser.audioClip.url} className="w-full h-9 mt-1" />
                    </div>
                  ) : (
                    <div className="p-2 bg-[#f5eedf] rounded-lg border border-[#ded1bb] text-center text-xs text-gray-600">
                      {isTamil ? 'குரல் பதிவு எதுவும் இணைக்கப்படவில்லை.' : 'No audio note uploaded.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#ede4d1] px-4 py-3 border-t border-[#c8b594] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#eae1d0] hover:bg-[#ded1bc] text-gray-800 border border-[#bfae8e]"
              >
                {t('adminCloseModal')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Confirm Delete / Remove User (Admin Only) ─── */}
      {!isSuperAdmin && userToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn"
          onClick={() => setUserToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-[#faf7ef] border-2 border-red-400 rounded-2xl shadow-2xl p-6 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 mx-auto text-xl">
              <FaTrashAlt />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-extrabold text-red-950 font-cinzel">
                {t('adminDeleteModalTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-700">
                <strong className="text-black">{translateName(userToDelete.fullName)}</strong> ({userToDelete.nikahId}) {t('adminDeleteModalDesc')}
              </p>
              <p className="text-xs text-red-700 bg-red-50 p-2 rounded-lg border border-red-200 font-semibold">
                {t('adminDeleteModalWarn')}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-5 py-2 rounded-lg bg-[#eae1d0] hover:bg-[#ded1bc] text-gray-800 font-bold text-xs"
              >
                {t('adminDeleteCancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md"
              >
                {t('adminDeleteConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Subscription & Features Customization Modal (Admin Only - completely removed from SuperAdmin) ─── */}
      {!isSuperAdmin && isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3.5 px-5 flex items-center justify-between border-b-2 border-[#caa85d] flex-shrink-0 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#caa85d] to-[#8a6d2f] flex items-center justify-center text-[#163828] shadow">
                  <FaSlidersH className="text-sm" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#fffae6] tracking-wide font-cinzel flex items-center gap-2">
                    <span>{isTamil ? 'சந்தா & அம்சங்கள் கட்டமைப்பு' : 'Subscription & Feature Customization'}</span>
                    <span className="text-xs bg-amber-400 text-gray-900 font-black px-2 py-0.5 rounded-full uppercase">
                      Admin Control
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#ebd7af]">
                    {isTamil
                      ? 'சந்தா விலை, இலவச வரம்புகள் மற்றும் பிரீமியம் அம்சங்களை நிர்வகிக்கவும்'
                      : 'Configure subscription pricing, free tier constraints & feature toggles'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="text-white/80 hover:text-white transition p-1 text-base cursor-pointer"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveSubscriptionSettings} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-gray-800">
              {settingsLoading && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2 font-bold animate-pulse">
                  <FaClock />
                  <span>{isTamil ? 'அமைப்புகள் ஏற்றப்படுகின்றன...' : 'Loading latest configuration...'}</span>
                </div>
              )}

              {/* 1. Subscription Price Section */}
              <div className="bg-[#f5efe1] border border-[#dfd2ba] rounded-xl p-4 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-[#dfd2ba] pb-2">
                  <FaCrown className="text-amber-600 text-base" />
                  <h4 className="font-extrabold text-sm text-[#163828]">
                    {isTamil ? 'பிரீமியம் சந்தா கட்டணங்கள் (ரூபாயில் ₹)' : 'Premium Subscription Pricing (INR ₹)'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Monthly Plan */}
                  <div className="bg-white p-3 rounded-lg border border-[#e2d5bd] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#163828]">
                        {isTamil ? 'மாதாந்திர சந்தா (Monthly Plan)' : 'Monthly Plan'}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {isTamil ? '30 நாட்கள்' : '30 Days'}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-600 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={subSettings.monthlySubscriptionPrice ?? 199}
                        onChange={(e) =>
                          setSubSettings((prev) => ({
                            ...prev,
                            monthlySubscriptionPrice: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full pl-8 pr-3 py-2 text-sm font-extrabold bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#caa85d] text-[#163828]"
                        placeholder="199"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {isTamil ? '1 மாத கால பிரீமியம் அணுகல் கட்டணம்.' : '1-Month access fee.'}
                    </p>
                  </div>

                  {/* Annual Plan */}
                  <div className="bg-white p-3 rounded-lg border border-[#e2d5bd] space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#163828]">
                        {isTamil ? 'வருடாந்திர சந்தா (Annual Plan)' : 'Annual Plan'}
                      </span>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {isTamil ? '365 நாட்கள் (1 ஆண்டு)' : '1 Year'}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-600 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={subSettings.subscriptionPrice ?? 999}
                        onChange={(e) =>
                          setSubSettings((prev) => ({
                            ...prev,
                            subscriptionPrice: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="w-full pl-8 pr-3 py-2 text-sm font-extrabold bg-white border border-[#c5b597] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#caa85d] text-[#163828]"
                        placeholder="999"
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      {isTamil ? '1 வருட கால பிரீமியம் அணுகல் கட்டணம்.' : 'Full 1-Year access fee.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Free Tier Limits & Constraints */}
              <div className="bg-[#f5efe1] border border-[#dfd2ba] rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <FaSlidersH className="text-[#163828] text-base" />
                  <h4 className="font-extrabold text-sm text-[#163828]">
                    {isTamil ? 'இலவச அடுக்கு கட்டுப்பாடுகள் (Constraints)' : 'Free Tier Constraints & Usage Limits'}
                  </h4>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {isTamil
                    ? 'இலவசப் பயனர்கள் பிரீமியம் பெறுவதற்கு முன் காணக்கூடிய அதிகபட்ச சுயவிவரங்கள் மற்றும் தேர்வு வரம்புகளை இங்கு மாற்றலாம்.'
                    : 'Configure the maximum profiles a free registered member can inspect or shortlist before requiring premium upgrade.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Max Profile Views */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#dfd2ba] space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-[#163828]">
                      {isTamil ? 'அதிகபட்ச சுயவிவர பார்வைகள் (Views)' : 'Max Profile Views Allowed'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={subSettings.freeTierLimits?.maxProfileViews ?? 5}
                      onChange={(e) =>
                        setSubSettings((prev) => ({
                          ...prev,
                          freeTierLimits: {
                            ...prev.freeTierLimits,
                            maxProfileViews: Math.max(0, parseInt(e.target.value, 10) || 0),
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-sm font-extrabold bg-[#faf7ef] border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#caa85d] text-[#163828]"
                    />
                    <span className="block text-[10px] text-gray-500 font-medium">
                      {isTamil
                        ? 'இயல்புநிலை: 5. நீங்கள் விரும்பும் எந்த எண்ணையும் நிர்ணயிக்கலாம் (எ.கா. 5, 10, 20).'
                        : 'Default: 5. Set to any limit (e.g. 5, 10, 20) instead of being locked.'}
                    </span>
                  </div>

                  {/* Max Shortlist / Choosing Profiles Limit */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#dfd2ba] space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-[#163828]">
                      {isTamil ? 'அதிகபட்ச தேர்வு வரம்பு (Choosing Limit)' : 'Max Shortlisting / Choosing Limit'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={subSettings.freeTierLimits?.maxShortlistProfiles ?? 3}
                      onChange={(e) =>
                        setSubSettings((prev) => ({
                          ...prev,
                          freeTierLimits: {
                            ...prev.freeTierLimits,
                            maxShortlistProfiles: Math.max(0, parseInt(e.target.value, 10) || 0),
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-sm font-extrabold bg-[#faf7ef] border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#caa85d] text-[#163828]"
                    />
                    <span className="block text-[10px] text-gray-500 font-medium">
                      {isTamil
                        ? 'இயல்புநிலை: 3. இலவச உறுப்பினர் தேர்வு செய்யக்கூடிய அதிகபட்ச வரன்கள்.'
                        : 'Default: 3. Maximum profiles a free member can mark into their shortlist.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Feature Enable / Disable Toggles */}
              <div className="bg-[#f5efe1] border border-[#dfd2ba] rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-emerald-700 text-sm" />
                    <h4 className="font-extrabold text-sm text-[#163828]">
                      {isTamil ? 'சந்தா அம்சங்கள் இயக்குதல் / முடக்குதல்' : 'Subscription Features Toggle'}
                    </h4>
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Enable / Disable</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  {isTamil
                    ? 'கீழ்க்காணும் அம்சங்களை நிர்வாகி தன் விருப்பப்படி இயக்கலாம் அல்லது முடக்கலாம்.'
                    : 'Toggle individual features to enable or disable them within the subscription benefits.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    {
                      key: 'directPhoneAccess',
                      titleEn: 'Direct Phone & Contact Access',
                      titleTa: 'நேரடி தொலைபேசி & தொடர்பு அணுகல்',
                      descEn: 'Allows viewing family contact numbers',
                      descTa: 'குடும்ப தொடர்பு எண்களை பார்க்கும் அனுமதி',
                    },
                    {
                      key: 'audioIntroAccess',
                      titleEn: 'Voice Introduction Clip',
                      titleTa: 'குரல் அறிமுக ஆடியோ பதிவு',
                      descEn: 'Candidate voice recording player',
                      descTa: 'வரனின் குரல் பதிவு கேட்கும் வசதி',
                    },
                    {
                      key: 'detailedBioAccess',
                      titleEn: 'Detailed Biodata Access',
                      titleTa: 'முழு சுயவிவர தகவல்கள் அணுகல்',
                      descEn: 'Full education, career & family details',
                      descTa: 'முழு கல்வி, வேலை மற்றும் குடும்ப தகவல்கள்',
                    },
                    {
                      key: 'shortlistAccess',
                      titleEn: 'Shortlisting & Choosing Profiles',
                      titleTa: 'சுயவிவரங்களை தேர்வு செய்து சேமித்தல்',
                      descEn: 'Bookmark preferred matches to profile',
                      descTa: 'விருப்பமான வரன்களை தேர்வு செய்து வைக்கும் வசதி',
                    },
                    {
                      key: 'photoFullView',
                      titleEn: 'Full Photo Gallery & Zoom',
                      titleTa: 'முழு புகைப்பட தொகுப்பு & பார்வை',
                      descEn: 'High-res candidate photo viewer',
                      descTa: 'தெளிவான புகைப்படங்களை காணும் வசதி',
                    },
                    {
                      key: 'newMatchAlerts',
                      titleEn: 'New Matching Profiles Alerts',
                      titleTa: 'புதிய பொருத்த வரன்கள் எச்சரிக்கை',
                      descEn: 'Priority notifications on matching candidates',
                      descTa: 'புதிய வரன்கள் பதிவாகும் போது அறிவிப்புகள்',
                    },
                  ].map((feat) => {
                    const isEnabled = !!subSettings.features?.[feat.key];
                    return (
                      <div
                        key={feat.key}
                        onClick={() =>
                          setSubSettings((prev) => ({
                            ...prev,
                            features: {
                              ...prev.features,
                              [feat.key]: !isEnabled,
                            },
                          }))
                        }
                        className={`p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                          isEnabled
                            ? 'bg-white border-emerald-400 shadow-xs hover:border-emerald-500'
                            : 'bg-gray-100/80 border-gray-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="font-extrabold text-xs text-gray-900 truncate">
                            {isTamil ? feat.titleTa : feat.titleEn}
                          </h5>
                          <p className="text-[10px] text-gray-500 truncate">
                            {isTamil ? feat.descTa : feat.descEn}
                          </p>
                        </div>
                        <button
                          type="button"
                          className={`text-2xl transition flex-shrink-0 ${
                            isEnabled ? 'text-emerald-600' : 'text-gray-400'
                          }`}
                        >
                          {isEnabled ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Horizontal Running Bar (Featured Profiles Marquee) Customization */}
              <div className="bg-[#f5efe1] border border-[#dfd2ba] rounded-xl p-4 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#dfd2ba] pb-2">
                  <div className="flex items-center gap-2">
                    <FaStar className="text-amber-600 text-base" />
                    <div>
                      <h4 className="font-extrabold text-sm text-[#163828]">
                        {isTamil ? '4. ஓடும் முகப்பு பட்டி (Featured Profiles Marquee) கட்டமைப்பு' : '4. Running Marquee Bar (Featured Profiles) Settings'}
                      </h4>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        {isTamil
                          ? 'ஓடும் பட்டி நிலை, விளம்பரக் கட்டணம், காட்சி நாட்கள் மற்றும் வரன் விவரங்களைத் தேர்வு செய்க'
                          : 'Configure running marquee visibility, promotion price, active duration, and visible profile details'}
                      </p>
                    </div>
                  </div>

                  {/* Master Marquee Toggle */}
                  <div
                    onClick={() =>
                      setSubSettings((prev) => ({
                        ...prev,
                        featuredMarquee: {
                          ...(prev.featuredMarquee || {}),
                          enabled: !prev.featuredMarquee?.enabled,
                        },
                      }))
                    }
                    className="flex items-center gap-2 cursor-pointer select-none"
                    title={isTamil ? 'ஓடும் பட்டியை இயக்க / முடக்க' : 'Toggle running bar'}
                  >
                    <span className="text-xs font-bold text-gray-700 hidden sm:inline">
                      {subSettings.featuredMarquee?.enabled !== false
                        ? (isTamil ? 'இயக்கத்தில் உள்ளது' : 'Enabled')
                        : (isTamil ? 'முடக்கப்பட்டுள்ளது' : 'Disabled')}
                    </span>
                    <button
                      type="button"
                      className={`text-2xl transition flex-shrink-0 ${
                        subSettings.featuredMarquee?.enabled !== false ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {subSettings.featuredMarquee?.enabled !== false ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>

                {/* Amount to Pay & Days Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amount (Price in ₹) */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#dfd2ba] space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-[#163828]">
                      {isTamil ? 'விளம்பரக் கட்டணம் (ரூபாயில் ₹)' : 'Promotion Fee (INR ₹)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-600 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={subSettings.featuredMarquee?.price ?? 299}
                        onChange={(e) =>
                          setSubSettings((prev) => ({
                            ...prev,
                            featuredMarquee: {
                              ...(prev.featuredMarquee || {}),
                              price: Math.max(0, parseInt(e.target.value, 10) || 0),
                            },
                          }))
                        }
                        className="w-full pl-8 pr-3 py-1.5 text-sm font-extrabold bg-[#faf7ef] border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#caa85d] text-[#163828]"
                        placeholder="299"
                      />
                    </div>
                    <span className="block text-[10px] text-gray-500 font-medium">
                      {isTamil
                        ? 'பயனர் தன் வரனை ஓடும் பட்டியில் முன்னிலைப்படுத்த செலுத்த வேண்டிய தொகை.'
                        : 'Amount user pays to put their profile in the running bar.'}
                    </span>
                  </div>

                  {/* Duration in Days */}
                  <div className="bg-white p-3.5 rounded-lg border border-[#dfd2ba] space-y-1.5 shadow-xs">
                    <label className="block text-xs font-bold text-[#163828]">
                      {isTamil ? 'காட்சி செல்லுபடியாகும் நாட்கள் (Days)' : 'Feature Duration (Days)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={subSettings.featuredMarquee?.durationDays ?? 15}
                      onChange={(e) =>
                        setSubSettings((prev) => ({
                          ...prev,
                          featuredMarquee: {
                            ...(prev.featuredMarquee || {}),
                            durationDays: Math.max(1, parseInt(e.target.value, 10) || 1),
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 text-sm font-extrabold bg-[#faf7ef] border border-[#c5b597] rounded-md focus:outline-none focus:ring-2 focus:ring-[#caa85d] text-[#163828]"
                      placeholder="15"
                    />
                    <span className="block text-[10px] text-gray-500 font-medium">
                      {isTamil
                        ? 'கட்டணம் செலுத்திய பின் எத்தனை நாட்கள் ஓடும் பட்டியில் காட்சிப்படுத்த வேண்டும்.'
                        : 'How many days the profile remains actively visible in the running bar.'}
                    </span>
                  </div>
                </div>

                {/* Visible Details Customization Checkboxes */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#163828]">
                      {isTamil ? 'ஓடும் பட்டியில் காண்பிக்கப்படும் வரன் விவரங்கள் (Visible Profile Details)' : 'Visible Details on Running Marquee Cards'}
                    </label>
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Admin Selection</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    {isTamil
                      ? 'கீழ்க்காணும் விவரங்களில் எவையெல்லாம் ஓடும் பட்டியில் தோன்றும் வரன் அட்டையில் தெரிய வேண்டும் என்பதை தேர்வு செய்க:'
                      : 'Check the details that should be visible on each profile card inside the horizontal running bar:'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 pt-1">
                    {[
                      { key: 'photo', labelEn: 'Photo', labelTa: 'புகைப்படம்' },
                      { key: 'nikahId', labelEn: 'Nikah ID', labelTa: 'நிக்காஹ் ID' },
                      { key: 'name', labelEn: 'Full Name', labelTa: 'வரன் பெயர்' },
                      { key: 'age', labelEn: 'Age', labelTa: 'வயது' },
                      { key: 'location', labelEn: 'District', labelTa: 'இருப்பிடம்' },
                      { key: 'education', labelEn: 'Education', labelTa: 'கல்வி' },
                      { key: 'occupation', labelEn: 'Occupation', labelTa: 'தொழில்' },
                      { key: 'monthlyIncome', labelEn: 'Monthly Income', labelTa: 'வருமானம்' },
                      { key: 'height', labelEn: 'Height', labelTa: 'உயரம்' },
                      { key: 'maritalStatus', labelEn: 'Marital Status', labelTa: 'திருமண நிலை' },
                    ].map((item) => {
                      const isChecked = subSettings.featuredMarquee?.visibleFields?.[item.key] !== false &&
                        (subSettings.featuredMarquee?.visibleFields?.[item.key] === true ||
                          ['photo', 'nikahId', 'name', 'age', 'location', 'education', 'occupation'].includes(item.key));

                      return (
                        <div
                          key={item.key}
                          onClick={() =>
                            setSubSettings((prev) => ({
                              ...prev,
                              featuredMarquee: {
                                ...(prev.featuredMarquee || {}),
                                visibleFields: {
                                  ...(prev.featuredMarquee?.visibleFields || {}),
                                  [item.key]: !isChecked,
                                },
                              },
                            }))
                          }
                          className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-between gap-1.5 cursor-pointer select-none transition ${
                            isChecked
                              ? 'bg-white border-amber-500 text-[#163828] shadow-xs'
                              : 'bg-gray-100 border-gray-300 text-gray-400'
                          }`}
                        >
                          <span className="truncate">{isTamil ? item.labelTa : item.labelEn}</span>
                          <input
                            type="checkbox"
                            checked={Boolean(isChecked)}
                            onChange={() => {}}
                            className="w-4 h-4 text-emerald-600 rounded accent-[#163828] cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#dfd2ba]">
                <button
                  type="button"
                  onClick={handleResetSettingsToDefault}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#ede4d1] hover:bg-[#dfd2ba] text-[#35250c] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <FaUndo className="text-[11px]" />
                  <span>{isTamil ? 'இயல்புநிலைக்கு மாற்றுக (Reset Defaults)' : 'Reset Defaults'}</span>
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition cursor-pointer"
                  >
                    {isTamil ? 'ரத்து செய்க' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={settingsSaving}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] hover:from-[#1b4431] hover:to-[#1b4431] text-[#edd48e] font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition border border-[#caa85d] disabled:opacity-50 cursor-pointer"
                  >
                    <FaSave className="text-xs" />
                    <span>
                      {settingsSaving
                        ? isTamil
                          ? 'சேமிக்கப்படுகிறது...'
                          : 'Saving...'
                        : isTamil
                        ? 'அமைப்புகளைச் சேமி (Save Settings)'
                        : 'Save Settings'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Help Desk / Support Queries Modal (Admin Only - completely removed from SuperAdmin) ─── */}
      {!isSuperAdmin && isTicketsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fadeIn"
          onClick={() => setIsTicketsOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-[#faf7ef] border-2 border-[#caa85d] rounded-2xl shadow-2xl overflow-hidden relative my-4 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#163828] via-[#21543c] to-[#163828] py-3.5 px-5 flex items-center justify-between border-b-2 border-[#caa85d] flex-shrink-0 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#caa85d] to-[#8a6d2f] flex items-center justify-center text-[#163828] shadow">
                  <FaHeadset className="text-sm" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#fffae6] tracking-wide font-cinzel flex items-center gap-2">
                    <span>{isTamil ? 'வாடிக்கையாளர் உதவி மையம் கோரிக்கைகள்' : 'Help Desk Customer Queries'}</span>
                    <span className="text-xs bg-amber-400 text-gray-900 font-black px-2 py-0.5 rounded-full uppercase">
                      Admin Desk
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#ebd7af]">
                    {isTamil
                      ? 'பயனாளர்கள் உதவி மையம் மூலம் அனுப்பிய அனைத்து கேள்விகள் மற்றும் விபரங்கள்'
                      : 'All queries submitted by users via customer support desk'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTicketsOpen(false)}
                className="text-white/80 hover:text-white transition p-1 text-base cursor-pointer"
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            {/* Filter & Search Bar Strip */}
            <div className="bg-[#ede4d1] p-3 border-b border-[#dfd2ba] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs flex-shrink-0">
              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                {[
                  { id: 'all', labelEn: 'All Queries', labelTa: 'அனைத்தும்', count: tickets.length },
                  {
                    id: 'open',
                    labelEn: 'Open',
                    labelTa: 'திறந்துள்ளது',
                    count: tickets.filter((t) => t.status === 'open' || !t.status).length,
                  },
                  {
                    id: 'in_progress',
                    labelEn: 'In Progress',
                    labelTa: 'பரிசீலனையில்',
                    count: tickets.filter((t) => t.status === 'in_progress').length,
                  },
                  {
                    id: 'resolved',
                    labelEn: 'Resolved',
                    labelTa: 'தீர்க்கப்பட்டது',
                    count: tickets.filter((t) => t.status === 'resolved').length,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTicketFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      ticketFilter === tab.id
                        ? 'bg-[#163828] text-[#edd48e] shadow-sm'
                        : 'bg-white text-gray-700 hover:bg-[#faf4e6] border border-[#d2c2a3]'
                    }`}
                  >
                    <span>{isTamil ? tab.labelTa : tab.labelEn}</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-black/10">
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search, Clear Resolved & Refresh */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                {tickets.some((t) => t.status === 'resolved') && (
                  <button
                    type="button"
                    disabled={ticketActionLoadingId === 'all-resolved'}
                    onClick={handleClearResolvedTickets}
                    className="px-2.5 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 font-bold text-xs flex items-center gap-1 transition shadow-2xs cursor-pointer"
                    title={isTamil ? 'தீர்க்கப்பட்ட அனைத்து கோரிக்கைகளையும் நீக்குக' : 'Remove all resolved queries'}
                  >
                    <FaTrashAlt className="text-[10px]" />
                    <span>{isTamil ? 'தீர்க்கப்பட்டதை நீக்குக' : 'Clear Resolved'}</span>
                  </button>
                )}
                <div className="relative flex-1 sm:w-56">
                  <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    value={ticketSearchQuery}
                    onChange={(e) => setTicketSearchQuery(e.target.value)}
                    placeholder={isTamil ? 'தேட...' : 'Search query...'}
                    className="w-full pl-7 pr-3 py-1 text-xs bg-white border border-[#c5b597] rounded-md focus:outline-none focus:ring-1 focus:ring-[#caa85d] text-gray-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchTickets}
                  className="p-1.5 rounded-md bg-white hover:bg-gray-100 text-gray-700 border border-[#c5b597] cursor-pointer"
                  title="Refresh"
                >
                  <FaRedo className={`text-xs ${ticketsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Modal Body: Query List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm custom-scrollbar">
              {ticketsLoading && (
                <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 text-xs flex items-center gap-2 font-bold animate-pulse">
                  <FaClock />
                  <span>{isTamil ? 'கோரிக்கைகள் ஏற்றப்படுகின்றன...' : 'Loading latest queries...'}</span>
                </div>
              )}

              {filteredTickets.length === 0 && !ticketsLoading ? (
                <div className="p-8 text-center bg-white border border-[#dfd2ba] rounded-xl space-y-2">
                  <FaHeadset className="text-3xl text-gray-400 mx-auto" />
                  <h4 className="font-bold text-gray-700">
                    {isTamil ? 'கோரிக்கைகள் எதுவும் இல்லை' : 'No Help Desk Queries Found'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {isTamil
                      ? 'பயனாளர்கள் உதவி மையம் வழியாக அனுப்பும் கோரிக்கைகள் இங்கு தோன்றும்.'
                      : 'Queries submitted by users through the customer support modal will appear here.'}
                  </p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const tId = ticket._id || ticket.id;
                  const isResolved = ticket.status === 'resolved';
                  const isInProgress = ticket.status === 'in_progress';
                  const isOpen = ticket.status === 'open' || !ticket.status;
                  const dateStr = ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleString(isTamil ? 'ta-IN' : 'en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Recent';

                  return (
                    <div
                      key={tId}
                      className={`p-4 rounded-xl border transition-all shadow-xs ${
                        isResolved
                          ? 'bg-[#f7faf7] border-emerald-300'
                          : isInProgress
                          ? 'bg-[#fffdf8] border-amber-300'
                          : 'bg-white border-[#caa85d]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-[#163828]">{ticket.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : isInProgress
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-red-100 text-red-900 border-red-300'
                            }`}
                          >
                            {isResolved
                              ? isTamil
                                ? 'தீர்க்கப்பட்டது'
                                : 'Resolved'
                              : isInProgress
                              ? isTamil
                                ? 'பரிசீலனையில்'
                                : 'In Progress'
                              : isTamil
                              ? 'புதிய கோரிக்கை'
                              : 'Open'}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium flex items-center gap-1">
                          <FaClock className="text-[10px]" />
                          <span>{dateStr}</span>
                        </span>
                      </div>

                      {/* Contact Badges */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                        {ticket.phone && (
                          <div className="flex items-center gap-1 text-[#163828] font-bold">
                            <FaPhoneAlt className="text-[10px] text-green-700" />
                            <a href={`tel:${ticket.phone}`} className="hover:underline">
                              {ticket.phone}
                            </a>
                            <a
                              href={`https://wa.me/${ticket.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-1 px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-extrabold flex items-center gap-0.5"
                              title="Chat on WhatsApp"
                            >
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}

                        {ticket.email && (
                          <div className="flex items-center gap-1 text-gray-700 font-medium">
                            <FaEnvelope className="text-[10px] text-amber-700" />
                            <a href={`mailto:${ticket.email}`} className="hover:underline">
                              {ticket.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Subject & Message Content */}
                      <div className="mt-2.5 bg-[#fdfaf3] p-3 rounded-lg border border-[#e8ddc7] space-y-1">
                        <div className="font-extrabold text-xs text-[#523d14] flex items-center gap-1">
                          <span>{isTamil ? 'தலைப்பு:' : 'Subject:'}</span>
                          <span className="text-gray-900 font-bold">{ticket.subject || 'General Inquiry'}</span>
                        </div>
                        <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed pt-1">
                          {ticket.message}
                        </p>
                      </div>

                      {/* Action buttons strip */}
                      <div className="mt-3 flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                        {isOpen && (
                          <button
                            type="button"
                            disabled={ticketActionLoadingId === tId}
                            onClick={() => handleUpdateTicketStatus(tId, 'in_progress')}
                            className="px-3 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition cursor-pointer"
                          >
                            {isTamil ? 'பரிசீலனையில் வைக்கவும்' : 'Mark In Progress'}
                          </button>
                        )}

                        {!isResolved && (
                          <button
                            type="button"
                            disabled={ticketActionLoadingId === tId}
                            onClick={() => handleUpdateTicketStatus(tId, 'resolved')}
                            className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <FaCheckCircle className="text-[10px]" />
                            <span>{isTamil ? 'தீர்க்கப்பட்டதாகக் குறிக்கவும்' : 'Mark Resolved'}</span>
                          </button>
                        )}

                        {isResolved && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={ticketActionLoadingId === tId}
                              onClick={() => handleUpdateTicketStatus(tId, 'open')}
                              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs transition cursor-pointer"
                            >
                              {isTamil ? 'மீண்டும் திறக்க' : 'Re-open'}
                            </button>
                            <button
                              type="button"
                              disabled={ticketActionLoadingId === tId}
                              onClick={() => handleDeleteTicket(tId)}
                              className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                              title={isTamil ? 'இந்த வினாவை நிரந்தரமாக நீக்குக' : 'Remove this query'}
                            >
                              <FaTrashAlt className="text-[10px]" />
                              <span>{isTamil ? 'நீக்குக' : 'Remove'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Floating Toast Feedback ─── */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl font-bold text-xs sm:text-sm flex items-center gap-2 text-white border transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-red-700 border-red-600'
              : toast.type === 'info'
              ? 'bg-[#163828] border-[#caa85d] text-[#edd48e]'
              : 'bg-emerald-800 border-emerald-600'
          }`}
        >
          {toast.type === 'error' ? <FaTimesCircle /> : <FaCheckCircle />}
          <span>{toast.message}</span>
        </div>
      )}

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
                {isTamil ? 'புகைப்படப் பார்வை' : 'Photo Viewer'}
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
                alt="Uploaded Photo View"
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

function AdminNeatRow({ label, value, isMono = false }) {
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
