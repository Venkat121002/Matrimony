import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaCrown,
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import DefaultAvatar from './DefaultAvatar';

export default function FeaturedMarqueeBar({
  onViewDetails,
  onOpenPromoteModal,
  currentUser,
  onToggleShortlist,
  shortlistedIds = [],
}) {
  const { isTamil, translateName, translateValue } = useLanguage();
  const [profiles, setProfiles] = useState([]);
  const [marqueeConfig, setMarqueeConfig] = useState({
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
  });
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredProfileId, setHoveredProfileId] = useState(null);

  // Infinite scroll, dragging, and wheel refs
  const scrollContainerRef = useRef(null);
  const isPausedRef = useRef(false);
  const isUserDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const dragMovedRef = useRef(false);

  isPausedRef.current = isPaused;

  const fetchMarqueeData = async () => {
    try {
      const res = await fetch('/api/profiles/featured-marquee');
      const data = await res.json();
      if (data.success) {
        if (data.settings) {
          setMarqueeConfig(data.settings);
        }
        if (Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        }
      }
    } catch (err) {
      console.warn('Failed to load marquee profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarqueeData();
  }, [
    currentUser?._id,
    currentUser?.nikahId,
    currentUser?.updatedAt,
    currentUser?.fullName,
    currentUser?.fullNameEn,
    currentUser?.isFeatured,
  ]);

  // Synchronize immediately if profile was updated across tabs or in edit settings
  useEffect(() => {
    const handleSync = () => {
      fetchMarqueeData();
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('nikah_profile_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('nikah_profile_updated', handleSync);
    };
  }, []);

  // 1. Filter Profiles by User's Gender and exclude current user's own profile:
  // - The user who is currently logged in should NOT see their own profile in this bar
  // - If user is bride -> show only groom profiles
  // - If user is groom -> show only bride profiles
  // - When logged out -> show both groom and bride profiles
  // - Admins see all other profiles
  const filteredProfiles = useMemo(() => {
    if (!profiles || profiles.length === 0) return [];

    const isOwn = (p) =>
      Boolean(
        currentUser &&
        ((currentUser._id && (String(p._id) === String(currentUser._id) || String(p.id) === String(currentUser._id))) ||
          (currentUser.nikahId && String(p.nikahId) === String(currentUser.nikahId)) ||
          (currentUser.id && (String(p.id) === String(currentUser.id) || String(p._id) === String(currentUser.id))))
      );

    // Strictly exclude the currently logged-in user's own profile
    const otherProfiles = profiles.filter((p) => !isOwn(p));

    if (!currentUser || !currentUser.gender || currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      return otherProfiles;
    }

    const userGender = String(currentUser.gender).toLowerCase().trim();
    const isBride = userGender === 'bride' || userGender === 'female' || userGender === 'மணமகள்';
    const isGroom = userGender === 'groom' || userGender === 'male' || userGender === 'மணமகன்';

    return otherProfiles.filter((p) => {
      if (isBride) return p.gender === 'groom';
      if (isGroom) return p.gender === 'bride';
      return true;
    });
  }, [profiles, currentUser]);

  // Dynamic candidate name resolver that respects both English (fullNameEn) and Tamil (fullName)
  const getProfileName = (p) => {
    if (!p) return '';
    const isOwn =
      currentUser &&
      ((currentUser._id && String(p._id) === String(currentUser._id)) ||
        (currentUser.nikahId && String(p.nikahId) === String(currentUser.nikahId)));
    const src = isOwn ? { ...p, ...currentUser } : p;

    if (isTamil) {
      if (src.fullName && /[\u0B80-\u0BFF]/.test(src.fullName)) {
        return src.fullName.trim();
      }
      if (src.name && /[\u0B80-\u0BFF]/.test(src.name)) {
        return src.name.trim();
      }
      if (src.fullName && src.fullName.trim()) {
        return translateName(src.fullName.trim(), 'ta');
      }
      if (src.fullNameEn && src.fullNameEn.trim()) {
        return translateName(src.fullNameEn.trim(), 'ta');
      }
      if (src.nameEn && src.nameEn.trim()) {
        return translateName(src.nameEn.trim(), 'ta');
      }
      return src.name || '';
    } else {
      if (src.fullNameEn && src.fullNameEn.trim()) {
        return src.fullNameEn.trim();
      }
      if (src.nameEn && src.nameEn.trim()) {
        return src.nameEn.trim();
      }
      if (src.fullName && !/[\u0B80-\u0BFF]/.test(src.fullName)) {
        return src.fullName.trim();
      }
      if (src.name && !/[\u0B80-\u0BFF]/.test(src.name)) {
        return src.name.trim();
      }
      if (src.fullName && src.fullName.trim()) {
        return translateName(src.fullName.trim(), 'en');
      }
      if (src.name && src.name.trim()) {
        return translateName(src.name.trim(), 'en');
      }
      return '';
    }
  };

  const isUserFeatured = Boolean(
    currentUser?.isFeatured &&
    (!currentUser.featuredUntil || new Date(currentUser.featuredUntil) > new Date())
  );

  // Infinite scroll and auto-running only activate if there are more than two profiles (>= 3).
  // Otherwise, lock scrolling on both sides and turn off the running ticker.
  const isInfiniteScrollActive = filteredProfiles.length > 2;

  // Seamless 4-set duplication ensuring infinite bidirectional scrolling (left and right)
  const displayList = useMemo(() => {
    if (filteredProfiles.length === 0) return [];
    if (!isInfiniteScrollActive) {
      // 1 or 2 profiles: display directly without infinite duplication
      return filteredProfiles;
    }
    let list = [...filteredProfiles];
    while (list.length < 12) {
      list = [...list, ...filteredProfiles];
    }
    // 4 copies: [Copy 0, Copy 1, Copy 2, Copy 3]
    return [...list, ...list, ...list, ...list];
  }, [filteredProfiles, isInfiniteScrollActive]);

  // Helper to keep scroll position normalized within middle sets [S, 2 * S)
  // S is the exact pixel width of 1 complete set of profiles (total scrollWidth / 4)
  const normalizeScroll = (el) => {
    if (!el || !isInfiniteScrollActive) return;
    const S = el.scrollWidth / 4;
    if (!S || S <= 0) return;

    while (el.scrollLeft < S) {
      el.scrollLeft += S;
    }
    while (el.scrollLeft >= 2 * S) {
      el.scrollLeft -= S;
    }
  };

  // Initialize scroll position to Copy 1 (at scrollLeft = S) so user can immediately scroll left or right
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || displayList.length === 0) return;
    if (!isInfiniteScrollActive) {
      el.scrollLeft = 0;
      return;
    }
    const S = el.scrollWidth / 4;
    if (S > 0) {
      el.scrollLeft = S;
    }
  }, [displayList, isInfiniteScrollActive]);

  // Recalibrate on window resize if needed
  useEffect(() => {
    if (!isInfiniteScrollActive) return;
    const onResize = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      normalizeScroll(el);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [displayList, isInfiniteScrollActive]);

  // 2. Smooth Continuous Horizontal Auto-scroll towards the left (Active ONLY if profiles > 2):
  useEffect(() => {
    if (!isInfiniteScrollActive) return;
    let animationFrameId;
    const container = scrollContainerRef.current;
    if (!container || displayList.length === 0) return;

    const step = () => {
      if (!isPausedRef.current && !isUserDraggingRef.current && container) {
        container.scrollLeft += 0.8;
        const S = container.scrollWidth / 4;
        if (S > 0 && container.scrollLeft >= 2 * S) {
          container.scrollLeft -= S;
        }
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [displayList, isInfiniteScrollActive]);

  // 3. Side Scrollable using Mouse Wheel (both vertical and horizontal wheel with infinite bidirectional loop):
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e) => {
      if (!isInfiniteScrollActive) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta !== 0) {
        e.preventDefault();
        el.scrollLeft += delta * 1.2;
        normalizeScroll(el);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [displayList, isInfiniteScrollActive]);

  // 4. Side Scrollable using Mouse Drag (Smooth grabbing and infinite bidirectional sliding):
  const handleMouseDown = (e) => {
    if (!isInfiniteScrollActive) return;
    if (e.button !== 0) return; // Only primary mouse button
    const el = scrollContainerRef.current;
    if (!el) return;

    isUserDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    dragMovedRef.current = false;

    const onWindowMouseMove = (moveEvent) => {
      if (!isUserDraggingRef.current || !scrollContainerRef.current) return;
      const dx = moveEvent.clientX - lastMouseXRef.current;
      if (Math.abs(dx) > 3) {
        dragMovedRef.current = true;
      }
      lastMouseXRef.current = moveEvent.clientX;
      scrollContainerRef.current.scrollLeft -= dx;
      normalizeScroll(scrollContainerRef.current);
    };

    const onWindowMouseUp = () => {
      isUserDraggingRef.current = false;
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
      setTimeout(() => {
        dragMovedRef.current = false;
      }, 50);
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
  };

  // 5. Native Scroll event listener to guarantee infinite bidirectional bounds on any scroll input (trackpads, touch, wheel)
  const handleScroll = () => {
    if (!isInfiniteScrollActive) return;
    normalizeScroll(scrollContainerRef.current);
  };

  const handleTouchStart = () => {
    if (!isInfiniteScrollActive) return;
    isUserDraggingRef.current = true;
  };

  const handleTouchEnd = () => {
    isUserDraggingRef.current = false;
  };

  if (!marqueeConfig.enabled) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full bg-[#faf7ef] border-2 border-[#caa85d]/60 rounded-2xl p-3 shadow-md mb-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-[#163828] animate-pulse">
          <FaCrown className="text-amber-500" />
          <span>{isTamil ? 'சிறப்பு வரன்கள் ஏற்றப்படுகின்றன...' : 'Loading featured profiles...'}</span>
        </div>
        <div className="flex gap-3 overflow-hidden opacity-60">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-64 h-24 bg-amber-100/50 rounded-xl flex-shrink-0 animate-pulse border border-amber-200" />
          ))}
        </div>
      </div>
    );
  }

  if (!filteredProfiles || filteredProfiles.length === 0) {
    return null;
  }

  const visible = marqueeConfig.visibleFields || {};

  return (
    <div className="w-full mb-4">
      {/* Main Container - Note: Cursor anywhere inside does NOT stop running; ONLY touching a profile stops it */}
      <div className="w-full bg-gradient-to-b from-[#fdfbf7] via-[#faf6ec] to-[#f4ede0] border-2 border-[#caa85d] rounded-2xl p-2.5 sm:p-3 shadow-lg relative overflow-hidden select-none">
        {/* Top Header Label */}
        <div className="flex items-center justify-between px-1.5 pb-2 border-b border-[#caa85d]/40 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-gray-950 flex items-center justify-center text-xs shadow-xs">
              <FaStar className="text-[11px]" />
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm text-[#163828] font-cinzel tracking-wide flex items-center gap-1.5">
              <span>{isTamil ? 'சிறப்புத் தேர்வு வரன்கள்' : 'Featured Profiles'}</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200/90 text-amber-900 font-black border border-amber-300 uppercase">
                {isInfiniteScrollActive ? (isTamil ? 'நேரலை' : 'Live') : (isTamil ? 'சிறப்பு' : 'Featured')}
              </span>
            </h3>
          </div>

          {isInfiniteScrollActive && (
            <div className="text-[10px] sm:text-[11px] text-gray-600 font-semibold flex items-center gap-1">
              <span className="hidden sm:inline">
                {isTamil
                  ? '👆 சுட்டியால் உருட்டலாம் (Mouse scroll / drag)'
                  : '👆 Mouse scroll / drag to explore'}
              </span>
              <span className="sm:hidden">
                {isTamil ? '👆 நகர்த்த இழுக்கவும்' : '👆 Swipe to explore'}
              </span>
            </div>
          )}
        </div>

        {/* Side-Scrollable Marquee Track Wrapper with mouse dragging and wheel scroll (Arrows removed) */}
        <div className="relative">
          {/* Side-Scrollable Marquee Track */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`py-1 px-1 sm:px-2 w-full no-scrollbar ${
              isInfiniteScrollActive
                ? 'overflow-x-auto cursor-grab active:cursor-grabbing'
                : 'overflow-hidden flex justify-center'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div
              className={`flex items-stretch ${
                isInfiniteScrollActive
                  ? 'w-max'
                  : 'w-full justify-center gap-2 sm:gap-4'
              }`}
            >
            {displayList.map((p, idx) => {
              const uniqueKey = `${p._id || p.nikahId || idx}-${idx}`;
              const isHovered = hoveredProfileId === uniqueKey;
              const isGroom = p.gender === 'groom';
              const photoUrl = Array.isArray(p.photos) && p.photos.length > 0 ? p.photos[0] : null;

              return (
                <div
                  key={uniqueKey}
                  onMouseEnter={() => {
                    // STOP running ONLY when cursor touches this profile card
                    setIsPaused(true);
                    setHoveredProfileId(uniqueKey);
                  }}
                  onMouseLeave={() => {
                    // RESUME immediately when cursor leaves this profile card
                    setIsPaused(false);
                    setHoveredProfileId(null);
                  }}
                  onClick={() => {
                    if (!dragMovedRef.current && onViewDetails) {
                      onViewDetails(p);
                    }
                  }}
                  className={`flex-shrink-0 w-64 sm:w-72 mx-2 p-2.5 rounded-xl border transition-all duration-200 cursor-pointer text-left relative flex items-start gap-2.5 select-none ${
                    isHovered
                      ? 'bg-white border-amber-500 shadow-xl scale-[1.04] z-20 ring-2 ring-amber-400'
                      : 'bg-white/95 hover:bg-white border-[#dfd2ba] shadow-sm hover:border-amber-400'
                  }`}
                  title={isTamil ? 'முழு விவரங்களை காண கிளிக் செய்க' : 'Click to view complete candidate details'}
                >
                  {/* Badge: Featured */}
                  {p.isFeaturedBadge && (
                    <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 text-[9px] font-black shadow-xs flex items-center gap-1 border border-amber-200">
                      <FaCrown className="text-[9px]" />
                      <span>{isTamil ? 'சிறப்பு வரன்' : 'Featured'}</span>
                    </div>
                  )}

                  {/* Candidate Photo */}
                  {visible.photo !== false && (
                    <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-lg overflow-hidden border border-[#caa85d] flex-shrink-0 bg-gray-100 shadow-2xs relative mt-0.5 pointer-events-none">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={getProfileName(p) || 'Candidate'}
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                          loading="lazy"
                        />
                      ) : (
                        <DefaultAvatar size="card" />
                      )}
                    </div>
                  )}

                  {/* Profile Details Content */}
                  <div className="flex-1 min-w-0 text-xs pointer-events-none">
                    {/* Header Row: ID, Gender & Direct Choose Button */}
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      {visible.nikahId !== false && (
                        <span className="font-extrabold text-[10px] px-1.5 py-0.2 rounded bg-amber-100/90 text-amber-900 border border-amber-200 uppercase tracking-tight">
                          {p.nikahId}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <span className="text-[10px] text-gray-500 font-bold">
                          {isGroom ? (isTamil ? 'மணமகன்' : 'Groom') : (isTamil ? 'மணமகள்' : 'Bride')}
                        </span>
                        {onToggleShortlist && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleShortlist(p);
                            }}
                            className={`pointer-events-auto p-1 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${
                              shortlistedIds.includes(p.id || p._id || p.nikahId)
                                ? 'bg-amber-400 text-amber-950 shadow-xs ring-1 ring-amber-500'
                                : 'bg-gray-100 hover:bg-amber-100 text-gray-400 hover:text-amber-700'
                            }`}
                            title={
                              shortlistedIds.includes(p.id || p._id || p.nikahId)
                                ? (isTamil ? 'தேர்வு செய்யப்பட்டது (நீக்க கிளிக் செய்க)' : 'Shortlisted (Click to unselect)')
                                : (isTamil ? 'வரனைத் தேர்வு செய்க' : 'Choose Profile')
                            }
                          >
                            <FaStar className={`text-[10px] ${shortlistedIds.includes(p.id || p._id || p.nikahId) ? 'fill-current text-amber-950' : ''}`} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Candidate Name */}
                    {visible.name !== false && (
                      <h4 className="font-extrabold text-xs sm:text-[13px] text-[#163828] truncate leading-tight">
                        {getProfileName(p)}
                      </h4>
                    )}

                    {/* Age & Marital Status */}
                    <div className="text-[11px] text-gray-700 font-semibold flex items-center gap-1.5 flex-wrap mt-0.5">
                      {visible.age !== false && (
                        <span>
                          {p.age} {isTamil ? 'வயது' : 'Yrs'}
                        </span>
                      )}
                      {visible.maritalStatus && p.maritalStatus && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600 truncate">{translateValue(p.maritalStatus)}</span>
                        </>
                      )}
                    </div>

                    {/* Location */}
                    {visible.location !== false && (p.district || p.location) && (
                      <p className="text-[10px] text-gray-600 truncate flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="text-amber-600 text-[9px] flex-shrink-0" />
                        <span>{translateValue(p.district || p.location)}</span>
                      </p>
                    )}

                    {/* Education */}
                    {visible.education !== false && p.education && (
                      <p className="text-[10px] text-gray-600 truncate flex items-center gap-1 mt-0.5">
                        <FaGraduationCap className="text-emerald-700 text-[10px] flex-shrink-0" />
                        <span>{translateValue(p.education)}</span>
                      </p>
                    )}

                    {/* Occupation */}
                    {visible.occupation !== false && p.occupation && (
                      <p className="text-[10px] text-gray-600 truncate flex items-center gap-1 mt-0.5">
                        <FaBriefcase className="text-blue-700 text-[9px] flex-shrink-0" />
                        <span>{translateValue(p.occupation)}</span>
                      </p>
                    )}

                    {/* Monthly Income */}
                    {visible.monthlyIncome && p.monthlyIncome && (
                      <p className="text-[10px] text-amber-900 font-bold truncate mt-0.5">
                        💰 {translateValue(p.monthlyIncome)}
                      </p>
                    )}

                    {/* Height */}
                    {visible.height && p.height && (
                      <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                        📏 {translateValue(p.height)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

        {/* Small Payment Option Directly Below the Running Bar */}
        <div className="mt-2 pt-2 border-t border-[#caa85d]/40 flex flex-col sm:flex-row items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1.5 text-gray-800 text-[11px] sm:text-xs font-bold text-center sm:text-left">
            <span className="text-amber-600 animate-pulse text-sm">⚡</span>
            <span>
              {isTamil
                ? `உங்கள் வரனையும் இந்த ஓடும் பட்டியில் ${marqueeConfig.durationDays} நாட்கள் முன்னிலைப்படுத்த வேண்டுமா?`
                : `Want to feature your profile in this running bar for ${marqueeConfig.durationDays} days?`}
            </span>
          </div>

          {isUserFeatured ? (
            <div className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-100/90 border border-emerald-300 text-emerald-800 font-extrabold text-[11px] rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
              <span className="text-emerald-700 font-black">✓</span>
              <span>
                {isTamil
                  ? 'ஏற்கனவே ஓடும் பட்டியில் காட்சிப்படுத்தப்பட்டுள்ளது (செயலில் உள்ளது)'
                  : 'Already Paid & Featured in Running Bar (Active)'}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenPromoteModal}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 font-black text-[11px] rounded-lg shadow-sm border border-amber-300/80 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FaCrown className="text-[#163828] text-xs" />
              <span>
                {isTamil
                  ? `இப்போது விளம்பரம் செய்க (₹${marqueeConfig.price} / ${marqueeConfig.durationDays} நாட்கள்)`
                  : `Promote Here (₹${marqueeConfig.price} / ${marqueeConfig.durationDays} Days)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
