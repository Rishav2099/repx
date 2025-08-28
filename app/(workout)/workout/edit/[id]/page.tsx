"use client";

import { Separator } from "@/components/ui/separator";
import React, { use, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// ======== Zod Schemas ========
const exerciseSchema = z
  .object({
    name: z.string().min(1, "Exercise name required"),
    type: z.enum(["reps", "time"], { message: "Select type" }),
    reps: z.number().optional(),
    sets: z.number().optional(),
    time: z.number().optional(),
  })
  .refine(
    (data) =>
      (data.type === "reps" && data.reps && data.sets) ||
      (data.type === "time" && data.time),
    {
      message: "Fill required fields for selected type",
      path: ["type"],
    }
  );

const formSchema = z.object({
  workoutName: z.string().min(1, "Workout name required"),
  exercises: z.array(exerciseSchema).min(1, "At least one exercise required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Exercise {
  name: string;
  type: string;
  reps?: number;
  sets?: number;
  time?: number;
}

interface WorkoutSchema {
  workoutName: string;
  exercises: Exercise[];
}

// ======== Page Component ========
const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [workout, setWorkout] = useState<WorkoutSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/${id}`);
      console.log(res);
      if (res.status === 200) {
        const workoutData = res.data?.workout;
        setWorkout(workoutData);

        form.reset({
          workoutName: workoutData?.workoutName,
          exercises: workoutData.exercises.map((ex: Exercise) => ({
            name: ex.name,
            type: ex.reps ? "reps" : "time",
            reps: ex.reps ?? undefined,
            sets: ex.sets ?? undefined,
            time: ex.time ?? undefined,
          })),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const {formState: {isSubmitting}} = form

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await axios.patch(`/api/workout/${id}`, values);
      console.log(res);
      form.reset();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  if (loading || !workout) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-center font-bold text-2xl py-4">Edit Workout</h1>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-[80vw] mx-auto my-10 space-y-6"
        >
          {/* Workout Name */}
          <FormField
            control={form.control}
            name="workoutName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workout Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Workout Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Exercises */}
          {fields.map((field, index) => {
            const watchType = form.watch(`exercises.${index}.type`);

            return (
              <div key={field.id} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">Exercise {index + 1}</h2>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={() => remove(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Name */}
                <FormField
                  control={form.control}
                  name={`exercises.${index}.name` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Exercise Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type */}
                <FormField
                  control={form.control}
                  name={`exercises.${index}.type` as const}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reps">Reps & Sets</SelectItem>
                          <SelectItem value="time">Time</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Conditional Fields */}
                {watchType === "reps" &&
                 (["reps", "sets"] as const).map((fieldName) => (
                    <FormField
                      key={fieldName}
                      control={form.control}
                      name={`exercises.${index}.${fieldName}` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {fieldName.charAt(0).toUpperCase() +
                              fieldName.slice(1)}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={fieldName}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                {watchType === "time" && (
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.time` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time (seconds)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Time in seconds"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            );
          })}

          {/* Add Exercise */}
          <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => append({ name: "", type: "reps" })}
            variant={'outline'}
          >
            + Add Exercise
          </Button>

          {/* Submit */}
          <Button
            type="submit"
            variant={'primary'}
            disabled={isSubmitting}
          >
            Submit
          </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Page;
