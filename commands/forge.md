---
description: Start a gated web build (9 phases, evidence required)
---

Start a gated build. The user's request is: $ARGUMENTS

If the request is empty, ask one question only: "Siapa penggunanya, dan satu
hal apa yang harus bisa mereka lakukan?"

Then follow `web-forge/SKILL.md` exactly:

1. Locate the forge CLI (the `scripts/forge.mjs` inside the installed
   `web-forge` skill, or a path the user supplied).
2. Run `doctor`. Report missing required tools and stop if any are missing.
3. If the project has no `.forge/ledger.json`, run `new "<name>"`.
4. Work through P0 → P2 by filling `docs/BRIEF.md`, `docs/SPEC.md`,
   `docs/PLAN.md`. Ask the intake questions one at a time, not as a block.
5. Run `gate` and show the raw output. Do not summarise it away.
6. Only then begin P3.

Rules that override convenience:

- A `SKIP` is not a pass. Say "not measured".
- Never approve a phase without a proof file recorded in the ledger.
- Never claim an audit you did not run.
- Write source files with the editor, never through a shell pipe.
