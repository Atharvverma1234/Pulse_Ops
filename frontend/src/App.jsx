// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider }   from './context/AuthContext';
import ProtectedRoute     from './components/ProtectedRoute';
import AppLayout          from './components/AppLayout';
import Login              from './pages/Login';
import Register           from './pages/Register';
import Dashboard          from './pages/dashboard/Dashboard';
import IncidentList       from './pages/incidents/IncidentList';
import IncidentDetail     from './pages/incidents/IncidentDetail';
import AlertList          from './pages/alerts/AlertList';
import AIIntelligence     from './pages/ai/AIIntelligence';   // ← add

function AppWithLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"    element={<Login />}    />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={<AppWithLayout><Dashboard /></AppWithLayout>}
          />
          <Route
            path="/incidents"
            element={<AppWithLayout><IncidentList /></AppWithLayout>}
          />
          <Route
            path="/incidents/:id"
            element={<AppWithLayout><IncidentDetail /></AppWithLayout>}
          />
          <Route
            path="/alerts"
            element={<AppWithLayout><AlertList /></AppWithLayout>}
          />
          <Route
            path="/ai"
            element={<AppWithLayout><AIIntelligence /></AppWithLayout>}  // ← add
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}