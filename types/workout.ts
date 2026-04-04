// types/workout.ts
export interface Exercise {
  name: string;
  reps: number;
  sets: number;
  time: number;
}

export interface Workout {
  _id?: string;
  workoutName: string;
  exercises: Exercise[];
}