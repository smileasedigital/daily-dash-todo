
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { TasksProvider } from './contexts/TasksContext';
import { StreakProvider } from './contexts/StreakContext';
import { ThemeProvider } from './contexts/ThemeContext';

import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <TasksProvider>
            <StreakProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster position="top-right" />
            </StreakProvider>
          </TasksProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
