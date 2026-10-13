import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
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
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message
        || err?.response?.data?.error?.details?.map((d: any) => d.message).join(', ')
        || 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 items-center justify-center p-12">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-600/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm shadow-2xl">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Join Thousands of<br />Aspiring Officers<br />Preparing Here
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-md mx-auto">
            Create your free account and start your competitive exam preparation journey today.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-surface-900">{t('auth.sign_up')}</h2>
            <p className="mt-1 text-surface-500">{t('auth.sign_up_subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">{t('auth.name')}</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Rahul Sharma"
                />
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">{t('auth.email')}</label>
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-700">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-all focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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
              <p className="mt-1 text-xs text-surface-400">Min 8 chars, 1 uppercase, 1 lowercase, 1 number</p>
            </div>

            {error && (
              <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-2.5 text-sm text-danger-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:opacity-60"
            >
              {loading ? t('auth.signing_up') : t('auth.sign_up')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            {t('auth.has_account')}{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              {t('auth.sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
