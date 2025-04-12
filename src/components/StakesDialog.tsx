
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTasks, Task } from '@/contexts/TasksContext';

interface StakesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const StakesDialog: React.FC<StakesDialogProps> = ({ isOpen, onClose, task }) => {
  const [stakes, setStakes] = useState(task.stakes || '');
  const { addStakes, removeStakes } = useTasks();

  const handleSave = () => {
    if (stakes.trim()) {
      addStakes(task.id, stakes);
    } else {
      removeStakes(task.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.stakes ? 'Edit Stakes' : 'Add Stakes'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              What are you putting at stake to ensure you complete this task?
            </p>
            <Textarea
              placeholder="E.g., 'No TV tonight if I don't finish this', 'Have to donate $10 to charity', etc."
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              className="min-h-[100px]"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Stakes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StakesDialog;
