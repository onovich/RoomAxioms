# Phase 9 Generator Risk Register

Status: Round 1 baseline

| ID | Risk | Likelihood | Impact | Phase 9 Handling |
| --- | --- | ---: | ---: | --- |
| G-001 | Random targets satisfy rules but produce guess points. | High | High | Reject through proof/no-guess verification and record rejection counts. |
| G-002 | Generated cases become mathematically valid but boring. | High | Medium | Add provisional difficulty metrics, but keep calibration caveat until real playtest exists. |
| G-003 | Search caps hide slow or truncated solver behavior. | Medium | High | Make caps explicit input fields and expose truncation as rejection. |
| G-004 | Reveal minimization removes clues that humans need. | Medium | High | Re-run proof/no-guess and final uniqueness after every removal. |
| G-005 | Experimental content leaks into the shipped selector. | Low | High | Keep artifacts report-only or under experimental paths and scan default content imports. |
| G-006 | Generator duplicates solver/proof semantics. | Medium | High | Consume public APIs from solver and proof only. |
| G-007 | New rule ideas destabilize MVP DSL v1. | Medium | High | Document technique candidates unless a tiny fully validated experiment is explicitly low risk. |
| G-008 | Difficulty claims imply real player calibration. | Medium | Medium | Mark all Phase 9 scores as provisional and uncalibrated. |

## Round 1 Decision

Proceed with a private package prototype because the monorepo already defines generator as a downstream package in the architecture handoff. Keep Round 2 and later outputs deterministic and capped. Do not alter the ten MVP cases or default `case-004`.
