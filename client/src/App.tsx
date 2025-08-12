import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ForumPage from './pages/ForumPage'
import MissionPage from './pages/MissionPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

import MapPage from './pages/MapPage'
import RankingPage from './pages/RankingPage'
import ONGsPage from './pages/ONGsPage'
import Donaciones from './pages/Donaciones'
import ProtectedRoute from './components/ProtectedRoute'
import UnauthenticatedOnlyRoute from './components/UnauthenticatedOnlyRoute'
import AuthenticatedOnlyRoute from './components/AuthenticatedOnlyRoute'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/verificar/:token" element={<VerifyEmailPage />} />
              
              {/* Rutas solo para usuarios NO registrados */}
              <Route path="/mission" element={
                <UnauthenticatedOnlyRoute>
                  <MissionPage />
                </UnauthenticatedOnlyRoute>
              } />
              <Route path="/ongs" element={
                <UnauthenticatedOnlyRoute>
                  <ONGsPage />
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
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App 