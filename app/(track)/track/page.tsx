"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

type Workout = {
  _id: string;
  workoutName: string;
  createdAt: string;
  duration: number;
};

type ChartData = {
  day: string;
  value: number;
};

const getCurrentWeekDays = (workouts: Workout[]): ChartData[] => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const days: ChartData[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);

    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    const count = workouts.filter((w) => {
      const workoutDate = new Date(w.createdAt);
      return (
        workoutDate.getFullYear() === d.getFullYear() &&
        workoutDate.getMonth() === d.getMonth() &&
        workoutDate.getDate() === d.getDate()
      );
    }).length;

    days.push({ day: dayLabel, value: count });
  }

  return days;
};

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="dark:bg-white/90 backdrop-blur-md border border-gray-200 shadow-md px-3 py-2 rounded-lg text-xs sm:text-sm">
        <p className="text-red-600">{`Workouts: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyChart() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [data, setData] = useState<ChartData[]>([]);

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

  useEffect(() => {
    setData(getCurrentWeekDays(workouts));
  }, [workouts]);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 tracking-wide text-center">
        Workout Analysis
      </h1>

      <Card className="w-full max-w-full sm:max-w-3xl shadow-lg rounded-2xl border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold">
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="20%">
                <CartesianGrid vertical={false} horizontal={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }} // ✅ smaller text on mobile
                  interval={0} // ✅ force show all labels
                  minTickGap={0} // ✅ no auto skipping
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.05)" }}
                />
                <Bar
                  dataKey="value"
                  fill="#3c191a"
                  stroke="#B91C1C"
                  strokeWidth={2}
                  radius={[6, 6, 0, 0]}
                  barSize={20} // ✅ smaller on mobile
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
