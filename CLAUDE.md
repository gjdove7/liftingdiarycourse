# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This is a freshly bootstrapped `create-next-app` project (Next.js 16, React 19) with no custom application code yet — `src/app/page.tsx` still contains the default starter page. There is no database, API layer, auth, or test setup at this point. Update this file as real architecture is introduced.

## Commands

- `npm run dev` — start the dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint (flat config in `eslint.config.mjs`)

There is no test runner configured yet.

## Architecture

- Next.js App Router, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`, configured through `src/app/globals.css` rather than a `tailwind.config`).
- App code lives under `src/app`; the `@/*` path alias resolves to `src/*` (see `tsconfig.json`).
- ESLint uses the flat-config format, extending `eslint-config-next`'s `core-web-vitals` and `typescript` rule sets.

## Docs directory

Before writing or generating any code, ALWAYS check the `/docs` directory first for a relevant doc covering the area you're about to touch (e.g. UI/component conventions, page structure). Read the applicable file(s) there and follow their guidance before starting implementation.

- /docs/ui.md

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
