"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

/**
 * Renders when the dashboard is loaded without a `?date=` param. Computes
 * "today" using the browser's local timezone (rather than the server's) and
 * redirects to it, so the default view lands on the correct day regardless
 * of where the server is deployed.
 */
export function RedirectToToday() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard?date=${format(new Date(), "yyyy-MM-dd")}`);
  }, [router]);

  return (
    <p className="text-muted-foreground text-sm">Loading today&apos;s workouts…</p>
  );
}
