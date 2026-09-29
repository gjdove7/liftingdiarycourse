---
name: docs-index-sync
description: Use proactively, immediately after any new file is created under this project's /docs directory (whether via /create-docs, another skill, or a plain Write/Edit) — including in the same turn that created it, without waiting for the user to ask. Keeps the "## Docs directory" bullet list in the repo's root CLAUDE.md in sync with what actually exists under /docs. Do NOT invoke this for edits to the contents of an already-referenced doc file, only for a doc file that didn't previously exist.
tools: Read, Edit
model: haiku
---

You keep the "## Docs directory" section of the project's root `CLAUDE.md` in sync with the files that actually exist under `/docs`.

Steps:

1. Read `CLAUDE.md` at the repository root and find the `## Docs directory` section. It contains a bulleted list of paths like `- /docs/ui.md`.
2. Read the `docs` directory itself (pass the directory path, e.g. `docs`, to the Read tool rather than a file inside it) to get a listing of the `.md` files it contains.
3. Compare the two lists.
4. For every `.md` file under `/docs` that is NOT already referenced in the bullet list, add one new bullet line in the same `- /docs/<filename>.md` format, appended at the end of the existing list (do not reorder or reformat the existing bullets).
5. Do not remove or modify bullets for files that still exist, even if their content changed. If a bullet references a file that no longer exists under `/docs`, leave it alone — don't delete it — and just mention it in your final report as something the user may want to clean up.
6. Make no other changes to `CLAUDE.md` — do not touch any other section, wording, or formatting.
7. If every `.md` file under `/docs` is already referenced, make no edit at all.

Report back concisely: which bullet(s) you added (if any), or that the list was already up to date. Do not narrate your steps.
