"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Timer, Clock } from "lucide-react";

const Page = () => {
  const [time, setTime] = useState(0);
  const [start, setStart] = useState(false);
  const [mode, setMode] = useState<"timer" | "stopwatch">("timer");
  
  // Timer input states
  const [minutes, setMinutes] = useState<number | "">("");
  const [seconds, setSeconds] = useState<number | "">("");
  
  const beepAudioRef = useRef<HTMLAudioElement | null>(null);
  const beepPlayedRef = useRef(false);

  // Initialize audio on client side to avoid SSR issues
  useEffect(() => {
    beepAudioRef.current = new Audio("/sounds/beep.mp3");
  }, []);

  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    beepPlayedRef.current = false;

    if (!start) return;

    if (mode === "stopwatch") {
      id = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }

    if (mode === "timer") {
      id = setInterval(() => {
        setTime((prev) => {
          if (prev <= 0) {
            clearInterval(id!);
            setStart(false);
            return 0;
          }

          // Play beep only once at 5 seconds
          if (prev === 5 && !beepPlayedRef.current && beepAudioRef.current) {
            beepAudioRef.current.play().catch(() => {});
            beepPlayedRef.current = true;
          }

          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (id) clearInterval(id);
    };
  }, [start, mode]);

  const formatTime = (sec: number) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    
    // Hide hours if 0 to make it look cleaner, unless it has hours
    if (h === "00") return `${m}:${s}`;
    return `${h}:${m}:${s}`;
  };

  const resetTime = () => {
    setTime(0);
    setStart(false);
    beepPlayedRef.current = false;
  };

  const handleSetTimer = () => {
    const m = typeof minutes === "number" ? minutes : 0;
    const s = typeof seconds === "number" ? seconds : 0;
    const total = Math.max(0, m * 60 + s);
    setTime(total);
    setStart(false);
    beepPlayedRef.current = false;
  };

  // Sync inputs with state changes
  useEffect(() => {
    handleSetTimer();
  }, [minutes, seconds]);

  return (
    <div className="max-h-dvh flex flex-col bg-background text-foreground pb-10">
      
      {/* Header */}
      <header className="flex justify-center items-center py-6 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="font-black text-2xl tracking-widest uppercase text-red-600 flex items-center gap-2">
          {mode === "timer" ? <Timer className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
          {mode}
        </h1>
      </header>

      {/* Segmented Mode Switch */}
      <div className="flex justify-center mt-8 px-4">
        <div className="flex p-1 bg-muted/50 rounded-2xl w-full max-w-sm border border-border/50">
          <button
            onClick={() => {
              setMode("timer");
              resetTime();
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              mode === "timer"
                ? "bg-background text-foreground shadow-sm shadow-black/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Timer
          </button>
          <button
            onClick={() => {
              setMode("stopwatch");
              resetTime();
            }}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
              mode === "stopwatch"
                ? "bg-background text-foreground shadow-sm shadow-black/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6">
        
        {/* Massive Clock Display */}
        <motion.div
          key={mode} // Animates slightly when switching modes
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-center my-8"
        >
          {/* Subtle glowing ring behind the timer */}
          <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 transition-colors duration-1000 ${start ? "bg-red-500" : "bg-transparent"}`} />
          
          <h1 className="text-8xl sm:text-[10rem] font-black tabular-nums tracking-tighter text-foreground relative z-10">
            {formatTime(time)}
          </h1>
        </motion.div>

        {/* Dynamic Timer Inputs (Fades out when running) */}
        <AnimatePresence>
          {mode === "timer" && !start && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center items-center gap-4 mb-8 overflow-hidden"
            >
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-24 h-20 text-center text-4xl font-bold bg-muted/30 border-2 border-border/50 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="00"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Min</span>
              </div>
              <span className="text-4xl font-bold text-muted-foreground pb-6">:</span>
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-24 h-20 text-center text-4xl font-bold bg-muted/30 border-2 border-border/50 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  placeholder="00"
                />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Sec</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Floating Action Controls */}
      <div className="flex justify-center gap-6 mt-auto">
        <Button
          onClick={() => setStart((prev) => !prev)}
          className={`w-20 h-20 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center
            ${start 
              ? "bg-muted/80 text-foreground hover:bg-muted" 
              : "bg-red-600 text-white hover:bg-red-700 shadow-red-500/30"
            }`}
        >
          {start ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </Button>
        
        <Button
          onClick={resetTime}
          variant="outline"
          className="w-20 h-20 rounded-full border-2 border-border hover:bg-muted transition-transform active:scale-95"
        >
          <RotateCcw className="w-8 h-8 text-muted-foreground" />
        </Button>
      </div>

    </div>
  );
};

export default Page;