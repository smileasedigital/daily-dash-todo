import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Plus, Calendar as CalendarIcon, Users, AlertTriangle } from 'lucide-react';
import { useTasks } from '@/contexts/TasksContext';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TaskFormDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stakes, setStakes] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | null>(null);
  const [sharedWith, setSharedWith] = useState<string[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTask, selectedDate } = useTasks();

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Submitting task:', {
        title: title.trim(),
        stakes,
        description,
        priority,
        sharedWith: sharedWith.length > 0 ? sharedWith : undefined,
        date: format(date, 'yyyy-MM-dd')
      });
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      await addTask(
        title.trim(), 
        stakes, 
        description, 
        priority, 
        sharedWith.length > 0 ? sharedWith : undefined,
        formattedDate
      );
      resetForm();
      setOpen(false);
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEmail = () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (sharedWith.includes(email)) {
      toast.error('This email is already added');
      return;
    }
    
    setSharedWith([...sharedWith, email]);
    setEmail('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setSharedWith(sharedWith.filter(e => e !== emailToRemove));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStakes('');
    setEmail('');
    setPriority(null);
    setSharedWith([]);
    setDate(new Date());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-black hover:bg-gray-800 text-white flex gap-2 items-center">
          <Plus className="h-5 w-5" />
          <span>Add New Task</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description (optional)</label>
            <Textarea
              id="description"
              placeholder="Add details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="date" className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 pointer-events-auto">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">Priority</label>
            <Select value={priority || undefined} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Set priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="stakes" className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Stakes (optional)
            </label>
            <Textarea
              id="stakes"
              placeholder="What's at stake if you don't complete this task?"
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Share for Accountability (optional)
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={handleAddEmail}>
                Add
              </Button>
            </div>
            
            {sharedWith.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {sharedWith.map((email) => (
                  <div key={email} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded-full">
                    <span>{email}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
