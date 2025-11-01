"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

const challengeSchema = z.object({
  challengeName: z.string().min(1, "Workout name is required"),
  description: z.string().optional(),
  reps: z.number().min(1, "Reps cannot be empty"),
  forDays: z.number().min(5, "Duration can't be less than 5 days"),
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
    formState: { isSubmitting },
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
        toast.success("Challenge sent successfully");
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
    <form className="mt-5 grid gap-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-3">
        <Label htmlFor="name">Challenge Name</Label>
        <Input
          id="name"
          {...register("challengeName")}
          placeholder="e.g. 100 Pushups for 30 Days"
        />
      </div>

      <div className="grid gap-3">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          {...register("description")}
          placeholder="Extra details..."
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="grid gap-3">
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            type="number"
            {...register("reps", { valueAsNumber: true })}
            placeholder="100"
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="duration">For Days</Label>
          <Input
            id="duration"
            type="number"
            {...register("forDays", { valueAsNumber: true })}
            placeholder="30"
            className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>

      <div className="grid gap-3">
        <Label htmlFor="date">Starts from</Label>
        <Input
          id="date"
          type="date"
          className="w-fit"
          {...register("startDate", { setValueAs: (v) => new Date(v) })}
          defaultValue={new Date().toISOString().split("T")[0]}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          className="bg-red-500 hover:bg-red-900 font-semibold text-white"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" /> Saving
            </>
          ) : (
            "Save"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ChallengeForm;
