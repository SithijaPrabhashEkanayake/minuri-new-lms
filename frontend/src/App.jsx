import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Gateway } from './pages/Gateway';
import { AuthCallback } from './pages/AuthCallback';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { TeacherLayout } from './layouts/TeacherLayout';
import { Catalog } from './pages/student/Catalog';
import { Library } from './pages/student/Library';
import { LiveClasses } from './pages/student/LiveClasses';
import { Quizzes } from './pages/student/Quizzes';
import { Progress } from './pages/student/Progress';
import { AITutor } from './pages/student/AITutor';
import { Approvals } from './pages/admin/Approvals';
import { Content } from './pages/admin/Content';
import { Limits } from './pages/admin/Limits';
import { Users } from './pages/admin/Users';
import { AISources } from './pages/admin/AISources';
import { Reports } from './pages/admin/Reports';
import { CMS } from './pages/admin/CMS';
import { Stream } from './pages/teacher/Stream';
import { QuizBuilder } from './pages/teacher/QuizBuilder';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';
import './index.css';

function PublicLayout() {
  return (
    <>
      <Navigation />
      <Outlet />
      <Footer />
    </>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Wait for auth to initialize
  }

  if (!user) {
    return <Navigate to="/lms" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user has wrong role, redirect to appropriate dashboard
    if (user.role === 'Admin') return <Navigate to="/admin/approvals" replace />;
    if (user.role === 'Teacher') return <Navigate to="/teach/stream" replace />;
    return <Navigate to="/app/library" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lms" element={<Gateway />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>

        {/* Student Dashboard Routes */}
        <Route path="/app" element={
          <ProtectedRoute allowedRoles={['Student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="catalog" element={<Catalog />} />
          <Route path="library" element={<Library />} />
          <Route path="live" element={<LiveClasses />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="progress" element={<Progress />} />
          <Route path="ai" element={<AITutor />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="approvals" element={<Approvals />} />
          <Route path="content" element={<Content />} />
          <Route path="users" element={<Users />} />
          <Route path="cms" element={<CMS />} />
          <Route path="limits" element={<Limits />} />
          <Route path="ai" element={<AISources />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Teacher Routes */}
        <Route path="/teach" element={
          <ProtectedRoute allowedRoles={['Teacher']}>
            <TeacherLayout />
          </ProtectedRoute>
        }>
          <Route path="stream" element={<Stream />} />
          <Route path="quizzes" element={<QuizBuilder />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;
