# Codex adapter

Codex reads `AGENTS.md` from the repository root.

## Install

```bash
# keep the forge checkout somewhere stable
git clone https://github.com/VorElze/web-forge.git ~/tools/web-forge
```

Then copy the block below into your project's `AGENTS.md`, adjusting the path.

## Rules block

```markdown
## Website and app requests

Treat "saya ingin membuat website", "saya ingin membuat aplikasi",
"I want to build a website", "I want to build an app", "build me an app", and
"create a web app" as a gated build request.

Pipeline (do not skip, do not reorder):

1. `node ~/tools/web-forge/scripts/forge.mjs doctor`
2. `node ~/tools/web-forge/scripts/forge.mjs new "<name>" --stack <stack>`
3. Fill `docs/BRIEF.md` → `docs/SPEC.md` → `docs/PLAN.md`.
4. `node ~/tools/web-forge/scripts/forge.mjs gate` — must show brief/spec/plan PASS.
5. Build in thin slices; `gate --url <url>` after each UI slice.
6. `gate --release --strict` before saying done.

Reporting: paste gate output, not a summary. Numbers or it did not happen.
SKIP means not measured, never "passed".
```

## Notes

- Codex works best when the gate output is pasted verbatim; ask for the raw
  table rather than a paraphrase.
- If the sandbox has no network, `doctor` still runs; only the visual audit and
  test download steps need connectivity.
