"use server";

import { z } from "zod";

import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().trim().min(1).max(100).nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { name, date } = createWorkoutSchema.parse(input);

  const workout = await createWorkout({ name, date });

  if (!workout) {
    throw new Error("Unauthorized");
  }

  return workout;
}
