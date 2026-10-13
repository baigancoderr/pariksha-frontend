import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Result, Question } from '@/types';
import { API_BASE_URL, ROUTES } from '@/config/constants';

interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl: string | null;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  rank: number;
}

interface DailyLeaderboard {
  date: string;
  participantCount: number;
  top: LeaderboardEntry[];
  currentUser: Omit<LeaderboardEntry, 'userId' | 'name' | 'avatarUrl'> | null;
}

const apiOrigin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const Results: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<Result | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<DailyLeaderboard | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const toast = useToast();

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      setIsLoadingLeaderboard(true);
      setLeaderboard(null);
      setLeaderboardError('');
      const response = await api.get(`/attempts/${attemptId}/result`);
      if (response.data.success) {
        const resultData = response.data.data;
        setResult(resultData);
        
        // Questions are already included in result data
        setQuestions(resultData.questions || []);
        setIsLoading(false);
        try {
          const leaderboardResponse = await api.get(`/attempts/${attemptId}/leaderboard`, {
            params: {
              date: getLocalDate(),
              timezoneOffsetMinutes: new Date().getTimezoneOffset(),
            },
          });
          setLeaderboard(leaderboardResponse.data.data);
        } catch (leaderboardRequestError) {
          console.error('Failed to load daily leaderboard:', leaderboardRequestError);
          setLeaderboardError('Could not load today’s leaderboard.');
        } finally {
          setIsLoadingLeaderboard(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch result:', error);
      toast.error('Failed to load result');
      navigate(ROUTES.STUDENT_DASHBOARD);
    } finally {
      setIsLoading(false);
      setIsLoadingLeaderboard(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading results..." />
      </div>
    );
  }

  if (!result) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-lg text-gray-900">Result not found</p>
        </div>
      </Card>
    );
  }

  const percentage = result.percentage || 0;
  const isPassed = percentage >= 40; // Assuming 40% is passing
  const mockTestTitle = typeof result.mockTest === 'object'
    ? result.mockTest.title.en
    : 'Mock Test';
  const resultDate = new Date(result.calculatedAt).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="mx-auto max-w-8xl space-y-6 pb-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Test Results</h1>
          <p className="mt-1 text-sm text-gray-500">{mockTestTitle}</p>
        </div>
        <p className="text-sm text-gray-500">Completed {resultDate}</p>
      </div>

      <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 shadow-lg" padding="none">
        <div className="grid gap-6 p-5 text-white sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Badge variant={isPassed ? 'success' : 'danger'} size="lg">
              {isPassed ? 'Passed' : 'Not passed'}
            </Badge>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              {isPassed ? 'Great work!' : 'Keep practicing!'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
              {isPassed
                ? 'You reached the passing score. Review your answers below and keep building on this progress.'
                : 'Review the questions below to see where you can improve on your next attempt.'}
            </p>
            <div className="mt-6 max-w-lg">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-indigo-100">Overall score</span>
                <span className="font-semibold">{percentage.toFixed(1)}%</span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-white/20"
                role="progressbar"
                aria-label="Overall score"
                aria-valuenow={Math.min(100, Math.max(0, percentage))}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300 transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 md:flex-col md:gap-3 md:text-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[6px] border-white/20 bg-white/10 shadow-inner sm:h-36 sm:w-36">
              <div className="text-center">
                <p className="text-3xl font-bold tracking-tight sm:text-4xl">{percentage.toFixed(1)}%</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-indigo-100">Your score</p>
              </div>
            </div>
            <p className="text-sm text-indigo-100">
              <span className="block text-xl font-bold text-white">{result.marksObtained} / {result.maxMarks}</span>
              marks earned
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Correct', value: result.correct, color: 'text-emerald-700', icon: '✓' },
          { label: 'Incorrect', value: result.incorrect, color: 'text-rose-700', icon: '×' },
          { label: 'Unanswered', value: result.unanswered, color: 'text-amber-700', icon: '—' },
          { label: 'Time taken', value: formatDuration(result.timeTakenSeconds), color: 'text-indigo-700', icon: '◷' },
        ].map((stat) => (
          <Card key={stat.label} className="border-gray-100 shadow-sm" padding="sm">
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-xl font-bold ${stat.color}`}>
                {stat.icon}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="truncate text-xs font-medium text-gray-500 sm:text-sm">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card
        className="overflow-hidden"
        padding="none"
        title="Today’s leaderboard"
        subtitle="See how you compare with everyone who completed this mock test today."
        action={leaderboard && (
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            {leaderboard.participantCount} {leaderboard.participantCount === 1 ? 'participant' : 'participants'}
          </span>
        )}
      >
        {isLoadingLeaderboard ? (
          <div className="flex min-h-40 items-center justify-center">
            <Loader size="md" text="Loading today’s leaderboard..." />
          </div>
        ) : leaderboardError ? (
          <div role="alert" className="m-5 rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-700 sm:m-6">
            <p className="font-semibold">Leaderboard unavailable</p>
            <p className="mt-1">{leaderboardError}</p>
          </div>
        ) : leaderboard ? (
          <div>
            <div className="border-b border-gray-100 bg-gradient-to-b from-indigo-50/70 to-white px-5 py-6 sm:px-6">
              {leaderboard.currentUser ? (
                <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-200">
                      #{leaderboard.currentUser.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">Your rank today</p>
                      <p className="mt-0.5 text-sm text-gray-500">Your best completed score in this test today</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pl-16 sm:pl-0 sm:text-right">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {leaderboard.currentUser.marksObtained}<span className="font-medium text-gray-400">/{leaderboard.currentUser.maxMarks}</span>
                      </p>
                      <p className="text-xs text-gray-500">marks</p>
                    </div>
                    <span className="h-9 w-px bg-gray-200" />
                    <div>
                      <p className="text-lg font-bold text-indigo-700">{leaderboard.currentUser.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">score</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
                  You don’t have a completed score in today’s leaderboard yet.
                </div>
              )}
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">Top performers</h3>
                  <p className="mt-0.5 text-xs text-gray-500">Ranked by score, then time taken</p>
                </div>
                {leaderboard.date && (
                  <span className="text-xs font-medium text-gray-500">
                    {new Date(`${leaderboard.date}T12:00:00`).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                )}
              </div>

              {leaderboard.top.length > 0 ? (
                <ol className="grid gap-3 sm:grid-cols-3">
                  {leaderboard.top.map((entry) => (
                    <li
                      key={entry.userId}
                      className={`relative flex min-w-0 items-center gap-3 overflow-hidden rounded-2xl border p-4 transition-shadow hover:shadow-md ${
                        leaderboard.currentUser?.rank === entry.rank
                          ? 'border-indigo-200 bg-indigo-50/70'
                          : entry.rank === 1
                            ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white'
                            : entry.rank === 2
                              ? 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
                              : 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'
                      }`}
                    >
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : entry.rank === 2
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-orange-200 text-orange-900'
                      }`}>
                        {String(entry.rank).padStart(2, '0')}
                      </span>
                      {entry.avatarUrl ? (
                        <img
                          src={`${apiOrigin}${entry.avatarUrl}`}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ) : (
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gray-100 font-semibold text-gray-600 shadow-sm">
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {entry.name}{leaderboard.currentUser?.rank === entry.rank ? ' (You)' : ''}
                        </span>
                        <span className="mt-0.5 block text-xs text-gray-500">{entry.marksObtained} / {entry.maxMarks} marks</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-base font-bold text-gray-900">{entry.percentage.toFixed(1)}%</span>
                        <span className="text-[11px] text-gray-500">score</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <p className="font-medium text-gray-800">No scores yet today</p>
                  <p className="mt-1 text-sm text-gray-500">Be the first to complete this mock test.</p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{result.totalQuestions}</p>
            <p className="text-sm text-gray-600">Total Questions</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{result.correct}</p>
            <p className="text-sm text-gray-600">Correct</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{result.incorrect}</p>
            <p className="text-sm text-gray-600">Incorrect</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{result.unanswered}</p>
            <p className="text-sm text-gray-600">Unanswered</p>
          </div>
        </Card>
      </div>

      {/* Subject-wise Performance */}
      {result.subjectResults && result.subjectResults.length > 0 && (
        <Card title="Subject-wise Performance">
          <div className="space-y-4">
            {result.subjectResults.map((subject, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{subject.subjectName}</h3>
                  <Badge variant="info">
                    {subject.marksObtained}/{subject.maxMarks}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="text-green-600">✓ {subject.correct} Correct</span>
                  <span className="text-red-600">✗ {subject.incorrect} Incorrect</span>
                  <span className="text-gray-500">— {subject.unanswered} Unanswered</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Answer Review */}
      <Card title="Answer Review">
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 text-sm rounded-lg ${
              language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 text-sm rounded-lg ${
              language === 'hi' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            हिंदी
          </button>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => {
            const questionResult = result.questionResults.find((qr) => qr.questionId === question._id);
            if (!questionResult) return null;

            const isCorrect = questionResult.isCorrect;
            const isUnanswered = questionResult.isUnanswered;

            return (
              <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                  <Badge variant={isCorrect ? 'success' : isUnanswered ? 'default' : 'danger'}>
                    {isCorrect ? '✓ Correct' : isUnanswered ? 'Not Answered' : '✗ Incorrect'}
                  </Badge>
                </div>

                <p className="text-gray-900 mb-4">
                  {language === 'en' ? question.questionText.en : (question.questionText.hi || question.questionText.en)}
                </p>

                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = questionResult.selectedOption === option.id;
                    const isCorrectOption = question.correctOption === option.id;
                    const optionText = language === 'en' ? option.text.en : (option.text.hi || option.text.en);

                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border-2 ${
                          isCorrectOption
                            ? 'border-green-500 bg-green-50'
                            : isSelected && !isCorrect
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <p className="flex-1">{optionText}</p>
                          {isCorrectOption && <span className="text-green-600 font-semibold">✓</span>}
                          {isSelected && !isCorrect && <span className="text-red-600 font-semibold">✗</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (question.explanation.en || question.explanation.hi) && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800">
                      {language === 'en' ? question.explanation.en : (question.explanation.hi || question.explanation.en)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
