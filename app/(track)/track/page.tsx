"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutDisplay from "@/components/WorkoutDisplay";

// --- Types ---
type Workout = {
  _id: { $oid: string } | string;
  workoutName: string;
  createdAt: { $date: string } | string;
  duration: number;
  exercises: unknown[];
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function WorkoutAnalysis() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const { theme } = useTheme();
  
  // States for filtering
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get("/api/workout/store");
      setWorkouts(res.data.workouts || []);
    } catch (error) {
      console.error("Error fetching workouts", error);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Generate Year Range from Data
  const availableYears = useMemo(() => {
    if (workouts.length === 0) return [new Date().getFullYear()];
    const years = workouts.map(w => {
        const dateStr = typeof w.createdAt === 'string' ? w.createdAt : w.createdAt.$date;
        return new Date(dateStr).getFullYear();
    });
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a); // Newest first
    return uniqueYears;
  }, [workouts]);

  // Filtering Logic: Match both Month and Year
  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w) => {
      const dateStr = typeof w.createdAt === 'string' ? w.createdAt : w.createdAt.$date;
      const d = new Date(dateStr);
      return d.getFullYear() === activeYear && d.getMonth() === activeMonth;
    });
  }, [workouts, activeYear, activeMonth]);

  const chartData = useMemo(() => getCurrentWeekDays(workouts), [workouts]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-tighter text-center italic uppercase">
        Repx Analysis
      </h1>

      {/* 1. Chart Section */}
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

      {/* 2. Enhanced Navigation Section */}
      <div className="w-full space-y-6 mb-8">
        
        {/* Year Selector */}
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

        {/* Month Tabs */}
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

      {/* 3. Filtered Workouts List */}
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
                  key={typeof workout._id === 'string' ? workout._id : workout._id.$oid} 
                  workout={workout as any} 
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

// Keep your getCurrentWeekDays function logic here...
const getCurrentWeekDays = (workouts: Workout[]) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
  
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const count = workouts.filter(w => {
        const dateStr = typeof w.createdAt === 'string' ? w.createdAt : w.createdAt.$date;
        const wd = new Date(dateStr);
        return wd.toDateString() === d.toDateString();
      }).length;
      return { day: d.toLocaleDateString("en-US", { weekday: "short" }), value: count };
    });
};