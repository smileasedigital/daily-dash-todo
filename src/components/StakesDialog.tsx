
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTasks, Task } from '@/contexts/TasksContext';
import { toast } from 'sonner';

interface StakesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const StakesDialog: React.FC<StakesDialogProps> = ({ isOpen, onClose, task }) => {
  const [stakes, setStakes] = useState(task.stakes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addStakes, removeStakes } = useTasks();

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (stakes.trim()) {
        await addStakes(task.id, stakes);
        toast.success('Stakes added successfully');
      } else {
        await removeStakes(task.id);
        toast.success('Stakes removed');
      }
      onClose();
    } catch (error) {
      console.error('Error saving stakes:', error);
      toast.error('Failed to save stakes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>{task.stakes ? 'Edit Stakes' : 'Add Stakes'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2 dark:text-gray-300">
              What are you putting at stake to ensure you complete this task?
            </p>
            <Textarea
              placeholder="E.g., 'No TV tonight if I don't finish this', 'Have to donate $10 to charity', etc."
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              className="min-h-[100px] dark:bg-gray-700 dark:text-white dark:border-gray-600"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              Save Stakes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StakesDialog;
