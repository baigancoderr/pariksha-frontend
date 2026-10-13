import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen, Zap, Globe, BarChart3, ArrowRight,
  CheckCircle, Shield, Clock, Users
} from 'lucide-react';

export function LandingPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: CheckCircle, title: t('landing.feat_free'), desc: t('landing.feat_free_desc'), color: 'text-success-500' },
    { icon: Globe, title: t('landing.feat_bilingual'), desc: t('landing.feat_bilingual_desc'), color: 'text-primary-500' },
    { icon: Zap, title: t('landing.feat_instant'), desc: t('landing.feat_instant_desc'), color: 'text-accent-400' },
    { icon: BarChart3, title: t('landing.feat_progress'), desc: t('landing.feat_progress_desc'), color: 'text-primary-700' },
  ];

  const stats = [
    { label: 'Mock Tests', value: 'Free', icon: BookOpen },
    { label: 'Languages', value: '2', icon: Globe },
    { label: 'Instant Results', value: '✓', icon: Clock },
    { label: 'Students', value: 'Growing', icon: Users },
  ];

  return (
    <div className="-m-4 lg:-m-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <Shield className="h-4 w-4 text-accent-400" />
              MP Police Constable 2026
            </div>

            <h1 className="text-4xl font-extrabold leading-tight text-white lg:text-5xl xl:text-6xl">
              {t('landing.hero_title')}
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              {t('landing.hero_subtitle')}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={isAuthenticated ? '/mock-tests' : '/register'}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-primary-700 shadow-lg shadow-black/10 transition-all hover:bg-primary-50 hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('landing.start_free')}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/exams"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                {t('landing.explore_exams')}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-center gap-3 py-5">
                <s.icon className="h-5 w-5 text-accent-400" />
                <div>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/60">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-surface-900 lg:text-4xl">
            {t('landing.features_title')}
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-primary-600" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-surface-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-primary-200 hover:shadow-md hover:-translate-y-1"
            >
              <div className={`inline-flex rounded-xl bg-surface-50 p-3 ${f.color} group-hover:bg-primary-50 transition-colors`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-surface-800">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-surface-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center lg:py-20">
          <h2 className="text-3xl font-bold text-white">
            {isAuthenticated ? t('dashboard.available_tests') : t('landing.start_free')}
          </h2>
          <p className="mt-4 text-white/80">
            {t('landing.hero_subtitle')}
          </p>
          <Link
            to={isAuthenticated ? '/mock-tests' : '/register'}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-bold text-primary-700 shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
          >
            {isAuthenticated ? t('exam.start_test') : t('auth.sign_up')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-sm text-surface-500">
            © 2026 ParikshaBhumi. All rights reserved. | Demo Content Only
          </p>
        </div>
      </footer>
    </div>
  );
}
