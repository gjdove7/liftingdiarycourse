"use server";

import { z } from "zod";

import { updateWorkout } from "@/data/workouts";

const updateWorkoutSchema = z.object({
  workoutId: z.uuid(),
  name: z.string().trim().min(1).max(100).nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const { workoutId, name, date } = updateWorkoutSchema.parse(input);

  const workout = await updateWorkout({ workoutId, name, date });

  if (!workout) {
    throw new Error("Unauthorized");
  }

  return workout;
}
