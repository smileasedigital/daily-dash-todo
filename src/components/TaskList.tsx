
import React from 'react';
import { Task } from '@/contexts/TasksContext';
import TaskItem from './TaskItem';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggle,
  onUpdate,
  onDelete,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-md bg-secondary h-8 w-48 mb-4"></div>
          <div className="rounded-md bg-secondary h-20 w-64"></div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <ClipboardList className="h-12 w-12 mb-2 opacity-20" />
        <p className="text-center">No tasks for this day</p>
        <p className="text-center text-sm">Add a task to get started</p>
      </div>
    );
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then sort by priority if present
    if (a.priority && b.priority && a.priority !== b.priority) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    // Then sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => (
        <div key={task.id} className="group">
          <TaskItem
            task={task}
            onToggle={onToggle}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
