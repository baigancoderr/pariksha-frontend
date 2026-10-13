import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';

interface Attempt {
  _id: string;
  mockTest: {
    _id: string;
    title: { en: string; hi?: string };
  };
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startedAt: string;
  submittedAt?: string;
  score?: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  totalQuestions?: number;
  timeTaken?: number;
}

export const MyAttempts: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchAttempts = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/attempts/me/history', {
          params: {
            page: currentPage,
            limit: 10,
            status: filterStatus,
          },
        });
        if (!active) return;
        setAttempts(response.data.data || []);
        setPagination(response.data.pagination || { page: currentPage, limit: 10, total: 0, pages: 0 });
      } catch (requestError) {
        if (!active) return;
        console.error('Failed to fetch attempts:', requestError);
        setError('Failed to load attempts. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchAttempts();
    return () => {
      active = false;
    };
  }, [currentPage, filterStatus]);

  const filteredAttempts = attempts;

  const stats = {
    total: pagination.total,
    completed: attempts.filter((a) => a.status === 'SUBMITTED').length,
    inProgress: attempts.filter((a) => a.status === 'IN_PROGRESS').length,
    avgScore:
      attempts.filter((a) => a.status === 'SUBMITTED' && a.score).length > 0
        ? Math.round(
            attempts
              .filter((a) => a.status === 'SUBMITTED' && a.score)
              .reduce((sum, a) => sum + (a.score || 0), 0) /
              attempts.filter((a) => a.status === 'SUBMITTED' && a.score).length
          )
        : 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" text="Loading attempts..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">My Attempts</h1>
        <p className="mt-2 text-blue-100">Track your test history and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgScore}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'EXPIRED'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Attempts List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-12">
          <Loader size="lg" text="Loading attempts..." />
        </div>
      ) : filteredAttempts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No attempts found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'ALL'
              ? 'Start taking tests to see your attempts here'
              : `No ${filterStatus.toLowerCase().replace(/_/g, ' ')} attempts`}
          </p>
          <Link
            to="/student/mock-tests"
            className="inline-block mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse Tests
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {attempt.mockTest?.title?.en || 'Test'}
                      </div>
                      {attempt.mockTest?.title?.hi && (
                        <div className="text-sm text-orange-600">{attempt.mockTest.title.hi}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(attempt.startedAt), 'MMM dd, yyyy')}
                      <div className="text-xs text-gray-400">
                        {format(new Date(attempt.startedAt), 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          attempt.status === 'SUBMITTED'
                            ? 'success'
                            : attempt.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {attempt.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attempt.status === 'SUBMITTED' ? (
                        <div>
                          <div className="text-lg font-bold text-indigo-600">{attempt.score}%</div>
                          {attempt.timeTaken && (
                            <div className="text-xs text-gray-500">{attempt.timeTaken} min</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {attempt.status === 'SUBMITTED' ? (
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">{attempt.correctAnswers || 0}</span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-red-600 font-medium">{attempt.wrongAnswers || 0}</span>
                          <span className="text-gray-400"> / </span>
                          <span className="text-gray-600">{attempt.totalQuestions || 0}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {attempt.status === 'IN_PROGRESS' ? (
                        <Link
                          to={`/student/test/${attempt._id}`}
                          className="inline-flex items-center px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          Resume
                        </Link>
                      ) : attempt.status === 'SUBMITTED' ? (
                        <Link
                          to={`/student/results/${attempt._id}`}
                          className="inline-flex items-center px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                           Results
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-sm">Expired</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <nav aria-label="Attempts pagination" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} attempts
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(pagination.pages, page + 1))}
              disabled={pagination.page >= pagination.pages || loading}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};
