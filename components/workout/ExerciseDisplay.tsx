import { Exercise } from "@/types/workout";

interface ExerciseDisplayProps {
  currentExercise: Exercise;
  currentSet: number; // <-- Added this
  editingField: "reps" | "sets" | null;
  setEditingField: (field: "reps" | "sets" | null) => void;
  updateExerciseField: (field: "reps" | "sets", value: number) => void;
  exerciseTime: number;
  formatTime: (sec: number) => string;
}

export function ExerciseDisplay({
  currentExercise,
  currentSet, // <-- Added this
  editingField,
  setEditingField,
  updateExerciseField,
  exerciseTime,
  formatTime,
}: ExerciseDisplayProps) {
  return (
    <main className="flex flex-col flex-1 items-center justify-center">
      <div
        className="rounded-full border-8 animate-flicker transition-transform duration-300 ease-in-out border-red-500 flex flex-col gap-8 items-center justify-center"
        style={{
          width: "clamp(250px, 95vw, 400px)",
          height: "clamp(250px, 95vw, 400px)",
        }}
      >
        <div className="flex flex-col items-center mt-5">
          <h2 className="font-bold text-2xl max-w-[90%] break-words text-center capitalize">
            {currentExercise.name}
          </h2>
          
          {/* UPDATED UI: "Set 1 of 3" */}
          <p className="text-lg font-semibold text-slate-400 mt-1">
            Set {currentSet} of {currentExercise.sets || 1}
          </p>
        </div>

        {currentExercise.reps ? (
          <div className="flex flex-col items-center">
            {/* Reps */}
            {editingField === "reps" ? (
              <input
                type="number"
                min={1}
                value={currentExercise.reps}
                className="bg-[#b13d404d] border-2 text-2xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center"
                onChange={(e) => updateExerciseField("reps", parseInt(e.target.value) || 1)}
                onBlur={() => setEditingField(null)}
                autoFocus
              />
            ) : (
              <p
                className="bg-[#b13d404d] border-2 text-2xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center cursor-pointer"
                onClick={() => setEditingField("reps")}
              >
                {currentExercise.reps}
              </p>
            )}
            <p className="font-bold text-sm uppercase tracking-widest mt-2 text-muted-foreground">Reps</p>

            {/* Sets */}
            {editingField === "sets" ? (
              <input
                type="number"
                min={1}
                value={currentExercise.sets}
                className="bg-[#b13d404d] border-2 text-xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center mt-3"
                onChange={(e) => updateExerciseField("sets", parseInt(e.target.value) || 1)}
                onBlur={() => setEditingField(null)}
                autoFocus
              />
            ) : (
              <p
                className="bg-[#b13d404d] border-2 text-xl font-bold text-white shadow-red-600 border-red-600 py-2 px-6 rounded-full w-24 text-center cursor-pointer mt-3"
                onClick={() => setEditingField("sets")}
              >
                {currentExercise.sets}
              </p>
            )}
            <p className="font-bold text-sm uppercase tracking-widest mt-1 text-muted-foreground">Sets</p>
          </div>
        ) : (
          <div>
            <p className="bg-[#b13d404d] border-2 text-4xl font-mono font-bold text-white shadow-red-600 border-red-600 py-4 px-8 rounded-full text-center">
              {formatTime(exerciseTime)}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}