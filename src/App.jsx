import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SubscriptionProvider } from './hooks/useSubscription';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import AppLayout from './pages/AppLayout';
import Haul from './pages/Haul';
import Archive from './pages/Archive';
import Reading from './pages/Reading';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Onboarding, { ONBOARDING_KEY } from './components/Onboarding';

function ThemeManager() {
  useEffect(() => {
    const saved = localStorage.getItem('gn-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);
  return null;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: 'var(--text-muted)',
    }}>
      <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '50%' }} />
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      const completed = localStorage.getItem(ONBOARDING_KEY);
      if (!completed) {
        setShowOnboarding(true);
      }
    }
  }, [user, loading]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && user && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Haul />} />
          <Route path="archive" element={<Archive />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route
          path="/read/:id"
          element={
            <ProtectedRoute>
              <Reading />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeManager />
      <AuthProvider>
        <SubscriptionProvider>
          <AppRoutes />
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
