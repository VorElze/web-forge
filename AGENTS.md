# AGENTS.md — web-forge drop-in rules

Paste this block into a project's `AGENTS.md` (OpenCode, Codex), `CLAUDE.md`
(Claude Code), or `.cursorrules` (Cursor). It is the enforcement half of the
skill: `SKILL.md` explains the procedure, this file makes it mandatory.

---

## Building a website or app

If the user says any of the following — in Indonesian or English — treat it as
a **gated build request**, not a chat:

- "saya ingin membuat website", "saya ingin membuat aplikasi", "bikin website",
  "buatkan web app", "lanjutkan proyek website ini"
- "I want to build a website", "I want to build an app", "build me an app",
  "create a web app", "start a new site"

Then, before writing a single line of application code:

1. `node <web-forge>/scripts/forge.mjs doctor` — fix every missing required tool.
2. `node <web-forge>/scripts/forge.mjs new "<name>" --stack <laravel|next|html|api>`
   in the project directory (skip if `.forge/ledger.json` already exists).
3. Fill `docs/BRIEF.md`, then `docs/SPEC.md`, then `docs/PLAN.md`.
4. Run `node <web-forge>/scripts/forge.mjs gate` and show the output to the user.

Do not start Phase 3 (code) until `brief`, `spec`, and `plan` are PASS.

## During the build

- Run `forge gate` after each thin slice, not once at the end.
- Before opening a new area of the codebase, read
  `graphify-out/GRAPH_REPORT.md` (run `graphify --code-only` or
  `node <web-forge>/scripts/codemap.mjs` if it is stale).
- After a slice that touches UI, run `forge gate --url <running-url>` so the
  visual audit runs on real pages.

## Before saying "done"

- `forge gate --release --strict` must exit 0.
- Do not describe a `SKIP` as a pass. Say "not measured".
- Do not mark a phase `approved` until its required skills are recorded with an
  existing proof file: `forge ledger mark <skill> --phase <P#> --proof <file>`.
- Report numbers: HTTP status codes, pass/fail counts, measured widths,
  contrast ratio, file sizes. "Looks good" is not a result.

## Forbidden shortcuts

- Claiming audit results you did not run.
- Writing source files through a shell pipe on a non-UTF-8 console — it
  produces mojibake that passes layout audits. Use an editor tool.
- Approving a phase by editing `.forge/ledger.json` by hand without a proof file.
- Lowering a threshold in `CONSTRAINTS.md` to make old work pass.
