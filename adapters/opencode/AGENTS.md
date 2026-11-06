# OpenCode adapter

Save this as `AGENTS.md` in your project root, or append it to an existing one.
OpenCode reads it on every session.

The skill itself goes in a skill directory OpenCode scans:

```
~/.config/opencode/skills/web-forge/SKILL.md
~/.config/opencode/skills/web-forge/scripts/forge.mjs
```

Install on Windows:

```powershell
Copy-Item -Recurse . "$env:USERPROFILE\.config\opencode\skills\web-forge"
Copy-Item .\commands\forge.md "$env:USERPROFILE\.config\opencode\command\forge.md"
```

Install on macOS/Linux:

```bash
cp -R . ~/.config/opencode/skills/web-forge
mkdir -p ~/.config/opencode/command
cp commands/forge.md ~/.config/opencode/command/forge.md
```

Then the phrase "saya ingin membuat website" loads the skill, and `/forge`
invokes it directly.

## Rules block (copy into project AGENTS.md)

```markdown
## Website or app requests

Any request to build a website or app ("saya ingin membuat website",
"saya ingin membuat aplikasi", "I want to build an app", "build me a website",
"create a web app") is a gated build, not a code sprint.

- Load the `web-forge` skill and follow its 9 phases.
- Do not write application code before `forge gate` reports brief/spec/plan PASS.
- Run `forge gate --url <url>` after each UI slice.
- Before claiming completion, run `forge gate --release --strict` and paste the
  output.
- A SKIP is not a pass. Say "not measured".
- Never write source files through a shell pipe; it produces mojibake.
- For new visual web pages, load Hallmark + Awwwards if available; for review-only, use Jury. If these are only nested in the web-forge bundle, expose/install them as separate host skills first.
```
