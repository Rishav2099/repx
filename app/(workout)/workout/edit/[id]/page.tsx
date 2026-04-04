"use client";

import React, { use, useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { GripVertical, Trash2, Plus, ArrowUp, ArrowDown, Save, Loader2 } from "lucide-react";

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

// ======== Page Component ========
const Page = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  
  const [workout, setWorkout] = useState<WorkoutSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { formState: { isSubmitting } } = form;

  // Extracted 'move' for the drag-and-drop feature
  const { fields, append, remove, move } = useFieldArray({
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

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const onSubmit = async (values: FormValues) => {
    try {
      await axios.patch(`/api/workout/${id}`, values);
      form.reset();
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  // ======== Drag and Drop Handlers ========
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  if (loading || !workout) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground pb-20 pt-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Workout Name - Hero Input */}
            <FormField
              control={form.control}
              name="workoutName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      placeholder="Workout Routine Name..."
                      className="w-full bg-transparent text-4xl sm:text-5xl font-black tracking-tighter placeholder:text-muted-foreground/50 border-none focus:outline-none focus:ring-0 px-0"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Exercises List */}
            <div className="space-y-4">
              {fields.map((field, index) => {
                const watchType = form.watch(`exercises.${index}.type`);
                const isDragging = draggedIndex === index;

                return (
                  <div
                    key={field.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`relative bg-card border shadow-sm rounded-2xl p-5 sm:p-6 transition-all duration-200 
                      ${isDragging ? "opacity-50 scale-[0.98] border-red-500 shadow-xl z-50" : "hover:shadow-md border-border"}
                    `}
                  >
                    {/* Header: Drag Grip, Title, Mobile Controls, Delete */}
                    <div className="flex justify-between items-center mb-5 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab active:cursor-grabbing p-1 -ml-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <h2 className="font-bold text-lg">Exercise {index + 1}</h2>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        {/* Mobile up/down controls */}
                        <div className="flex sm:hidden mr-2 bg-muted rounded-lg">
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => move(index, index - 1)}>
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)}>
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>

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
                    </div>

                    {/* Inputs Area */}
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
                                <Input placeholder="e.g. Squat, Pushups..." className="h-12 text-lg font-medium" {...field} />
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

                      {/* Conditional Grid: Reps & Sets */}
                      {watchType === "reps" && (
                        <div className="sm:col-span-12 grid grid-cols-2 gap-4 mt-2">
                          {(["sets", "reps"] as const).map((fieldName) => (
                            <FormField
                              key={fieldName}
                              control={form.control}
                              name={`exercises.${index}.${fieldName}` as const}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    {fieldName}
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder={`0`}
                                      className="h-12 text-lg font-medium"
                                      value={field.value ?? ""}
                                      onChange={(e) =>
                                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      )}

                      {/* Conditional Grid: Time */}
                      {watchType === "time" && (
                        <div className="sm:col-span-12 mt-2">
                          <FormField
                            control={form.control}
                            name={`exercises.${index}.time` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                  Duration (Seconds)
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="e.g. 60"
                                    className="h-12 text-lg font-medium"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value ? Number(e.target.value) : undefined)
                                    }
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
                <Plus className="w-5 h-5 mr-2" /> Add Next Exercise
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
                    <Save className="w-5 h-5 mr-2" /> Save Changes
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

export default Page;