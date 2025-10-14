import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import NotificationManager from './components/NotificationManager'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ForumPage from './pages/ForumPage'
import PostDetailPage from './pages/PostDetailPage'
import MissionPage from './pages/MissionPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

import CompleteDataPage from './pages/CompleteDataPage'
import AuthCallbackPage from './pages/AuthCallbackPage'

import MapPage from './pages/MapPage'
import RankingPage from './pages/RankingPage'
import Donaciones from './pages/Donaciones'
import ProtectedRoute from './components/ProtectedRoute'
import UnauthenticatedOnlyRoute from './components/UnauthenticatedOnlyRoute'
import AuthenticatedOnlyRoute from './components/AuthenticatedOnlyRoute'

// Quick Actions pages
import CreateCampaignPage from './pages/CreateCampaignPage'
import ManageVolunteersPage from './pages/ManageVolunteersPage'
import ReportsPage from './pages/ReportsPage'
import DonationsHistoryPage from './pages/DonationsHistoryPage'
import SearchOrgsPage from './pages/SearchOrgsPage'
import VolunteerOpportunitiesPage from './pages/VolunteerOpportunitiesPage'
import MyHistoryPage from './pages/MyHistoryPage'
import MyDonationsPage from './pages/MyDonationsPage'
import AdminPage from './pages/AdminPage'
import PaymentsSetupPage from './pages/PaymentsSetupPage'
import DonationSuccessPage from './pages/DonationSuccessPage'
import DonationFailurePage from './pages/DonationFailurePage'
import DonationPendingPage from './pages/DonationPendingPage'

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <NotificationProvider>
        <NotificationManager />
        <div className="min-h-screen">
          {isAdminRoute ? (
            <Routes>
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          ) : (
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/verificar/:token" element={<VerifyEmailPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

                {/* Rutas solo para usuarios NO registrados */}
                <Route path="/mission" element={
                  <UnauthenticatedOnlyRoute>
                    <MissionPage />
                  </UnauthenticatedOnlyRoute>
                } />

                {/* Rutas solo para usuarios registrados */}
                <Route path="/donaciones" element={
                  <AuthenticatedOnlyRoute>
                    <Donaciones />
                  </AuthenticatedOnlyRoute>
                } />
                <Route path="/map" element={
                  <AuthenticatedOnlyRoute>
                    <MapPage />
                  </AuthenticatedOnlyRoute>
                } />
                <Route path="/ranking" element={
                  <AuthenticatedOnlyRoute>
                    <RankingPage />
                  </AuthenticatedOnlyRoute>
                } />

                {/* Rutas protegidas (requieren autenticación) */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/forum" element={
                  <ProtectedRoute>
                    <ForumPage />
                  </ProtectedRoute>
                } />
                <Route path="/forum/:id" element={
                  <ProtectedRoute>
                    <PostDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />

                {/* Quick Actions routes */}
                <Route path="/acciones/crear-campania" element={<ProtectedRoute><CreateCampaignPage /></ProtectedRoute>} />
                <Route path="/acciones/gestionar-voluntarios" element={<ProtectedRoute><ManageVolunteersPage /></ProtectedRoute>} />
                <Route path="/acciones/reportes" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                <Route path="/acciones/historial-donaciones" element={<ProtectedRoute><DonationsHistoryPage /></ProtectedRoute>} />
                <Route path="/acciones/buscar-organizaciones" element={<ProtectedRoute><SearchOrgsPage /></ProtectedRoute>} />
                <Route path="/acciones/oportunidades-voluntariado" element={<ProtectedRoute><VolunteerOpportunitiesPage /></ProtectedRoute>} />
                <Route path="/acciones/mi-historial" element={<ProtectedRoute><MyHistoryPage /></ProtectedRoute>} />
                <Route path="/acciones/mis-donaciones" element={<ProtectedRoute><MyDonationsPage /></ProtectedRoute>} />
                <Route path="/pagos/configurar" element={<ProtectedRoute><PaymentsSetupPage /></ProtectedRoute>} />
                {/* Rutas públicas de retorno de pagos */}
                <Route path="/donaciones/exito" element={<DonationSuccessPage />} />
                <Route path="/donaciones/error" element={<DonationFailurePage />} />
                <Route path="/donaciones/pendiente" element={<DonationPendingPage />} />
                <Route path="/complete-data" element={
                  <ProtectedRoute>
                    <CompleteDataPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          )}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-card)',
                color: 'var(--color-fg)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 10px 30px -12px rgba(0,0,0,0.20)'
              },
              success: {
                duration: 3000,
              },
              error: {
                duration: 5000,
              },
            }}
          />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;