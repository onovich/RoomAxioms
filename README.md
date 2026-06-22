# Room Axioms / 房间公理

Room Axioms is a browser-first deduction game prototype: all mechanical rules are public before play, every room cell is fixed before the first investigation, and each click only reveals an objective fact.

《房间公理》是一个浏览器优先的格状推理游戏原型：全部机械规则在开局前公开，房间中的每个格子在开局前已经固定，调查只揭示客观物件。

## Current Build

- React + TypeScript + Vite app in `apps/web`
- Data-driven recreation of the handoff prototype for `case-004`
- Rule panel, board interactions, evidence log, hints, developer verification layer, mobile tabs
- GitHub Pages workflow for `http://blog.onovich.com/RoomAxioms/`
- Original design handoff preserved under `docs/room-axioms-handoff`

## Commands

```powershell
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For manual testing on Windows, double-click `StartLocalTest.cmd`. To open the hosted build, use `OpenOnlineTest.cmd`.

## Product Contract

- Rules are fixed axioms, not hidden events.
- Observations only add facts; they do not rewrite earlier deductions.
- Player marks are notes, not solver facts.
- The final guest layout must be unique; complete safe-object layout does not have to be unique.
- Candidate, forced-cell, and target overlays are developer information unless surfaced through a hint.

The full handoff, architecture notes, DSL specification, prototype screenshots, and backlog live in `docs/room-axioms-handoff`.
