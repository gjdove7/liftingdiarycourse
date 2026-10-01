import { and, eq, exists } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { db } from "@/db";
import { workouts, workoutExercises } from "@/db/schema";

/**
 * Adds a catalog exercise to a workout owned by the current user, appending
 * it after any existing exercises (next `order` value). The catalog allows
 * the same exercise to appear more than once in a workout — `workout_exercises`
 * only has a unique constraint on (workoutId, order), not on
 * (workoutId, exerciseId) — so no de-duplication is applied here.
 * Returns `null` if unauthenticated or the workout isn't owned by the user.
 */
export async function addExerciseToWorkout({
  workoutId,
  exerciseId,
}: {
  workoutId: string;
  exerciseId: string;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const workout = await db.query.workouts.findFirst({
    where: { id: workoutId, userId },
    columns: { id: true },
    with: {
      workoutExercises: {
        columns: { order: true },
        orderBy: { order: "desc" },
        limit: 1,
      },
    },
  });
  if (!workout) return null;

  const nextOrder = (workout.workoutExercises[0]?.order ?? 0) + 1;

  const [inserted] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: nextOrder })
    .returning({ id: workoutExercises.id });

  return db.query.workoutExercises.findFirst({
    where: { id: inserted.id },
    with: { exercise: true, sets: true },
  });
}

/**
 * Removes an exercise from a workout (cascades to its sets via the FK).
 * `workout_exercises` has no `user_id` column, so ownership is verified with
 * a correlated `exists()` subquery joining back to `workouts` — a mutation
 * targeting another user's row simply deletes zero rows.
 */
export async function removeWorkoutExercise({
  workoutExerciseId,
}: {
  workoutExerciseId: string;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const [deleted] = await db
    .delete(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        exists(
          db
            .select({ id: workouts.id })
            .from(workouts)
            .where(
              and(
                eq(workouts.id, workoutExercises.workoutId),
                eq(workouts.userId, userId),
              ),
            ),
        ),
      ),
    )
    .returning();

  return deleted ?? null;
}

/**
 * Swaps a workout-exercise's `order` with its adjacent sibling (by current
 * order) in the given direction. Returns `null` if unauthenticated, not
 * owned, or already at the top/bottom (no sibling in that direction).
 *
 * `(workoutId, order)` has a `NOT DEFERRABLE` unique constraint, so a direct
 * two-row swap in one statement can transiently collide — the swap runs via
 * a temporary sentinel `order` value, submitted through `db.batch()` (the
 * `neon-http` driver used here has no `db.transaction()` support; `batch()`
 * is Neon's equivalent, running the statements as a single atomic request).
 */
export async function moveWorkoutExercise({
  workoutExerciseId,
  direction,
}: {
  workoutExerciseId: string;
  direction: "up" | "down";
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const current = await db.query.workoutExercises.findFirst({
    where: { id: workoutExerciseId, workout: { userId } },
    columns: { id: true, workoutId: true },
  });
  if (!current) return null;

  const siblings = await db.query.workoutExercises.findMany({
    where: { workoutId: current.workoutId },
    orderBy: { order: "asc" },
    columns: { id: true, order: true },
  });

  const index = siblings.findIndex((s) => s.id === workoutExerciseId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) return null;

  const a = siblings[index];
  const b = siblings[swapIndex];

  await db.batch([
    db
      .update(workoutExercises)
      .set({ order: -1 })
      .where(eq(workoutExercises.id, a.id)),
    db
      .update(workoutExercises)
      .set({ order: a.order })
      .where(eq(workoutExercises.id, b.id)),
    db
      .update(workoutExercises)
      .set({ order: b.order })
      .where(eq(workoutExercises.id, a.id)),
  ]);

  return { id: a.id };
}
