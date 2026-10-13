import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import type { Exam, Question } from '@/types';

type MockTestType = 'FULL_LENGTH' | 'SUBJECT_WISE' | 'TOPIC_WISE' | 'PREVIOUS_YEAR';

const mockTestTypes: MockTestType[] = [
  'FULL_LENGTH',
  'SUBJECT_WISE',
  'TOPIC_WISE',
  'PREVIOUS_YEAR',
];

const isMockTestType = (value: string): value is MockTestType =>
  mockTestTypes.some((type) => type === value);

interface MockTest {
  _id: string;
  title: { en: string; hi?: string };
  exam: { _id?: string; name: string | { en: string; hi?: string }; code: string } | string;
  type: string;
  status: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount?: number;
  isFree: boolean;
  createdAt: string;
}

interface MockTestDetails extends MockTest {
  questions: Array<{
    question: string | {
      _id: string;
      questionText?: { en: string; hi?: string };
      difficulty?: string;
    };
    order: number;
    marksCorrect: number;
    marksIncorrect: number;
  }>;
  instructions?: { en: string; hi?: string };
  description?: { en: string; hi?: string };
}

export const AdminMockTests: React.FC = () => {
  const [tests, setTests] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewTest, setViewTest] = useState<MockTestDetails | null>(null);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const viewRequestId = useRef(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTestId, setEditingTestId] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleHi, setEditTitleHi] = useState('');
  const [editDurationMinutes, setEditDurationMinutes] = useState(60);
  const [editTestType, setEditTestType] = useState<MockTestType>('FULL_LENGTH');
  const [editIsFree, setEditIsFree] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [titleEn, setTitleEn] = useState('');
  const [titleHi, setTitleHi] = useState('');
  const [testType, setTestType] = useState<MockTestType>('FULL_LENGTH');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isFree, setIsFree] = useState(true);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mock-tests/admin/all?limit=100');
      setTests(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load mock tests');
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = async () => {
    setTitleEn('');
    setTitleHi('');
    setSelectedExam('');
    setQuestions([]);
    setSelectedQuestionIds([]);
    setTestType('FULL_LENGTH');
    setDurationMinutes(60);
    setIsFree(true);
    setFormError('');
    setIsCreateOpen(true);
    setIsLoadingExams(true);
    try {
      const response = await api.get('/exams/admin/all?limit=100');
      setExams(response.data.data || []);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to load exams');
    } finally {
      setIsLoadingExams(false);
    }
  };

  useEffect(() => {
    if (!isCreateOpen || !selectedExam) return;

    let cancelled = false;
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      setQuestions([]);
      setSelectedQuestionIds([]);
      setFormError('');
      try {
        const firstPage = await api.get('/questions', {
          params: { examId: selectedExam, status: 'PUBLISHED', limit: 100, page: 1 },
        });
        const pages = firstPage.data.pagination?.pages || 1;
        const remainingPages = await Promise.all(
          Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
            api.get('/questions', {
              params: {
                examId: selectedExam,
                status: 'PUBLISHED',
                limit: 100,
                page: index + 2,
              },
            }),
          ),
        );
        if (!cancelled) {
          setQuestions([
            ...(firstPage.data.data || []),
            ...remainingPages.flatMap((response) => response.data.data || []),
          ]);
        }
      } catch (err: any) {
        if (!cancelled) {
          setFormError(err.response?.data?.error?.message || 'Failed to load published questions');
        }
      } finally {
        if (!cancelled) setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
    return () => {
      cancelled = true;
    };
  }, [isCreateOpen, selectedExam]);

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestionIds((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    if (!titleEn.trim() || !selectedExam || selectedQuestionIds.length === 0 || durationMinutes < 1) {
      setFormError('Enter a title, select an exam and at least one question, and provide a valid duration.');
      return;
    }

    const selectedQuestions = selectedQuestionIds
      .map((id) => questions.find((question) => question._id === id))
      .filter((question): question is Question => Boolean(question));
    if (selectedQuestions.length !== selectedQuestionIds.length) {
      setFormError('Some selected questions are no longer available. Reload the question list and try again.');
      return;
    }

    setIsCreating(true);
    try {
      await api.post('/mock-tests', {
        exam: selectedExam,
        title: { en: titleEn.trim(), ...(titleHi.trim() ? { hi: titleHi.trim() } : {}) },
        type: testType,
        durationMinutes,
        totalMarks: selectedQuestions.reduce((total, question) => total + question.marksCorrect, 0),
        questions: selectedQuestions.map((question, order) => ({
          question: question._id,
          order,
          marksCorrect: question.marksCorrect,
          marksIncorrect: question.marksIncorrect,
        })),
        isFree,
      });
      setIsCreateOpen(false);
      await fetchTests();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Failed to create mock test');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (testId: string, newStatus: string) => {
    try {
      await api.patch(`/mock-tests/${testId}/status`, { status: newStatus });
      fetchTests();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const openView = async (testId: string) => {
    const requestId = ++viewRequestId.current;
    setIsViewLoading(true);
    setViewTest(null);
    setError('');
    try {
      const response = await api.get(`/mock-tests/admin/${testId}`);
      if (requestId === viewRequestId.current) setViewTest(response.data.data);
    } catch (err: any) {
      if (requestId === viewRequestId.current) {
        setError(err.response?.data?.error?.message || 'Failed to load mock test details');
      }
    } finally {
      if (requestId === viewRequestId.current) setIsViewLoading(false);
    }
  };

  const openEdit = (test: MockTest) => {
    setEditingTestId(test._id);
    setEditTitleEn(test.title.en);
    setEditTitleHi(test.title.hi || '');
    setEditDurationMinutes(test.durationMinutes);
    setEditTestType(isMockTestType(test.type) ? test.type : 'FULL_LENGTH');
    setEditIsFree(test.isFree);
    setEditError('');
    setIsEditOpen(true);
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEditError('');
    if (!editTitleEn.trim() || !Number.isInteger(editDurationMinutes) || editDurationMinutes < 1) {
      setEditError('Enter a title and a duration of at least one minute.');
      return;
    }

    setIsSavingEdit(true);
    try {
      await api.patch(`/mock-tests/${editingTestId}`, {
        title: { en: editTitleEn.trim(), ...(editTitleHi.trim() ? { hi: editTitleHi.trim() } : {}) },
        durationMinutes: editDurationMinutes,
        type: editTestType,
        isFree: editIsFree,
      });
      setIsEditOpen(false);
      await fetchTests();
    } catch (err: any) {
      setEditError(err.response?.data?.error?.message || 'Failed to update mock test');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const examName = typeof test.exam === 'object' && test.exam !== null
      ? typeof test.exam.name === 'string'
        ? test.exam.name
        : test.exam.name?.en || ''
      : '';
    
    return (
      test.title.en.toLowerCase().includes(search.toLowerCase()) ||
      test.title.hi?.toLowerCase().includes(search.toLowerCase()) ||
      examName.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mock Tests Management</h1>
          <p className="mt-1 text-sm text-gray-500">{filteredTests.length} tests</p>
        </div>
        <Button variant="primary" size="md" onClick={openCreateForm}>
          + Create Mock Test
        </Button>
      </div>

      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, exam..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Questions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm text-gray-500">
                    No mock tests found
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{test.title.en}</div>
                      {test.title.hi && (
                        <div className="text-sm text-orange-600">{test.title.hi}</div>
                      )}
                      {test.isFree && (
                        <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {typeof test.exam === 'object' && test.exam !== null
                        ? typeof test.exam.name === 'string'
                          ? test.exam.name
                          : test.exam.name?.en || '-'
                        : '-'}
                      {typeof test.exam === 'object' && test.exam !== null && (
                        <div className="text-xs text-gray-500">{test.exam.code}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {test.type?.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {test.durationMinutes} min
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {test.totalMarks}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {test.questionCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={test.status}
                        onChange={(e) => handleStatusChange(test._id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(test)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void openView(test._id)}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => !isCreating && setIsCreateOpen(false)}
        title="Create Mock Test"
        size="xl"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-mock-test-form" isLoading={isCreating}>
              Create Test
            </Button>
          </>
        }
      >
        <form id="create-mock-test-form" onSubmit={handleCreate} className="space-y-5">
          {formError && <Alert type="error" message={formError} onClose={() => setFormError('')} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Title (English) *
              <input
                value={titleEn}
                onChange={(event) => setTitleEn(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Title (Hindi)
              <input
                value={titleHi}
                onChange={(event) => setTitleHi(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Exam *
              <select
                value={selectedExam}
                onChange={(event) => setSelectedExam(event.target.value)}
                required
                disabled={isLoadingExams}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">{isLoadingExams ? 'Loading exams...' : 'Select an exam'}</option>
                {exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name.en}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Test type
              <select
                value={testType}
                onChange={(event) => {
                  if (isMockTestType(event.target.value)) setTestType(event.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {mockTestTypes.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes) *
              <input
                type="number"
                min={1}
                step={1}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
              <input type="checkbox" checked={isFree} onChange={(event) => setIsFree(event.target.checked)} />
              Free test
            </label>
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">Published questions *</h4>
              <span className="text-sm text-gray-500">
                {selectedQuestionIds.length} selected · {questions
                  .filter((question) => selectedQuestionIds.includes(question._id))
                  .reduce((total, question) => total + question.marksCorrect, 0)} marks
              </span>
            </div>
            {!selectedExam ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Select an exam to load its published questions.</p>
            ) : isLoadingQuestions ? (
              <div className="flex justify-center rounded-lg border border-gray-200 p-6"><Loader size="sm" /></div>
            ) : questions.length === 0 ? (
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">No published questions are available for this exam.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {questions.map((question) => (
                  <label key={question._id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedQuestionIds.includes(question._id)}
                      onChange={() => toggleQuestion(question._id)}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1 text-sm text-gray-700">{question.questionText.en}</span>
                    <span className="shrink-0 text-xs text-gray-500">{question.marksCorrect} marks</span>
                  </label>
                ))}
              </div>
            )}
          </section>
        </form>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => !isSavingEdit && setIsEditOpen(false)}
        title="Edit Mock Test"
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSavingEdit}>
              Cancel
            </Button>
            <Button type="submit" form="edit-mock-test-form" isLoading={isSavingEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <form id="edit-mock-test-form" onSubmit={handleEdit} className="space-y-5">
          {editError && <Alert type="error" message={editError} onClose={() => setEditError('')} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">
              Title (English) *
              <input
                value={editTitleEn}
                onChange={(event) => setEditTitleEn(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Title (Hindi)
              <input
                value={editTitleHi}
                onChange={(event) => setEditTitleHi(event.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Test type
              <select
                value={editTestType}
                onChange={(event) => {
                  if (isMockTestType(event.target.value)) setEditTestType(event.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                {mockTestTypes.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes) *
              <input
                type="number"
                min={1}
                step={1}
                value={editDurationMinutes}
                onChange={(event) => setEditDurationMinutes(Number(event.target.value))}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-gray-700">
              <input type="checkbox" checked={editIsFree} onChange={(event) => setEditIsFree(event.target.checked)} />
              Free test
            </label>
          </div>
          <p className="text-xs text-gray-500">
            This form edits the test title, type, duration, and free-test setting. Questions and exam assignment are unchanged.
          </p>
        </form>
      </Modal>

      <Modal
        isOpen={isViewLoading || Boolean(viewTest)}
        onClose={() => {
          viewRequestId.current += 1;
          setViewTest(null);
          setIsViewLoading(false);
        }}
        title={isViewLoading ? 'Loading Mock Test' : viewTest?.title.en}
        size="lg"
      >
        {isViewLoading ? (
          <div className="flex justify-center py-10"><Loader size="md" text="Loading test details..." /></div>
        ) : viewTest ? (
          <div className="space-y-5">
            {viewTest.title.hi && <p className="-mt-4 text-sm text-orange-700">{viewTest.title.hi}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Status', viewTest.status],
                ['Duration', `${viewTest.durationMinutes} min`],
                ['Total marks', String(viewTest.totalMarks)],
                ['Questions', String(viewTest.questions?.length || viewTest.questionCount || 0)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Exam and type</h4>
              <p className="mt-1 text-sm text-gray-600">
                {typeof viewTest.exam === 'object' && viewTest.exam !== null
                  ? typeof viewTest.exam.name === 'string'
                    ? viewTest.exam.name
                    : viewTest.exam.name.en
                  : 'Exam'} · {viewTest.type.replace(/_/g, ' ')} · {viewTest.isFree ? 'Free' : 'Paid'}
              </p>
            </div>
            {viewTest.description?.en && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Description</h4>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{viewTest.description.en}</p>
              </div>
            )}
            {viewTest.instructions?.en && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Instructions</h4>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{viewTest.instructions.en}</p>
              </div>
            )}
            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-900">Questions</h4>
              <ol className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {viewTest.questions?.map((item, index) => {
                  const question = typeof item.question === 'object' ? item.question : null;
                  return (
                    <li key={question?._id || `${item.order}-${index}`} className="flex gap-3 rounded-md bg-gray-50 p-3">
                      <span className="font-semibold text-indigo-600">{index + 1}.</span>
                      <span className="min-w-0 flex-1 text-sm text-gray-700">
                        {question?.questionText?.en || 'Question details unavailable'}
                      </span>
                      <span className="shrink-0 text-xs text-gray-500">{item.marksCorrect} marks</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
