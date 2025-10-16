import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// Pages
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import DashboardLayout from "@/pages/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import ContentLibraryPage from "@/pages/ContentLibraryPage";
import VideoPlayerPage from "@/pages/VideoPlayerPage";
import UploadClipPage from "@/pages/UploadClipPage";
import CourseBuilderPage from "@/pages/CourseBuilderPage";
import CoursePlayerPage from "@/pages/CoursePlayerPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import UserManagementPage from "@/pages/UserManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import BillingPage from "@/pages/BillingPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import UserProfilePage from "@/pages/UserProfilePage";
import NotFoundPage from "@/pages/NotFoundPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            <Route path="/email-verification" element={<EmailVerificationPage />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="library" element={<ContentLibraryPage />} />
              <Route path="video/:id" element={<VideoPlayerPage />} />
              <Route path="upload" element={<UploadClipPage />} />
              <Route path="course-builder" element={<CourseBuilderPage />} />
              <Route path="course/:id" element={<CoursePlayerPage />} />
              <Route path="profile" element={<UserProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              
              {/* Admin routes */}
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/users" element={<UserManagementPage />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
