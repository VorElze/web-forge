---
name: web-forge
description: "Build a website or app from the web-forge trigger phrases through nine gated phases. For new visual pages, also use Hallmark and Awwwards when installed; for review-only use Jury. Keep web-forge release gates authoritative."
version: 1.1.0
author: Syamsi (VorElze), DeepSeek V4.1 Flash
license: MIT
platforms: [windows, macos, linux]
metadata:
  forge:
    tags: [website, web-app, gated-delivery, design-audit, accessibility, seo, testing, deploy]
    related_skills:
      - spec-driven-development
      - writing-plans
      - graphify
      - design-taste-frontend
      - hallmark
      - awwwards
      - jury
      - verification-before-completion
      - ponytail
---

# Web Forge

One command turns a sentence into a shipped, measured product. It converts
"saya ingin membuat website" — or "I want to build an app" — into a fixed
sequence of nine phases, each with an exit gate that runs as code. It does not
guarantee taste. It guarantees that nobody says "done" without evidence.

The rule that makes it absolute: **no phase is approved until its gate returns
PASS and its proof file is recorded in `.forge/ledger.json`**. `forge gate
--release` refuses to open otherwise.

## When to Use

Trigger on any of these (Indonesian or English, any casing):

- "saya ingin membuat website", "saya mau bikin website", "buatkan saya website",
  "bikin aplikasi", "saya ingin membuat aplikasi", "buatkan web app"
- "I want to build a website", "build me a website", "create a web app",
  "start a new site", "make an app for ..."
- "lanjutkan proyek website ini", "rebuild this site", "redeploy this app"

If the sentence names an outcome and a user, treat it as a build request and
run `forge doctor` before writing any code.

**Don't use for:** a single snippet or one-file fix; a bug whose cause is already
known (use `diagnosing-bugs`); a design critique with no build (use
`impeccable`); documentation-only edits.

## Prerequisites

- Node 20+ (the CLI is dependency-free), git.
- `graphify` on `PATH` — the code map is a required gate, not optional reading.
- Recommended: `playwright-cli` and the `design-taste-frontend` inspector
  (`inspect.mjs`) for the visual gate. If absent, the gate reports **SKIP**, and
  a release fails on SKIP — it never passes silently.
- Per stack: PHP 8.4+ and Composer for Laravel; nothing extra for static/Next.

Run `node scripts/forge.mjs doctor` first. Fix every MISS before Phase 0.

## How to Run

```bash
node scripts/forge.mjs doctor
node scripts/forge.mjs new "Nama Produk" --stack laravel   # or next | html | api
# ... fill docs/BRIEF.md, docs/SPEC.md, docs/PLAN.md ...
node scripts/forge.mjs gate --url http://127.0.0.1:8080    # after the server runs
node scripts/forge.mjs gate --release --strict             # the only way to call it shipped
```

## Quick Reference

| Command | Purpose |
|---|---|
| `forge doctor` | Tool inventory; exit 1 if a required tool is missing |
| `forge new "<name>"` | Scaffold `docs/` + `.forge/` contract |
| `forge gate` | Run every check, write `.forge/report.md` |
| `forge gate --url <u>` | Add the visual audit on real pages |
| `forge gate --release --strict` | Release gate; SKIP also fails |
| `forge ledger mark <skill> --phase P3 --proof <file>` | Record that a skill was actually applied |
| `forge ledger phase P3 --status approved` | Approve a phase after its gate passes |

## Procedure

Nine phases. Each row is a gate, not a suggestion. Skip a phase only by writing
the reason into `docs/DECISIONS.md` and recording the SKIP in the ledger.

| Phase | Deliverable | Gate (must be measurable) |
|---|---|---|
| **P0 Intake** | `docs/BRIEF.md` with 8 answers + one named reference | `forge gate` → `brief` PASS. No reference artifact = do not start. |
| **P1 Spec** | `docs/SPEC.md`: goals, non-goals, anti-goals, sitemap, data model, completion criteria | Every criterion is a number or a yes/no check. No TBD. |
| **P2 Plan** | `docs/PLAN.md`: tasks ≤ one session, each with `Files` and `Gate:` | `plan` PASS (tasks ≥ 3, every task gated) |
| **P3 Foundation** | Shell, navigation, design tokens, `graphify update .` map | Inspector 0 FAIL at 390/768/1440 on the empty shell; `graph` PASS |
| **P4 Core screens** | The three flows the brief named | Each screen: empty, loading, error, keyboard, mobile. Routes 200. |
| **P5 Remaining** | Secondary screens, auth, admin, forms | Route matrix × 2 identities, zero 500 |
| **P6 Harden** | Security, performance, a11y, uploads | Contrast ≥ 4.5:1, targets ≥ 44 px, no horizontal scroll at 5 widths, no secret in git |
| **P7 Prove** | Tests + adversarial review + evidence file | `tests` PASS, inspector 0 FAIL, verdict written by someone other than the author |
| **P8 Ship** | Deploy, cache, post-deploy probe | External route matrix, sitemap, robots, 404, form round-trip |
| **P9 Handoff** | `docs/HANDOFF.md` + debt list | A newcomer runs the app from the document alone |

### The one-command path

1. `forge doctor` → all required tools OK.
2. `forge new "<name>"` → contract files exist.
3. Fill P0–P2 documents. **Do not write code yet.** This is the phase people skip
   and it is the phase that prevents rebuilding twice.
4. Build P3 → P5 in thin slices. After each slice: `forge gate --url ...`.
5. At P6 load `security-and-hardening`, `performance-optimization`,
   `touch-target-audit`, `css-overflow-verification`.
6. At P7 load `verification-before-completion`. Write the verdict with a
   different agent/context than the one that wrote the code.
7. `forge gate --release --strict` → only then deploy.
8. At P9 load `documentation-and-adrs` and `ponytail-debt`.

### Skill routing

| Request | Skills | Notes |
|---|---|---|
| Website/app build trigger | `web-forge` | Run phases and measurable gates. |
| New visual website/page | Hallmark + Awwwards, if both are separately installed/visible | Host selection/rules load them; the Forge CLI does not. Preserve web-forge release gates. |
| Review/score only | Jury | Evidence-only review; do not turn it into a redesign. |
| Skill missing from host | Do not claim it was loaded | Read bundled docs as reference or expose/install the skill directory, then reload. |

The full phase map and expected proof are in
`references/60-skills.md`. Absence of a skill never blocks a phase — but it
changes the gate from PASS to SKIP, and SKIP fails `--release`.

### Bundled optional skills (`third-party/`)

This repository vendors MIT-licensed copies of **`awwwards`**, **`jury`**,
and **`hallmark`** under `third-party/` (see `NOTICE.md`).

**Trigger routing for new website/app requests:** first use `web-forge` as the
project lifecycle and gates. For distinctive visual design, load **both**
`hallmark` and `awwwards` when available: Hallmark establishes the anti-slop
floor, material truth, theme choice, and sloplint pass; Awwwards contributes
concept-led art direction, motion choreography, and its deeper browser QA.
Resolve conflicts in this order: user constraints and project design system →
web-forge measurable/release gates → accessibility/performance/security floors
from Hallmark → chosen visual direction. Do not force both full workflows when
they conflict or the task is a small UI fix; state the selected scope in
`docs/DECISIONS.md`. For a score-only review, use `jury` instead of both build
skills.

These skills are not invoked by `forge gate` itself. The host agent must load
them through the matching skill trigger/description, a project rule, or an
explicit `skill_view` call. `web-forge` can recommend/require them by written
protocol, but that is separate from a CLI gate. See
`references/80-awwwards-juliobsz.md` and `references/81-hallmark.md` for notes.

## Pitfalls

1. **Claiming "0 FAIL" without running the inspector.** The number is the
   evidence. If `inspect.mjs` did not run, the honest status is SKIP.
2. **Encoding through a shell pipe.** Writing source files with
   `echo`/`-replace`/`Set-Content` in a non-UTF-8 console turns `U+2192` into
   `U+00E2 U+2020` — it renders on the page and passes every layout audit.
   Write files with an editor tool; `forge gate` checks for it.
3. **Skipping graphify because "the codebase is small".** The map is how a new
   agent avoids re-reading everything; it is also the staleness check.
4. **Copying a CDN demo into a project that bans external assets.** Rebuild with
   local CSS/SVG. The gate counts external URLs and can fail on them.
5. **Author grading its own work.** P7 requires a separate context. Same-context
   review approves everything.
6. **Treating "tests pass" as release-ready.** Tests do not cover contrast,
   tap targets, or a 404 page. Those are separate gates.
7. **Approving a phase by editing the ledger.** The ledger records proofs, it
   does not create them. `ledger` fails when an approved phase has no proof file.

## Verification

The skill worked when all of the following are true and reproducible:

- `node scripts/forge.mjs doctor` → exit 0.
- `node scripts/forge.mjs gate --release --strict` → exit 0, `verdict: TERBUKA`.
- `.forge/report.md` lists no FAIL and no unexplained SKIP.
- `.forge/ledger.json` has every phase `approved` with a proof path that exists.
- `graphify-out/GRAPH_REPORT.md` is newer than the last source change.

If any of these is missing, the correct answer to "is it done?" is "not measured".
