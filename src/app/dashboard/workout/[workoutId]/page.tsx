import { notFound } from "next/navigation";
import { Poppins } from "next/font/google";
import { z } from "zod";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { EditWorkoutForm } from "@/components/dashboard/edit-workout-form";
import { getWorkoutById } from "@/data/workouts";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const workoutIdSchema = z.uuid();

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  const { success } = workoutIdSchema.safeParse(workoutId);
  const workout = success ? await getWorkoutById(workoutId) : null;

  if (!workout) {
    notFound();
  }

  return (
    <div className={cn("flex min-h-full flex-col", poppins.className)}>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold">Lifting Diary</span>
        <UserButton />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">Edit Workout</h1>
        <EditWorkoutForm
          workoutId={workout.id}
          initialName={workout.name ?? ""}
          initialDate={workout.date}
        />
      </div>
    </div>
  );
}
