import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, ROUTES } from '@/config/constants';
import api from '@/lib/api';
import { AnnouncementTicker } from '@/components/ui/AnnouncementTicker';

interface StudentAnnouncement {
  message: string;
  targetTest: string | null;
  targetTestTitle: string | null;
  targetUrl: string | null;
  updatedAt: string | null;
}

const apiOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

interface StudentLayoutProps {
  children: React.ReactNode;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [announcement, setAnnouncement] = useState<StudentAnnouncement | null>(null);
  const [announcementError, setAnnouncementError] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadAnnouncement = async () => {
      try {
        const response = await api.get('/announcements');
        if (isMounted) {
          setAnnouncement(response.data.data.message ? response.data.data : null);
          setAnnouncementError(false);
        }
      } catch (error) {
        console.error('Failed to load student announcement:', error);
        if (isMounted) setAnnouncementError(true);
      }
    };

    void loadAnnouncement();
    const refreshInterval = window.setInterval(() => void loadAnnouncement(), 60_000);
    return () => {
      isMounted = false;
      window.clearInterval(refreshInterval);
    };
  }, []);

  const menuItems = [
    {
      name: 'Dashboard',
      path: ROUTES.STUDENT_DASHBOARD,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Mock Tests',
      path: '/student/mock-tests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: 'My Attempts',
      path: '/student/attempts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: 'My Profile',
      path: ROUTES.PROFILE,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a3 3 0 11-6 0 3 3 0 016 0zM5.5 20a6.5 6.5 0 0113 0" />
        </svg>
      ),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const announcementDestination = announcement?.targetUrl
    ? { href: announcement.targetUrl, isExternal: true }
    : {
        href: announcement?.targetTest
          ? `/student/mock-tests/${announcement.targetTest}`
          : '/student/mock-tests',
        isExternal: false,
      };

  const announcementTitle = announcement?.targetTestTitle
    || (announcement?.targetUrl ? 'Open announcement link' : 'Announcement');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 w-64`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-40 overflow-hidden rounded-lg  ">
              <img src={logo} alt="Parikshabhoomi logo" className="h-full w-full object-cover" />
            </div>
         
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={`${apiOrigin}${user.avatarUrl}`} alt="" className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <span className="text-indigo-600 font-semibold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`${isSidebarOpen ? 'md:ml-64' : 'ml-0'} min-w-0 transition-all`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-16 shrink-0 bg-white border-b border-gray-200 flex items-center px-6">
          <button
            type="button"
            aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="mx-2 min-w-0 flex-1 sm:mx-4">
            {announcement ? (
              announcementDestination.isExternal ? (
                <a
                  href={announcementDestination.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="announcement-track flex h-10 min-w-0 items-center gap-2 overflow-hidden rounded-lg bg-indigo-50 px-3 text-indigo-900 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:px-4"
                  aria-label={`Open announcement link: ${announcement.message}`}
                  title={announcement.message}
                >
                  <svg className="h-4 w-4 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.586l-1.7-5.1M18 13a3 3 0 100-6m0 6a3 3 0 000-6m0 6l-2.177 1.088A8 8 0 0112.245 15H9.75a3.75 3.75 0 010-7.5h2.495a8 8 0 013.578.845L18 9.5" />
                  </svg>
                  <AnnouncementTicker message={announcement.message} className="min-w-0 flex-1 text-xs font-medium sm:text-sm" />
                </a>
              ) : (
                <Link
                  to={announcementDestination.href}
                  className="announcement-track flex h-10 min-w-0 items-center gap-2 overflow-hidden rounded-lg bg-indigo-50 px-3 text-indigo-900 transition-colors hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:px-4"
                  aria-label={`Open announcement: ${announcement.message}`}
                  title={announcement.message}
                >
                  <svg className="h-4 w-4 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.586l-1.7-5.1M18 13a3 3 0 100-6m0 6a3 3 0 000-6m0 6l-2.177 1.088A8 8 0 0112.245 15H9.75a3.75 3.75 0 010-7.5h2.495a8 8 0 013.578.845L18 9.5" />
                  </svg>
                  <AnnouncementTicker message={announcement.message} className="min-w-0 flex-1 text-xs font-medium sm:text-sm" />
                </Link>
              )
            ) : announcementError ? (
              <p role="status" className="truncate text-xs text-gray-500">Announcement unavailable</p>
            ) : null}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-4">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                onClick={() => setIsNotificationsOpen((open) => !open)}
                className="relative rounded-lg p-2 transition-colors hover:bg-gray-100"
              >
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {announcement && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
                  </div>
                  {announcement ? (
                    announcementDestination.isExternal ? (
                      <a
                        href={announcementDestination.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block p-4 transition-colors hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                      >
                        <span className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.586l-1.7-5.1M18 13a3 3 0 100-6m0 6a3 3 0 000-6m0 6l-2.177 1.088A8 8 0 0112.245 15H9.75a3.75 3.75 0 010-7.5h2.495a8 8 0 013.578.845L18 9.5" />
                            </svg>
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-gray-900">{announcementTitle}</span>
                            <span className="mt-1 block break-words text-sm leading-5 text-gray-600">{announcement.message}</span>
                            <span className="mt-2 block text-xs font-semibold text-indigo-600">Open link in new tab →</span>
                          </span>
                        </span>
                      </a>
                    ) : (
                      <Link
                        to={announcementDestination.href}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block p-4 transition-colors hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
                      >
                      <span className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.586l-1.7-5.1M18 13a3 3 0 100-6m0 6a3 3 0 000-6m0 6l-2.177 1.088A8 8 0 0112.245 15H9.75a3.75 3.75 0 010-7.5h2.495a8 8 0 013.578.845L18 9.5" />
                          </svg>
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-gray-900">{announcementTitle}</span>
                          <span className="mt-1 block break-words text-sm leading-5 text-gray-600">{announcement.message}</span>
                          <span className="mt-2 block text-xs font-semibold text-indigo-600">
                            {announcement.targetTest ? 'View mock test →' : 'View mock tests →'}
                          </span>
                        </span>
                      </span>
                      </Link>
                    )
                  ) : (
                    <p className="px-4 py-6 text-center text-sm text-gray-500">You’re all caught up.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}
    </div>
  );
};
