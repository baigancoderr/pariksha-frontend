import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  Home, BookOpen, FileText, BarChart3, Settings,
  LogOut, X, GraduationCap, ClipboardList, Shield
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-primary-50 hover:text-primary-700';
const linkActive =
  'bg-primary-50 text-primary-700 shadow-sm border-l-3 border-primary-600';
const linkInactive =
  'text-surface-600 hover:text-primary-700';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === UserRole.ADMIN;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    onClose();
  };

  const navItems = [
    { to: '/dashboard', icon: Home, label: t('nav.dashboard'), auth: true },
    { to: '/exams', icon: GraduationCap, label: t('nav.exams'), auth: false },
    { to: '/mock-tests', icon: FileText, label: t('nav.mock_tests'), auth: false },
    { to: '/my-attempts', icon: ClipboardList, label: t('nav.my_attempts'), auth: true },
  ];

  const adminItems = [
    { to: '/admin', icon: Shield, label: t('nav.admin'), auth: true },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-surface-200 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-surface-200 px-5">
        <NavLink to="/" className="flex items-center gap-2" onClick={onClose}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 shadow-md">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
            {t('app_name')}
          </span>
        </NavLink>
        <button onClick={onClose} className="rounded-md p-1 hover:bg-surface-100 lg:hidden">
          <X className="h-5 w-5 text-surface-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems
          .filter((item) => !item.auth || isAuthenticated)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-surface-200" />
            <p className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
              Admin
            </p>
            {adminItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      {isAuthenticated && user && (
        <div className="border-t border-surface-200 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-surface-50 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-surface-800">{user.name}</p>
              <p className="truncate text-xs text-surface-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-1.5 text-surface-400 hover:bg-danger-500/10 hover:text-danger-500 transition-colors"
              title={t('nav.logout')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
