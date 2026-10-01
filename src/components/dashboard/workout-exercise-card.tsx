"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetRow } from "@/components/dashboard/set-row";
import {
  removeWorkoutExerciseAction,
  moveWorkoutExerciseAction,
  addSetAction,
} from "@/app/dashboard/workout/[workoutId]/actions";
import type { WorkoutExerciseDetail } from "@/data/workouts";

export function WorkoutExerciseCard({
  workoutExercise,
  isFirst,
  isLast,
  onChanged,
}: {
  workoutExercise: WorkoutExerciseDetail;
  isFirst: boolean;
  isLast: boolean;
  onChanged: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [newWeight, setNewWeight] = useState("");
  const [newReps, setNewReps] = useState("");
  const [isRemoving, startRemoveTransition] = useTransition();
  const [isMoving, startMoveTransition] = useTransition();
  const [isAddingSet, startAddSetTransition] = useTransition();

  function handleRemove() {
    setError(null);
    startRemoveTransition(async () => {
      try {
        await removeWorkoutExerciseAction({
          workoutExerciseId: workoutExercise.id,
        });
        onChanged();
      } catch {
        setError("Couldn't remove exercise. Please try again.");
      }
    });
  }

  function handleMove(direction: "up" | "down") {
    setError(null);
    startMoveTransition(async () => {
      try {
        await moveWorkoutExerciseAction({
          workoutExerciseId: workoutExercise.id,
          direction,
        });
        onChanged();
      } catch {
        setError("Couldn't reorder exercise. Please try again.");
      }
    });
  }

  function handleAddSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newWeight || !newReps) return;

    setError(null);
    startAddSetTransition(async () => {
      try {
        await addSetAction({
          workoutExerciseId: workoutExercise.id,
          weight: newWeight,
          reps: Number(newReps),
        });
        setNewWeight("");
        setNewReps("");
        onChanged();
      } catch {
        setError("Couldn't add set. Please try again.");
      }
    });
  }

  const isPending = isRemoving || isMoving;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{workoutExercise.exercise.name}</CardTitle>
        <CardAction className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleMove("up")}
            disabled={isFirst || isPending}
            aria-label={`Move ${workoutExercise.exercise.name} up`}
          >
            <ChevronUp />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleMove("down")}
            disabled={isLast || isPending}
            aria-label={`Move ${workoutExercise.exercise.name} down`}
          >
            <ChevronDown />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            disabled={isPending}
            aria-label={`Remove ${workoutExercise.exercise.name}`}
          >
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {workoutExercise.sets.length === 0 && (
          <p className="text-sm text-muted-foreground">No sets logged yet.</p>
        )}
        {workoutExercise.sets.map((set) => (
          <SetRow key={set.id} set={set} onChanged={onChanged} />
        ))}

        <form onSubmit={handleAddSet} className="flex items-end gap-2 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`new-set-weight-${workoutExercise.id}`}>
              Weight
            </Label>
            <Input
              id={`new-set-weight-${workoutExercise.id}`}
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              value={newWeight}
              onChange={(event) => setNewWeight(event.target.value)}
              className="w-24"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`new-set-reps-${workoutExercise.id}`}>Reps</Label>
            <Input
              id={`new-set-reps-${workoutExercise.id}`}
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={newReps}
              onChange={(event) => setNewReps(event.target.value)}
              className="w-20"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isAddingSet || !newWeight || !newReps}
          >
            <Plus data-icon="inline-start" />
            {isAddingSet ? "Adding…" : "Add Set"}
          </Button>
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
