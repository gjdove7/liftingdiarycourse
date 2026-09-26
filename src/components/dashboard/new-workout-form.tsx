"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { createWorkoutAction } from "@/app/dashboard/workout/new/actions";

export function NewWorkoutForm() {
  const router = useRouter();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Fills in the date input with the browser's local "today" after mount, via
  // a direct DOM write rather than React state — the server's timezone can
  // disagree with the visiting user's about what day it is, so this can't be
  // computed during server rendering (see the note in RedirectToToday).
  useEffect(() => {
    const input = dateInputRef.current;
    if (input && !input.value) {
      input.value = format(new Date(), "yyyy-MM-dd");
    }
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const date = dateInputRef.current?.value;
    if (!date) return;

    setError(null);
    startTransition(async () => {
      try {
        const workout = await createWorkoutAction({
          name: name.trim() || null,
          date,
        });
        router.push(`/dashboard?date=${workout.date}`);
      } catch {
        setError("Couldn't create the workout. Please try again.");
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
            <Input id="workout-date" type="date" ref={dateInputRef} required />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>

        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating…" : "Create Workout"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
