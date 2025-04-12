
import React, { useState } from 'react';
import { Task, useTasks } from '@/contexts/TasksContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Trash2 } from 'lucide-react';

interface StakesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const StakesDialog: React.FC<StakesDialogProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const { addStakes, removeStakes } = useTasks();
  const [stakes, setStakes] = useState(task.stakes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stakes.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addStakes(task.id, stakes);
      onClose();
    } catch (error) {
      console.error('Error adding stakes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveStakes = async () => {
    setIsSubmitting(true);
    try {
      await removeStakes(task.id);
      setStakes('');
      onClose();
    } catch (error) {
      console.error('Error removing stakes:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            {task.stakes ? 'Edit Stakes' : 'Add Stakes'}
          </DialogTitle>
          <DialogDescription>
            Add personal stakes to motivate yourself to complete this task.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Task</p>
            <p className="text-sm text-gray-500">{task.title}</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="stakes" className="text-sm font-medium">
              Your stakes
            </label>
            <Input
              id="stakes"
              placeholder="e.g. No TV tonight if not completed"
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              What will you give up if you don't complete this task?
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {task.stakes && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleRemoveStakes}
                disabled={isSubmitting}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Remove Stakes
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!stakes.trim() || isSubmitting}
            >
              {task.stakes ? 'Update Stakes' : 'Add Stakes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StakesDialog;
