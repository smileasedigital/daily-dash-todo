
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import StreakDisplay from '@/components/StreakDisplay';
import { Flame, LogOut, Calendar, CheckSquare, Moon, Sun, Settings, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const AppSidebar: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const getUserInitials = () => {
    if (!currentUser) return 'U';
    
    if (currentUser.user_metadata?.name) {
      const names = currentUser.user_metadata.name.split(' ');
      return names.map(name => name[0]).join('').toUpperCase();
    }
    
    return currentUser.email?.[0].toUpperCase() || 'U';
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage 
              src={currentUser?.user_metadata?.avatar_url} 
              alt={currentUser?.email || "User"} 
            />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {currentUser?.user_metadata?.name || currentUser?.email || "User"}
            </p>
            {currentUser?.email && (
              <p className="text-xs text-muted-foreground truncate max-w-32">
                {currentUser.email}
              </p>
            )}
          </div>
        </div>
        
        <div className="px-2 my-2">
          <StreakDisplay minimal />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Tasks" isActive>
              <CheckSquare className="h-4 w-4 mr-2" />
              <span>Tasks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Calendar">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Calendar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Streaks">
              <Flame className="h-4 w-4 mr-2" />
              <span>Streaks</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Email Settings">
              <Mail className="h-4 w-4 mr-2" />
              <span>Email Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <Separator className="my-4" />
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={theme === 'light' ? 'Dark Mode' : 'Light Mode'} onClick={toggleTheme}>
              {theme === 'light' ? (
                <Moon className="h-4 w-4 mr-2" />
              ) : (
                <Sun className="h-4 w-4 mr-2" />
              )}
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => {
            signOut();
            navigate('/login');
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
