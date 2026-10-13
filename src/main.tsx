import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './layouts/AdminLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { ROUTES, USER_ROLES } from './config/constants';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';
import { Exams } from './pages/admin/Exams';
import { Subjects } from './pages/admin/Subjects';
import { Questions } from './pages/admin/Questions';
import { BulkImport } from './pages/admin/BulkImport';
import { AdminMockTests } from './pages/admin/MockTests';
import { AdminAnnouncement } from './pages/admin/Announcement';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { StudentMockTests } from './pages/student/MockTests';
import { TestDetail } from './pages/student/TestDetail';
import { MyAttempts } from './pages/student/MyAttempts';
import { TestTaking } from './pages/student/TestTaking';
import { Results } from './pages/student/Results';
import { ProfilePage } from './pages/Profile';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        {/* Admin Routes */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_EXAMS}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <Exams />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_SUBJECTS}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <Subjects />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_QUESTIONS}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <Questions />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_BULK_IMPORT}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <BulkImport />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mock-tests"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <AdminMockTests />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_ANNOUNCEMENT}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.ADMIN}>
              <AdminLayout>
                <AdminAnnouncement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path={ROUTES.STUDENT_DASHBOARD}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/mock-tests"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <StudentLayout>
                <StudentMockTests />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/mock-tests/:testId"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <StudentLayout>
                <TestDetail />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/attempts"
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <StudentLayout>
                <MyAttempts />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.STUDENT_TEST_TAKING}/:attemptId`}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <TestTaking />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${ROUTES.STUDENT_RESULTS}/:attemptId`}
          element={
            <ProtectedRoute requiredRole={USER_ROLES.STUDENT}>
              <StudentLayout>
                <Results />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </AuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
