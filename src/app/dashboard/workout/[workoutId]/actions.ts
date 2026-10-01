"use server";

import { z } from "zod";

import { updateWorkout, setWorkoutCompleted } from "@/data/workouts";
import {
  addExerciseToWorkout,
  removeWorkoutExercise,
  moveWorkoutExercise,
} from "@/data/workout-exercises";
import { addSet, updateSet, deleteSet } from "@/data/sets";

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

const setWorkoutCompletedSchema = z.object({
  workoutId: z.uuid(),
  completed: z.boolean(),
});

type SetWorkoutCompletedInput = z.infer<typeof setWorkoutCompletedSchema>;

export async function setWorkoutCompletedAction(
  input: SetWorkoutCompletedInput,
) {
  const { workoutId, completed } = setWorkoutCompletedSchema.parse(input);

  const workout = await setWorkoutCompleted({ workoutId, completed });

  if (!workout) {
    throw new Error("Unauthorized");
  }

  return workout;
}

const addExerciseToWorkoutSchema = z.object({
  workoutId: z.uuid(),
  exerciseId: z.uuid(),
});

type AddExerciseToWorkoutInput = z.infer<typeof addExerciseToWorkoutSchema>;

export async function addExerciseToWorkoutAction(
  input: AddExerciseToWorkoutInput,
) {
  const { workoutId, exerciseId } = addExerciseToWorkoutSchema.parse(input);

  const workoutExercise = await addExerciseToWorkout({ workoutId, exerciseId });

  if (!workoutExercise) {
    throw new Error("Unauthorized");
  }

  return workoutExercise;
}

const removeWorkoutExerciseSchema = z.object({
  workoutExerciseId: z.uuid(),
});

type RemoveWorkoutExerciseInput = z.infer<typeof removeWorkoutExerciseSchema>;

export async function removeWorkoutExerciseAction(
  input: RemoveWorkoutExerciseInput,
) {
  const { workoutExerciseId } = removeWorkoutExerciseSchema.parse(input);

  const deleted = await removeWorkoutExercise({ workoutExerciseId });

  if (!deleted) {
    throw new Error("Unauthorized");
  }

  return deleted;
}

const moveWorkoutExerciseSchema = z.object({
  workoutExerciseId: z.uuid(),
  direction: z.enum(["up", "down"]),
});

type MoveWorkoutExerciseInput = z.infer<typeof moveWorkoutExerciseSchema>;

export async function moveWorkoutExerciseAction(
  input: MoveWorkoutExerciseInput,
) {
  const { workoutExerciseId, direction } =
    moveWorkoutExerciseSchema.parse(input);

  const moved = await moveWorkoutExercise({ workoutExerciseId, direction });

  if (!moved) {
    throw new Error("Unauthorized");
  }

  return moved;
}

// numeric(6,2): up to 4 integer digits, up to 2 decimal digits (max 9999.99).
const weightSchema = z
  .string()
  .trim()
  .regex(/^\d{1,4}(\.\d{1,2})?$/, "Invalid weight");
const repsSchema = z.coerce.number().int().min(1).max(1000);

const addSetSchema = z.object({
  workoutExerciseId: z.uuid(),
  weight: weightSchema,
  reps: repsSchema,
});

type AddSetInput = z.infer<typeof addSetSchema>;

export async function addSetAction(input: AddSetInput) {
  const { workoutExerciseId, weight, reps } = addSetSchema.parse(input);

  const set = await addSet({ workoutExerciseId, weight, reps });

  if (!set) {
    throw new Error("Unauthorized");
  }

  return set;
}

const updateSetSchema = z.object({
  setId: z.uuid(),
  weight: weightSchema,
  reps: repsSchema,
});

type UpdateSetInput = z.infer<typeof updateSetSchema>;

export async function updateSetAction(input: UpdateSetInput) {
  const { setId, weight, reps } = updateSetSchema.parse(input);

  const set = await updateSet({ setId, weight, reps });

  if (!set) {
    throw new Error("Unauthorized");
  }

  return set;
}

const deleteSetSchema = z.object({
  setId: z.uuid(),
});

type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export async function deleteSetAction(input: DeleteSetInput) {
  const { setId } = deleteSetSchema.parse(input);

  const deleted = await deleteSet({ setId });

  if (!deleted) {
    throw new Error("Unauthorized");
  }

  return deleted;
}
