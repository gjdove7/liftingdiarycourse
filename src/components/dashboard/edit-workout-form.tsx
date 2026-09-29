"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { updateWorkoutAction } from "@/app/dashboard/workout/[workoutId]/actions";

export function EditWorkoutForm({
  workoutId,
  initialName,
  initialDate,
}: {
  workoutId: string;
  initialName: string;
  /** A "yyyy-MM-dd" calendar-date string. */
  initialDate: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date) return;

    setError(null);
    startTransition(async () => {
      try {
        const workout = await updateWorkoutAction({
          workoutId,
          name: name.trim() || null,
          date,
        });
        router.push(`/dashboard?date=${workout.date}`);
      } catch {
        setError("Couldn't save the workout. Please try again.");
      }
    });
  }

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workout-name">Name</Label>
            <Input
              id="workout-name"
              placeholder="e.g. Push Day"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workout-date">Date</Label>
            <Input
              id="workout-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard?date=${initialDate}`)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
