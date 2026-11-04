# Claude Code adapter

Claude Code reads `CLAUDE.md` from the project root and skills from
`~/.claude/skills/`.

## Install

```bash
mkdir -p ~/.claude/skills
cp -R . ~/.claude/skills/web-forge
```

Then reuse the rules below in your project's `CLAUDE.md`.

## Rules block (copy into project CLAUDE.md)

```markdown
## Building websites and apps

Trigger phrases — in Indonesian or English — start a gated build:
"saya ingin membuat website", "saya ingin membuat aplikasi",
"I want to build a website", "I want to build an app", "build me an app",
"create a web app".

When triggered:

1. Read `~/.claude/skills/web-forge/SKILL.md` and follow it.
2. Run `node ~/.claude/skills/web-forge/scripts/forge.mjs doctor`.
3. Scaffold with `new`, then fill BRIEF → SPEC → PLAN before any app code.
4. Run `forge gate` and show the raw table. Then proceed slice by slice.
5. Release only on `forge gate --release --strict` exit 0.

Hard rules:

- SKIP is not PASS. Report "not measured".
- No phase approval without a proof file in `.forge/ledger.json`.
- No audit claim without the command output.
- Use the editor tool for source files, never a shell pipe (mojibake risk).
```

## Notes

- Claude Code sub-agents are a good fit for the P7 separation rule: write the
  code in one context, run the review gate in a fresh one so the reviewer only
  sees the diff and the measurements.
- If a sub-agent is used for the gate, forbid it from editing code; it reports
  APPROVE / REVISE / BLOCK with numbered findings only.
