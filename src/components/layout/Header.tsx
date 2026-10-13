import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Globe, Bell, UserCircle } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const { isAuthenticated } = useAuth();

  const toggleLanguage = () => {
    const next = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(next);
    localStorage.setItem('pb_lang', next);
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white px-4 lg:px-6 shadow-sm">
      {/* Left – mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-surface-500 hover:bg-surface-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Center spacer for alignment */}
      <div className="flex-1" />

      {/* Right – actions */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 rounded-lg border border-surface-200 px-3 py-1.5 text-sm font-medium text-surface-600 transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
        >
          <Globe className="h-4 w-4" />
          <span>{i18n.language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>

        {isAuthenticated ? (
          <>
            <button className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 ml-2">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-surface-700 hover:bg-surface-100 transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
            >
              {t('nav.register')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
