
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useTasks, Task } from '@/contexts/TasksContext';

interface ShareTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const ShareTaskDialog: React.FC<ShareTaskDialogProps> = ({ isOpen, onClose, task }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { shareTask, unshareTask } = useTasks();

  const handleShare = async () => {
    if (!email.trim()) return;
    
    try {
      setIsSubmitting(true);
      await shareTask(task.id, email);
      setEmail('');
    } catch (error) {
      console.error('Error sharing task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnshare = async (emailToRemove: string) => {
    try {
      setIsSubmitting(true);
      await unshareTask(task.id, emailToRemove);
    } catch (error) {
      console.error('Error unsharing task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share for Accountability</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Share this task with someone who can help keep you accountable.
              They'll be notified when you create and complete the task.
            </p>
            
            <div className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <Button onClick={handleShare} disabled={!email.trim() || isSubmitting}>
                Share
              </Button>
            </div>
          </div>
          
          {task.sharedWith && task.sharedWith.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Shared with:</h4>
              <div className="space-y-2">
                {task.sharedWith.map((sharedEmail) => (
                  <div key={sharedEmail} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                    <span className="text-sm">{sharedEmail}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnshare(sharedEmail)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTaskDialog;
