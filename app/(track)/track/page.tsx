"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutDisplay, { CleanWorkout } from "@/components/WorkoutDisplay";

// --- Types ---
// This represents the messy data exactly as it comes from your API/MongoDB
type RawWorkout = {
  _id: { $oid: string } | string;
  workoutName: string;
  createdAt: { $date: string } | string;
  duration: number;
  exercises: {
    _id: { $oid: string } | string;
    name: string;
    reps: number;
    sets: number;
  }[];
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function WorkoutAnalysis() {
  // We strictly tell React: "Only store CLEAN workouts in this state"
  const [workouts, setWorkouts] = useState<CleanWorkout[]>([]);
  const { theme } = useTheme();
  
  // States for filtering
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get("/api/workout/store");
      const rawData: RawWorkout[] = res.data.workouts || [];

      // THE ADAPTER: Clean the data immediately!
      const cleanData: CleanWorkout[] = rawData.map((w) => {
        // Extract dates safely
        const dateString = typeof w.createdAt === 'string' ? w.createdAt : w.createdAt.$date;
        
        return {
          id: typeof w._id === 'string' ? w._id : w._id.$oid,
          workoutName: w.workoutName,
          duration: w.duration,
          createdAt: new Date(dateString), // Convert to real JS Date object
          exercises: w.exercises.map(ex => ({
            id: typeof ex._id === 'string' ? ex._id : ex._id.$oid,
            name: ex.name,
            reps: ex.reps,
            sets: ex.sets,
          }))
        };
      });

      // Save the cleaned data to state
      setWorkouts(cleanData);
    } catch (error) {
      console.error("Error fetching workouts", error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Generate Year Range from CLEAN Data
  const availableYears = useMemo(() => {
    if (workouts.length === 0) return [new Date().getFullYear()];
    const years = workouts.map(w => w.createdAt.getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [workouts]);

  // Filtering Logic: Match both Month and Year using CLEAN Data
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      // Much simpler because w.createdAt is guaranteed to be a Date object!
      return w.createdAt.getFullYear() === activeYear && w.createdAt.getMonth() === activeMonth;
    });
  }, [workouts, activeYear, activeMonth]);

  const chartData = useMemo(() => getCurrentWeekDays(workouts), [workouts]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-tighter text-center italic uppercase">
        Repx Analysis
      </h1>

      {/* Chart Section */}
      <Card className="w-full shadow-2xl rounded-3xl border-none bg-gradient-to-b from-background to-muted/20 mb-10">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Activity Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                   cursor={{ fill: 'transparent' }} 
                   content={({ active, payload }) => {
                     if (active && payload?.length) return (
                        <div className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-bold">
                            {payload[0].value} Workouts
                        </div>
                     );
                     return null;
                   }}
                />
                <Bar
                  dataKey="value"
                  fill={theme === "dark" ? "#ef4444" : "#b91c1c"}
                  radius={[10, 10, 10, 10]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Section */}
      <div className="w-full space-y-6 mb-8">
        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Select Year</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {availableYears.map(year => (
                    <button
                        key={year}
                        onClick={() => setActiveYear(year)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border ${
                            activeYear === year 
                            ? "bg-foreground text-background border-foreground shadow-lg scale-95" 
                            : "bg-background text-muted-foreground border-muted hover:border-foreground"
                        }`}
                    >
                        {year}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Select Month</span>
            <Tabs value={activeMonth.toString()} onValueChange={(v) => setActiveMonth(parseInt(v))} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto bg-muted/50 backdrop-blur-sm h-auto p-1 gap-1 no-scrollbar rounded-2xl border">
                    {MONTHS.map((month, index) => (
                    <TabsTrigger
                        key={month}
                        value={index.toString()}
                        className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-xl py-2 px-5 text-xs font-semibold transition-all"
                    >
                        {month}
                    </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
      </div>

      {/* Filtered Workouts List */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end px-1 mb-2">
          <h3 className="font-black text-2xl uppercase italic tracking-tighter">
            {MONTHS[activeMonth]} <span className="text-red-500">{activeYear}</span>
          </h3>
          <span className="text-xs font-bold bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">
            {filteredWorkouts.length} SESSIONS
          </span>
        </div>

        {filteredWorkouts.length > 0 ? (
          <div className="grid gap-4">
             {filteredWorkouts.map((workout) => (
                <WorkoutDisplay 
                  // Because we mapped the data, it's just 'workout.id' now!
                  key={workout.id} 
                  workout={workout}
                />
              ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl opacity-50">
            <p className="text-sm font-medium">No sessions recorded for this period</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Chart Logic updated to use the CLEAN data
const getCurrentWeekDays = (workouts: CleanWorkout[]) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
  
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      const count = workouts.filter(w => {
        // Look how clean this is compared to the old string checking!
        return w.createdAt.toDateString() === d.toDateString();
      }).length;
      
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), value: count };
    });
};