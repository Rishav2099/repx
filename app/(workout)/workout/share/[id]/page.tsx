"use client";

import React, { use, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Download, Dumbbell, Save, Trash2, Timer, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";

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

const SharePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [workout, setWorkout] = useState<WorkoutSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { formState: { isSubmitting } } = form;

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/workout/${id}`);
      if (res.status === 200) {
        const workoutData = res.data?.workout;
        setWorkout(workoutData);

        form.reset({
          workoutName: `${workoutData?.workoutName} (Imported)`,
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
      toast.error("Failed to load shared workout");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await axios.post(`/api/workout`, values);
      if (res.status === 200 || res.status === 201) {
        toast.success("Workout saved to your routines!");
        router.push("/"); 
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to save workout");
    }
  };

  if (loading || !workout) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground pb-24 pt-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-red-500/10 p-3 rounded-full">
            <Download className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tight">Import Routine</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Review and customize before saving to your profile.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Workout Name Hero Input */}
            <FormField
              control={form.control}
              name="workoutName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Workout Name..."
                      className="w-full bg-transparent text-4xl sm:text-5xl font-black tracking-tighter placeholder:text-muted-foreground/50 border-none focus:outline-none focus:ring-0 px-0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Exercises List */}
            <div className="space-y-4 mt-8">
              {fields.map((field, index) => {
                const watchType = form.watch(`exercises.${index}.type`);

                return (
                  <div key={field.id} className="bg-card border border-border shadow-sm rounded-2xl p-5 sm:p-6 hover:shadow-md transition-all">
                    
                    {/* Header: Title & Delete */}
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-border/50">
                      <h2 className="font-bold text-lg flex items-center gap-2">
                        <span className="bg-muted text-muted-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        Exercise
                      </h2>

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8 transition-colors"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                      
                      {/* Name Input */}
                      <div className="sm:col-span-8">
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.name` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Name</FormLabel>
                              <FormControl>
                                <Input className="h-12 text-lg font-medium" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Type Select */}
                      <div className="sm:col-span-4">
                        <FormField
                          control={form.control}
                          name={`exercises.${index}.type` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 font-medium">
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
                      </div>

                      {/* Conditional: Reps & Sets */}
                      {watchType === "reps" && (
                        <div className="sm:col-span-12 grid grid-cols-2 gap-4 mt-2">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.sets` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                  <Dumbbell className="w-3 h-3" /> Sets
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-12 text-lg font-medium"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.reps` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                  Reps
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-12 text-lg font-medium"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {/* Conditional: Time */}
                      {watchType === "time" && (
                        <div className="sm:col-span-12 mt-2">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.time` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                                  <Timer className="w-3 h-3" /> Duration (Seconds)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-12 text-lg font-medium"
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 mt-8 pt-4">
              <Button
                type="button"
                onClick={() => append({ name: "", type: "reps" })}
                variant="outline"
                className="w-full h-14 border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 hover:bg-transparent rounded-2xl font-bold transition-all"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Exercise
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-500/20 transition-transform active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" /> Save to My Routines
                  </>
                )}
              </Button>
            </div>
            
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SharePage;