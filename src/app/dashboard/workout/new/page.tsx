import { Poppins } from "next/font/google";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
        <Avatar>
          <AvatarFallback>
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">New Workout</h1>
        <NewWorkoutForm />
      </div>
    </div>
  );
}
