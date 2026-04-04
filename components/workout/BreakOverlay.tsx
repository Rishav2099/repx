import { Button } from "@/components/ui/button";
import { Timer, X, FastForward, Plus } from "lucide-react";

interface BreakOverlayProps {
  exerciseBreak: boolean;
  showBreakDropdown: boolean;
  setShowBreakDropdown: (show: boolean) => void;
  breakDuration: number;
  setBreakDuration: React.Dispatch<React.SetStateAction<number>>;
  skipBreak: () => void;
}

export function BreakOverlay({
  exerciseBreak,
  showBreakDropdown,
  setShowBreakDropdown,
  breakDuration,
  setBreakDuration,
  skipBreak,
}: BreakOverlayProps) {
  if (!exerciseBreak) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 flex flex-col items-end">
      
      {/* Minimized Pill State */}
      {!showBreakDropdown && (
        <button
          onClick={() => setShowBreakDropdown(true)}
          className="flex items-center gap-2 bg-background/80 backdrop-blur-md border border-border shadow-lg px-4 py-2.5 rounded-full hover:bg-accent transition-all duration-300 ease-out group"
        >
          <Timer className="w-4 h-4 text-red-500 group-hover:animate-spin-once" />
          <span className="font-bold tabular-nums text-foreground">
            {breakDuration}s
          </span>
        </button>
      )}

      {/* Expanded Card State */}
      <div
        className={`bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-72 transform transition-all duration-300 ease-out origin-top-right overflow-hidden
          ${
            showBreakDropdown
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 -translate-y-4 pointer-events-none absolute"
          }`}
      >
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-red-500">
              <Timer className="w-4 h-4" />
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">
                Recovery
              </h3>
            </div>
            <button
              onClick={() => setShowBreakDropdown(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Timer Display */}
          <div className="text-center mb-6">
            <span className="text-6xl font-black tabular-nums tracking-tighter text-foreground">
              {breakDuration}
            </span>
            <span className="text-2xl text-muted-foreground font-medium ml-1">
              s
            </span>
          </div>

          {/* Time Addition Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <Button
              size="sm"
              variant="secondary"
              className="font-semibold text-xs h-9 bg-muted/50 hover:bg-muted"
              onClick={() => setBreakDuration((prev) => prev + 15)}
            >
              <Plus className="w-3 h-3 mr-1" /> 15s
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="font-semibold text-xs h-9 bg-muted/50 hover:bg-muted"
              onClick={() => setBreakDuration((prev) => prev + 30)}
            >
              <Plus className="w-3 h-3 mr-1" /> 30s
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="font-semibold text-xs h-9 bg-muted/50 hover:bg-muted"
              onClick={() => setBreakDuration((prev) => prev + 60)}
            >
              <Plus className="w-3 h-3 mr-1" /> 60s
            </Button>
          </div>

          {/* Primary Action */}
          <Button
            onClick={skipBreak}
            className="w-full h-12 font-bold text-base bg-foreground text-background hover:bg-foreground/90 group"
          >
            Skip Rest
            <FastForward className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}