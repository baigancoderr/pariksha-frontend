// User Types
export interface UserSocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
  website?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'TEACHER';
  preferredLanguage: 'en' | 'hi';
  avatarUrl?: string;
  socialLinks?: UserSocialLinks;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

// Bilingual Text
export interface BilingualText {
  en: string;
  hi?: string;
}

// Exam Types
export interface Exam {
  _id: string;
  name: BilingualText;
  code: string;
  slug: string;
  category: string;
  description?: BilingualText;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Subject Types
export interface Subject {
  _id: string;
  exam: string;
  name: BilingualText;
  description?: BilingualText;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Topic Types
export interface Topic {
  _id: string;
  subject: string;
  exam: string;
  name: BilingualText;
  description?: BilingualText;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Question Types
export interface QuestionOption {
  id: string;
  text: BilingualText;
}

export interface Question {
  _id: string;
  exam: string;
  subject: string;
  topic?: string;
  questionText: BilingualText;
  options: QuestionOption[];
  correctOption: string;
  explanation?: BilingualText;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marksCorrect: number;
  marksIncorrect: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  tags: string[];
  sourceRef?: string;
  createdBy: string;
  lastModifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Mock Test Types
export interface MockTestQuestion {
  question: string;
  order: number;
  marksCorrect: number;
  marksIncorrect: number;
}

export interface MockTest {
  _id: string;
  exam: string;
  title: BilingualText;
  description?: BilingualText;
  instructions?: BilingualText;
  type: 'FULL_LENGTH' | 'SUBJECT_WISE' | 'TOPIC_WISE' | 'PREVIOUS_YEAR';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  allowLanguageSwitch: boolean;
  showResultImmediately: boolean;
  allowAnswerReview: boolean;
  questions: MockTestQuestion[];
  subjects?: string[];
  topics?: string[];
  isFree: boolean;
  createdBy: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Attempt Types
export interface AttemptAnswer {
  questionId: string;
  selectedOption?: string;
  state: 'UNANSWERED' | 'ANSWERED' | 'MARKED_FOR_REVIEW' | 'ANSWERED_AND_MARKED';
  savedAt?: string;
}

export interface Attempt {
  _id: string;
  user: string;
  mockTest: string;
  exam: string;
  questionOrder: string[];
  language: 'en' | 'hi';
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startedAt: string;
  expiresAt: string;
  submittedAt?: string;
  answers: AttemptAnswer[];
  createdAt: string;
  updatedAt: string;
}

// Result Types
export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  marksObtained: number;
  maxMarks: number;
}

export interface QuestionResult {
  questionId: string;
  selectedOption?: string;
  correctOption: string;
  isCorrect: boolean;
  isUnanswered: boolean;
  marksAwarded: number;
}

export interface Result {
  _id: string;
  attempt: string;
  user: string;
  mockTest: string | MockTest;  // Can be populated
  exam: string;
  totalMarks: number;
  maxMarks: number;
  marksObtained: number;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
  timeTakenSeconds: number;
  percentage: number;
  questionResults: QuestionResult[];
  subjectResults: SubjectResult[];
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  preferredLanguage: 'en' | 'hi';
}

export interface ExamFormData {
  name: BilingualText;
  code: string;
  slug: string;
  category: string;
  description?: BilingualText;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export interface SubjectFormData {
  exam: string;
  name: BilingualText;
  description?: BilingualText;
  order?: number;
}

export interface TopicFormData {
  subject: string;
  exam: string;
  name: BilingualText;
  description?: BilingualText;
  order?: number;
}

export interface QuestionFormData {
  exam: string;
  subject: string;
  topic?: string;
  questionText: BilingualText;
  options: QuestionOption[];
  correctOption: string;
  explanation?: BilingualText;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  marksCorrect?: number;
  marksIncorrect?: number;
  tags?: string[];
  sourceRef?: string;
}

export interface MockTestFormData {
  exam: string;
  title: BilingualText;
  description?: BilingualText;
  instructions?: BilingualText;
  type: 'FULL_LENGTH' | 'SUBJECT_WISE' | 'TOPIC_WISE' | 'PREVIOUS_YEAR';
  durationMinutes: number;
  totalMarks: number;
  passingMarks?: number;
  allowLanguageSwitch?: boolean;
  showResultImmediately?: boolean;
  allowAnswerReview?: boolean;
  questions: MockTestQuestion[];
  isFree?: boolean;
}
