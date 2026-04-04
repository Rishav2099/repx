import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Dumbbell, Calendar } from "lucide-react";

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
}

export default function WorkoutDisplay({ workout }: WorkoutProps) {
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
          <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-xs font-medium">
            <Clock className="w-3.5 h-3.5" />
            {Math.round(workout.duration / 60)} mins
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