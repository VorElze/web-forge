# Notice

## What this repository contains

Most text, scripts, and documents here are original work, licensed MIT (see
`LICENSE`). This repository **vendors** a MIT-licensed third-party skill bundle
under `third-party/` (see **`NOTICE.md` → Bundled third-party content**).

## What it references

`web-forge` coordinates skills that the user may already have installed in
their AI client. It mentions those skills **by identifier only** — for example
`spec-driven-development`, `design-taste-frontend`, `graphify` — so the agent
can load them if present.

No source text, prompt body, reference file, or script from those skills is
bundled, vendored, or redistributed here. The identifiers are used
descriptively, the same way a build tool names its optional integrations.

## Why it is built this way

Skill libraries in the wild carry mixed and sometimes unclear licenses. Copying
their contents into a public repository would require a per-file license audit
and could redistribute material without permission. Referring to them by name
keeps this repository's license clean and keeps the user's client responsible
for what it has installed.

## If a referenced skill is missing

The pipeline still runs. The affected gate becomes `SKIP` rather than `PASS`,
and `forge gate --release --strict` refuses to open a release while a SKIP
remains. Missing capability is visible, never silent.

## Third-party tools

- **graphify** — optional. Not bundled. When absent, `scripts/codemap.mjs`
  (original, dependency-free) writes a shallower map to the same path.
- **Node.js** — runtime requirement, MIT-style license, not bundled.
- **Playwright / playwright-cli** — optional, not bundled.

## Bundled third-party content

This repository includes a verbatim copy of the `awwwards/` and `jury/` skill
packages from `https://github.com/juliobsz/skills` (MIT).

- License text: `third-party/juliobsz-skills-LICENSE.txt`
- Upstream revision: `third-party/UPSTREAM_REVISION.txt`

## Trademarks

Product and project names mentioned in this repository belong to their
respective owners. Their mention does not imply endorsement.
