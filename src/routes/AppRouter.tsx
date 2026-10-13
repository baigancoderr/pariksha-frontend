import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '@/features/exams/LandingPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { MockTestListPage } from '@/features/mock-tests/MockTestListPage';
import { MockTestDetailPage } from '@/features/mock-tests/MockTestDetailPage';
import { AttemptPage } from '@/features/attempt/AttemptPage';
import { ResultPage } from '@/features/results/ResultPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages – full-screen, no sidebar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main layout with sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/exams" element={<MockTestListPage />} />
          <Route path="/mock-tests" element={<MockTestListPage />} />
          <Route path="/mock-tests/:testId" element={<MockTestDetailPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attempts"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attempt/:attemptId"
            element={
              <ProtectedRoute>
                <AttemptPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:attemptId"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/results/:attemptId"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<LandingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
