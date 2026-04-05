"use client";

import React, { useState } from "react";
import { EllipsisVertical, Pencil, Share2, Trash, Dumbbell, Play } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface workoutProps {
  workout: {
    _id: string;
    workoutName: string;
    exercises: {
      name: string;
      reps?: number;
      sets?: number;
      time?: number;
    }[];
  };
}

const WorkoutDisplay = ({ workout }: workoutProps) => {
  const router = useRouter();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteWorkout = async () => {
    try {
      setIsDeleting(true);
      const res = await axios.delete(`/api/workout/${workout._id}`);
      if (res.status === 200) {
        toast.success("Workout deleted");
        router.refresh(); // Smoother than window.location.reload()
      }
    } catch (error) {
      toast.error("Failed to delete workout");
      console.log(error);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const shareWorkout = async () => {
    const shareUrl = `${window.location.origin}/workout/share/${workout._id}`;

    const shareData = {
      title: `Check out my ${workout.workoutName} workout 💪`,
      text: "Here’s my workout plan on Repx!",
      url: shareUrl,
    };

    if (navigator.share) {
      await navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Workout link copied to clipboard!");
    }
  };

  // Generate a preview string of the exercises
  const exerciseCount = workout.exercises?.length || 0;
  const previewText = workout.exercises
    ?.slice(0, 3)
    .map((e) => e.name)
    .join(", ") + (exerciseCount > 3 ? "..." : "");

  return (
    <>
      <div
        onClick={() => router.push(`/workout/preview/${workout._id}`)}
        className="group relative bg-card border border-border hover:border-red-500/50 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        {/* Top Row: Name & Menu */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-xl font-black capitalize tracking-tight text-foreground group-hover:text-red-500 transition-colors">
              {workout.workoutName}
            </h3>
            <p className="text-sm font-medium text-muted-foreground mt-1 capitalize truncate max-w-[200px] sm:max-w-[250px]">
              {previewText || "No exercises added"}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground -mr-2 -mt-2"
                onClick={(e) => e.stopPropagation()} // Prevent card click
              >
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                className="cursor-pointer font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/workout/edit/${workout._id}`);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Routine
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  shareWorkout();
                }}
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer font-semibold text-red-500 focus:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteAlert(true);
                }}
              >
                <Trash className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom Row: Details & Quick Start */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1 rounded-full border border-border/50">
            <Dumbbell className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {exerciseCount} {exerciseCount === 1 ? "Exercise" : "Exercises"}
            </span>
          </div>

          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
            <Play className="w-4 h-4 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl">
              Delete Workout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              This action cannot be undone. This will permanently delete your
              <span className="font-bold text-foreground"> {workout.workoutName} </span>
              routine and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteWorkout}
              disabled={isDeleting}
              className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkoutDisplay;