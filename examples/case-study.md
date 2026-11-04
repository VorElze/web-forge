# Case study — what the gate caught that review did not

Abstracted from a real Laravel 12 project (258 source files, ~11.7k lines of
code, 92 tests). Names and organisation details removed; numbers kept because
they are the point.

## Context

A content site with public pages, an admin panel, role-based accounts, and a
handover to non-technical editors. By the usual signs it was finished: tests
green, routes 200, design reviewed by eye, deployment documented.

## Finding 1 — mojibake that every layout audit passed

`forge gate` on the project returned:

```
FAIL  encoding   mojibake: resources/css/app.css
```

One line in the stylesheet was written through a shell pipe on a non-UTF-8
console. A CSS `content` value that should have been `→` (U+2192) had become
three characters (U+00E2 U+2020 U+2019). The arrow rendered as garbage on the
live page.

Why it survived every other check:

- Tests assert behaviour, not glyphs.
- Layout audits measure geometry. The corrupted string occupies the same width.
- Visual review looks at the whole page; one broken arrow at 12 px is invisible.
- The file is valid UTF-8 — it is the *content* that is wrong, not the encoding.

Lesson folded into the repo: `encoding` is a first-class gate, and the build
rules forbid writing source files through a shell pipe.

## Finding 2 — convention drift invisible in diffs

The project's own `AGENTS.md` required a helper (`lroute()`) instead of the
framework's `route()` in views. Measured with `rg`:

- `route()` in views: **171 occurrences**
- `lroute()` in views: **0**

Nobody broke the rule in one commit. It eroded over thirty. A diff-based review
cannot see this; a repo-wide count can.

Lesson folded into the repo: `CONSTRAINTS.md` plus measurable gates, and a code
map (`graphify-out/GRAPH_REPORT.md`) so a new agent sees structure before
reading files.

## Finding 3 — a dead import that hid a missing feature

`routes/web.php` imported a controller that no route used. Harmless by itself,
but it was the remnant of a theme-switching feature that had been removed
half-way. Reading the file top-to-bottom does not reveal it; listing symbols and
their usage does.

Lesson: `graphify-query-first` before `grep`, and a "god nodes" list in the code
map.

## Finding 4 — the ledger refusing a fake approval

The same pipeline was run on its own repository. Approving Phase 0 without
recording its required skills produced:

```
FAIL  ledger   skill wajib belum tercatat: P0/interview-me,
               P0/brainstorming, P0/context-engineering,
               P0/request-token-efficiency
```

The approval was not accepted. That is the difference between a checklist
someone promises to follow and a gate that cannot be walked past.

## What changed in the delivery

| Before | After |
|---|---|
| "Tests pass" = done | Tests + 9 gates = done |
| Review by eye | Numbers per gate, per width |
| Conventions in prose | Conventions as counted thresholds |
| Phase approval by saying so | Approval requires an existing proof file |
| "Not measured" described as "fine" | SKIP, and release stays closed |

## Reproducing the demo

```bash
node scripts/forge.mjs new "Demo" --stack html
printf "a { content: '\xe2\x80\xa0'; }\n" > style.css   # mojibake on purpose
node scripts/forge.mjs gate --no-run
# → FAIL encoding, naming style.css
```

The point is not that the tool knows about arrows. The point is that a
measurable check exists for the class of defect that humans stop seeing after
the twentieth review.
