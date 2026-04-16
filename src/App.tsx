import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/stores';
import { Toaster } from '@/components/ui/sonner';
import { Sidebar } from '@/components/layout/Sidebar';
import { VEXAgent } from '@/components/vex';

// Auth Pages
import { WelcomePage } from '@/pages/auth/WelcomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';

// Main Dashboard Pages
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ShieldPage } from '@/pages/modules/ShieldPage';
import { ListenerPage } from '@/pages/modules/ListenerPage';
import { BankPage } from '@/pages/modules/BankPage';
import { ArenaPage } from '@/pages/modules/ArenaPage';
import { ActionHubPage } from '@/pages/modules/ActionHubPage';
import { StudioPage } from '@/pages/modules/StudioPage';
import { GrowthPage } from '@/pages/modules/GrowthPage';
import { ControlTowerPage } from '@/pages/modules/ControlTowerPage';
import { LiminalPage } from '@/pages/modules/LiminalPage';

// Profile & Settings
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/profile/SettingsPage';
import { TokenStorePage } from '@/pages/profile/TokenStorePage';

// Legal Pages
import { TermsPage } from '@/pages/legal/TermsPage';
import { PrivacyPage } from '@/pages/legal/PrivacyPage';
import { CookiesPage } from '@/pages/legal/CookiesPage';
import { LiminalConsentPage } from '@/pages/legal/LiminalConsentPage';

import { cn } from '@/lib/utils';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Layout with Sidebar
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Don't show the floating VEX widget when on the dedicated /vex page
  const isOnVexPage = location.pathname === '/vex';

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <Sidebar />
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          'lg:ml-16',
          sidebarOpen && 'lg:ml-64'
        )}
      >
        <div className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
      {isAuthenticated && !isOnVexPage && <VEXAgent />}
    </div>
  );
}

function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Legal Routes */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/liminal-consent" element={<LiminalConsentPage />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shield"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ShieldPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/listener"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ListenerPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bank"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <BankPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/arena"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ArenaPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/action-hub"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ActionHubPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StudioPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/growth"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <GrowthPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/control-tower"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ControlTowerPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/liminal"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiminalPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vex"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <VEXAgent autoExpand />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tokens"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <TokenStorePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
