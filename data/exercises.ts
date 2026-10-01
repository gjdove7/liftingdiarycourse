import { db } from "@/db";

/**
 * The full shared exercise catalog, ordered alphabetically. Deliberately does
 * not call `auth()` or scope by user — `exercises` is a shared catalog table,
 * not user-owned data, so the data-isolation rule doesn't apply here. Access
 * to the pages that use this is already gated by `src/proxy.ts`.
 */
export async function listExercises() {
  return db.query.exercises.findMany({
    orderBy: { name: "asc" },
  });
}

export type ExerciseCatalogEntry = Awaited<
  ReturnType<typeof listExercises>
>[number];
