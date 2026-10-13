import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/hooks/useToast';
import api from '@/lib/api';
import { MockTest, Exam, Attempt } from '@/types';
import { format } from 'date-fns';
import { ROUTES } from '@/config/constants';

export const StudentDashboard: React.FC = () => {
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [examsRes, mockTestsRes, attemptsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/mock-tests?status=PUBLISHED'),
        api.get('/attempts/me/history?limit=10'),
      ]);

      setExams(examsRes.data.data || []);
      setMockTests(mockTestsRes.data.data || []);
      setAttempts(attemptsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTest = async (mockTestId: string) => {
    try {
      const response = await api.post('/attempts', {
        mockTestId: mockTestId,
        language: 'hi',
      });
      if (response.data.success) {
        const attemptId = response.data.data._id;
        navigate(`${ROUTES.STUDENT_TEST_TAKING}/${attemptId}`);
      }
    } catch (error: any) {
      console.error('Failed to start test:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to start test');
    }
  };

  const filteredMockTests = selectedExam
    ? mockTests.filter((test) => test.exam === selectedExam)
    : mockTests;

  const stats = {
    totalAttempts: attempts.length,
    inProgress: attempts.filter((a) => a.status === 'IN_PROGRESS').length,
    completed: attempts.filter((a) => a.status === 'SUBMITTED').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to ParikshaBhumi! 📚</h1>
        <p className="mt-2 text-gray-600">Choose a mock test and start practicing for your exams</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{stats.totalAttempts}</p>
            <p className="mt-1 text-sm text-gray-600">Total Attempts</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
            <p className="mt-1 text-sm text-gray-600">In Progress</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="mt-1 text-sm text-gray-600">Completed</p>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Exam:</label>
          <div className="flex-1 max-w-md">
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
          </div>
        </div>
      </Card>

      {/* Available Mock Tests */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Mock Tests</h2>
        {filteredMockTests.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-900">No Mock Tests Available</p>
              <p className="mt-1 text-sm text-gray-500">Check back later for new tests</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMockTests.map((test) => (
              <Card key={test._id}>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{test.title.en}</h3>
                    {test.title.hi && (
                      <p className="text-sm text-orange-600 mt-1">{test.title.hi}</p>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{test.durationMinutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{test.questionCount || 0} questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{test.totalMarks} marks</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="info">{test.type.replace('_', ' ')}</Badge>
                    {test.isFree && <Badge variant="success">Free</Badge>}
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => handleStartTest(test._id)}
                  >
                    Start Test
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Recent Attempts</h2>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="min-w-xl md:min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts.slice(0, 5).map((attempt) => (
                    <tr key={attempt._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">Mock Test</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            attempt.status === 'SUBMITTED'
                              ? 'success'
                              : attempt.status === 'IN_PROGRESS'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {attempt.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(attempt.startedAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {attempt.status === 'IN_PROGRESS' ? (
                          <Button
                            size="sm"
                            onClick={() => navigate(`${ROUTES.STUDENT_TEST_TAKING}/${attempt._id}`)}
                          >
                            Resume
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`${ROUTES.STUDENT_RESULTS}/${attempt._id}`)}
                          >
                             Result
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
