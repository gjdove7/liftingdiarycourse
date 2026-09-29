# Data Mutations Standards

This document defines how data is mutated (created, updated, or deleted) throughout this project. It applies to every server action and every database mutation helper under `/data`. See `docs/data-fetching.md` for the equivalent standards on reading data.

## All mutations go through Server Actions

**Every data mutation must be performed via a Server Action. This is incredibly important — there are no exceptions.**

- Do not mutate data via Route Handlers (`src/app/api/**/route.ts`).
- Do not mutate data from Client Components via `fetch`, a data-fetching library, or any other mechanism.
- Server Actions are the only entry point through which UI code may trigger a database write.

### Server Actions live in colocated `actions.ts` files

- Server Actions must be defined in a file named `actions.ts`, colocated next to the route/component that uses it (e.g. `src/app/dashboard/actions.ts`).
- Each `actions.ts` file must start with the `"use server"` directive.
- Do not scatter Server Actions across arbitrarily named files, and do not define them inline inside component files.

### Server Action parameters must be typed — never `FormData`

- Every Server Action must declare explicitly typed parameters (primitives, objects, arrays of the above).
- Server Actions must **not** accept a `FormData` parameter. Do not use the `<form action={...}>` pattern that hands a Server Action raw `FormData`.
- Call Server Actions directly with plain typed arguments from client code (e.g. from an event handler), rather than binding them to form submission.

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
  performedAt: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { name, performedAt } = createWorkoutSchema.parse(input);

  return createWorkout({ name, performedAt });
}
```

### Every Server Action must validate its arguments with Zod

- Every Server Action must validate all of its incoming arguments using [Zod](https://zod.dev) before doing anything else with them.
- Define a Zod schema for the action's input, and parse the arguments against it (e.g. `schema.parse(input)`) at the top of the action body. Do not skip validation because the parameters are "already typed" — TypeScript types are erased at runtime and do not protect against malformed or malicious input.
- Only pass the parsed, validated output (not the raw input) into the `/data` helper function that performs the mutation.

### Do not call `redirect()` inside a Server Action — redirect client-side after it resolves

- Server Actions must **not** call `redirect()` from `next/navigation`. Have the action return the data the caller needs (e.g. the created record), and perform the redirect client-side (e.g. via the `useRouter` hook's `router.push`/`router.replace`) once the action's promise resolves.
- This matters because Server Actions in this project are invoked directly from client code (see "Server Action parameters must be typed" above), typically inside a `try`/`catch` around the call. `redirect()` works by throwing a `NEXT_REDIRECT` error; a `catch` block around the action call will intercept that error and prevent the redirect from happening, silently turning a successful mutation into what looks like a failure.
- Keeping navigation client-side avoids this failure mode entirely and keeps the action focused on the mutation itself.

```ts
// src/app/dashboard/workout/new/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100).nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

// Returns the created workout instead of redirecting — the caller navigates.
export async function createWorkoutAction(input: CreateWorkoutInput) {
  const { name, date } = createWorkoutSchema.parse(input);

  return createWorkout({ name, date });
}
```

```tsx
// client component
const router = useRouter();

const workout = await createWorkoutAction(input);
router.push(`/dashboard?date=${workout.date}`);
```

## Database mutations: Drizzle ORM helper functions in `/data`

- All database mutations (inserts, updates, deletes) must be made via helper functions defined in the `/data` directory. Server Actions must call these helpers rather than mutating the database directly.
- These helper functions must use [Drizzle ORM](https://orm.drizzle.team) to build and execute mutations.
- **Raw SQL is not allowed.** Do not use `sql` template escapes, raw query strings, or any other mechanism to bypass Drizzle's query builder, except where Drizzle itself has no other way to express something — and even then, prefer restructuring the mutation over reaching for raw SQL.
- A Server Action should orchestrate validation and call into `/data` helpers; it should not itself construct Drizzle queries.

## Data isolation: users can only ever mutate their own data

**A logged-in user must only ever be able to mutate their own data. They must never be able to modify or delete another user's data, under any circumstances.**

- Every helper function in `/data` that writes user-owned data must scope its mutation to the current authenticated user (e.g. filtering `update`/`delete` `where` clauses by the authenticated user's ID), not just to an ID supplied by the caller.
- Never trust a user ID, record ID, or other identifier passed in from the client as sufficient to authorize a mutation. Always intersect it with the current session's user ID in the mutation itself (e.g. `where(and(eq(table.id, recordId), eq(table.userId, currentUserId)))`), so a mutation targeting another user's record simply affects nothing rather than relying on an `if` check after the fact.
- Helper functions should read the authenticated user from the server-side session/auth context themselves rather than accepting a trusted caller-supplied "current user" value.
