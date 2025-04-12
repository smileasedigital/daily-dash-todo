
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock user type - in a real app, this would come from your auth provider
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in (from localStorage in this mock version)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Mock Google Sign In
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      // This is a mock - in a real app, you'd use Firebase Auth or another provider
      const mockUser: User = {
        id: 'mock-user-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
        photoURL: 'https://ui-avatars.com/api/?name=John+Doe&background=random'
      };
      
      setCurrentUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      toast.success('Signed in successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      setCurrentUser(null);
      localStorage.removeItem('user');
      toast.info('Signed out');
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
