import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { ROUTES } from '@/config/constants';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface DashboardStats {
  totalExams: number;
  totalSubjects: number;
  totalQuestions: number;
  totalMockTests: number;
  totalStudents: number;
  totalAttempts: number;
  publishedTests: number;
  draftTests: number;
}

interface RecentActivity {
  _id: string;
  user: { name: string; email: string };
  mockTest: { title: { en: string } };
  status: string;
  startedAt: string;
  submittedAt?: string;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch stats
      const [examsRes, subjectsRes, questionsRes, mockTestsRes, attemptsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/subjects'),
        api.get('/questions'),
        api.get('/mock-tests'),
        api.get('/attempts'),
      ]);

      const mockTests = mockTestsRes.data.data || [];
      const publishedTests = mockTests.filter((t: any) => t.status === 'PUBLISHED').length;
      const draftTests = mockTests.filter((t: any) => t.status === 'DRAFT').length;

      setStats({
        totalExams: examsRes.data.data?.length || 0,
        totalSubjects: subjectsRes.data.data?.length || 0,
        totalQuestions: questionsRes.data.data?.length || 0,
        totalMockTests: mockTests.length,
        totalStudents: 0, // Would need separate endpoint
        totalAttempts: attemptsRes.data.data?.length || 0,
        publishedTests,
        draftTests,
      });

      // Fetch recent activity
      const recentAttempts = attemptsRes.data.data?.slice(0, 5) || [];
      setRecentActivity(recentAttempts);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Exams',
      value: stats?.totalExams || 0,
      icon: '📚',
      color: 'bg-blue-500',
      link: ROUTES.ADMIN_EXAMS,
    },
    {
      title: 'Total Questions',
      value: stats?.totalQuestions || 0,
      icon: '❓',
      color: 'bg-green-500',
      link: ROUTES.ADMIN_QUESTIONS,
    },
    {
      title: 'Mock Tests',
      value: stats?.totalMockTests || 0,
      icon: '📝',
      color: 'bg-purple-500',
      link: ROUTES.ADMIN_MOCK_TESTS,
    },
    {
      title: 'Total Attempts',
      value: stats?.totalAttempts || 0,
      icon: '🎯',
      color: 'bg-orange-500',
      link: '#',
    },
  ];

  const testStatusData = [
    { name: 'Published', value: stats?.publishedTests || 0 },
    { name: 'Draft', value: stats?.draftTests || 0 },
    { name: 'Archived', value: 0 },
  ];

  const weeklyActivityData = [
    { day: 'Mon', attempts: 45 },
    { day: 'Tue', attempts: 62 },
    { day: 'Wed', attempts: 38 },
    { day: 'Thu', attempts: 71 },
    { day: 'Fri', attempts: 55 },
    { day: 'Sat', attempts: 28 },
    { day: 'Sun', attempts: 19 },
  ];

  const subjectDistribution = [
    { subject: 'Mathematics', questions: 120 },
    { subject: 'Physics', questions: 95 },
    { subject: 'Chemistry', questions: 88 },
    { subject: 'Biology', questions: 76 },
    { subject: 'English', questions: 65 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 md:flex-row md:w-auto">
          <Link to={ROUTES.ADMIN_BULK_IMPORT} className="sm:flex-1 md:flex-none">
            <Button variant="outline" className="w-full md:w-auto">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Bulk Import
            </Button>
          </Link>
          <Link to={ROUTES.ADMIN_QUESTIONS} className="sm:flex-1 md:flex-none">
            <Button variant="primary" className="w-full md:w-auto">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Link key={stat.title} to={stat.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-16 h-16 rounded-full flex items-center justify-center text-3xl`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <Card title="Weekly Activity" subtitle="Test attempts over the last 7 days">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attempts" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Test Status Distribution */}
        <Card title="Test Status" subtitle="Distribution of mock tests by status">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={testStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {testStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Subject Distribution */}
      <Card title="Question Distribution by Subject" subtitle="Number of questions in each subject">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={subjectDistribution} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="subject" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="questions" fill="#10B981" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Test Attempts" subtitle="Latest student activity">
        {recentActivity.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No recent activity</p>
            <p className="mt-1 text-sm">Test attempts will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{activity.user.name}</div>
                        <div className="text-sm text-gray-500">{activity.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{activity.mockTest.title.en}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          activity.status === 'SUBMITTED'
                            ? 'success'
                            : activity.status === 'IN_PROGRESS'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {activity.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(activity.startedAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
