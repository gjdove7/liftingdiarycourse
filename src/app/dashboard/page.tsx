import { Poppins } from "next/font/google";
import { isValid, parse } from "date-fns";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { WorkoutDashboard } from "@/components/dashboard/workout-dashboard";
import { RedirectToToday } from "@/components/dashboard/redirect-to-today";
import { getWorkoutsForDate } from "@/data/workouts";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/**
 * Validates the `date` search param as a "yyyy-MM-dd" calendar-date string.
 * Deliberately does not fall back to a server-computed "today" — the
 * server's timezone (e.g. UTC on Vercel) can disagree with the visiting
 * user's timezone about what day it is, so the "no date param" case is
 * instead handled client-side in `RedirectToToday`.
 */
function parseDateParam(value: string | undefined) {
  if (!value) return null;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? value : null;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const date = parseDateParam(dateParam);
  const workouts = date ? await getWorkoutsForDate(date) : [];

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
        {date ? (
          <WorkoutDashboard date={date} workouts={workouts} />
        ) : (
          <RedirectToToday />
        )}
      </div>
    </div>
  );
}
