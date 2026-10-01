import { and, eq, exists } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";

/**
 * Correlated ownership check shared by `updateSet`/`deleteSet`: is the
 * `sets` row (via its `workoutExerciseId`) part of a `workout_exercises` row
 * whose `workouts.userId` matches? Neither `sets` nor `workout_exercises`
 * has a `user_id` column of its own, so this has to join through both.
 */
function ownsSet(userId: string) {
  return exists(
    db
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
      .where(
        and(
          eq(workoutExercises.id, sets.workoutExerciseId),
          eq(workouts.userId, userId),
        ),
      ),
  );
}

/**
 * Adds a new set to a workout-exercise, assigning the next `setNumber`.
 * Ownership of the parent workout is verified via a nested relation filter
 * on the initial lookup, so the insert itself only ever targets a
 * `workoutExerciseId` already confirmed to belong to the current user.
 */
export async function addSet({
  workoutExerciseId,
  weight,
  reps,
}: {
  workoutExerciseId: string;
  /** Decimal string, e.g. "102.50" — `weight` is a `numeric` column;
   * Drizzle represents it as a string to avoid float precision loss. */
  weight: string;
  reps: number;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const workoutExercise = await db.query.workoutExercises.findFirst({
    where: { id: workoutExerciseId, workout: { userId } },
    columns: { id: true },
    with: {
      sets: {
        columns: { setNumber: true },
        orderBy: { setNumber: "desc" },
        limit: 1,
      },
    },
  });
  if (!workoutExercise) return null;

  const nextSetNumber = (workoutExercise.sets[0]?.setNumber ?? 0) + 1;

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber: nextSetNumber, weight, reps })
    .returning();

  return set;
}

/** Updates a set's weight/reps. Ownership verified via `ownsSet()`. */
export async function updateSet({
  setId,
  weight,
  reps,
}: {
  setId: string;
  weight: string;
  reps: number;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const [set] = await db
    .update(sets)
    .set({ weight, reps })
    .where(and(eq(sets.id, setId), ownsSet(userId)))
    .returning();

  return set ?? null;
}

/** Deletes a set. Ownership verified via `ownsSet()`. */
export async function deleteSet({ setId }: { setId: string }) {
  const { userId } = await auth();
  if (!userId) return null;

  const [deleted] = await db
    .delete(sets)
    .where(and(eq(sets.id, setId), ownsSet(userId)))
    .returning();

  return deleted ?? null;
}
