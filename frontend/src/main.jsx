import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPage from './components/AdminPage.jsx'
import UserProfilePage from './components/UserProfilePage.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'

/**
 * Checks whether the current browser path matches the super admin route.
 * Handles typing "/super admin" (with space, %20, hyphen, or /superadmin).
 */
export function isSuperAdminPath(pathname = window.location.pathname) {
  try {
    const raw = String(pathname || '').trim().toLowerCase();
    const decoded = decodeURIComponent(raw).trim().toLowerCase();

    return (
      decoded === '/super admin' ||
      decoded.startsWith('/super admin/') ||
      decoded.startsWith('/super admin?') ||
      decoded.startsWith('/super admin#') ||
      raw === '/super%20admin' ||
      raw.startsWith('/super%20admin/') ||
      raw.startsWith('/super%20admin?') ||
      raw.startsWith('/super%20admin#') ||
      decoded === '/super-admin' ||
      decoded.startsWith('/super-admin/') ||
      decoded.startsWith('/super-admin?') ||
      decoded.startsWith('/super-admin#') ||
      decoded === '/superadmin' ||
      decoded.startsWith('/superadmin/') ||
      decoded.startsWith('/superadmin?') ||
      decoded.startsWith('/superadmin#')
    );
  } catch {
    return false;
  }
}

/**
 * Checks whether the current browser path matches the admin route.
 * Matches "/admin" (excluding /superadmin, /super-admin, etc.).
 */
export function isAdminPath(pathname = window.location.pathname) {
  try {
    if (isSuperAdminPath(pathname)) return false;

    const raw = String(pathname || '').trim().toLowerCase();
    const decoded = decodeURIComponent(raw).trim().toLowerCase();

    return (
      decoded === '/admin' ||
      decoded.startsWith('/admin/') ||
      decoded.startsWith('/admin?') ||
      decoded.startsWith('/admin#')
    );
  } catch {
    return false;
  }
}

/**
 * Checks whether the current browser path matches the user profile route.
 */
export function isProfilePath(pathname = window.location.pathname) {
  try {
    const raw = String(pathname || '').trim().toLowerCase();
    const decoded = decodeURIComponent(raw).trim().toLowerCase();

    return (
      decoded === '/profile' ||
      decoded.startsWith('/profile/') ||
      decoded.startsWith('/profile?') ||
      decoded.startsWith('/profile#')
    );
  } catch {
    return false;
  }
}

/**
 * Determines current route mode: 'superadmin' | 'admin' | 'user'
 */
export function getRouteMode(pathname = window.location.pathname) {
  if (isSuperAdminPath(pathname)) return 'superadmin';
  if (isAdminPath(pathname)) return 'admin';
  if (isProfilePath(pathname)) return 'profile';
  return 'user';
}

function RootRouter() {
  const [routeMode, setRouteMode] = useState(() => getRouteMode());

  useEffect(() => {
    const onLocationChange = () => {
      setRouteMode(getRouteMode());
    };

    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  return (
    <LanguageProvider>
      {routeMode === 'superadmin' ? (
        <AdminPage portalType="superadmin" />
      ) : routeMode === 'admin' ? (
        <AdminPage portalType="admin" />
      ) : routeMode === 'profile' ? (
        <UserProfilePage />
      ) : (
        <App />
      )}
    </LanguageProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootRouter />
  </StrictMode>,
)
