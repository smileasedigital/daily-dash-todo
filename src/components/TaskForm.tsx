
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onAdd: (title: string) => void;
  autoFocus?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, autoFocus = false }) => {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    onAdd(title.trim());
    setTitle('');
    setIsSubmitting(false);
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
