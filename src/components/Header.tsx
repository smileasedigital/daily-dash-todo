
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react'; // Import sun and moon icons

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Get theme state and toggle function
  const location = useLocation();
  const isOnDashboard = location.pathname === '/dashboard';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link 
            to="/" 
            className="font-bold text-xl text-gray-800 dark:text-white flex items-center gap-2"
          >
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-md p-1">
              Todo
            </span>
            <span>App</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {currentUser ? (
            <>
              {!isOnDashboard && (
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              )}
              
              <Button 
                onClick={logout}
                variant="destructive"
              >
                Logout
              </Button>
              
              {currentUser.user_metadata?.avatar_url && (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={currentUser.user_metadata.avatar_url} 
                    alt="User avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
