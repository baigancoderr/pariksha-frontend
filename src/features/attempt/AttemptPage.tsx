import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBilingualText } from '@/hooks/useBilingualText';
import { api } from '@/lib/api';
import type { Attempt, AttemptAnswer, ApiResponse } from '@/types';
import { Loader } from '@/components/ui/Loader';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle,
  Send, Save, AlertTriangle, X
} from 'lucide-react';

export function AttemptPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { t } = useTranslation();
  const bt = useBilingualText();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Load attempt
  useEffect(() => {
    api.get<ApiResponse<Attempt>>(`/attempts/${attemptId}`)
      .then((res) => {
        const data = res.data.data;
        setAttempt(data);
        setAnswers(data.answers);

        // Calculate initial time left
        const expiresMs = new Date(data.expiresAt).getTime();
        const remaining = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (data.status !== 'IN_PROGRESS') {
          navigate(`/results/${attemptId}`, { replace: true });
        }
      })
      .catch(() => setError('Failed to load attempt'))
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 && attempt?.status === 'IN_PROGRESS') {
      handleSubmit();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, attempt?.status]);

  // Auto-save every 30 seconds
  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      persistAnswers();
    }, 30_000);
    return () => clearInterval(saveTimerRef.current);
  }, [answers]);

  const persistAnswers = useCallback(async () => {
    const changed = answers.filter((a) => a.selectedOption || a.state !== 'UNANSWERED');
    if (changed.length === 0) return;
    setSaving(true);
    try {
      await api.patch(`/attempts/${attemptId}/answers`, { answers: changed });
    } catch { /* silent – UI shows save status */ }
    finally { setSaving(false); }
  }, [answers, attemptId]);

  const selectOption = (optionId: string) => {
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== currentIndex) return a;
        const isClearing = a.selectedOption === optionId;
        return {
          ...a,
          selectedOption: isClearing ? undefined : optionId,
          state: isClearing
            ? (a.state === 'ANSWERED_AND_MARKED' ? 'MARKED_FOR_REVIEW' : 'UNANSWERED')
            : (a.state === 'MARKED_FOR_REVIEW' ? 'ANSWERED_AND_MARKED' : 'ANSWERED'),
        };
      }),
    );
  };

  const toggleReview = () => {
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== currentIndex) return a;
        if (a.state === 'MARKED_FOR_REVIEW') return { ...a, state: 'UNANSWERED' };
        if (a.state === 'ANSWERED_AND_MARKED') return { ...a, state: 'ANSWERED' };
        if (a.state === 'ANSWERED') return { ...a, state: 'ANSWERED_AND_MARKED' };
        return { ...a, state: 'MARKED_FOR_REVIEW' };
      }),
    );
  };

  const clearAnswer = () => {
    setAnswers((prev) =>
      prev.map((a, i) =>
        i === currentIndex ? { ...a, selectedOption: undefined, state: 'UNANSWERED' } : a,
      ),
    );
  };

  const goNext = () => {
    if (currentIndex < (attempt?.questions.length ?? 0) - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await persistAnswers();
      await api.post(`/attempts/${attemptId}/submit`);
      navigate(`/results/${attemptId}`, { replace: true });
    } catch {
      setError('Submission failed. Trying again...');
      // Retry once
      try {
        await api.post(`/attempts/${attemptId}/submit`);
        navigate(`/results/${attemptId}`, { replace: true });
      } catch { setError('Submission failed. Please check your internet.'); }
    } finally {
      setSubmitting(false);
      setSubmitModal(false);
    }
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!attempt || error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-danger-500" />
          <p className="mt-4 text-surface-600">{error || 'Failed to load'}</p>
        </div>
      </div>
    );
  }

  const question = attempt.questions[currentIndex];
  const answer = answers[currentIndex];
  const answeredCount = answers.filter((a) => a.state === 'ANSWERED' || a.state === 'ANSWERED_AND_MARKED').length;
  const reviewCount = answers.filter((a) => a.state === 'MARKED_FOR_REVIEW' || a.state === 'ANSWERED_AND_MARKED').length;
  const unansweredCount = answers.filter((a) => a.state === 'UNANSWERED').length;
  const isLowTime = timeLeft < 60;

  return (
    <div className="fixed inset-0 flex flex-col bg-surface-50 -m-4 lg:-m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-surface-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-surface-700">
            {t('test.question')} {currentIndex + 1} {t('test.of')} {attempt.questions.length}
          </span>
        </div>

        <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${
          isLowTime ? 'bg-danger-500/10 text-danger-500 animate-pulse-soft' : 'bg-surface-100 text-surface-700'
        }`}>
          <Clock className="h-4 w-4" />
          {formatTime(timeLeft)}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400">
            {saving ? t('test.saving') : t('test.saved')}
          </span>
          <button
            onClick={() => setSubmitModal(true)}
            className="rounded-lg bg-danger-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
          >
            <Send className="inline h-4 w-4 mr-1" />
            {t('test.submit_test')}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-3xl animate-fade-in" key={currentIndex}>
            {/* Question text */}
            <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm mb-6">
              <p className="text-base leading-relaxed text-surface-800">
                <span className="font-bold text-primary-600 mr-2">Q{currentIndex + 1}.</span>
                {bt(question?.questionText)}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question?.options.map((opt) => {
                const isSelected = answer?.selectedOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectOption(opt.id)}
                    className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-surface-200 bg-white hover:border-primary-200 hover:bg-primary-50/30'
                    }`}
                  >
                    <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-100 text-surface-600'
                    }`}>
                      {opt.id}
                    </span>
                    <span className="text-sm text-surface-700">{bt(opt.text)}</span>
                    {isSelected && <CheckCircle className="ml-auto h-5 w-5 text-primary-600 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={clearAnswer}
                className="rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50"
              >
                {t('test.clear_answer')}
              </button>
              <button
                onClick={toggleReview}
                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  answer?.state === 'MARKED_FOR_REVIEW' || answer?.state === 'ANSWERED_AND_MARKED'
                    ? 'border-accent-400 bg-accent-400/10 text-accent-500'
                    : 'border-surface-200 text-surface-600 hover:bg-surface-50'
                }`}
              >
                <Flag className="h-4 w-4" />
                {t('test.mark_review')}
              </button>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={goPrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 rounded-lg border border-surface-200 px-4 py-2 text-sm font-medium text-surface-600 hover:bg-surface-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> {t('test.previous')}
                </button>
                <button
                  onClick={() => { persistAnswers(); goNext(); }}
                  disabled={currentIndex >= attempt.questions.length - 1}
                  className="flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-40"
                >
                  {t('test.save_next')} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Question palette sidebar */}
        <div className="hidden lg:flex w-72 flex-col border-l border-surface-200 bg-white">
          <div className="border-b border-surface-200 p-4">
            <h3 className="text-sm font-semibold text-surface-700 mb-3">{t('test.question_palette')}</h3>
            <div className="flex flex-wrap gap-1.5 text-[11px] text-surface-500">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-success-500" /> {t('test.answered')} ({answeredCount})</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-surface-200" /> {t('test.unanswered')} ({unansweredCount})</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-accent-400" /> {t('test.review')} ({reviewCount})</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {answers.map((a, i) => {
                let bgClass = 'bg-surface-100 text-surface-600 hover:bg-surface-200';
                if (a.state === 'ANSWERED') bgClass = 'bg-success-500 text-white';
                if (a.state === 'MARKED_FOR_REVIEW') bgClass = 'bg-accent-400 text-white';
                if (a.state === 'ANSWERED_AND_MARKED') bgClass = 'bg-primary-500 text-white';

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold transition-all ${bgClass} ${
                      i === currentIndex ? 'ring-2 ring-primary-600 ring-offset-1' : ''
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {submitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-surface-900">{t('test.submit_test')}</h3>
              <button onClick={() => setSubmitModal(false)} className="rounded-md p-1 hover:bg-surface-100">
                <X className="h-5 w-5 text-surface-400" />
              </button>
            </div>

            <p className="text-surface-600 mb-2">{t('test.submit_confirm')}</p>

            {unansweredCount > 0 && (
              <div className="rounded-lg bg-warning-500/10 border border-warning-500/20 p-3 text-sm text-amber-700 mb-4">
                <AlertTriangle className="inline h-4 w-4 mr-1" />
                {t('test.submit_warning', { unanswered: unansweredCount })}
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="rounded-lg bg-success-500/10 p-3">
                <p className="text-lg font-bold text-success-500">{answeredCount}</p>
                <p className="text-xs text-surface-500">{t('test.answered')}</p>
              </div>
              <div className="rounded-lg bg-surface-100 p-3">
                <p className="text-lg font-bold text-surface-600">{unansweredCount}</p>
                <p className="text-xs text-surface-500">{t('test.unanswered')}</p>
              </div>
              <div className="rounded-lg bg-accent-400/10 p-3">
                <p className="text-lg font-bold text-accent-500">{reviewCount}</p>
                <p className="text-xs text-surface-500">{t('test.review')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubmitModal(false)}
                className="flex-1 rounded-lg border border-surface-200 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? t('common.loading') : t('test.submit_test')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
