import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';

export const TestDetail: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await api.get(`/mock-tests/${testId}`);
      setTest(response.data.data);
    } catch (error) {
      console.error('Failed to fetch test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    try {
      setStarting(true);
      const response = await api.post('/attempts', {
        mockTestId: testId,
        language: 'hi',
      });
      if (response.data.success) {
        const attemptId = response.data.data._id;
        navigate(`/student/test/${attemptId}`);
      }
    } catch (error: any) {
      console.error('Failed to start test:', error);
      alert(error.response?.data?.error?.message || 'Failed to start test');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size="lg" text="Loading test details..." />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-medium text-gray-900">Test not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={test.isFree ? 'success' : 'default'}>
            {test.isFree ? 'FREE' : 'PREMIUM'}
          </Badge>
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
            {test.type.replace(/_/g, ' ')}
          </span>
        </div>
        <h1 className="text-3xl font-bold">{test.title.en}</h1>
        {test.title.hi && <p className="mt-2 text-indigo-100 text-lg">{test.title.hi}</p>}
      </div>

      {/* Test Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-2xl font-bold text-gray-900">{test.durationMinutes}</p>
            <p className="text-sm text-gray-600">Minutes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-2xl font-bold text-gray-900">{test.questionCount || 0}</p>
            <p className="text-sm text-gray-600">Questions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <svg className="w-8 h-8 mx-auto mb-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-2xl font-bold text-gray-900">{test.totalMarks}</p>
            <p className="text-sm text-gray-600">Total Marks</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      {test.instructions && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Instructions
          </h2>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line text-gray-700">{test.instructions.en}</div>
            {test.instructions.hi && (
              <div className="mt-4 whitespace-pre-line text-orange-600 border-t border-gray-200 pt-4">
                {test.instructions.hi}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Important Points */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">📌 Important Points</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Make sure you have stable internet connection</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Your answers will be auto-saved periodically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>You can switch between English and Hindi during the test</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Once started, the timer cannot be paused</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-0.5">•</span>
            <span>Submit the test before time runs out</span>
          </li>
        </ul>
      </div>

      {/* Start Button */}
      <div className="flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
        >
          Go Back
        </button>
        <button
          onClick={handleStartTest}
          disabled={starting}
          className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {starting ? 'Starting...' : 'Start Test Now →'}
        </button>
      </div>
    </div>
  );
};
