# Phase 22 Smoke And Boundary Evidence

Status: local smoke PASS; online HTTP PASS; package boundary scans PASS with expected test/tooling references.

## Local Smoke

Commands:

```powershell
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StartDevServer.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\Smoke.cmd
C:\Users\Administrator\.codex\skills\project-ops-workflow\scripts\ops\StopDevServer.cmd
```

Results:

- Dev server started on `http://127.0.0.1:5173/RoomAxioms/`.
- `Smoke.cmd`: PASS.
- Dev server process tree rooted at PID `31576` stopped successfully.

## Online HTTP

Commands:

```powershell
Invoke-WebRequest -UseBasicParsing -Uri https://onovich.github.io/RoomAxioms/ | Select-Object -ExpandProperty StatusCode
Invoke-WebRequest -UseBasicParsing -Uri http://blog.onovich.com/RoomAxioms/ | Select-Object -ExpandProperty StatusCode
```

Results:

- GitHub Pages URL: `200`
- Custom domain URL: `200`

## Boundary Scans

Domain scan:

```powershell
rg "zod|@room-axioms/(schema|solver|proof|oracle|authoring|generator)|react|vite|node:fs|fs" packages\domain\src -n
```

Result: PASS. Matches were limited to `vitest` imports in domain tests.

Web player import and target-access scan:

```powershell
rg "@room-axioms/(authoring|generator)|content/experimental|target\[|targetAccess" apps\web\src -n
```

Result: PASS.

- No authoring/generator imports in player web code.
- No `content/experimental` imports in player web code.
- Target reads remain limited to `logic/targetAccess.ts`, tests, verification harnesses, and performance evidence paths.

Solver/proof/tooling boundary scan:

```powershell
rg "@room-axioms/authoring|@room-axioms/generator|apps/web|react|vite" packages\solver\src packages\proof\src packages\generator\src packages\authoring\src -n
```

Result: PASS.

- Solver/proof do not import authoring/generator or web UI code.
- Authoring imports generator as private maintainer tooling.
- Generator and authoring test references to `vitest` are expected.

## Player-Secrecy Notes

- The final selector imports only `content/cases/case-*.json` files.
- Rejected and verifier-only material stays under `content/experimental/phase-22`.
- Player mode still uses target data only through the existing target-access boundary for inspection, conclusion checking, tests, and explicit developer surfaces.
