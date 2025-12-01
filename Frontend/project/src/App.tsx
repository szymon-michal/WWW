import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DentistLayout } from './components/layout/DentistLayout';
import { PatientLayout } from './components/layout/PatientLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Auth pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Dentist pages
import { DashboardPage } from './pages/dentist/DashboardPage';
import { PatientsPage } from './pages/dentist/PatientsPage';
import { PatientDetailsPage } from './pages/dentist/PatientDetailsPage';

// Patient pages
import { MyDashboard } from './pages/patient/MyDashboard';
import { MyAppointments } from './pages/patient/MyAppointments';
import { MyHealth } from './pages/patient/MyHealth';
import { MyBilling } from './pages/patient/MyBilling';
import { MyProfile } from './pages/patient/MyProfile';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['DENTIST', 'STAFF']}>
            <DentistLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
      </Route>

      <Route
        path="/patients"
        element={
          <ProtectedRoute allowedRoles={['DENTIST', 'STAFF']}>
            <DentistLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientsPage />} />
        <Route path=":id" element={<PatientDetailsPage />} />
      </Route>

      {/* Patient routes */}
      <Route
        path="/my/*"
        element={
          <ProtectedRoute allowedRoles={['PATIENT']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<MyDashboard />} />
        <Route path="appointments" element={<MyAppointments />} />
        <Route path="health" element={<MyHealth />} />
        <Route path="billing" element={<MyBilling />} />
        <Route path="profile" element={<MyProfile />} />
      </Route>

      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'PATIENT' ? (
              <Navigate to="/my/dashboard" replace />
            ) : user?.role === 'ADMIN' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Fallback for unmatched routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;