"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkoutDisplay, { CleanWorkout } from "@/components/WorkoutDisplay";
import Loader from "@/components/loader"; // Make sure this path matches your file structure!

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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function WorkoutAnalysis() {
  const { theme } = useTheme();

  // States
  const [activeYear, setActiveYear] = useState<number>(
    new Date().getFullYear(),
  );
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
  const [isLoading, setIsLoading] = useState(true);

  // We use a dictionary cache to store workouts by "YYYY-MM" so we don't refetch
  const [workoutCache, setWorkoutCache] = useState<
    Record<string, CleanWorkout[]>
  >({});

  // Generate dynamic years (e.g., this year and the last 2 years)
  // Since we fetch lazily now, we shouldn't rely on data to know what years exist
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  }, []);

  const fetchWorkoutsForPeriod = async (year: number, month: number) => {
    const cacheKey = `${year}-${month}`;

    // If we already have the data for this month/year, don't fetch again!
    if (workoutCache[cacheKey]) {
      return;
    }

    setIsLoading(true);
    try {
      // Pass year and month as query parameters to your API
      const res = await axios.get("/api/workout/store", {
        params: { year, month },
      });

      const rawData: RawWorkout[] = res.data.workouts || [];

      const cleanData: CleanWorkout[] = rawData.map((w) => {
        const dateString =
          typeof w.createdAt === "string" ? w.createdAt : w.createdAt.$date;
        return {
          id: typeof w._id === "string" ? w._id : w._id.$oid,
          workoutName: w.workoutName,
          duration: w.duration,
          createdAt: new Date(dateString),
          exercises: w.exercises.map((ex) => ({
            id: typeof ex._id === "string" ? ex._id : ex._id.$oid,
            name: ex.name,
            reps: ex.reps,
            sets: ex.sets,
          })),
        };
      });

      // Save to cache
      setWorkoutCache((prev) => ({
        ...prev,
        [cacheKey]: cleanData,
      }));
    } catch (error) {
      console.error("Error fetching workouts", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data whenever the user changes the Year or Month tab
  useEffect(() => {
    fetchWorkoutsForPeriod(activeYear, activeMonth);
  }, [activeYear, activeMonth]);

  // Pull the current data to display directly from our cache
  const filteredWorkouts = useMemo(() => {
    const cacheKey = `${activeYear}-${activeMonth}`;
    return workoutCache[cacheKey] || [];
  }, [workoutCache, activeYear, activeMonth]);

  // Chart data (Uses the active month's data. If you want it to always be 'this week',
  // you might need a separate fetch just for the chart).
  const chartData = useMemo(
    () => getCurrentWeekDays(filteredWorkouts),
    [filteredWorkouts],
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 mb-24 max-w-4xl mx-auto ">
      <h1 className="text-2xl sm:text-3xl font-black mb-8 tracking-tighter text-center italic uppercase">
        Repx Analysis
      </h1>

      {/* Chart Section */}
      <Card className="w-full shadow-2xl rounded-3xl border-none bg-gradient-to-b from-background to-muted/20 mb-10">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Activity Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  strokeOpacity={0.1}
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  content={({ active, payload }) => {
                    if (active && payload?.length)
                      return (
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
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
            Select Year
          </span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {availableYears.map((year) => (
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
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">
            Select Month
          </span>
          <Tabs
            value={activeMonth.toString()}
            onValueChange={(v) => setActiveMonth(parseInt(v))}
            className="w-full"
          >
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

      {/* Filtered Workouts List & Loader */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end px-1 mb-2">
          <h3 className="font-black text-2xl uppercase italic tracking-tighter">
            {MONTHS[activeMonth]}{" "}
            <span className="text-red-500">{activeYear}</span>
          </h3>
          <span className="text-xs font-bold bg-red-500/10 text-red-500 px-3 py-1 rounded-full border border-red-500/20">
            {isLoading ? "..." : filteredWorkouts.length} SESSIONS
          </span>
        </div>

        {/* Show Loader if fetching, otherwise show content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="grid gap-4">
            {filteredWorkouts.map((workout) => (
              <WorkoutDisplay key={workout.id} workout={workout} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl opacity-50">
            <p className="text-sm font-medium">
              No sessions recorded for this period
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const getCurrentWeekDays = (workouts: CleanWorkout[]) => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);

    const count = workouts.filter((w) => {
      return w.createdAt.toDateString() === d.toDateString();
    }).length;

    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      value: count,
    };
  });
};
