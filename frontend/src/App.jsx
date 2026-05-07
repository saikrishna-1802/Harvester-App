import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import JobEntry from './pages/driver/JobEntry';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import Expenses from './pages/admin/Expenses';
import Jobs from './pages/admin/Jobs';
import Rates from "./pages/admin/Rates";
import UserManagement from './pages/admin/UserManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/driver'} replace />;
  }
  
  return children;
};

function App() {
  const { user, loading } = useAuth();
  
  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/driver'} replace />
          ) : (
            <Login />
          )
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="settings" element={<Settings />} />
          <Route path="rates" element={<Rates />} />
          <Route path="jobs" element={<Jobs />} />
	  <Route path="users" element={<UserManagement />} />
        </Route>

        {/* Driver Routes */}
        <Route path="/driver" element={
          <ProtectedRoute allowedRoles={['driver']}>
            <JobEntry />
          </ProtectedRoute>
        } />

        {/* Root Redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
