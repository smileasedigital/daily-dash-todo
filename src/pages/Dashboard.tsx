import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/contexts/TasksContext';
import { useStreak } from '@/contexts/StreakContext';
import Header from '@/components/Header';
import DateSelector from '@/components/DateSelector';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';
import StreakDisplay from '@/components/StreakDisplay';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Award, AlertTriangle, Share2 } from 'lucide-react';

interface TaskSummary {
  total: number;
  completed: number;
  withStakes: number;
  shared: number;
}

const Dashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    filteredTasks,
    tasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    isLoading: tasksLoading
  } = useTasks();
  const { streak, isLoading: streakLoading } = useStreak();
  const navigate = useNavigate();
  const [taskSummary, setTaskSummary] = useState<TaskSummary>({
    total: 0,
    completed: 0,
    withStakes: 0,
    shared: 0
  });

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  useEffect(() => {
    if (tasks.length === 0) return;
    
    const summary = {
      total: tasks.length,
      completed: tasks.filter(task => task.completed).length,
      withStakes: tasks.filter(task => task.stakes).length,
      shared: tasks.filter(task => task.sharedWith && task.sharedWith.length > 0).length
    };
    
    setTaskSummary(summary);
  }, [tasks]);

  if (loading || tasksLoading || streakLoading) {
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
      
      <main className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2">
            <DateSelector 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            
            <TaskForm onAdd={addTask} autoFocus />
          </div>
          
          <div>
            <StreakDisplay />
          </div>
        </div>
        
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="today">Today's Tasks</TabsTrigger>
            <TabsTrigger value="streaks">Streaks</TabsTrigger>
            <TabsTrigger value="stakes">Stakes</TabsTrigger>
            <TabsTrigger value="shared">Accountability</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today">
            <TaskList
              tasks={filteredTasks}
              onToggle={toggleTaskCompletion}
              onUpdate={updateTask}
              onDelete={deleteTask}
              isLoading={tasksLoading}
            />
          </TabsContent>
          
          <TabsContent value="streaks">
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Flame className="h-5 w-5 mr-2 text-orange-500" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-bold">{streak?.current_streak || 0}</div>
                  <p className="text-sm text-gray-500 mt-1">consecutive days</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 mr-2 text-amber-500" />
                    Longest Streak
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-bold">{streak?.longest_streak || 0}</div>
                  <p className="text-sm text-gray-500 mt-1">days achieved</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    Task Completion
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-4xl font-bold">{taskSummary.completed}</div>
                  <p className="text-sm text-gray-500 mt-1">of {taskSummary.total} tasks completed</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="stakes">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Tasks with Stakes
              </h3>
              <TaskList
                tasks={tasks.filter(task => task.stakes)}
                onToggle={toggleTaskCompletion}
                onUpdate={updateTask}
                onDelete={deleteTask}
                isLoading={tasksLoading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="shared">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Share2 className="h-5 w-5 mr-2 text-blue-500" />
                Shared for Accountability
              </h3>
              <TaskList
                tasks={tasks.filter(task => task.sharedWith && task.sharedWith.length > 0)}
                onToggle={toggleTaskCompletion}
                onUpdate={updateTask}
                onDelete={deleteTask}
                isLoading={tasksLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
