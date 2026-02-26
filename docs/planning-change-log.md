# Planning Change Log

Tracks changes to phase decomposition and detailed step plans.

## Change Entry Template
- Date:
- Change ID:
- Affected Phase(s):
- Previous Plan:
- New Plan:
- Why Changed:
- Risks Introduced:
- Mitigation:
- Requires Spec Update: `Yes` | `No`

## Entries

- Date: 2026-02-25
- Change ID: PLAN-0002
- Affected Phase(s): Phase 05 (babylon-gui), Phase 04 (three-rapier-bounce skeleton)
- Previous Plan: `three-rapier-bounce` and `babylon-gui` both assigned dev port 5176.
- New Plan: `three-rapier-bounce` reassigned to port 5180 (dev) / 4180 (preview). `babylon-gui` keeps 5176 / 4176.
- Why Changed: Port collision discovered during cross-phase audit.
- Risks Introduced: None — `three-rapier-bounce` is still a skeleton with no implementation depending on the port number.
- Mitigation: Grep verified only `babylon-gui` uses port 5176 after the change.
- Requires Spec Update: No

---

- Date: 2026-02-26
- Change ID: PLAN-0001
- Affected Phase(s): All
- Previous Plan: Prior docs were organized around a different set of apps/stacks.
- New Plan: Reorganized into seven phases aligned to `three-html`, `three-pixi`, and `babylon-gui` plus shared/validation/migration phases.
- Why Changed: New canonical user spec superseded prior plan.
- Risks Introduced: Existing codebase may require non-trivial transition work.
- Mitigation: Added explicit transition phase (`phase-07-repo-transition-gap-plan.md`) and CAN logging.
- Requires Spec Update: No
