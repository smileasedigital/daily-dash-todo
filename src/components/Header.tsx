
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, signOut } = useAuth();

  return (
    <header className="bg-white sticky top-0 z-10 border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>

        {currentUser && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-gray-100">
                <AvatarImage src={currentUser.photoURL} alt={currentUser.name} />
                <AvatarFallback>
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sign out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
