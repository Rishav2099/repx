"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const Page = () => {
  const [time, setTime] = useState(0);
  const [start, setStart] = useState(false);
  const [mode, setMode] = useState<"timer" | "stopwatch">("timer");
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const beepPlayedRef = useRef(false); // Track beep outside render

  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    beepPlayedRef.current = false; // Reset beep flag when mode/start changes

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
          if (prev === 5 && !beepPlayedRef.current) {
            const beep = new Audio("/sounds/beep.mp3");
            beep.play().catch(() => {}); // Ignore autoplay errors
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
    return `${h}:${m}:${s}`;
  };

  const resetTime = () => {
    setTime(0);
    setStart(false);
    beepPlayedRef.current = false;
  };

  const setTimer = () => {
    const total = Math.max(0, minutes * 60 + seconds);
    setTime(total);
    setStart(false);
    beepPlayedRef.current = false;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-center font-bold text-3xl py-6">Timer</h1>
        <Separator />
      </div>

      {/* Mode Switch */}
      <div className="w-[80vw] flex justify-evenly mx-auto my-6">
        <Button
          variant={mode === "timer" ? "primary" : "outline"}
          onClick={() => {
            setMode("timer");
            resetTime();
          }}
        >
          Timer
        </Button>
        <Button
          variant={mode === "stopwatch" ? "primary" : "outline"}
          onClick={() => {
            setMode("stopwatch");
            resetTime();
          }}
        >
          Stopwatch
        </Button>
      </div>

      {/* Timer Inputs (only for Timer mode) */}
      {mode === "timer" && (
        <div className="flex justify-center gap-4 my-4">
          <input
            type="number"
            min="0"
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-20 text-center border rounded-lg p-2"
            placeholder="Min"
          />
          <span className="text-xl font-bold">:</span>
          <input
            type="number"
            min="0"
            max="59"
            value={seconds}
            onChange={(e) => setSeconds(Number(e.target.value))}
            className="w-20 text-center border rounded-lg p-2"
            placeholder="Sec"
          />
          <Button onClick={setTimer} variant="outline">
            Set
          </Button>
        </div>
      )}

      {/* Timer / Stopwatch Display */}
      <motion.div
        className="flex-1 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <h1 className="text-6xl  font-bold tracking-widest">
          {formatTime(time)}
        </h1>
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center gap-4 pb-8 mt-10">
        <Button
          onClick={() => setStart((prev) => !prev)}
          variant={'primary'}
          className="px-8 text-lg rounded-2xl"
        >
          {start ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={resetTime}
          variant="outline"
          className="px-8 text-lg rounded-2xl"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Page;