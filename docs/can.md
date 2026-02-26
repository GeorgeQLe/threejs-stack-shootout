# CAN Log (Changes, Assumptions, Notes)

Purpose: Canonical in-repo log for deviations from `docs/spec.md` and for noteworthy planning/implementation assumptions.

## Usage Rules
1. Add a new entry whenever implementation intentionally diverges from the canonical spec.
2. Add a new entry whenever a phase step is re-ordered, split, merged, or removed.
3. Link each entry to the affected phase doc and file paths.

## Entry Template
- Date:
- Entry ID:
- Type: `Change` | `Assumption` | `Note`
- Scope: `Spec` | `Phase Plan` | `Implementation`
- Affected Docs:
- Affected Code Paths:
- Description:
- Reason:
- Impact on Comparability:
- Action Taken:
- Follow-up Required: `Yes` | `No`
- Owner:

## Entries

- Date: 2026-02-25
- Entry ID: CAN-0003
- Type: Note
- Scope: Implementation
- Affected Docs: `docs/phases/phase-05-babylon-gui.md`
- Affected Code Paths: `apps/babylon-gui/src/main.ts`
- Description: Babylon's `scene.getTotalVertices() / 3` counts total scene vertices (static), not per-frame rendered triangles like Three.js's `renderer.info.render.triangles`. A clarifying comment was added. The values are directionally comparable for identical geometry but are not an exact semantic match.
- Reason: No Babylon.js public API exposes per-frame rendered triangle counts without engine internals.
- Impact on Comparability: Low — both metrics scale proportionally with scene complexity; absolute values may differ slightly.
- Action Taken: Added inline comment documenting the semantic difference.
- Follow-up Required: No
- Owner: Claude

---

- Date: 2026-02-25
- Entry ID: CAN-0002
- Type: Change
- Scope: Implementation
- Affected Docs: none
- Affected Code Paths: `apps/three-rapier-bounce/package.json`
- Description: Reassigned `three-rapier-bounce` dev port from 5176 to 5180 and preview port from 4176 to 4180 to resolve collision with `babylon-gui` which owns port 5176.
- Reason: Both apps claimed port 5176; `babylon-gui` was committed first and keeps its port.
- Impact on Comparability: None.
- Action Taken: Updated `package.json` scripts.
- Follow-up Required: No
- Owner: Claude

---

- Date: 2026-02-26
- Entry ID: CAN-0001
- Type: Change
- Scope: Phase Plan
- Affected Docs: `docs/spec.md`, `docs/phases/*`, `docs/phase-classification-parallel.md`
- Affected Code Paths: none
- Description: Replaced earlier planning docs that targeted a different app matrix with the new `web-3d-tech-stack-bench` stack model.
- Reason: User issued a new canonical spec with different workspace layout and stack set.
- Impact on Comparability: Positive, because planning now aligns with required stack parity.
- Action Taken: Rewrote spec/phase docs to match current target.
- Follow-up Required: Yes
- Owner: Codex
