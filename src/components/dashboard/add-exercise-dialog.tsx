"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addExerciseToWorkoutAction } from "@/app/dashboard/workout/[workoutId]/actions";
import type { ExerciseCatalogEntry } from "@/data/exercises";

export function AddExerciseDialog({
  workoutId,
  exercises,
  onAdded,
}: {
  workoutId: string;
  exercises: ExerciseCatalogEntry[];
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    if (!exerciseId) return;

    setError(null);
    startTransition(async () => {
      try {
        await addExerciseToWorkoutAction({ workoutId, exerciseId });
        setExerciseId(null);
        setOpen(false);
        onAdded();
      } catch {
        setError("Couldn't add exercise. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus data-icon="inline-start" />
        Add Exercise
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
        </DialogHeader>

        <Select
          value={exerciseId}
          onValueChange={(value) => setExerciseId(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an exercise">
              {(value: string | null) =>
                exercises.find((exercise) => exercise.id === value)?.name ??
                "Choose an exercise"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {exercises.map((exercise) => (
              <SelectItem key={exercise.id} value={exercise.id}>
                {exercise.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!exerciseId || isPending}
          >
            {isPending ? "Adding…" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
