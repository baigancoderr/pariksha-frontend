import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBilingualText } from '@/hooks/useBilingualText';
import api from '@/lib/api';
import type { Result, Question, ApiResponse } from '@/types';
import { Loader } from '@/components/ui/Loader';
import {
  Award, CheckCircle, XCircle, MinusCircle, Clock,
  BarChart3, ArrowLeft, Target
} from 'lucide-react';

export function ResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { t } = useTranslation();
  const bt = useBilingualText();
  const [result, setResult] = useState<Result | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ResultPage mounted, attemptId:', attemptId);
    api.get<ApiResponse<Result>>(`/attempts/${attemptId}/result`)
      .then((response) => {
        console.log('Result data:', response.data);
        const resultData = response.data.data as any; // Backend returns questions too
        setResult(resultData);
        setQuestions(resultData.questions || []);
        console.log('Questions loaded:', resultData.questions?.length || 0);
      })
      .catch((error) => {
        console.error('Error loading result:', error);
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="md" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="py-20 text-center">
        <p className="text-lg text-surface-500">{t('common.error')}</p>
        <p className="text-sm text-surface-400 mt-2">Result not found. Please try again.</p>
        <Link to="/dashboard" className="mt-4 inline-block text-primary-600 hover:underline">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const questionMap = new Map(questions.map((q) => [q._id, q]));

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> {t('result.back_to_dashboard')}
      </Link>

      {/* Score card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 p-6 lg:p-8 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-6 w-6 text-accent-400" />
          <h1 className="text-2xl font-bold">{t('result.test_result')}</h1>
        </div>
        {result.mockTest && typeof result.mockTest !== 'string' && (
          <p className="text-white/70 mb-6">{bt(result.mockTest.title)}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
            <p className="text-3xl font-extrabold">{result.marksObtained}</p>
            <p className="text-xs text-white/60 mt-1">{t('result.score')} / {result.maxMarks}</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
            <p className="text-3xl font-extrabold">{result.accuracy}%</p>
            <p className="text-xs text-white/60 mt-1">{t('result.accuracy')}</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
            <p className="text-3xl font-extrabold">{result.percentage}%</p>
            <p className="text-xs text-white/60 mt-1">{t('result.percentage')}</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 text-center">
            <p className="text-3xl font-extrabold">{formatTime(result.timeTakenSeconds)}</p>
            <p className="text-xs text-white/60 mt-1">{t('result.time_taken')}</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm">
          <CheckCircle className="h-8 w-8 text-success-500" />
          <div>
            <p className="text-2xl font-bold text-surface-900">{result.correct}</p>
            <p className="text-xs text-surface-500">{t('result.correct')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm">
          <XCircle className="h-8 w-8 text-danger-500" />
          <div>
            <p className="text-2xl font-bold text-surface-900">{result.incorrect}</p>
            <p className="text-xs text-surface-500">{t('result.incorrect')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-4 shadow-sm">
          <MinusCircle className="h-8 w-8 text-surface-400" />
          <div>
            <p className="text-2xl font-bold text-surface-900">{result.unanswered}</p>
            <p className="text-xs text-surface-500">{t('result.unanswered')}</p>
          </div>
        </div>
      </div>

      {/* Subject-wise analysis */}
      {result.subjectResults.length > 0 && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900 mb-4">
            <Target className="h-5 w-5 text-primary-600" />
            {t('result.subject_analysis')}
          </h2>
          <div className="space-y-4">
            {result.subjectResults.map((sr) => {
              const pct = sr.maxMarks > 0 ? Math.round((sr.marksObtained / sr.maxMarks) * 100) : 0;
              return (
                <div key={sr.subjectId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-surface-700">{sr.subjectName}</span>
                    <span className="text-sm text-surface-500">
                      {sr.marksObtained}/{sr.maxMarks} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 70 ? 'bg-success-500' : pct >= 40 ? 'bg-accent-400' : 'bg-danger-500'
                      }`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 flex gap-3 text-xs text-surface-400">
                    <span>✓ {sr.correct}</span>
                    <span>✗ {sr.incorrect}</span>
                    <span>— {sr.unanswered}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Question-by-question review */}
      <div className="rounded-2xl border border-surface-200 bg-white shadow-sm">
        <div className="flex w-full items-center justify-between p-6 bg-primary-50 border-b border-surface-200">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-surface-900">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            Question-by-Question Review ({result.totalQuestions} Questions)
          </h2>
        </div>

        <div className="divide-y divide-surface-100">
            {result.questionResults.map((qr, idx) => {
              const q = questionMap.get(qr.questionId);
              return (
                <div key={qr.questionId} className="p-4 lg:p-6">
                  <div className="flex items-start gap-3">
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      qr.isCorrect ? 'bg-success-500 text-white' : qr.isUnanswered ? 'bg-surface-200 text-surface-500' : 'bg-danger-500 text-white'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-base font-medium text-surface-800 mb-2">{q ? bt(q.questionText) : `Question ${idx + 1}`}</p>
                      <div className="mb-3 flex gap-3 text-xs">
                        {qr.isUnanswered ? (
                          <span className="text-surface-400">❌ {t('result.unanswered')}</span>
                        ) : qr.isCorrect ? (
                          <span className="text-success-600 font-semibold">✅ {t('result.correct')} (+{qr.marksAwarded} marks)</span>
                        ) : (
                          <span className="text-danger-600 font-semibold">❌ {t('result.incorrect')} ({qr.marksAwarded} marks)</span>
                        )}
                      </div>

                      {q && (
                        <div className="space-y-2">
                          {/* Options */}
                          {q.options.map((opt) => {
                            const isCorrect = opt.id === qr.correctOption;
                            const isSelected = opt.id === qr.selectedOption;
                            return (
                              <div
                                key={opt.id}
                                className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${
                                  isCorrect
                                    ? 'border-success-500 bg-success-50'
                                    : isSelected && !isCorrect
                                      ? 'border-danger-500 bg-danger-50'
                                      : 'border-surface-200 bg-white'
                                }`}
                              >
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                  isCorrect ? 'bg-success-500 text-white' : isSelected ? 'bg-danger-500 text-white' : 'bg-surface-100 text-surface-600'
                                }`}>
                                  {opt.id}
                                </span>
                                <span className={`flex-1 ${isCorrect ? 'font-semibold text-success-700' : isSelected ? 'text-danger-700' : 'text-surface-700'}`}>
                                  {bt(opt.text)}
                                </span>
                                {isCorrect && (
                                  <span className="flex items-center gap-1 text-xs font-semibold text-success-600">
                                    <CheckCircle className="h-4 w-4" /> Correct Answer
                                  </span>
                                )}
                                {isSelected && !isCorrect && (
                                  <span className="flex items-center gap-1 text-xs font-semibold text-danger-600">
                                    <XCircle className="h-4 w-4" /> Your Answer
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          
                          {/* Explanation - Always show */}
                          {q.explanation ? (
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mt-3">
                              <div className="flex items-start gap-2">
                                <span className="text-blue-600 font-semibold text-sm">💡 Explanation:</span>
                                <p className="text-sm text-blue-900 leading-relaxed">{bt(q.explanation)}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg bg-surface-50 border border-surface-200 p-3 mt-3">
                              <p className="text-xs text-surface-500 italic">No explanation available for this question.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}
