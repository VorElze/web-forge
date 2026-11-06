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

This repository includes the following separately licensed upstream skill
packages. The repository's top-level MIT license applies only to original
web-forge material; each upstream license is retained with its copy.

- **Awwwards + Jury** from `https://github.com/juliobsz/skills` (MIT):
  `third-party/awwwards/`, `third-party/jury/`.
  License: `third-party/juliobsz-skills-LICENSE.txt`.
  Revision: `third-party/UPSTREAM_REVISION.txt`.
- **Hallmark** from `https://github.com/Nutlope/hallmark` (MIT):
  `third-party/hallmark/` (includes the upstream `LICENSE`).
  Revision: `third-party/HALLMARK_UPSTREAM.txt`.

The bundled third-party skill source is redistributed under its original terms;
web-forge's integration/routing documentation is original and covered by the
repository license. Bundling is not affiliation or endorsement by upstreams.

## Trademarks

Product and project names mentioned in this repository belong to their
respective owners. Their mention does not imply endorsement.
