
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, CalendarCheck } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CalendarCheck className="h-6 w-6 text-todo-blue" />
          <h1 className="text-xl font-semibold text-gray-800">Daily Dash</h1>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={currentUser.photoURL} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {currentUser.name}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-500"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:ml-2">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
