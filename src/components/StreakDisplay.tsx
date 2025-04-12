
import React from 'react';
import { useStreak } from '@/contexts/StreakContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Trophy, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  minimal?: boolean;
}

const StreakDisplay: React.FC<StreakDisplayProps> = ({ minimal = false }) => {
  const { streak, isLoading } = useStreak();

  if (isLoading) {
    return (
      <div className="animate-pulse flex flex-col items-center rounded-lg p-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 mb-4"></div>
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!streak) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">No streak data available</p>
      </div>
    );
  }

  if (minimal) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
        <Flame 
          className={cn(
            "h-5 w-5",
            streak.current_streak > 0 ? "text-orange-500" : "text-gray-400"
          )} 
        />
        <span className="font-medium">{streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}</span>
      </div>
    );
  }

  // Calculate milestone status
  const milestones = [
    { days: 7, achieved: streak.current_streak >= 7 },
    { days: 30, achieved: streak.current_streak >= 30 },
    { days: 100, achieved: streak.current_streak >= 100 },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Streak</CardTitle>
          <Trophy className={cn(
            "h-5 w-5",
            streak.longest_streak >= 7 ? "text-amber-500" : "text-gray-300"
          )} />
        </div>
        <CardDescription>Keep your momentum going!</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center">
            <div 
              className={cn(
                "h-20 w-20 rounded-full flex items-center justify-center",
                streak.current_streak > 0 
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white" 
                  : "bg-gray-100 text-gray-400"
              )}
            >
              <Flame className="h-10 w-10" />
            </div>
            <div className="absolute -bottom-3 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
              <span className="font-bold text-lg">{streak.current_streak}</span>
              <span className="text-sm text-gray-500 ml-1">day{streak.current_streak !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-2">
          <p className="text-sm text-gray-500">Best streak: <span className="font-medium text-gray-700">{streak.longest_streak} days</span></p>
          {streak.last_completed_date && (
            <p className="text-xs text-gray-500 mt-1">
              Last completed: <span className="font-medium">{new Date(streak.last_completed_date).toLocaleDateString()}</span>
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0 text-xs text-gray-500">
        <div className="flex gap-2">
          {milestones.map((milestone) => (
            <div 
              key={milestone.days} 
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full",
                milestone.achieved ? "bg-amber-100" : "bg-gray-100"
              )}
            >
              <CalendarCheck className={cn(
                "h-3 w-3",
                milestone.achieved ? "text-amber-500" : "text-gray-400"
              )} />
              <span>{milestone.days}d</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StreakDisplay;
