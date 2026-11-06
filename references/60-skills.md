# Peta skill

Sumber kebenaran mesin: `manifest.json`. Dokumen ini versi bacanya.

Aturan umum: **skill wajib harus meninggalkan bukti.** `forge gate` menolak
fase yang di-`approved` bila salah satu skill wajibnya tidak tercatat di
`.forge/ledger.json`.

```bash
node scripts/forge.mjs phases                      # tampilkan peta
node scripts/forge.mjs ledger mark graphify --phase P3 --proof graphify-out/GRAPH_REPORT.md
```

## P0 — Intake

| Skill | Bukti |
|---|---|
| `interview-me` | `docs/BRIEF.md` |
| `brainstorming` | `docs/BRIEF.md` |
| `context-engineering` | `AGENTS.md` |
| `request-token-efficiency` | `docs/PLAN.md` |

## P1 — Spec

| Skill | Bukti |
|---|---|
| `spec-driven-development` | `docs/SPEC.md` |
| `measurable-acceptance-criteria` | `docs/SPEC.md` |
| `domain-modeling` | `docs/SPEC.md` |
| `constraint-driven-development` | `CONSTRAINTS.md` |

## P2 — Plan

| Skill | Bukti |
|---|---|
| `writing-plans` | `docs/PLAN.md` |
| `planning-and-task-breakdown` | `docs/PLAN.md` |
| `incremental-implementation` | `docs/PLAN.md` |
| `lean-build` | `docs/PLAN.md` |
| `karpathy-guidelines` | `docs/DECISIONS.md` |

## P3 — Fondasi

| Skill | Bukti |
|---|---|
| `graphify` | `graphify-out/GRAPH_REPORT.md` |
| `graphify-query-first` | `docs/PLAN.md` |
| `codebase-design` | `docs/DECISIONS.md` |
| `design-taste-frontend` | `.forge/audit/` |
| `frontend-design` | `docs/DECISIONS.md` |
| `hallmark` (opsional, visual baru) | `.forge/audit/` |
| `awwwards` (opsional, arah seni + motion) | `.forge/audit/` |

## P4 — Layar inti

| Skill | Bukti |
|---|---|
| `surgical-patch` | `docs/PLAN.md` |
| `ponytail` | `docs/DECISIONS.md` |
| `forms-and-data-entry` | `docs/SPEC.md` |
| `impeccable` | `.forge/audit/` |
| `ui-ux-pro-max` | `.forge/audit/` |
| `antislop-ui` | `.forge/audit/` |
| `antislop-layoutmobile` | `.forge/audit/` |

## P5 — Layar sisa

| Skill | Bukti |
|---|---|
| `webapp-testing` | `.forge/report.json` |
| `playwright-cli` | `.forge/audit/` |

## P6 — Harden

| Skill | Bukti |
|---|---|
| `security-and-hardening` | `docs/DECISIONS.md` |
| `performance-optimization` | `.forge/report.md` |
| `touch-target-audit` | `.forge/report.md` |
| `css-overflow-verification` | `.forge/report.md` |
| `web-design-guidelines` | `.forge/report.md` |
| `antislop-human` | `.forge/report.md` |
| `observability-and-instrumentation` | `docs/DECISIONS.md` |

## P7 — Prove

| Skill | Bukti |
|---|---|
| `test-driven-development` | `.forge/report.json` |
| `tdd` | `.forge/report.json` |
| `verification-before-completion` | `.forge/report.md` |
| `gate-harness-selfcheck` | `.forge/report.json` |
| `code-review` | `docs/HANDOFF.md` |
| `requesting-code-review` | `docs/HANDOFF.md` |
| `receiving-code-review` | `docs/HANDOFF.md` |
| `release-gate-scan` | `.forge/report.md` |
| `verify-and-stop` | `.forge/report.md` |

## P8 — Ship

| Skill | Bukti |
|---|---|
| `git-workflow-and-versioning` | `docs/HANDOFF.md` |
| `github` | `docs/HANDOFF.md` |
| `shipping-and-launch` | `docs/HANDOFF.md` |
| `live-web-release-verification` | `.forge/report.md` |

## P9 — Handoff

| Skill | Bukti |
|---|---|
| `documentation-and-adrs` | `docs/HANDOFF.md` |
| `finishing-a-development-branch` | `docs/HANDOFF.md` |
| `humanizer` | `docs/HANDOFF.md` |
| `no-ai-slop`, `stop-slop`, `antislop`, `antislop-code`, `antislop-copywriting`, `avoid-ai-writing` | `docs/HANDOFF.md` |
| `ponytail-debt` | `docs/HANDOFF.md` |
| `sdlc-review` | `docs/HANDOFF.md` |

## Skill kondisional

Aktif hanya bila permukaan proyek menyentuhnya — daftar lengkap dengan syarat
"when" ada di `manifest.json`. Contoh: `api-and-interface-design` (ada API),
`php-upload-size-limits` (PHP + unggahan), `cpanel-shared-hosting-deploy`
(hosting cPanel), `live-react-runtime-qa` (React/Next).

## Yang sengaja tidak dipaksa

Skill non-perangkat-lunak (catatan Apple, pencari paper, produksi musik,
laporan absensi) tidak pernah masuk pipeline. Memaksanya menghasilkan pekerjaan
palsu, bukan kualitas. Aturannya sederhana: **kalau skill itu tidak bisa
mengubah artefak proyek, dia bukan gerbang.**

## Kalau skill tidak terpasang

Pipeline tetap jalan. Gate berubah dari PASS menjadi SKIP untuk bagian yang
bergantung pada skill tersebut, dan `--release --strict` menutup rilis sampai
audit dijalankan manual atau skill dipasang. Yang dilarang hanya satu:
mengklaim PASS untuk sesuatu yang tidak diukur.
