
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';

const Index: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, loading, navigate]);

  return <Login />;
};

export default Index;
