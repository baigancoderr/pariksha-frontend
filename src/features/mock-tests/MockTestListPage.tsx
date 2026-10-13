import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBilingualText } from '@/hooks/useBilingualText';
import { api } from '@/lib/api';
import type { MockTest, ApiResponse } from '@/types';
import { Loader } from '@/components/ui/Loader';
import { Clock, BarChart3, ArrowRight, FileText, Search } from 'lucide-react';

export function MockTestListPage() {
  const { t } = useTranslation();
  const bt = useBilingualText();
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get<ApiResponse<MockTest[]>>('/mock-tests?limit=50')
      .then((res) => setTests(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tests.filter((t) =>
    bt(t.title).toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{t('nav.mock_tests')}</h1>
          <p className="mt-1 text-sm text-surface-500">{filtered.length} tests available</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search') + '...'}
            className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-surface-300" />
          <p className="mt-4 text-surface-500">{t('common.no_data')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((test) => (
            <div
              key={test._id}
              className="group flex flex-col rounded-xl border border-surface-200 bg-white shadow-sm transition-all hover:border-primary-200 hover:shadow-md"
            >
              <div className="flex-1 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-md bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {test.type.replace(/_/g, ' ')}
                  </span>
                  {test.isFree && (
                    <span className="rounded-full bg-success-500/10 px-2 py-0.5 text-xs font-medium text-success-500">
                      FREE
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-surface-800 line-clamp-2 mb-2">
                  {bt(test.title)}
                </h3>
                {test.description && (
                  <p className="text-sm text-surface-500 line-clamp-2">{bt(test.description)}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-xs text-surface-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {test.durationMinutes} {t('exam.minutes')}
                  </span>
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" /> {test.totalMarks} {t('exam.marks')}
                  </span>
                  {test.questionCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> {test.questionCount} Q
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t border-surface-100 p-4">
                <Link
                  to={`/mock-tests/${test._id}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary-50 py-2.5 text-sm font-medium text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white"
                >
                  {t('exam.start_test')}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
