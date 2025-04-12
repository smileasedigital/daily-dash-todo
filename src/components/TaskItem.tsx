
import React, { useState } from 'react';
import { Task } from '@/contexts/TasksContext';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<Task, 'id'>>) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleEdit = () => {
    setEditedTitle(task.title);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (editedTitle.trim()) {
      onUpdate(task.id, { title: editedTitle });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedTitle(task.title);
    }
  };

  const handleToggle = () => {
    onToggle(task.id);
  };

  return (
    <div className={cn(
      "flex items-center gap-3 py-3 px-4 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-all",
      task.completed && "bg-gray-50"
    )}>
      <Checkbox 
        checked={task.completed} 
        onCheckedChange={() => handleToggle()}
        className={cn(
          task.completed ? 'border-todo-green text-todo-green' : 'border-gray-300',
        )}
      />

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleUpdate}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleUpdate}
              className="h-8 w-8 p-0"
            >
              <Check className="h-4 w-4 text-todo-green" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setEditedTitle(task.title);
              }}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4 text-todo-red" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p 
            className={cn(
              "flex-1 transition-all",
              task.completed && "task-done"
            )}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleEdit}
              className="h-8 w-8 p-0 opacity-50 hover:opacity-100"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              className="h-8 w-8 p-0 text-todo-red opacity-50 hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
