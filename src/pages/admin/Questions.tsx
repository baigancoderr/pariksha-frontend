import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';
import { QuestionForm } from '@/components/admin/QuestionForm';
import { QuestionPreview } from '@/components/admin/QuestionPreview';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { Question, Exam, Subject, Topic } from '@/types';

export const Questions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchExams();
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      fetchSubjects(selectedExam);
    } else {
      setSubjects([]);
      setTopics([]);
    }
    setSelectedSubject('');
    setSelectedTopic('');
  }, [selectedExam]);

  useEffect(() => {
    if (selectedSubject) {
      fetchTopics(selectedExam, selectedSubject);
    } else {
      setTopics([]);
    }
    setSelectedTopic('');
  }, [selectedSubject]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      if (response.data.success) {
        setExams(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
  };

  const fetchSubjects = async (examId: string) => {
    try {
      const response = await api.get(`/subjects?exam=${examId}`);
      if (response.data.success) {
        setSubjects(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchTopics = async (examId: string, subjectId: string) => {
    try {
      const response = await api.get(`/topics?exam=${examId}&subject=${subjectId}`);
      if (response.data.success) {
        setTopics(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/questions');
      if (response.data.success) {
        setQuestions(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedQuestion(null);
    setIsFormOpen(true);
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted successfully');
      fetchQuestions();
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error('Failed to delete question:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to delete question');
    }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      await api.patch(`/questions/${id}`, { status: newStatus });
      toast.success(`Question ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully`);
      fetchQuestions();
    } catch (error: any) {
      console.error('Failed to update question status:', error);
      toast.error('Failed to update question status');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedQuestion(null);
    fetchQuestions();
  };

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.questionText.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (question.questionText.hi && question.questionText.hi.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExam = !selectedExam || question.exam === selectedExam;
    const matchesSubject = !selectedSubject || question.subject === selectedSubject;
    const matchesTopic = !selectedTopic || question.topic === selectedTopic;
    const matchesDifficulty = difficultyFilter === 'ALL' || question.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'ALL' || question.status === statusFilter;

    return matchesSearch && matchesExam && matchesSubject && matchesTopic && matchesDifficulty && matchesStatus;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HARD':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading questions..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage bilingual questions with advanced filtering
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Question
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search questions by text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              options={[
                { value: '', label: 'All Exams' },
                ...exams.map((exam) => ({
                  value: exam._id,
                  label: exam.name.en,
                })),
              ]}
            />

            <Select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              options={[
                { value: '', label: 'All Subjects' },
                ...subjects.map((subject) => ({
                  value: subject._id,
                  label: subject.name.en,
                })),
              ]}
              disabled={!selectedExam}
            />

            <Select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              options={[
                { value: '', label: 'All Topics' },
                ...topics.map((topic) => ({
                  value: topic._id,
                  label: topic.name.en,
                })),
              ]}
              disabled={!selectedSubject}
            />

            <Select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Difficulties' },
                { value: 'EASY', label: 'Easy' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HARD', label: 'Hard' },
              ]}
            />

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Status' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'ARCHIVED', label: 'Archived' },
              ]}
            />
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing <strong>{filteredQuestions.length}</strong> of <strong>{questions.length}</strong> questions
            </span>
            {(searchQuery || selectedExam || selectedSubject || selectedTopic || difficultyFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedExam('');
                  setSelectedSubject('');
                  setSelectedTopic('');
                  setDifficultyFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Questions Grid */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">No questions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || selectedExam || selectedSubject ? 'Try adjusting your filters' : 'Get started by adding your first question'}
            </p>
            {!searchQuery && !selectedExam && (
              <Button variant="primary" onClick={handleCreate} className="mt-4">
                Add First Question
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.map((question) => (
            <Card key={question._id} padding="none">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    {/* Question Text */}
                    <div className="mb-3">
                      <p className="text-base text-gray-900 line-clamp-2">
                        {question.questionText.en}
                      </p>
                      {question.questionText.hi && (
                        <p className="text-sm text-orange-600 mt-1 line-clamp-2">
                          {question.questionText.hi}
                        </p>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <Badge variant={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant={question.status === 'PUBLISHED' ? 'success' : 'warning'}>
                        {question.status}
                      </Badge>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {question.marksCorrect > 0 ? '+' : ''}{question.marksCorrect}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {question.marksIncorrect}
                      </span>
                      {question.tags && question.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {question.tags.slice(0, 2).join(', ')}
                          {question.tags.length > 2 && ` +${question.tags.length - 2}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewQuestion(question)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePublish(question._id, question.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        question.status === 'PUBLISHED'
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={question.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={question.status === 'PUBLISHED' ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(question._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Question Form Modal */}
      {isFormOpen && (
        <QuestionForm
          question={selectedQuestion}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedQuestion(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Preview Modal */}
      {previewQuestion && (
        <QuestionPreview
          question={previewQuestion}
          isOpen={true}
          onClose={() => setPreviewQuestion(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Question"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => handleDelete(deleteConfirmId)}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-gray-700">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
};
