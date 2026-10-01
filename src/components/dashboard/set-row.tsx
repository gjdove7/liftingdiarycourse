"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  updateSetAction,
  deleteSetAction,
} from "@/app/dashboard/workout/[workoutId]/actions";
import type { SetDetail } from "@/data/workouts";

export function SetRow({
  set,
  onChanged,
}: {
  set: SetDetail;
  onChanged: () => void;
}) {
  const [weight, setWeight] = useState(set.weight);
  const [reps, setReps] = useState(String(set.reps));
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isDirty = weight !== set.weight || reps !== String(set.reps);
  const isPending = isSaving || isDeleting;

  function handleSave() {
    setError(null);
    startSaveTransition(async () => {
      try {
        const updated = await updateSetAction({
          setId: set.id,
          weight,
          reps: Number(reps),
        });
        // The DB normalizes `weight` to a fixed 2-decimal string (e.g. "110"
        // becomes "110.00"), so sync local state from what was actually
        // persisted rather than leaving it at the raw typed value — otherwise
        // `isDirty` would stay true (and the save button stuck visible)
        // forever after a save whose input wasn't already 2-decimal-formatted.
        setWeight(updated.weight);
        setReps(String(updated.reps));
        onChanged();
      } catch {
        setError("Couldn't save set. Please try again.");
      }
    });
  }

  function handleDelete() {
    setError(null);
    startDeleteTransition(async () => {
      try {
        await deleteSetAction({ setId: set.id });
        onChanged();
      } catch {
        setError("Couldn't delete set. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="w-6 text-sm text-muted-foreground">
          #{set.setNumber}
        </span>
        <Input
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          className="w-24"
          aria-label={`Set ${set.setNumber} weight`}
          disabled={isPending}
        />
        <span className="text-sm text-muted-foreground">×</span>
        <Input
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={reps}
          onChange={(event) => setReps(event.target.value)}
          className="w-20"
          aria-label={`Set ${set.setNumber} reps`}
          disabled={isPending}
        />
        {isDirty && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={handleSave}
            disabled={isPending}
            aria-label="Save set"
          >
            <Check />
          </Button>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isPending}
          aria-label="Delete set"
        >
          <Trash2 />
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
