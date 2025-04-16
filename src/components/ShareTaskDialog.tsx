
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Loader2 } from 'lucide-react';
import { useTasksContext, Task } from '@/contexts/TasksContext';
import { toast } from 'sonner';

interface ShareTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const ShareTaskDialog: React.FC<ShareTaskDialogProps> = ({ isOpen, onClose, task }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { shareTask, unshareTask } = useTasksContext();

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await shareTask(task.id, email);
      setEmail('');
    } catch (error) {
      console.error('Error sharing task:', error);
      toast.error('Failed to share task. Please try again.');
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
      toast.error('Failed to remove shared user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dark:bg-gray-800 dark:text-white dark:border-gray-700">
        <DialogHeader>
          <DialogTitle>Share for Accountability</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2 dark:text-gray-300">
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
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Button 
                onClick={handleShare} 
                disabled={!email.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Share
              </Button>
            </div>
          </div>
          
          {task.sharedWith && task.sharedWith.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Shared with:</h4>
              <div className="space-y-2">
                {task.sharedWith.map((sharedEmail) => (
                  <div key={sharedEmail} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-md">
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
