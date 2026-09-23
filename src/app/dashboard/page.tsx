"use client";

import { useState } from "react";
import { Poppins } from "next/font/google";
import { format, isSameDay } from "date-fns";
import { Dumbbell, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Workout = {
  id: string;
  name: string;
  date: Date;
  durationMinutes: number;
  exercises: string[];
};

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const today = new Date();

function atTime(hours: number, minutes: number) {
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    hours,
    minutes
  );
}

const placeholderWorkouts: Workout[] = [
  {
    id: "1",
    name: "Upper Body Strength",
    date: atTime(9, 0),
    durationMinutes: 45,
    exercises: ["Bench Press", "Pull-ups", "Shoulder Press"],
  },
  {
    id: "2",
    name: "Cardio Session",
    date: atTime(18, 0),
    durationMinutes: 30,
    exercises: ["Treadmill", "Rowing"],
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(today);

  const workoutsForDate = placeholderWorkouts.filter(
    (workout) => date && isSameDay(workout.date, date)
  );

  return (
    <div className={cn("flex min-h-full flex-col", poppins.className)}>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold">Lifting Diary</span>
        <Avatar>
          <AvatarFallback>
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">Workout Dashboard</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Select Date</h2>
            <Card className="w-fit">
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">
              Workouts for {date ? format(date, "do MMM yyyy") : "..."}
            </h2>

            {workoutsForDate.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-sm">
                  <Dumbbell className="text-muted-foreground/60 size-8" />
                  No workouts logged for this date.
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {workoutsForDate.map((workout) => (
                  <Card key={workout.id}>
                    <CardHeader>
                      <CardTitle className="font-semibold">
                        {workout.name}
                      </CardTitle>
                      <CardAction className="text-sm text-muted-foreground">
                        {format(workout.date, "h:mm a")}
                      </CardAction>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.map((exercise) => (
                          <Badge key={exercise} variant="secondary">
                            {exercise}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Duration: {workout.durationMinutes} min
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
