"use client";

import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { AddExerciseDialog } from "@/components/dashboard/add-exercise-dialog";
import { WorkoutExerciseCard } from "@/components/dashboard/workout-exercise-card";
import type { WorkoutExerciseDetail } from "@/data/workouts";
import type { ExerciseCatalogEntry } from "@/data/exercises";

export function WorkoutExercisesEditor({
  workoutId,
  workoutExercises,
  exerciseCatalog,
}: {
  workoutId: string;
  workoutExercises: WorkoutExerciseDetail[];
  exerciseCatalog: ExerciseCatalogEntry[];
}) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Exercises</h2>
        <AddExerciseDialog
          workoutId={workoutId}
          exercises={exerciseCatalog}
          onAdded={() => router.refresh()}
        />
      </div>

      {workoutExercises.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No exercises logged yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {workoutExercises.map((workoutExercise, index) => (
            <WorkoutExerciseCard
              key={workoutExercise.id}
              workoutExercise={workoutExercise}
              isFirst={index === 0}
              isLast={index === workoutExercises.length - 1}
              onChanged={() => router.refresh()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
