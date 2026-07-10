const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'minuri-next/src/app');

const routes = {
  // Public Routes
  'page.js': `import { Home } from '@/views/Home';\nexport default function Page() { return <Home />; }`,
  'about/page.js': `import { About } from '@/views/About';\nexport default function Page() { return <About />; }`,
  'blog/page.js': `import { Blog } from '@/views/Blog';\nexport default function Page() { return <Blog />; }`,
  'contact/page.js': `import { Contact } from '@/views/Contact';\nexport default function Page() { return <Contact />; }`,
  'lms/page.js': `import { Gateway } from '@/views/Gateway';\nexport default function Page() { return <Gateway />; }`,
  'auth/callback/page.js': `import { AuthCallback } from '@/views/AuthCallback';\nexport default function Page() { return <AuthCallback />; }`,
  
  // Student Dashboard Routes
  'app/layout.js': `import { DashboardLayout } from '@/layouts/DashboardLayout';\nexport default function Layout({ children }) { return <DashboardLayout>{children}</DashboardLayout>; }`,
  'app/catalog/page.js': `import { Catalog } from '@/views/student/Catalog';\nexport default function Page() { return <Catalog />; }`,
  'app/library/page.js': `import { Library } from '@/views/student/Library';\nexport default function Page() { return <Library />; }`,
  'app/live/page.js': `import { LiveClasses } from '@/views/student/LiveClasses';\nexport default function Page() { return <LiveClasses />; }`,
  'app/quizzes/page.js': `import { Quizzes } from '@/views/student/Quizzes';\nexport default function Page() { return <Quizzes />; }`,
  'app/progress/page.js': `import { Progress } from '@/views/student/Progress';\nexport default function Page() { return <Progress />; }`,
  'app/ai/page.js': `import { AITutor } from '@/views/student/AITutor';\nexport default function Page() { return <AITutor />; }`,

  // Admin Routes
  'admin/layout.js': `import { AdminLayout } from '@/layouts/AdminLayout';\nexport default function Layout({ children }) { return <AdminLayout>{children}</AdminLayout>; }`,
  'admin/approvals/page.js': `import { Approvals } from '@/views/admin/Approvals';\nexport default function Page() { return <Approvals />; }`,
  'admin/content/page.js': `import { Content } from '@/views/admin/Content';\nexport default function Page() { return <Content />; }`,
  'admin/users/page.js': `import { Users } from '@/views/admin/Users';\nexport default function Page() { return <Users />; }`,
  'admin/cms/page.js': `import { CMS } from '@/views/admin/CMS';\nexport default function Page() { return <CMS />; }`,
  'admin/limits/page.js': `import { Limits } from '@/views/admin/Limits';\nexport default function Page() { return <Limits />; }`,
  'admin/ai/page.js': `import { AISources } from '@/views/admin/AISources';\nexport default function Page() { return <AISources />; }`,
  'admin/reports/page.js': `import { Reports } from '@/views/admin/Reports';\nexport default function Page() { return <Reports />; }`,

  // Teacher Routes
  'teach/layout.js': `import { TeacherLayout } from '@/layouts/TeacherLayout';\nexport default function Layout({ children }) { return <TeacherLayout>{children}</TeacherLayout>; }`,
  'teach/stream/page.js': `import { Stream } from '@/views/teacher/Stream';\nexport default function Page() { return <Stream />; }`,
  'teach/quizzes/page.js': `import { QuizBuilder } from '@/views/teacher/QuizBuilder';\nexport default function Page() { return <QuizBuilder />; }`,
  'teach/reports/page.js': `import { Reports } from '@/views/admin/Reports';\nexport default function Page() { return <Reports />; }`,
};

Object.entries(routes).forEach(([routePath, content]) => {
  const fullPath = path.join(appDir, routePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, '"use client";\n\n' + content, 'utf8');
  console.log('Created', routePath);
});
