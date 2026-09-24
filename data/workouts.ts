import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";

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
