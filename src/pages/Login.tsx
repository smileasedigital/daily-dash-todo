
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarCheck } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithGoogle, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (currentUser && !loading) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarCheck className="h-10 w-10 text-todo-blue" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Daily Dash</h1>
          <p className="text-gray-500">
            Simple day-based task management to keep you productive
          </p>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            Continue with Google
          </Button>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>No account needed. Just sign in and start organizing your day!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
