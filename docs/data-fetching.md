# Data Fetching Standards

This document defines how data is fetched and queried throughout this project. It applies to every page, layout, and component under `src/app` and `src/components`, and to every database access helper under `/data`.

## All data fetching happens in Server Components

**All data fetching in this app must be done via Server Components. This is incredibly important — there are no exceptions.**

- Do not fetch data via Route Handlers (`src/app/api/**/route.ts`). Route Handlers must not exist purely to serve data to the app's own UI.
- Do not fetch data from Client Components (`"use client"`), whether via `fetch`, a data-fetching library (SWR, React Query, etc.), `useEffect`, or any other mechanism.
- Do not fetch data via any other mechanism (Server Actions used as a data-fetching workaround, middleware, edge functions, etc.).
- Fetch data directly inside `async` Server Components (pages, layouts, and server-only components) by calling the helper functions described below, then pass the resulting data down as props to any Client Components that need to render it.

If a component needs interactivity but also needs data, split it: fetch the data in a parent Server Component and pass it down as props to a Client Component that only handles interactivity/presentation.

## Database access: Drizzle ORM helper functions in `/data`

- All database queries must be made via helper functions defined in the `/data` directory. Server Components must call these helpers rather than querying the database directly.
- These helper functions must use [Drizzle ORM](https://orm.drizzle.team) to build and execute queries.
- **Raw SQL is not allowed.** Do not use `sql` template escapes, raw query strings, or any other mechanism to bypass Drizzle's query builder, except where Drizzle itself has no other way to express something — and even then, prefer restructuring the query over reaching for raw SQL.

## Data isolation: users can only ever access their own data

**A logged-in user must only ever be able to access their own data. They must never be able to access another user's data, under any circumstances.**

- Every helper function in `/data` that reads or writes user-owned data must scope its query to the current authenticated user (e.g. filtering by the authenticated user's ID), not just to an ID supplied by the caller.
- Never trust a user ID, record ID, or other identifier passed in from a route param, form field, or client input as sufficient to authorize access. Always intersect it with the current session's user ID in the query itself (e.g. `where(and(eq(table.id, recordId), eq(table.userId, currentUserId)))`), so a request for another user's record simply returns nothing rather than relying on an `if` check after the fact.
- Helper functions should read the authenticated user from the server-side session/auth context themselves rather than accepting a trusted caller-supplied "current user" value.
