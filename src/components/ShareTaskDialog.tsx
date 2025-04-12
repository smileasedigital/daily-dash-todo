
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
import { Share2, X, User2 } from 'lucide-react';
import { toast } from 'sonner';

interface ShareTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const ShareTaskDialog: React.FC<ShareTaskDialogProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const { shareTask, unshareTask } = useTasks();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await shareTask(task.id, email);
      setEmail('');
    } catch (error) {
      console.error('Error sharing task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveShare = async (email: string) => {
    setIsSubmitting(true);
    try {
      await unshareTask(task.id, email);
    } catch (error) {
      console.error('Error removing shared email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-500" />
            Share Task for Accountability
          </DialogTitle>
          <DialogDescription>
            Share this task with friends who can help keep you accountable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Task</p>
            <p className="text-sm text-gray-500">{task.title}</p>
          </div>
          
          {task.sharedWith && task.sharedWith.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Currently shared with</p>
              <div className="space-y-1">
                {task.sharedWith.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                    <div className="flex items-center gap-2 text-sm">
                      <User2 className="h-4 w-4 text-blue-500" />
                      <span>{email}</span>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveShare(email)}
                      disabled={isSubmitting}
                      className="h-6 w-6 rounded-full"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label htmlFor="email" className="text-sm font-medium block mb-1">
                  Share with
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                disabled={!email.trim() || !validateEmail(email) || isSubmitting}
                className="mb-[1px]"
              >
                Share
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Your friend will receive an email notification about this task.
            </p>
          </form>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareTaskDialog;
