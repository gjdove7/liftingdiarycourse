# Routing Coding Standards

This document defines the coding standards for routes and route protection in this project — everything under `src/app` plus `src/proxy.ts`. See `docs/server-components.md` for how individual pages handle `params`/`searchParams`, and `docs/auth.md` for the broader Clerk conventions this doc's protection rules build on.

## All application routes live under `/dashboard`

- Every route a signed-in user interacts with must be a sub-route of `/dashboard` (e.g. `/dashboard`, `/dashboard/workout/new`, `/dashboard/workout/[workoutId]`). Do not add top-level app routes (e.g. `src/app/workout/page.tsx`) for authenticated features — nest the segment under `src/app/dashboard/` instead.
- `src/app/page.tsx` (the marketing/landing root) and the Clerk catch-all auth routes (`src/app/sign-in/[[...sign-in]]`, `src/app/sign-up/[[...sign-up]]`) are the only routes allowed outside `/dashboard`, since they must be reachable by signed-out visitors.
- New authenticated features are added as a new folder under `src/app/dashboard/`, following the existing pattern in `src/app/dashboard/workout/new/page.tsx` and `src/app/dashboard/workout/[workoutId]/page.tsx` — never as a sibling top-level route.

## Route protection happens in `src/proxy.ts`, not in individual pages

**This is Next.js 16. The `middleware.ts` file convention is deprecated and renamed to `proxy.ts` — the exported function and file name are `proxy`, not `middleware` (see `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). Do not create a `middleware.ts` file; it will not run.** Clerk's own helper is still named `clerkMiddleware()` (that's Clerk's export name, unrelated to the Next.js file convention rename) — it is called from inside `src/proxy.ts` as the file's default export.

- All protection for `/dashboard` and every sub-route must be enforced in `src/proxy.ts` using `clerkMiddleware()` combined with `createRouteMatcher()`, both from `@clerk/nextjs/server`. This is the single place route access is decided — do not gate a route by checking `auth()` in a layout and conditionally rendering a "please sign in" message instead.

  ```ts
  // src/proxy.ts
  import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

  export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });

  export const config = {
    matcher: [
      "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
      "/(api|trpc)(.*)",
    ],
  };
  ```

- `auth.protect()` redirects a signed-out visitor straight to the sign-in flow before any `/dashboard` route renders. Every new route added under `src/app/dashboard/` is automatically covered by the `isProtectedRoute` matcher as long as it stays under that path segment — do not add a second, narrower matcher per feature.
- Because `config.matcher` controls which requests `proxy.ts` runs on at all, never narrow it to exclude a path under `/dashboard`. If a matcher change is ever needed, verify every existing `/dashboard` sub-route (including nested dynamic segments like `[workoutId]`) still falls inside it.
- As stated in `docs/auth.md`, this proxy-level check is optimistic/edge-level only. Every Server Component and `/data` helper under `/dashboard` must still independently call `auth()` and scope its own queries to that `userId` — `auth.protect()` in `proxy.ts` stops a signed-out visitor from reaching the page at all, it does not substitute for per-request data isolation.

## Never re-implement protection at the page or layout level

- Do not write a `redirect("/sign-in")` call in `src/app/dashboard/layout.tsx` (or any page under it) as the mechanism for keeping signed-out users out. That duplicates what `proxy.ts` already does, is easy to forget on a new route, and runs later (after the page has already started rendering) than the proxy check.
- A layout or page under `/dashboard` may still call `auth()` — per `docs/auth.md` — but only to read the current user's id for data scoping, never to decide whether to allow the request through.
