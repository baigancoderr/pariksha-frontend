// API Configuration
const apiHost = typeof window === 'undefined' ? 'localhost' : window.location.hostname || 'localhost';
const apiProtocol = typeof window === 'undefined' ? 'http:' : window.location.protocol;
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${apiProtocol}//${apiHost}:5000/api/v1`;

// App Configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ParikshaBhumi';
export const APP_NAME_HI = import.meta.env.VITE_APP_NAME_HI || 'परीक्षाभूमि';

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Student Routes
  DASHBOARD: '/dashboard',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_TEST_TAKING: '/student/test',
  STUDENT_RESULTS: '/student/results',
  EXAMS: '/exams',
  EXAM_DETAIL: '/exams/:examId',
  MOCK_TESTS: '/mock-tests',
  MOCK_TEST_DETAIL: '/mock-tests/:testId',
  TEST_INSTRUCTIONS: '/test/:testId/instructions',
  TEST_ATTEMPT: '/attempt/:attemptId',
  TEST_RESULT: '/result/:attemptId',
  ATTEMPT_HISTORY: '/attempts',
  PROFILE: '/profile',
  
  // Admin Routes
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EXAMS: '/admin/exams',
  ADMIN_SUBJECTS: '/admin/subjects',
  ADMIN_TOPICS: '/admin/topics',
  ADMIN_QUESTIONS: '/admin/questions',
  ADMIN_MOCK_TESTS: '/admin/mock-tests',
  ADMIN_BULK_IMPORT: '/admin/bulk-import',
  ADMIN_ANNOUNCEMENT: '/admin/announcement',
  ADMIN_USERS: '/admin/users',
} as const;

// User Roles
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
} as const;

// Languages
export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  LANGUAGE: 'preferred_language',
  THEME: 'theme',
} as const;

// Question States
export const ANSWER_STATES = {
  UNANSWERED: 'UNANSWERED',
  ANSWERED: 'ANSWERED',
  MARKED_FOR_REVIEW: 'MARKED_FOR_REVIEW',
  ANSWERED_AND_MARKED: 'ANSWERED_AND_MARKED',
} as const;

// Attempt Status
export const ATTEMPT_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  EXPIRED: 'EXPIRED',
} as const;

// Question Difficulty
export const DIFFICULTY = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;

// Exam Status
export const EXAM_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  
  // Exams
  EXAMS: '/exams',
  EXAM_BY_ID: (id: string) => `/exams/${id}`,
  EXAM_SUBJECTS: (id: string) => `/exams/${id}/subjects`,
  
  // Subjects
  SUBJECTS: '/subjects',
  SUBJECT_TOPICS: (id: string) => `/subjects/${id}/topics`,
  
  // Mock Tests
  MOCK_TESTS: '/mock-tests',
  MOCK_TEST_BY_ID: (id: string) => `/mock-tests/${id}`,
  
  // Attempts
  ATTEMPTS: '/attempts',
  ATTEMPT_BY_ID: (id: string) => `/attempts/${id}`,
  SAVE_ANSWERS: (id: string) => `/attempts/${id}/answers`,
  SUBMIT_ATTEMPT: (id: string) => `/attempts/${id}/submit`,
  ATTEMPT_RESULT: (id: string) => `/attempts/${id}/result`,
  USER_ATTEMPTS: '/attempts/me/history',
  
  // Admin Questions
  QUESTIONS: '/questions',
  QUESTION_BY_ID: (id: string) => `/questions/${id}`,
} as const;

// Default Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 1;

// Timer Settings
export const TIMER_UPDATE_INTERVAL = 1000; // 1 second
export const AUTO_SAVE_INTERVAL = 5000; // 5 seconds

// Toast Duration
export const TOAST_DURATION = 3000;

// Color Palette (matching CRM theme)
export const COLORS = {
  PRIMARY: '#6366f1',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#3b82f6',
  GRAY: '#6b7280',
} as const;
