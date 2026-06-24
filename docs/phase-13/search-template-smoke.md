# Phase 13 Search Template Smoke

Status: Round 2 evidence

## Command

```powershell
cmd /c pnpm.cmd authoring -- sample --seed 1301 --template content/experimental/phase-13/phase-13-difference-sample-template.json
```

## Result

- command exited successfully;
- authoring report `ok: false`;
- diagnostic code: `SAMPLE_REJECTED`;
- accepted candidates: `0`;
- attempts: `48`;
- rejection pattern: all sampled targets failed `TARGET_VIOLATES_RULES`, followed by `NO_CANDIDATE_ACCEPTED`;
- solver stats: `nodeCount 48`, `propagationCount 51`, `truncated false`;
- artifact policy: `report-only`;
- no files were written by the CLI.

## Decision

Keep the template as a report-only broad sampling aid, not as a promotion source. Phase 13 candidate work should prioritize hand-authored natural difference geometry, then use sampling only for comparison or accidental useful shapes.

