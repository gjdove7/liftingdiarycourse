# Server Components Standards

This document defines coding standards for Server Components in this project — `page.tsx`, `layout.tsx`, and any other Server Component under `src/app`. See `docs/data-fetching.md` for how these components should fetch data, and `docs/data-mutations.md` for how they trigger mutations.

## `params` and `searchParams` are Promises — always `await` them

**This is Next.js 16. `params` and `searchParams` are asynchronous props (`Promise`s), not plain objects. This is a breaking change from Next.js 14 and earlier (where they were synchronous) — do not write code as if this were an older Next.js version, and do not rely on training-data knowledge of these props being synchronous.**

- Every `page.tsx` and `layout.tsx` that declares a `params` and/or `searchParams` prop must type it as a `Promise`, and must `await` it before reading any values off of it.
- The component itself must be an `async function` (or use React's `use()` if it's a Client Component — see below) so it can `await` these props.
- Never destructure or index into `params`/`searchParams` synchronously (e.g. `params.workoutId`). This will not work correctly in this Next.js version and must not be used, even as a stopgap.

```tsx
// src/app/dashboard/workout/[workoutId]/page.tsx
export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
  // ...
}
```

```tsx
// src/app/dashboard/page.tsx
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  // ...
}
```

The same applies to `layout.tsx` files that accept `params` (e.g. for routes under a dynamic segment) — `await` it there too before use.

### Client Components

A Client Component (`"use client"`) cannot be `async`, so it cannot `await` these props directly. If a Client Component page needs to read `params`/`searchParams`, unwrap the promise with React's `use()` instead:

```tsx
"use client";

import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = use(params);
  // ...
}
```

Per `docs/data-fetching.md`, data fetching itself must still happen in a Server Component — a Client Component page should only use `use()` to read routing params it needs for presentation/interactivity, not to then fetch data client-side.

## Validate dynamic route params before using them

A dynamic segment value (e.g. `workoutId` from `[workoutId]`) is always a plain string pulled from the URL — it is not guaranteed to be a valid id (UUID, number, etc.) just because the route matched. Validate it (e.g. with Zod, matching the validation conventions in `docs/data-mutations.md`) before passing it into a `/data` helper, and call `notFound()` from `next/navigation` when it doesn't validate or when the corresponding record isn't found/owned by the current user, rather than letting a malformed value reach the database query or throw an unhandled error.

```tsx
import { notFound } from "next/navigation";
import { z } from "zod";

import { getWorkoutById } from "@/data/workouts";

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

  // ...
}
```

Recall from `docs/data-fetching.md` that `getWorkoutById` (and every `/data` helper) must itself scope its query to the authenticated user via `auth()` — the validation here only rules out malformed input, it is never a substitute for that server-side ownership check.
