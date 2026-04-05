"use client";

import { Calendar } from "@/components/ui/calendar";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { isBefore, isAfter, startOfDay } from "date-fns";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
        toast.success("Progress logged!");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch {
      toast.error("Error updating progress");
    } finally {
      setIsClicked(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center p-4 sm:p-6 bg-background border border-border rounded-[2rem] shadow-sm w-full max-w-sm mx-auto overflow-hidden">
      
      {/* Loading Overlay */}
      {isClicked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
          <Loader2 className="w-8 h-8 animate-spin text-red-500" />
        </div>
      )}

      <Calendar
        onDayClick={handleDateClick}
        mode="single"
        className="w-full text-sm font-medium"
        modifiers={{
          challenger: challengerDays,
          challengee: challengeeDays,
          both: bothDays,
          today: [today],
        }}
        modifiersClassNames={{
          // Challenger: Red outer ring
          challenger:
            "relative after:absolute after:inset-[2px] after:rounded-full after:border-2 after:border-red-500 after:pointer-events-none text-foreground",

          // Challengee: Dynamic foreground inner ring
          challengee:
            "relative after:absolute after:inset-[6px] after:rounded-full after:border-[1.5px] after:border-foreground after:pointer-events-none text-foreground",

          // Both: Red outer + Foreground inner
          both:
            "relative after:absolute after:inset-[2px] after:rounded-full after:border-2 after:border-red-500 after:pointer-events-none before:absolute before:inset-[7px] before:rounded-full before:border-[1.5px] before:border-foreground before:pointer-events-none before:z-20 text-foreground",

          // Today highlight
          today: "font-black bg-muted rounded-full text-foreground",
        }}
        disabled={(date) =>
          isBefore(startOfDay(date), start) ||
          isAfter(startOfDay(date), end) ||
          isClicked
        }
      />

      {/* Modern Legend */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-5 mt-6 pt-5 border-t border-border/50 text-xs sm:text-sm font-semibold text-muted-foreground w-full">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-red-500"></span>
          <p className="capitalize truncate max-w-[80px]">{challengerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-foreground"></span>
          <p className="capitalize truncate max-w-[80px]">{challengeeName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative w-3.5 h-3.5">
            <span className="absolute inset-0 rounded-full border-2 border-red-500"></span>
            <span className="absolute inset-[3px] rounded-full border border-foreground"></span>
          </span>
          <p>Both</p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCalendar;