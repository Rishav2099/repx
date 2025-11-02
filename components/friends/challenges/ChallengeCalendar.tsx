"use client";

import { Calendar } from "@/components/ui/calendar";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { isBefore, isAfter, startOfDay } from "date-fns";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

interface ChallengeCalendarProps {
  challengerDates?: string[];
  challengeeDates?: string[];
  startDate: string;
  endDate: string;
  id: string;
  challengerName: string;
  challengeeName: string;
}

const ChallengeCalendar = ({
  challengerDates = [],
  challengeeDates = [],
  startDate,
  endDate,
  id,
  challengerName,
  challengeeName,
}: ChallengeCalendarProps) => {
  const queryClient = useQueryClient();
  const [isClicked, setIsClicked] = useState(false);

  // Memoize date arrays
  const { challengerDays, challengeeDays, bothDays, start, end, today } =
    useMemo(() => {
      const challengerDays = challengerDates.map((d) => startOfDay(new Date(d)));
      const challengeeDays = challengeeDates.map((d) => startOfDay(new Date(d)));

      const bothDays = challengerDays.filter((day) =>
        challengeeDays.some((d) => d.toDateString() === day.toDateString())
      );

      return {
        challengerDays,
        challengeeDays,
        bothDays,
        start: startOfDay(new Date(startDate)),
        end: startOfDay(new Date(endDate)),
        today: startOfDay(new Date()),
      };
    }, [challengerDates, challengeeDates, startDate, endDate]);

  const handleDateClick = async (date: Date) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    if (isBefore(date, start) || isAfter(date, end)) return;

    try {
      setIsClicked(true);
      const { status } = await axios.post(`/api/challenges/${id}/progress`, {
        date: formattedDate,
      });

      if (status === 200) {
        toast.success("Progress updated!");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch {
      toast.error("Error updating progress");
    } finally {
      setIsClicked(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-3 sm:p-4 bg-[#0e0e0e] rounded-2xl shadow-xl w-full max-w-sm mx-auto">
      <Calendar
        onDayClick={handleDateClick}
        mode="single"
        className="rounded-xl border border-neutral-800 bg-[#111] text-white w-full text-xs sm:text-sm"
        modifiers={{
          challenger: challengerDays,
          challengee: challengeeDays,
          both: bothDays,
          today: [today],
        }}
        modifiersClassNames={{
          // Challenger: red border (outer)
          challenger:
            "relative after:absolute after:inset-0 after:rounded-full after:border-2 after:border-red-500 after:pointer-events-none ",

          // Challengee: white ring (inner)
          challengee:
            "relative after:absolute after:inset-1 after:rounded-full after:ring-2 after:ring-white after:pointer-events-none ",

          // Both: red border + white ring (stacked)
          both:
            "relative after:absolute after:inset-0 after:rounded-full after:border-2 after:border-red-500 after:pointer-events-none  before:absolute before:inset-1 before:rounded-full before:ring-2 before:ring-white before:pointer-events-none before:z-20",

          // Today: subtle gray border
          today: "border border-gray-500 rounded-lg",
        }}
        disabled={(date) =>
          isBefore(startOfDay(date), start) ||
          isAfter(startOfDay(date), end) ||
          isClicked
        }
      />

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-4 text-xs sm:text-sm text-gray-300">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-red-500"></span>
          <p>{challengerName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white ring-2 ring-white ring-offset-1 ring-offset-transparent"></span>
          <p>{challengeeName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative w-3 h-3 sm:w-4 sm:h-4">
            <span className="absolute inset-0 rounded-full border-2 border-red-500"></span>
            <span className="absolute inset-0.5 rounded-full ring-2 ring-white"></span>
          </span>
          <p>Both</p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCalendar;