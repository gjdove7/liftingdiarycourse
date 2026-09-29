import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";
import { workouts } from "@/db/schema";

/**
 * Workouts (with their exercises) belonging to the currently authenticated
 * user on a specific date. Returns an empty list if there is no signed-in
 * user.
 *
 * `date` must be a "yyyy-MM-dd" calendar-date string, not a `Date` instance —
 * converting through `Date` would tie the value to a timezone, and the
 * `date` column here is timezone-less.
 */
export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  return db.query.workouts.findMany({
    where: { userId, date },
    orderBy: { date: "desc" },
    with: {
      workoutExercises: {
        orderBy: { order: "asc" },
        with: {
          exercise: true,
        },
      },
    },
  });
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getWorkoutsForDate>
>[number];

/**
 * A single workout (with its exercises) belonging to the currently
 * authenticated user. Returns `null` if there is no signed-in user or the
 * workout doesn't exist / isn't owned by them.
 */
export async function getWorkoutById(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const workout = await db.query.workouts.findFirst({
    where: { id: workoutId, userId },
    with: {
      workoutExercises: {
        orderBy: { order: "asc" },
        with: {
          exercise: true,
        },
      },
    },
  });

  return workout ?? null;
}

/**
 * Creates a new workout owned by the currently authenticated user. Returns
 * `null` if there is no signed-in user.
 *
 * `date` must be a "yyyy-MM-dd" calendar-date string (see the note on
 * `getWorkoutsForDate` for why this isn't a `Date` instance).
 */
export async function createWorkout({
  name,
  date,
}: {
  name: string | null;
  date: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, date })
    .returning();

  return workout;
}

/**
 * Updates the name and date of a workout owned by the currently
 * authenticated user. Returns `null` if there is no signed-in user or the
 * workout doesn't exist / isn't owned by them.
 *
 * `date` must be a "yyyy-MM-dd" calendar-date string (see the note on
 * `getWorkoutsForDate` for why this isn't a `Date` instance).
 */
export async function updateWorkout({
  workoutId,
  name,
  date,
}: {
  workoutId: string;
  name: string | null;
  date: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [workout] = await db
    .update(workouts)
    .set({ name, date, updatedAt: new Date() })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();

  return workout ?? null;
}
