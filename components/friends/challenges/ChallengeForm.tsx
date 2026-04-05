"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Swords, Target, AlignLeft, Dumbbell, CalendarClock, CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const challengeSchema = z.object({
  challengeName: z.string().min(1, "Workout name is required"),
  description: z.string().optional(),
  reps: z.number().min(1, "Reps cannot be empty"),
  forDays: z.number().min(5, "Duration must be at least 5 days"),
  startDate: z.date(),
});

type ChallengeValue = z.infer<typeof challengeSchema>;

const ChallengeForm = ({
  friendId,
  userId,
  closeDialog,
}: {
  friendId: string;
  userId: string;
  closeDialog: () => void;
}) => {
  const router = useRouter();
  const form = useForm<ChallengeValue>({
    resolver: zodResolver(challengeSchema),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = form;

  const queryClient = useQueryClient();

  const onSubmit = async (values: ChallengeValue) => {
    try {
      const res = await axios.post("/api/challenges", {
        ...values,
        challenger: userId,
        challengee: friendId,
      });
      if (res.status === 200) {
        toast.success("Challenge sent successfully!");
        reset();
        closeDialog();
        router.refresh();
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
    } catch (error) {
      toast.error("Failed to send challenge");
      console.log(error);
    }
  };

  return (
    <form className="mt-4 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
      
      {/* Challenge Name */}
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" /> Challenge Name
        </Label>
        <Input
          id="name"
          {...register("challengeName")}
          placeholder="e.g. 100 Pushups for 30 Days"
          className={`h-12 rounded-xl bg-muted/30 focus-visible:ring-red-500 ${errors.challengeName ? "border-red-500" : ""}`}
        />
        {errors.challengeName && <span className="text-xs font-semibold text-red-500">{errors.challengeName.message}</span>}
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5" /> Description <span className="text-[10px] lowercase normal-case opacity-60">(Optional)</span>
        </Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Loser buys dinner..."
          className="h-12 rounded-xl bg-muted/30 focus-visible:ring-red-500"
        />
      </div>

      {/* Reps & Duration Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Reps */}
        <div className="grid gap-2">
          <Label htmlFor="reps" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Dumbbell className="w-3.5 h-3.5" /> Daily Reps
          </Label>
          <div className="relative">
            <Input
              id="reps"
              type="number"
              {...register("reps", { valueAsNumber: true })}
              placeholder="100"
              className={`h-12 rounded-xl bg-muted/30 text-lg font-bold focus-visible:ring-red-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.reps ? "border-red-500" : ""}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">reps</span>
          </div>
          {errors.reps && <span className="text-xs font-semibold text-red-500">{errors.reps.message}</span>}
        </div>

        {/* Duration */}
        <div className="grid gap-2">
          <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" /> For Days
          </Label>
          <div className="relative">
            <Input
              id="duration"
              type="number"
              {...register("forDays", { valueAsNumber: true })}
              placeholder="30"
              className={`h-12 rounded-xl bg-muted/30 text-lg font-bold focus-visible:ring-red-500 appearance-none [&::-webkit-inner-spin-button]:appearance-none ${errors.forDays ? "border-red-500" : ""}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">days</span>
          </div>
          {errors.forDays && <span className="text-xs font-semibold text-red-500">{errors.forDays.message}</span>}
        </div>
      </div>

      {/* Start Date */}
      <div className="grid gap-2">
        <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5" /> Starts From
        </Label>
        <Input
          id="date"
          type="date"
          className={`h-12 rounded-xl bg-muted/30 font-medium focus-visible:ring-red-500 w-full sm:w-2/3 ${errors.startDate ? "border-red-500" : ""}`}
          {...register("startDate", { setValueAs: (v) => new Date(v) })}
          defaultValue={new Date().toISOString().split("T")[0]}
          min={new Date().toISOString().split("T")[0]}
        />
        {errors.startDate && <span className="text-xs font-semibold text-red-500">{errors.startDate.message}</span>}
      </div>

      {/* Footer Actions */}
      <DialogFooter className="mt-4 gap-2 sm:gap-0">
        <DialogClose asChild>
          <Button variant="outline" className="h-12 rounded-xl font-bold">
            Cancel
          </Button>
        </DialogClose>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black shadow-lg shadow-red-500/20 transition-transform active:scale-[0.98] px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Swords className="w-5 h-5 mr-2" /> Send Challenge
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ChallengeForm;