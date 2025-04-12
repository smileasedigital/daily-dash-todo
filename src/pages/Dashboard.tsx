
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TasksContext';
import Header from '@/components/Header';
import DateSelector from '@/components/DateSelector';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

const Dashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    filteredTasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    isLoading
  } = useTasks();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-md bg-gray-100 h-8 w-48 mb-4"></div>
          <div className="rounded-md bg-gray-100 h-20 w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-4 py-6">
        <DateSelector 
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />
        
        <TaskForm onAdd={addTask} autoFocus />
        
        <TaskList
          tasks={filteredTasks}
          onToggle={toggleTaskCompletion}
          onUpdate={updateTask}
          onDelete={deleteTask}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Dashboard;
