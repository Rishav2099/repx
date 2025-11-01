import { Calendar } from "@/components/ui/calendar";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { isBefore, isAfter, startOfDay } from "date-fns";
import React, { useState } from "react";
import { toast } from "sonner";

interface ChallengeCalendarProps {
  challengerDates?: string[];
  challengeeDates?: string[];
  startDate: string;
  endDate: string;
  id: string;
  challengerName: string;
  challengeeName: string
}

const ChallengeCalendar = ({
  challengerDates = [],
  challengeeDates = [],
  startDate,
  endDate,
  id,
  challengerName,
  challengeeName
}: ChallengeCalendarProps) => {
  const challengerDays = challengerDates.map((d) => startOfDay(new Date(d)));
  const challengeeDays = challengeeDates.map((d) => startOfDay(new Date(d)));
  const queryClient = useQueryClient();
  const [isClicked, setIsClicked] = useState(false);

  const bothDays = challengerDays.filter((day) =>
    challengeeDays.some((d) => d.toDateString() === day.toDateString())
  );

  const start = startOfDay(new Date(startDate));
  const end = startOfDay(new Date(endDate));
  const today = startOfDay(new Date());

  const handleDateClick = async (date: Date) => {
    const formattedDate = date.toLocaleDateString("en-CA");
    if (isBefore(date, start) || isAfter(date, end)) return;

    try {
      setIsClicked(true);
      const res = await axios.post(`/api/challenges/${id}/progress`, {
        date: formattedDate,
      });
      if (res.status === 200) {
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
    <div className="flex flex-col items-center justify-center p-4 bg-[#0e0e0e] rounded-2xl shadow-xl w-full max-w-md mx-auto">
      <Calendar
        onDayClick={handleDateClick}
        mode="single"
        className="rounded-xl border border-neutral-800 bg-[#111] text-white w-full py-2 shadow-inner grid place-items-center"
        modifiers={{
          challenger: challengerDays,
          challengee: challengeeDays,
          both: bothDays,
          today: [today],
        }}
        modifiersClassNames={{
          both: "relative border-2 border-red-500 rounded-full",
          challenger: "relative border-2 border-red-500 rounded-full",
          challengee: "relative ring ring-white rounded-full",
          today: "border border-gray-500 rounded-lg",
        }}
        disabled={(date) =>
          isBefore(startOfDay(date), start) ||
          isAfter(startOfDay(date), end) ||
          isClicked
        }
      />

      {/* Legend Section */}
      <div className="flex gap-4 mt-4 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-full border border-neutral-700"></span>
          <p>{challengerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-white rounded-full border border-neutral-700"></span>
          <p>{challengeeName}</p>
        </div>
      </div>
    </div>
  );
};

export default ChallengeCalendar;
