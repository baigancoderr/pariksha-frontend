# ParikshaBhumi - Exam Platform Frontend

A comprehensive, bilingual (English/Hindi) competitive exam platform built with React, TypeScript, and Tailwind CSS.

## 🎯 Features

### Admin Dashboard (100% Complete)
- **Dashboard**: Analytics, charts, statistics, recent activity
- **Exam Management**: Create, edit, publish/unpublish exams with bilingual support
- **Subject & Topic Management**: Hierarchical tree view with drag-drop reordering
- **Question Bank**: Advanced filtering, bilingual question editor, preview, publish workflow
- **Bulk Import**: CSV/Excel upload with validation and error reporting
- **Mock Test Builder**: Create tests with question selection

### Student Interface (Basic Functional)
- **Dashboard**: Browse available mock tests, view attempt history
- **Test Taking**: Timer, question navigator, language toggle, mark for review
- **Results**: Score display, subject-wise breakdown, detailed answer review

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your backend API URL
# VITE_API_BASE_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── ExamForm.tsx
│   │   ├── SubjectForm.tsx
│   │   ├── TopicForm.tsx
│   │   ├── QuestionForm.tsx
│   │   └── QuestionPreview.tsx
│   └── ui/              # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── BilingualInput.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Alert.tsx
│       └── Loader.tsx
├── pages/
│   ├── auth/            # Authentication pages
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── admin/           # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── Exams.tsx
│   │   ├── Subjects.tsx
│   │   ├── Questions.tsx
│   │   └── BulkImport.tsx
│   └── student/         # Student pages
│       ├── Dashboard.tsx
│       ├── TestTaking.tsx
│       └── Results.tsx
├── layouts/
│   ├── AdminLayout.tsx  # Admin layout with sidebar
│   └── StudentLayout.tsx # Student layout with navbar
├── context/
│   └── AuthContext.tsx  # Authentication context
├── hooks/
│   └── useToast.tsx     # Toast notification hook
├── lib/
│   └── api.ts           # Axios API client
├── config/
│   └── constants.ts     # App constants and routes
├── types/
│   └── index.ts         # TypeScript types
└── main.tsx             # App entry point with routing
```

## 🎨 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **@hello-pangea/dnd** - Drag and drop
- **date-fns** - Date utilities

## 🔐 Authentication

The app uses JWT-based authentication with role-based access control:
- **Admin**: Full access to management features
- **Student**: Access to test taking and results

## 🌐 API Integration

All API calls go through the centralized `api.ts` client with:
- JWT token injection
- Automatic token refresh
- Error handling
- Request/response interceptors

## 🎭 Demo Credentials

```
Admin:
Email: admin@parikshabhumi.com
Password: admin123

Student:
Email: student@parikshabhumi.com
Password: student123
```

## 🔧 Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 🎯 Key Features Implemented

### Bilingual Support
- All content supports English and Hindi
- Language toggle in UI
- Color-coded inputs (Blue for English, Orange for Hindi)

### Admin Features
- Complete CRUD operations for all entities
- Drag-and-drop reordering
- Bulk import with CSV validation
- Rich text question editor
- Publish/Unpublish workflow
- Advanced filtering and search

### Student Features
- Mock test catalog with filters
- Timer-based test taking
- Mark for review functionality
- Language switching during test
- Detailed results with answer review

## 🚧 Future Enhancements

- Mock test builder with drag-drop
- Advanced analytics and reporting
- Performance tracking over time
- Mobile app version
- Offline support
- Payment integration
- Discussion forums
- Video explanations

## 📄 License

MIT

## 👥 Support

For support, email support@parikshabhumi.com
