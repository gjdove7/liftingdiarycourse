# UI Coding Standards

This document defines the coding standards for all UI work in this project. It applies to every page, layout, and component under `src/app` and `src/components`.

## Components: shadcn/ui only

**Only [shadcn/ui](https://ui.shadcn.com) components may be used for UI in this project. Absolutely no custom components are to be created.**

- Do not hand-write new components (no bespoke `Button`, `Card`, `Modal`, `Input`, etc.). If a UI need arises, first check whether a shadcn/ui component satisfies it.
- Add missing shadcn/ui components via the CLI so they land in `src/components/ui` and stay consistent with the project's configured style, base color, and icon library:

  ```bash
  npx shadcn@latest add <component>
  ```

- Configuration lives in `components.json` (style: `base-nova`, base color: `neutral`, icons: `lucide`). Do not deviate from this configuration when adding components.
- Compose UI exclusively from components generated into `src/components/ui`. Page and feature-level code (e.g. `src/app/**`, `src/components/dashboard/**`) should assemble these primitives, not introduce new ones.
- If a shadcn/ui component needs project-specific behavior, extend/wrap it via props and composition rather than forking it into a custom implementation.
- Icons come from `lucide-react`, matching the `iconLibrary` set in `components.json`.
- Styling is done with Tailwind CSS utility classes and the `cn` helper in `src/lib/utils.ts`, consistent with the shadcn/ui conventions already used by generated components. Do not introduce alternative styling systems (CSS modules, styled-components, inline style objects, etc.).

## Date formatting: date-fns

All date formatting must use [`date-fns`](https://date-fns.org). Do not hand-roll date formatting logic or use `Intl.DateTimeFormat`/`Date.prototype.toLocaleDateString` directly.

Dates must be displayed with an ordinal day, abbreviated month, and full year, using the `date-fns` `format` function with the pattern `"do MMM yyyy"`:

```ts
import { format } from "date-fns";

format(new Date(2025, 8, 1), "do MMM yyyy"); // "1st Sep 2025"
format(new Date(2025, 7, 2), "do MMM yyyy"); // "2nd Aug 2025"
format(new Date(2026, 0, 3), "do MMM yyyy"); // "3rd Jan 2026"
format(new Date(2024, 5, 4), "do MMM yyyy"); // "4th Jun 2024"
```

Expected output examples:

- 1st Sep 2025
- 2nd Aug 2025
- 3rd Jan 2026
- 4th Jun 2024

`date-fns` is not yet a project dependency — add it (`npm install date-fns`) before using it.
