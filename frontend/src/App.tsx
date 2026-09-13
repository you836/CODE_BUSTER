import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import IAMRoles from './pages/IAMRoles';
import RoleDetail from './pages/RoleDetail';
import AccessAnalysis from './pages/AccessAnalysis';
import Candidates from './pages/Candidates';
import PolicyGenerator from './pages/PolicyGenerator';
import Simulation from './pages/Simulation';
import DependencyGraph from './pages/DependencyGraph';
import Verification from './pages/Verification';
import AuditTrail from './pages/AuditTrail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="roles" element={<IAMRoles />} />
            <Route path="roles/:id" element={<RoleDetail />} />
            <Route path="access-analysis" element={<AccessAnalysis />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="policy" element={<PolicyGenerator />} />
            <Route path="simulation" element={<Simulation />} />
            <Route path="dependency-graph" element={<DependencyGraph />} />
            <Route path="verification" element={<Verification />} />
            <Route path="audit-trail" element={<AuditTrail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
