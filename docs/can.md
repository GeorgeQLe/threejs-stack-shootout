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

## Initial Entries
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
