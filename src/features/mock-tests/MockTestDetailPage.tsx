import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBilingualText } from '@/hooks/useBilingualText';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { MockTest, ApiResponse } from '@/types';
import { Loader } from '@/components/ui/Loader';
import { Clock, BarChart3, FileText, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export function MockTestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const { t, i18n } = useTranslation();
  const bt = useBilingualText();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [test, setTest] = useState<MockTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<ApiResponse<MockTest>>(`/mock-tests/${testId}`)
      .then((res) => setTest(res.data.data))
      .catch(() => setError('Test not found'))
      .finally(() => setLoading(false));
  }, [testId]);

  const handleStart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setStarting(true);
    setError('');
    try {
      const res = await api.post<ApiResponse<{ _id: string }>>('/attempts', {
        mockTestId: testId,
        language: i18n.language,
      });
      navigate(`/attempt/${res.data.data._id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Failed to start test';
      if (err?.response?.data?.error?.code === 'ATTEMPT_IN_PROGRESS') {
        // Find existing attempt and resume
        try {
          const attRes = await api.get<any>('/attempts/me/history?limit=50');
          const existing = attRes.data.data.find(
            (a: any) => a.mockTest?._id === testId && a.status === 'IN_PROGRESS',
          );
          if (existing) {
            navigate(`/attempt/${existing._id}`);
            return;
          }
        } catch {}
      }
      setError(msg);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="py-20 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-surface-300" />
        <p className="mt-4 text-surface-500">{error || t('common.error')}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
            {test.type.replace(/_/g, ' ')}
          </span>
          {test.isFree && (
            <span className="rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-medium text-success-500">
              FREE
            </span>
          )}
        </div>

        <h1 className="text-2xl font-bold text-surface-900">{bt(test.title)}</h1>
        {test.description && (
          <p className="mt-2 text-surface-500">{bt(test.description)}</p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-surface-50 p-4 text-center">
            <Clock className="mx-auto h-5 w-5 text-primary-600 mb-1" />
            <p className="text-lg font-bold text-surface-800">{test.durationMinutes}</p>
            <p className="text-xs text-surface-500">{t('exam.minutes')}</p>
          </div>
          <div className="rounded-xl bg-surface-50 p-4 text-center">
            <BarChart3 className="mx-auto h-5 w-5 text-primary-600 mb-1" />
            <p className="text-lg font-bold text-surface-800">{test.totalMarks}</p>
            <p className="text-xs text-surface-500">{t('exam.marks')}</p>
          </div>
          <div className="rounded-xl bg-surface-50 p-4 text-center">
            <FileText className="mx-auto h-5 w-5 text-primary-600 mb-1" />
            <p className="text-lg font-bold text-surface-800">{test.questionCount || '—'}</p>
            <p className="text-xs text-surface-500">{t('exam.questions')}</p>
          </div>
        </div>
      </div>

      {/* Instructions card */}
      {test.instructions && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 lg:p-8 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900 mb-4">
            <Info className="h-5 w-5 text-primary-600" />
            Instructions
          </h2>
          <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
            <p>{bt(test.instructions)}</p>
          </div>
          <div className="mt-6 rounded-xl bg-primary-50 p-4 space-y-2">
            {[
              { text: 'Each correct answer carries positive marks', icon: CheckCircle },
              { text: 'Wrong answers carry negative marks', icon: AlertTriangle },
              { text: test.allowLanguageSwitch ? 'You can switch language during the test' : 'Language cannot be changed during test', icon: Info },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-primary-800">
                <item.icon className="h-4 w-4 flex-shrink-0 text-primary-600" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-danger-500/10 border border-danger-500/20 px-4 py-3 text-sm text-danger-500">
          {error}
        </div>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={starting}
        className="w-full rounded-xl bg-primary-600 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl disabled:opacity-60"
      >
        {starting ? t('common.loading') : t('exam.start_test')}
      </button>
    </div>
  );
}
