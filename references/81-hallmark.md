# Hallmark alongside web-forge and Awwwards

Upstream: [`Nutlope/hallmark`](https://github.com/Nutlope/hallmark), MIT.
A verbatim copy of its installable skill is bundled in `third-party/hallmark/`;
license and exact upstream revision are recorded in `NOTICE.md` and
`third-party/HALLMARK_UPSTREAM.txt`.

## Trigger routing

When the user asks to build a website or app using a web-forge trigger phrase,
use this order:

1. **web-forge** is the project-wide pipeline: intake, spec, planning,
   implementation slices, measurable gates, evidence ledger, release and handoff.
2. For new public-facing UI, load **Hallmark + Awwwards** if both skills are
   visible to the host agent. Hallmark enforces truthful content and its visual
   floor; Awwwards develops a distinctive concept, art direction and motion.
   Keep each workflow's output proportionate to the project. Do not force two
   full-page creative processes onto a simple component patch or when their
   constraints conflict; document the chosen scope in `docs/DECISIONS.md`.
3. For a review-only request, use **jury** as a separate evidence-based score,
   not as another build workflow.

User requirements and the existing product design system win. The web-forge
release, security, accessibility and performance gates remain mandatory; a
visual preference cannot waive them. Do not invent facts, awards, customer
logos, metrics or quotes. Hallmark's upstream instructions govern named
`redesign`/`audit` commands; do not silently reinterpret ordinary edits as those
commands.

## Important host limitation

Bundling a skill directory does **not** make Hermes or another agent host load
that nested skill automatically. Hermes indexes skill roots with `SKILL.md`;
these copies are under `web-forge/third-party/`, so the host will not expose them
as standalone `hallmark`, `awwwards`, or `jury` entries just because `web-forge`
is loaded. The trigger-routing text above is an instruction to load those skills
only if the host can see them. To make this reliable, install/copy the three
skill directories into the agent's own skill path, or expose a documented
external skill directory. Then start/reload a new session and verify all names
are listed. Do not add the large creative skills to `skills.auto_load` unless
the owner explicitly wants them always in context.

For this package, web-forge's Indonesian and English build triggers are in
`SKILL.md` → **When to Use**. After installing `hallmark` and `awwwards`, the
web-forge instructions route those same build requests to both skills for new
visual work. This is a host-level skill-selection behavior, **not** a CLI gate
and cannot be guaranteed in hosts that ignore skill descriptions or project
instructions.

## Install Hallmark directly from this bundled copy

```bash
node third-party/hallmark/scripts/install.mjs --claude --codex --opencode
```

The upstream installer writes to the selected host's global skill directories.
Review the installer and choose only the target harnesses you use. For Hermes,
copy `third-party/hallmark/` to a directory named `hallmark` within
`~/.hermes/skills/` or a configured `skills.external_dirs` directory; likewise
make `awwwards/` and `jury/` available as separate skill roots.

Hallmark can use Together AI for its optional comp step when `TOGETHER_API_KEY`
is configured; it is not needed for the normal skill workflow. Do not put
credentials into project files or commits.

## Validation

Hallmark upstream includes `scripts/refcheck.mjs`, `scripts/sloplint.mjs`, and
tests. Install only in the intended target environment; the bundle alone does
not add packages to a project. Refer to `third-party/hallmark/SKILL.md` and its
linked references for exact workflow and dependency requirements.
