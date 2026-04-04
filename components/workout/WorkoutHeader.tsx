import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

interface WorkoutHeaderProps {
  workoutName: string;
  isPaused: boolean;
  togglePause: () => void;
  formattedDuration: string;
}

export function WorkoutHeader({ workoutName, isPaused, togglePause, formattedDuration }: WorkoutHeaderProps) {
  return (
    <header className="flex justify-between items-center px-6 py-4 border-b">
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-2xl capitalize">{workoutName}</h1>
        <Button
          onClick={togglePause}
          variant="primary"
          size="icon"
          className="w-10 h-10 transition transform hover:scale-110 active:scale-95"
        >
          {isPaused ? <Play /> : <Pause />}
        </Button>
      </div>
      <div className="text-center">
        <span className="block font-mono text-lg">{formattedDuration}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider">Duration</span>
      </div>
    </header>
  );
}