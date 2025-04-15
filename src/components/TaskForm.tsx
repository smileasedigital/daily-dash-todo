
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { useTasksContext } from '@/contexts/TasksContext';
import { formatDateForTask } from '@/utils/taskUtils';
import { toast } from 'sonner';

interface TaskFormProps {
  autoFocus?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ autoFocus = false }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask, selectedDate } = useTasksContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const formattedDate = formatDateForTask(selectedDate);
      await addTask(title.trim(), undefined, undefined, undefined, undefined, formattedDate);
      setTitle('');
      toast.success('Task added');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex items-center gap-2 mb-6 bg-gray-50 rounded-xl p-1 pl-4 transition-all"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="border-none bg-transparent shadow-none focus-visible:ring-0 flex-1 placeholder:text-gray-400"
        autoFocus={autoFocus}
      />
      <Button 
        type="submit" 
        disabled={!title.trim() || isSubmitting}
        size="sm"
        className="shrink-0 rounded-lg bg-black hover:bg-gray-800 text-white"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default TaskForm;
