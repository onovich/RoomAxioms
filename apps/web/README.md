# Room Axioms Web

React/Vite implementation of the `case-004` Room Axioms handoff prototype.

## Scripts

```powershell
pnpm --filter @room-axioms/web dev
pnpm --filter @room-axioms/web lint
pnpm --filter @room-axioms/web typecheck
pnpm --filter @room-axioms/web test
pnpm --filter @room-axioms/web build
```

The app is built with `base: '/RoomAxioms/'` for GitHub Pages.

## Structure

- `src/data`: handoff puzzle data and labels
- `src/logic`: candidate layout analysis and hint text
- `src/hooks`: game session state
- `src/view`: screen and component composition
- `@room-axioms/domain`: shared coordinates, neighborhood helpers, DSL types, events, and pure reducer
