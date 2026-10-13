import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left – Illustration panel (like the CRM reference) */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 items-center justify-center p-12">
        {/* Decorative bg blobs */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm shadow-2xl">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Empowering Students<br />Through Smart Exam<br />Preparation
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-md mx-auto">
            Free mock tests, instant results, bilingual support. Crack your competitive exam with ParikshaBhumi.
          </p>
        </div>
      </div>

      {/* Right – Login form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              {t('app_name')}
            </h2>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-surface-900">{t('auth.sign_in')}</h2>
            <p className="mt-1 text-surface-500">{t('auth.sign_in_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">
                {t('auth.email')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="your@email.com"
                />
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-2.5 text-sm text-danger-500">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? t('auth.signing_in') : t('auth.sign_in')}
            </button>
          </form>

          {/* Link to register */}
          <p className="mt-6 text-center text-sm text-surface-500">
            {t('auth.no_account')}{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              {t('auth.sign_up')}
            </Link>
          </p>

          <p className="mt-12 text-center text-xs text-surface-400">
            © 2026 ParikshaBhumi
          </p>
        </div>
      </div>
    </div>
  );
}
