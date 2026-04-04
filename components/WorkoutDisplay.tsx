import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Dumbbell, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Make sure to import Button

export interface CleanExercise {
  id: string;
  name: string;
  reps: number;
  sets: number;
}

export interface CleanWorkout {
  id: string;
  workoutName: string;
  duration: number;
  exercises: CleanExercise[];
  createdAt: Date; 
}

export interface WorkoutProps {
  workout: CleanWorkout;
  onDelete?: (id: string) => void; // Added this prop
}

export default function WorkoutDisplay({ workout, onDelete }: WorkoutProps) {
  const date = workout.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="w-full overflow-hidden border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl capitalize font-bold text-primary">
              {workout.workoutName}
            </CardTitle>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{date}</span>
            </div>
          </div>
          
          {/* Action Area: Duration + Delete Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              {Math.round(workout.duration / 60)} mins
            </div>
            
            {/* Delete Button (Only shows if onDelete is passed from parent) */}
            {onDelete && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                onClick={() => onDelete(workout.id)}
                title="Delete Workout"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2 border-b pb-1">
            <Dumbbell className="w-4 h-4 text-red-500" />
            Exercises
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {workout.exercises.map((ex, index) => (
              <div
                key={ex.id + index}
                className="flex justify-between items-center bg-muted/30 p-2 rounded-md text-sm"
              >
                <span className="font-medium capitalize">{ex.name}</span>
                <span className="text-muted-foreground">
                  <span className="font-bold text-foreground">{ex.sets}</span>{" "}
                  sets ×{" "}
                  <span className="font-bold text-foreground">{ex.reps}</span>{" "}
                  reps
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}