import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Attempt, Question } from '@/types';
import { ROUTES } from '@/config/constants';

export const TestTaking: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isQuestionPaperOpen, setIsQuestionPaperOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  const [mockTestId, setMockTestId] = useState('');
  const [visitedQuestionIds, setVisitedQuestionIds] = useState<Set<string>>(() => new Set());
  const savedVisitIds = useRef(new Set<string>());
  const toast = useToast();

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  useEffect(() => {
    if (!attempt) return;

    const question = questions[currentQuestionIndex];
    const questionId = question?._id;
    if (questionId) {
      setVisitedQuestionIds((visited) => new Set(visited).add(questionId));
      if (!savedVisitIds.current.has(questionId)) {
        savedVisitIds.current.add(questionId);
        const savedAnswer = attempt.answers.find((answer) => answer.questionId === questionId);
        void saveAnswer(
          questionId,
          savedAnswer?.selectedOption,
          savedAnswer?.state || 'UNANSWERED',
        );
      }
    }
  }, [attempt, currentQuestionIndex, questions]);

  useEffect(() => {
    if (!attempt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiryTime = new Date(attempt.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

      setTimeRemaining(remaining);

      if (remaining === 0) {
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt]);

  const fetchAttempt = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/attempts/${attemptId}`);
      if (response.data.success) {
        const attemptData = response.data.data;
        setAttempt(attemptData);
        setMockTestId(attemptData.mockTestId);
        setLanguage(attemptData.language);
        savedVisitIds.current = new Set(
          attemptData.answers
            .filter((answer: Attempt['answers'][number]) => answer.savedAt)
            .map((answer: Attempt['answers'][number]) => answer.questionId),
        );
        setVisitedQuestionIds(
          new Set(
            attemptData.answers
              .filter((answer: Attempt['answers'][number]) => answer.savedAt || answer.state !== 'UNANSWERED' || answer.selectedOption)
              .map((answer: Attempt['answers'][number]) => answer.questionId),
          ),
        );
        
        // Questions are already included in attempt data
        setQuestions(attemptData.questions || []);
      }
    } catch (error) {
      console.error('Failed to fetch attempt:', error);
      toast.error('Failed to load test');
      navigate(ROUTES.STUDENT_DASHBOARD);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAnswer = async (questionId: string, selectedOption?: string, state?: string) => {
    try {
      setIsSaving(true);
      console.log('Saving answer:', { questionId, selectedOption, state, attemptId });
      const response = await api.patch(`/attempts/${attemptId}/answers`, {
        answers: [{
          questionId,
          selectedOption,
          state: state || (selectedOption ? 'ANSWERED' : 'UNANSWERED'),
        }]
      });
      console.log('Answer saved successfully:', response.data);
    } catch (error) {
      console.error('Failed to save answer:', error);
      toast.error('Failed to save answer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (!attempt || !questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    saveAnswer(question._id, optionId);

    // Update local state
    const updatedAttempt = { ...attempt };
    const answerIndex = updatedAttempt.answers.findIndex(
      (a) => a.questionId === question._id
    );

    if (answerIndex >= 0) {
      updatedAttempt.answers[answerIndex].selectedOption = optionId;
      updatedAttempt.answers[answerIndex].state = 'ANSWERED';
    } else {
      updatedAttempt.answers.push({
        questionId: question._id,
        selectedOption: optionId,
        state: 'ANSWERED',
      });
    }

    setAttempt(updatedAttempt);
  };

  const handleMarkForReview = () => {
    if (!attempt || !questions[currentQuestionIndex]) return;

    const question = questions[currentQuestionIndex];
    const currentAnswer = attempt.answers.find((a) => a.questionId === question._id);
    const newState = currentAnswer?.selectedOption ? 'ANSWERED_AND_MARKED' : 'MARKED_FOR_REVIEW';

    saveAnswer(question._id, currentAnswer?.selectedOption, newState);

    const updatedAttempt = { ...attempt };
    const answerIndex = updatedAttempt.answers.findIndex((a) => a.questionId === question._id);

    if (answerIndex >= 0) {
      updatedAttempt.answers[answerIndex].state = newState;
    } else {
      updatedAttempt.answers.push({
        questionId: question._id,
        state: newState,
      });
    }

    setAttempt(updatedAttempt);
  };

  const handleSubmit = async () => {
    try {
      await api.post(`/attempts/${attemptId}/submit`);
      toast.success('Test submitted successfully');
      navigate(`${ROUTES.STUDENT_RESULTS}/${attemptId}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
      toast.error('Failed to submit test');
    }
  };

  const handleShowInstructions = async () => {
    if (!mockTestId) {
      toast.error('Test instructions are unavailable');
      return;
    }

    setIsLoadingInstructions(true);
    try {
      const response = await api.get(`/mock-tests/${mockTestId}`);
      const testInstructions = response.data.data?.instructions;
      const text = typeof testInstructions === 'string'
        ? testInstructions
        : language === 'hi'
          ? testInstructions?.hi || testInstructions?.en
          : testInstructions?.en || testInstructions?.hi;
      setInstructions(text || 'No instructions are available for this test.');
      setIsQuestionPaperOpen(false);
      setIsInstructionsOpen(true);
    } catch (error) {
      console.error('Failed to load test instructions:', error);
      toast.error('Failed to load test instructions');
    } finally {
      setIsLoadingInstructions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading test..." />
      </div>
    );
  }

  if (!attempt || questions.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-lg text-gray-900">Test not found</p>
        </div>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = attempt.answers.find((a) => a.questionId === currentQuestion._id);
  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const stats = {
    answered: attempt.answers.filter((a) => a.state === 'ANSWERED' || a.state === 'ANSWERED_AND_MARKED').length,
    notAnswered: Math.max(0, questions.length - attempt.answers.filter((a) => a.state === 'ANSWERED' || a.state === 'ANSWERED_AND_MARKED').length),
    markedForReview: attempt.answers.filter((a) => a.state === 'MARKED_FOR_REVIEW' || a.state === 'ANSWERED_AND_MARKED').length,
    visited: visitedQuestionIds.size,
    notVisited: Math.max(0, questions.length - visitedQuestionIds.size),
  };

  const clearResponse = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    const updatedAttempt = { ...attempt, answers: attempt.answers.filter((a) => a.questionId !== question._id) };
    setAttempt(updatedAttempt);
    saveAnswer(question._id, undefined, 'UNANSWERED');
  };

  const questionNumberGrid = Array.from({ length: Math.max(questions.length, 1) }, (_, index) => index + 1);
  const getQuestionStatus = (questionNumber: number) => {
    const questionId = questions[questionNumber - 1]?._id;
    const answer = questionId ? attempt.answers.find((item) => item.questionId === questionId) : undefined;

    if (answer?.state === 'MARKED_FOR_REVIEW' || answer?.state === 'ANSWERED_AND_MARKED') {
      return 'marked';
    }
    if (answer?.state === 'ANSWERED') {
      return 'answered';
    }
    if (questionId && visitedQuestionIds.has(questionId)) {
      return 'visited';
    }
    return 'notVisited';
  };

  const renderQuestionText = (text: string | undefined) =>
    text || 'No question available for this section.';

  return (
    <div className="fixed inset-0 bg-[#edf5fb] text-slate-800 shadow-inner">
      <header className="flex h-[64px] items-center gap-4 border-b border-slate-200 bg-[#f8fbfe] px-4 sm:px-5 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-44 items-center justify-center overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-blue-200">
            <img src={logo} alt="Parikshabhoomi logo" className="h-full w-full object-cover" />
          </div>
         
        </div>

        <div className="hidden flex-1 items-center justify-center overflow-hidden text-sm text-slate-600 md:flex">
          <span className="truncate font-medium text-slate-700">MP Police Constable</span>
          <span className="mx-2 text-slate-400">:</span>
          <span className="truncate">(3 Nov 2025, Shift 1) Memory-Based Paper</span>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 sm:text-[11px]">
            <span>Time Left</span>
            <div className="flex items-center gap-1 rounded bg-[#edf4fa] px-1.5 py-0.5 font-mono">
              <span className="inline-flex w-6 justify-center">{String(hours).padStart(2, '0')}</span>
              <span className="text-slate-400">:</span>
              <span className="inline-flex w-6 justify-center">{String(minutes).padStart(2, '0')}</span>
              <span className="text-slate-400">:</span>
              <span className="inline-flex w-6 justify-center">{String(seconds).padStart(2, '0')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:px-3 sm:text-sm"
          >
            {isSidebarOpen ? 'Hide ' : 'Show '}
          </button>

          {/* <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 sm:px-3 sm:text-sm"
          >
            Pause
          </button> */}
        </div>
      </header>

      <div className="relative flex h-[calc(100%-64px)] min-h-0 overflow-hidden">
        <main className={`relative min-h-0 flex-1 overflow-hidden bg-[#f3f7fa] transition-all duration-300 ${isSidebarOpen ? 'mr-0' : ''}`}>
          {isInstructionsOpen ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#f7fafc] px-4 py-3 sm:px-5">
                <h1 className="text-base font-semibold text-slate-800">Test Instructions</h1>
                <button
                  type="button"
                  onClick={() => setIsInstructionsOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Test
                </button>
              </div>
              <div className="h-[calc(100%-56px)] overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl whitespace-pre-line rounded-lg border border-slate-200 bg-white p-5 text-[15px] leading-relaxed text-slate-800 shadow-sm">
                  {isLoadingInstructions ? 'Loading instructions...' : instructions}
                </div>
              </div>
            </>
          ) : isQuestionPaperOpen ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#f7fafc] px-4 py-3 sm:px-5">
                <h1 className="text-base font-semibold text-slate-800">Question Paper</h1>
                <button
                  type="button"
                  onClick={() => setIsQuestionPaperOpen(false)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Test
                </button>
              </div>
              <div className="h-[calc(100%-56px)] overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-5">
                  {questions.map((question, index) => (
                    <article key={question._id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <h2 className="mb-2 text-sm font-semibold text-slate-500">Question {index + 1}</h2>
                      <p className="text-[15px] leading-relaxed text-slate-800">
                        {renderQuestionText(
                          language === 'en'
                            ? question.questionText.en
                            : question.questionText.hi || question.questionText.en
                        )}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
          <div className="flex items-center justify-between border-b border-slate-200 bg-[#f7fafc] px-4 py-3 text-sm text-slate-700 sm:px-5">
            <div className="font-medium">
              <span className="text-slate-900">Question No.</span>
              <span className="ml-2 font-bold text-slate-800">{currentQuestionIndex + 1}</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 text-[11px] text-slate-600 sm:gap-4 sm:text-xs">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-700">Marks</span>
                <span className="rounded bg-[#dfeaf7] px-2 py-0.5 font-semibold text-[#1c7ad6]">+1</span>
                <span className="rounded bg-[#fceaea] px-2 py-0.5 font-semibold text-[#e05a5a]">-0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Time</span>
                <span className="rounded bg-[#edf4fa] px-2 py-0.5 font-medium text-slate-700">00:16</span>
              </div>
              <button className="rounded border border-slate-300 bg-white px-2 py-1 text-[11px] text-slate-700 sm:text-xs">
                Report
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-132px)] overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
            <div className="mb-6 text-[16px] leading-relaxed text-slate-800 sm:text-[17px]">
              <span className="font-medium text-[#2d2d2d]">
                {renderQuestionText(
                  language === 'en'
                    ? currentQuestion.questionText.en
                    : currentQuestion.questionText.hi || currentQuestion.questionText.en
                )}
              </span>
            </div>

            <div className="max-w-[980px] space-y-3">
              {currentQuestion.options.map((option, index) => {
                const optionText = renderQuestionText(
                  language === 'en' ? option.text.en : option.text.hi || option.text.en
                );
                const isSelected = currentAnswer?.selectedOption === option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-[#2a8ce8] bg-[#edf6ff] shadow-sm ring-1 ring-[#bae0ff]'
                        : 'border-transparent bg-white/60 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-sm font-medium ${
                        isSelected
                          ? 'border-[#2a8ce8] bg-[#2a8ce8] text-white'
                          : 'border-slate-400 bg-white text-slate-700'
                      }`}
                    >
                      ○
                    </span>
                    <span className="flex-1 text-[15px] leading-relaxed text-slate-800">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 bg-[#f6f9fb] px-4 py-3 transition-all duration-300 sm:px-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleMarkForReview();
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    }
                  }}
                  className="rounded-md border border-[#2d5ca8] bg-[#eef5ff] px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-[#e3efff] sm:text-sm"
                >
                  Mark for Review & Next
                </button>
                <button
                  type="button"
                  onClick={clearResponse}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 sm:text-sm"
                >
                  Clear Response
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex(currentQuestionIndex + 1);
                    } else {
                      setShowSubmitConfirm(true);
                    }
                  }}
                  className="rounded-md bg-gradient-to-r from-[#1d7ed6] to-[#1367bb] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:brightness-105 sm:text-sm"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Save & Next' : 'Submit Test'}
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </main>

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close question sidebar"
            onClick={() => setIsSidebarOpen(false)}
            className="absolute inset-0 z-10 bg-slate-900/20 lg:hidden"
          />
        )}
        <aside
          className={`absolute inset-y-0 right-0 z-20 flex min-h-0 flex-shrink-0 flex-col border-l border-slate-200 bg-[#f6f9fb] p-4 shadow-inner transition-all duration-300 lg:relative lg:inset-auto lg:z-auto ${
            isSidebarOpen
              ? 'w-[min(310px,85vw)] overflow-y-auto opacity-100 lg:w-[310px]'
              : 'w-0 overflow-hidden opacity-0 p-0 lg:w-0'
          }`}
        >
          {isSidebarOpen && (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfeefb] text-sm font-bold text-[#2d7dd2]">
                  G
                </div>
                <div className="text-sm font-semibold text-slate-800">Gouri</div>
              </div>

              <div className="mb-5 space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                  <span>Answered</span>
                  <span className="ml-auto font-semibold text-green-600">{stats.answered}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                  <span>Marked</span>
                  <span className="ml-auto font-semibold text-red-600">{stats.markedForReview}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
                  <span>Visited</span>
                  <span className="ml-auto font-semibold text-yellow-700">{stats.visited}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-slate-300" />
                  <span>Not Visited</span>
                  <span className="ml-auto font-semibold text-slate-700">{stats.notVisited}</span>
                </div>
              </div>

              <div className="mb-4 rounded-t-md border border-[#cfe1f0] bg-[#dfeef9] px-3 py-2 text-sm font-semibold text-slate-700">
                SECTION : Full Test
              </div>

              <div className="grid grid-cols-5 gap-2">
                {questionNumberGrid.map((questionNumber) => {
                  const status = getQuestionStatus(questionNumber);

                  const statusClasses = {
                    answered: 'border border-green-600 bg-green-500 text-white',
                    marked: 'border border-red-600 bg-red-500 text-white',
                    visited: 'border border-yellow-500 bg-yellow-100 text-yellow-800',
                    notVisited: 'border border-slate-300 bg-white text-slate-700',
                  }[status];

                  return (
                    <button
                      key={questionNumber}
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex(questionNumber - 1);
                        if (window.innerWidth < 1024) setIsSidebarOpen(false);
                      }}
                      aria-label={`Go to question ${questionNumber}, ${status === 'notVisited' ? 'not visited' : status}`}
                      className={`flex h-10 w-full items-center justify-center rounded-md text-sm font-medium transition ${
                        statusClasses
                      } ${questionNumber - 1 === currentQuestionIndex ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                    >
                      {questionNumber}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-200 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuestionPaperOpen(true)}
                    className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                  >
                    Question Paper
                  </button>
                  <button
                    type="button"
                    onClick={handleShowInstructions}
                    disabled={isLoadingInstructions}
                    className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-wait disabled:opacity-60"
                  >
                    Instructions
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      {showSubmitConfirm && (
        <Modal
          isOpen={true}
          onClose={() => setShowSubmitConfirm(false)}
          title="Submit Test"
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowSubmitConfirm(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleSubmit}>
                Yes, Submit
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to submit the test? You won't be able to change your answers after submission.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">{stats.answered}</p>
                  <p className="text-xs text-gray-600">Answered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">{stats.notAnswered}</p>
                  <p className="text-xs text-gray-600">Not Answered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-orange-600">{stats.markedForReview}</p>
                  <p className="text-xs text-gray-600">Marked</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
