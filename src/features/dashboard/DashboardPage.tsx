import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useBilingualText } from '@/hooks/useBilingualText';
import { api } from '@/lib/api';
import type { MockTest, ApiResponse } from '@/types';
import { Loader } from '@/components/ui/Loader';
import {
  BookOpen, Clock, FileText, ArrowRight, BarChart3,
  Award, TrendingUp, CheckCircle
} from 'lucide-react';

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const bt = useBilingualText();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<ApiResponse<MockTest[]>>('/mock-tests?limit=6'),
      api.get<any>('/attempts/me/history?limit=5'),
    ])
      .then(([testsRes, attemptsRes]) => {
        setTests(testsRes.data.data);
        setAttempts(attemptsRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-6 lg:p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white">
          {t('dashboard.welcome')}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="mt-2 text-white/70 max-w-xl">
          {t('landing.hero_subtitle')}
        </p>
        <Link
          to="/mock-tests"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/15 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/25"
        >
          {t('exam.start_test')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: FileText, label: t('dashboard.available_tests'), value: tests.length, color: 'text-primary-600 bg-primary-50' },
          { icon: CheckCircle, label: t('result.correct'), value: attempts.filter((a: any) => a.status === 'SUBMITTED').length, color: 'text-success-500 bg-green-50' },
          { icon: TrendingUp, label: t('nav.my_attempts'), value: attempts.length, color: 'text-accent-500 bg-amber-50' },
          { icon: Award, label: t('result.accuracy'), value: '—', color: 'text-primary-700 bg-primary-50' },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className={`rounded-xl p-3 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Available tests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">{t('dashboard.available_tests')}</h2>
          <Link to="/mock-tests" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            View All →
          </Link>
        </div>
        {tests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-8 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-surface-300" />
            <p className="mt-3 text-surface-500">{t('common.no_data')}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <div
                key={test._id}
                className="group rounded-xl border border-surface-200 bg-white p-5 shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="inline-block rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700 mb-2">
                      {test.type.replace(/_/g, ' ')}
                    </p>
                    <h3 className="text-base font-semibold text-surface-800 line-clamp-2">
                      {bt(test.title)}
                    </h3>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} {t('exam.minutes')}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" /> {test.totalMarks} {t('exam.marks')}
                  </span>
                  {test.isFree && (
                    <span className="rounded-full bg-success-500/10 px-2 py-0.5 text-xs font-medium text-success-500">
                      FREE
                    </span>
                  )}
                </div>
                <Link
                  to={`/mock-tests/${test._id}`}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-50 py-2 text-sm font-medium text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white"
                >
                  {t('exam.start_test')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent attempts */}
      <section>
        <h2 className="text-lg font-semibold text-surface-900 mb-4">{t('dashboard.recent_attempts')}</h2>
        {attempts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-8 text-center">
            <p className="text-surface-500">{t('dashboard.no_attempts')}</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-surface-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead className="border-b border-surface-200 bg-surface-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-surface-600">Test</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-600 hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-surface-600 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-surface-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {attempts.map((att: any) => (
                  <tr key={att._id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-800">
                      {att.mockTest ? bt(att.mockTest.title) : 'Test'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        att.status === 'SUBMITTED'
                          ? 'bg-success-500/10 text-success-500'
                          : att.status === 'IN_PROGRESS'
                            ? 'bg-accent-400/10 text-accent-500'
                            : 'bg-surface-200 text-surface-600'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-surface-500 hidden md:table-cell">
                      {new Date(att.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={att.status === 'SUBMITTED' ? `/results/${att._id}` : `/attempt/${att._id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        {att.status === 'SUBMITTED' ? t('exam.view_results') : t('exam.resume_test')}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
