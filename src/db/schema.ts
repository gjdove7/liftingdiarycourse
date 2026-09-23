import { defineRelations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  date,
  timestamp,
  index,
  unique,
} from 'drizzle-orm/pg-core';

// ---------------------------------------------------------------------------
// workouts
// One row per workout session, owned by a Clerk user (no local users table —
// Clerk is the source of truth for identity).
// ---------------------------------------------------------------------------
export const workouts = pgTable(
  'workouts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    date: date('date').notNull().defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    name: text('name'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('workouts_user_id_idx').on(t.userId),
    index('workouts_user_id_date_idx').on(t.userId, t.date),
  ],
);

// ---------------------------------------------------------------------------
// exercises
// Shared catalog of canonical exercise definitions. Not user-scoped.
// ---------------------------------------------------------------------------
export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// workout_exercises
// Join table: an ordered list of catalog exercises performed within one
// specific workout session.
// ---------------------------------------------------------------------------
export const workoutExercises = pgTable(
  'workout_exercises',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutId: uuid('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: uuid('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('workout_exercises_workout_id_idx').on(t.workoutId),
    index('workout_exercises_exercise_id_idx').on(t.exerciseId),
    unique('workout_exercises_workout_id_order_unique').on(t.workoutId, t.order),
  ],
);

// ---------------------------------------------------------------------------
// sets
// A single performed set (weight x reps) belonging to one workout's instance
// of an exercise (workout_exercises row), in a specific order.
// ---------------------------------------------------------------------------
export const sets = pgTable(
  'sets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workoutExerciseId: uuid('workout_exercise_id')
      .notNull()
      .references(() => workoutExercises.id, { onDelete: 'cascade' }),
    setNumber: integer('set_number').notNull(),
    weight: numeric('weight', { precision: 6, scale: 2 }).notNull(),
    reps: integer('reps').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('sets_workout_exercise_id_idx').on(t.workoutExerciseId),
    unique('sets_workout_exercise_id_set_number_unique').on(t.workoutExerciseId, t.setNumber),
  ],
);

// ---------------------------------------------------------------------------
// Relations (for the `db.query.*` relational query API)
// ---------------------------------------------------------------------------
export const dbRelations = defineRelations(
  { workouts, exercises, workoutExercises, sets },
  (r) => ({
    workouts: {
      workoutExercises: r.many.workoutExercises({
        from: r.workouts.id,
        to: r.workoutExercises.workoutId,
      }),
    },
    exercises: {
      workoutExercises: r.many.workoutExercises({
        from: r.exercises.id,
        to: r.workoutExercises.exerciseId,
      }),
    },
    workoutExercises: {
      workout: r.one.workouts({
        from: r.workoutExercises.workoutId,
        to: r.workouts.id,
        optional: false,
      }),
      exercise: r.one.exercises({
        from: r.workoutExercises.exerciseId,
        to: r.exercises.id,
        optional: false,
      }),
      sets: r.many.sets({
        from: r.workoutExercises.id,
        to: r.sets.workoutExerciseId,
      }),
    },
    sets: {
      workoutExercise: r.one.workoutExercises({
        from: r.sets.workoutExerciseId,
        to: r.workoutExercises.id,
        optional: false,
      }),
    },
  }),
);
