import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

/* ── Lazy-loaded pages (each becomes its own JS chunk) ─── */
const LoginPage                  = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const EmployeeListPage           = lazy(() => import('./pages/employees/EmployeeListPage').then(m => ({ default: m.EmployeeListPage })));
const EmployeeNewPage            = lazy(() => import('./pages/employees/EmployeeNewPage').then(m => ({ default: m.EmployeeNewPage })));
const EmployeeDetailPage         = lazy(() => import('./pages/employees/EmployeeDetailPage').then(m => ({ default: m.EmployeeDetailPage })));
const DepartmentListPage         = lazy(() => import('./pages/departments/DepartmentListPage').then(m => ({ default: m.DepartmentListPage })));
const DepartmentDetailPage       = lazy(() => import('./pages/departments/DepartmentDetailPage').then(m => ({ default: m.DepartmentDetailPage })));
const LeaveListPage              = lazy(() => import('./pages/leaves/LeaveListPage').then(m => ({ default: m.LeaveListPage })));
const LeaveNewPage               = lazy(() => import('./pages/leaves/LeaveNewPage').then(m => ({ default: m.LeaveNewPage })));
const TimeOffPage                = lazy(() => import('./pages/TimeOffPage').then(m => ({ default: m.TimeOffPage })));
const ProfilePage                = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const OrgChartPage               = lazy(() => import('./pages/OrgChartPage').then(m => ({ default: m.OrgChartPage })));
const PerformanceReviewsPage     = lazy(() => import('./pages/performance-reviews/PerformanceReviewsPage').then(m => ({ default: m.PerformanceReviewsPage })));
const PerformanceReviewNewPage   = lazy(() => import('./pages/performance-reviews/PerformanceReviewNewPage').then(m => ({ default: m.PerformanceReviewNewPage })));
const PerformanceReviewDetailPage = lazy(() => import('./pages/performance-reviews/PerformanceReviewDetailPage').then(m => ({ default: m.PerformanceReviewDetailPage })));
const JobPostingsPage            = lazy(() => import('./pages/job-postings/JobPostingsPage').then(m => ({ default: m.JobPostingsPage })));
const JobPostingNewPage          = lazy(() => import('./pages/job-postings/JobPostingNewPage').then(m => ({ default: m.JobPostingNewPage })));
const JobApplicationPage         = lazy(() => import('./pages/job-postings/JobApplicationPage').then(m => ({ default: m.JobApplicationPage })));

/* ── Query client ─────────────────────────────────────── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,        // 1 min — avoid redundant refetches
      gcTime: 5 * 60_000,       // 5 min — keep cache longer
      refetchOnWindowFocus: false,
    },
  },
});

/* ── Suspense fallback ────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
      Loading…
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/employees" replace />} />

              {/* Manager routes */}
              <Route path="employees" element={<ProtectedRoute roles={['super_admin', 'hr_manager']}><EmployeeListPage /></ProtectedRoute>} />
              <Route path="employees/new" element={<ProtectedRoute roles={['super_admin', 'hr_manager']}><EmployeeNewPage /></ProtectedRoute>} />
              <Route path="employees/:id" element={<ProtectedRoute roles={['super_admin', 'hr_manager']}><EmployeeDetailPage /></ProtectedRoute>} />
              <Route path="departments" element={<DepartmentListPage />} />
              <Route path="departments/:id" element={<DepartmentDetailPage />} />
              <Route path="leaves" element={<LeaveListPage />} />
              <Route path="leaves/new" element={<ProtectedRoute roles={['employee']}><LeaveNewPage /></ProtectedRoute>} />

              {/* Employee routes */}
              <Route path="time-off" element={<TimeOffPage />} />

              {/* Shared routes */}
              <Route path="org-chart" element={<OrgChartPage />} />
              <Route path="performance-reviews" element={<PerformanceReviewsPage />} />
              <Route path="performance-reviews/new" element={<PerformanceReviewNewPage />} />
              <Route path="performance-reviews/:id" element={<PerformanceReviewDetailPage />} />
              <Route path="job-postings" element={<JobPostingsPage />} />
              <Route path="job-postings/new" element={<ProtectedRoute roles={['super_admin', 'hr_manager']}><JobPostingNewPage /></ProtectedRoute>} />
              <Route path="job-postings/:id/apply" element={<JobApplicationPage />} />

              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
