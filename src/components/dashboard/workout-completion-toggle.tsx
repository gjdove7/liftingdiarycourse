"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { setWorkoutCompletedAction } from "@/app/dashboard/workout/[workoutId]/actions";

export function WorkoutCompletionToggle({
  workoutId,
  initialCompleted,
  completedAt,
}: {
  workoutId: string;
  initialCompleted: boolean;
  completedAt: Date | null;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheckedChange(completed: boolean) {
    setError(null);
    setChecked(completed);
    startTransition(async () => {
      try {
        await setWorkoutCompletedAction({ workoutId, completed });
        router.refresh();
      } catch {
        setChecked(!completed);
        setError("Couldn't update completion status. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Switch
          id="workout-completed"
          checked={checked}
          onCheckedChange={handleCheckedChange}
          disabled={isPending}
        />
        <Label htmlFor="workout-completed">Completed</Label>
        {checked && completedAt && (
          <span className="text-sm text-muted-foreground">
            Completed on {format(completedAt, "do MMM yyyy")}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
