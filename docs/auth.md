# Auth Coding Standards

This document defines the coding standards for all authentication and authorization work in this project. It applies to every page, layout, component, proxy, and data helper that needs to know who the current user is.

## Clerk only

**[Clerk](https://clerk.com) (`@clerk/nextjs`) is the sole authentication provider for this app. Do not hand-roll auth, and do not introduce another auth library (NextAuth/Auth.js, Lucia, Passport, custom JWT/session/cookie handling, etc.).**

- There is no local `users` table and none should be added for identity purposes. Clerk is the source of truth for user identity — see the comment in `src/db/schema.ts`. Tables that own user data store the Clerk user id directly (a `text('user_id')` column, as on `workouts`), not a foreign key to a local users table.
- Never write custom sign-in/sign-up forms, password handling, session tokens, or cookie-based auth. Use Clerk's components, hooks, and server helpers for everything auth-related.
- Never store or manage credentials (passwords, OAuth tokens, etc.) in this app's own database. Clerk owns that data.

## Provider setup: `ClerkProvider` and `proxy.ts`

- `ClerkProvider` wraps the app once, in `src/app/layout.tsx`. Do not add additional `ClerkProvider` instances elsewhere.
- Route-level Clerk wiring lives in `src/proxy.ts` via `clerkMiddleware()` from `@clerk/nextjs/server`. In this Next.js version, Proxy is the renamed successor to Middleware (see `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`) — the file must be named `proxy.ts`, not `middleware.ts`.
- Treat Proxy/`clerkMiddleware()` as an optimistic, edge-level check only (e.g. redirecting obviously signed-out visitors away from protected routes with `auth.protect()`/`createRouteMatcher`). It is not a substitute for real authorization — every Server Component and `/data` helper must still independently verify the user via `auth()`, per the data isolation rules in `docs/data-fetching.md`. Do not remove or weaken that server-side check on the assumption that the proxy already handled it.

## Server-side: `auth()` from `@clerk/nextjs/server`

- In Server Components, Route Handlers, Server Actions, and `/data` helpers, get the current user with `auth()` from `@clerk/nextjs/server`:

  ```ts
  import { auth } from "@clerk/nextjs/server";

  const { userId } = await auth();
  ```

- `/data` helpers must call `auth()` themselves to determine the current user rather than accepting a caller-supplied user id — see `data/workouts.ts` for the established pattern (return an empty/safe result when `userId` is `null`, and scope every query to that `userId`). This is the same rule `docs/data-fetching.md` states for data isolation; Clerk's `auth()` is the only source for "the current authenticated user" anywhere server-side.
- Use `currentUser()` from `@clerk/nextjs/server` only when you need full Clerk user profile fields (name, email, image, etc.) beyond the id — prefer the cheaper `auth()` when only the user id is needed.

## Client-side: Clerk's built-in components and hooks

- Build signed-in/signed-out UI with Clerk's control components — `<Show when="signed-in">` / `<Show when="signed-out">`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` — as already used in `src/app/page.tsx`. Do not hand-write conditional auth UI by fetching/checking the user manually in a Client Component.
- If a Client Component needs auth state directly (not just conditional rendering), use Clerk's hooks (`useAuth`, `useUser`) from `@clerk/nextjs`. Do not fetch auth state via a custom API route or Context provider.
- `<SignInButton>` / `<SignUpButton>` should use `mode="modal"` for in-page sign-in/sign-up, matching the existing usage in `src/app/page.tsx`, unless a full-page flow is specifically required.

## Sign-in / sign-up pages

- Full-page auth flows live at the Clerk-conventional catch-all routes: `src/app/sign-in/[[...sign-in]]/page.tsx` rendering `<SignIn />`, and `src/app/sign-up/[[...sign-up]]/page.tsx` rendering `<SignUp />` (both from `@clerk/nextjs`). Do not build custom form UI for these flows — Clerk's components handle the full flow, including multi-step steps like verification and MFA.
- All UI here still follows `docs/ui.md`: only shadcn/ui primitives and Tailwind for any surrounding page chrome (e.g. layout/branding around the `<SignIn />`/`<SignUp />` component). Do not restyle the internals of Clerk's components with bespoke CSS overrides beyond Clerk's supported [`appearance`](https://clerk.com/docs/customization/overview) prop.

## Environment variables and keys

- Clerk keys (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and any additional Clerk env vars) belong in `.env.local` and must never be committed or hardcoded in source.
- Never expose `CLERK_SECRET_KEY` (or any secret Clerk key) to client code — it must only be read on the server (Route Handlers, Server Components, `proxy.ts`, `/data` helpers). Only `NEXT_PUBLIC_*`-prefixed Clerk keys may be referenced from Client Components.

## Data isolation

Authorization for user-owned data is enforced in the database query itself, not just by checking `userId` in a page. See "Data isolation: users can only ever access their own data" in `docs/data-fetching.md` — every `/data` helper must scope its query to the `userId` returned by `auth()`, intersected in the `where` clause, never trusting an id supplied by the caller.
