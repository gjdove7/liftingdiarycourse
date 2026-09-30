import { Poppins } from "next/font/google";
import { UserButton } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { NewWorkoutForm } from "@/components/dashboard/new-workout-form";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function NewWorkoutPage() {
  return (
    <div className={cn("flex min-h-full flex-col", poppins.className)}>
      <header className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-lg font-semibold">Lifting Diary</span>
        <UserButton />
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">New Workout</h1>
        <NewWorkoutForm />
      </div>
    </div>
  );
}
