"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { differenceInMinutes, format, parse } from "date-fns";
import { CalendarIcon, Dumbbell, Plus } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { WorkoutWithExercises } from "@/data/workouts";

export function WorkoutDashboard({
  date,
  workouts,
}: {
  /** A "yyyy-MM-dd" calendar-date string (see the note in page.tsx on why
   * this isn't a `Date` — it's built here, client-side, from the string
   * below so it reflects the browser's own timezone). */
  date: string;
  workouts: WorkoutWithExercises[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selectedDate = parse(date, "yyyy-MM-dd", new Date());

  function handleSelect(newDate: Date | undefined) {
    if (!newDate) return;
    router.replace(`/dashboard?date=${format(newDate, "yyyy-MM-dd")}`);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold">
            Workouts for {format(selectedDate, "do MMM yyyy")}
          </h2>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={<Button variant="outline" size="sm" />}>
              <CalendarIcon data-icon="inline-start" />
              {format(selectedDate, "do MMM yyyy")}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/dashboard/workout/new" />}
        >
          <Plus data-icon="inline-start" />
          New Workout
        </Button>
      </div>

      {workouts.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
            <Dumbbell className="text-muted-foreground/60 size-8" />
            No workouts logged for this date.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {workouts.map((workout) => {
            const durationMinutes =
              workout.startedAt && workout.completedAt
                ? differenceInMinutes(workout.completedAt, workout.startedAt)
                : null;

            return (
              <Link
                key={workout.id}
                href={`/dashboard/workout/${workout.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <CardTitle className="font-semibold">
                      {workout.name ?? "Workout"}
                    </CardTitle>
                    {workout.startedAt && (
                      <CardAction className="text-sm text-muted-foreground">
                        {format(workout.startedAt, "h:mm a")}
                      </CardAction>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      {workout.workoutExercises.map((workoutExercise) => (
                        <Badge key={workoutExercise.id} variant="secondary">
                          {workoutExercise.exercise.name}
                        </Badge>
                      ))}
                    </div>
                    {durationMinutes !== null && (
                      <p className="text-sm text-muted-foreground">
                        Duration: {durationMinutes} min
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
