import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from './store/slices/authSlice';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import LogAnalysis from './pages/LogAnalysis';
import Alerts from './pages/Alerts';
import ThreatIntel from './pages/ThreatIntel';
import Reports from './pages/Reports';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';

import ProtectedRoute from './components/layout/ProtectedRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMe());
    }
  }, []);

  return (
    <Routes>
      {/* ── Public routes ─────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Admin portal ──────────────────────────────── */}
      {/* Separate login page — red theme, admin-only */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <UserManagement />
        </ProtectedRoute>
      } />

      {/* ── User portal (analyst / viewer) ────────────── */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['analyst', 'viewer']}>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/cases" element={
        <ProtectedRoute allowedRoles={['analyst', 'viewer']}>
          <Cases />
        </ProtectedRoute>
      } />
      <Route path="/logs" element={
        <ProtectedRoute allowedRoles={['analyst', 'viewer']}>
          <LogAnalysis />
        </ProtectedRoute>
      } />
      <Route path="/threats" element={
        <ProtectedRoute allowedRoles={['analyst', 'viewer']}>
          <ThreatIntel />
        </ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute allowedRoles={['analyst', 'viewer']}>
          <Alerts />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={['analyst', 'viewer']}>
          <Reports />
        </ProtectedRoute>
      } />

      {/* ── Unauthorized ──────────────────────────────── */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400 mb-4">You don't have permission to view this page.</p>
            <a href="/login" className="text-blue-400 hover:text-blue-300 mr-4">User Login</a>
            <a href="/admin/login" className="text-red-400 hover:text-red-300">Admin Login</a>
          </div>
        </div>
      } />

      {/* ── Root & catch-all ──────────────────────────── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;