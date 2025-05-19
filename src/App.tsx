import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { Calendar } from './pages/Calendar';
import { NotFound } from './pages/NotFound';
import { Settings } from './components/settings/Settings';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { Landing } from './pages/Landing';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    console.log('App: Starting auth check...');
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('App: Got session:', session ? 'Session exists' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
    }).catch(error => {
      console.error('App: Error getting session:', error);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('App: Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="board/:boardId" element={<Board />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;