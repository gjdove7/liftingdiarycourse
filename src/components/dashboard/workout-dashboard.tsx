"use client";

import { useRouter } from "next/navigation";
import { differenceInMinutes, format, parse } from "date-fns";
import { Dumbbell } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  const selectedDate = parse(date, "yyyy-MM-dd", new Date());

  function handleSelect(newDate: Date | undefined) {
    if (!newDate) return;
    router.replace(`/dashboard?date=${format(newDate, "yyyy-MM-dd")}`);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Select Date</h2>
        <Card className="w-fit">
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Workouts for {format(selectedDate, "do MMM yyyy")}
        </h2>

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
                  ? differenceInMinutes(
                      workout.completedAt,
                      workout.startedAt
                    )
                  : null;

              return (
                <Card key={workout.id}>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
