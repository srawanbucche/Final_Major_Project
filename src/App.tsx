import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AnalysisPage } from '@/pages/AnalysisPage'
import { AnalysisSettingsPage } from '@/pages/AnalysisSettingsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { DataSourcesPage } from '@/pages/DataSourcesPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { LandingPage } from '@/pages/LandingPage'
import { LegalPage } from '@/pages/LegalPage'
import { LoginPage } from '@/pages/LoginPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OnboardingPage } from '@/pages/OnboardingPage'
import { PrivacyConsentPage } from '@/pages/PrivacyConsentPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SignupPage } from '@/pages/SignupPage'
import { TrendsPage } from '@/pages/TrendsPage'

function OnboardingGate() {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="grid min-h-svh place-items-center text-sm text-muted-foreground">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (user.onboarding_complete) return <Navigate to="/dashboard" replace />
  return <OnboardingPage />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<LegalPage kind="terms" />} />
          <Route path="/privacy" element={<LegalPage kind="privacy" />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>
          <Route path="/onboarding" element={<OnboardingGate />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/data-sources" element={<DataSourcesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/analysis-settings" element={<AnalysisSettingsPage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/privacy-consent" element={<PrivacyConsentPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  )
}
