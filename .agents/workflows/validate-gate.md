---
description: Meta-harness validation and promotion workflow for AstroMap. Optimized for reproducibility, scoped promotion, and low-risk delivery.
---

# Validate and Promote Workflow — AstroMap

## Purpose

Use this workflow before commit, push, or deployment.

Goal:

- prove the change is ready
- validate the correct level of risk
- separate validation from promotion
- avoid accidental staging and noisy process

This workflow follows the MAESTRO philosophy:

- smaller runtime rules
- stronger verification
- no ritual steps without value
- controlled records, not bureaucratic logs

## Core Rules

- Validation comes before promotion.
- Reproducibility beats convenience.
- Stage only intended files.
- Risk determines depth of checks.
- Not every change needs the same ceremony.

## Change Classes

Classify the change first:

- `trivial`: docs, text, low-risk cosmetic copy
- `standard`: isolated code change with limited blast radius
- `risky`: touches shared contracts, calculations, exports, config, or key UX
- `structural`: broad architecture, migrations, or deploy-affecting behavior

## Workflow

### Step 1 — Preflight

Check:

- current branch is correct
- working tree state is understood
- changed files match intended scope
- no secrets, temp files, or accidental artifacts are present

If scope is messy, stop and clean the change before validation.

### Step 2 — Dependency Discipline

Do not run install commands by habit.

Use deterministic dependency flow appropriate to the project state.
Only refresh dependencies when the change actually requires it.

### Step 3 — Validation Plan

Pick checks based on risk:

- `trivial` -> minimal relevant checks
- `standard` -> lint + targeted tests or build as needed
- `risky` -> lint + tests + build + targeted smoke
- `structural` -> full validation + explicit review of blast radius

State the chosen validation path before executing it.

### Step 4 — Static and Test Validation

Run the applicable checks:

- lint
- tests
- build

Do not treat all three as blind ritual if the change class clearly does not require them, but any risky or structural change must pass the full set.

### Step 5 — Targeted Smoke

Run targeted smoke validation when the change touches:

- visual flows
- API contracts
- PDF/export
- routing/navigation
- data loading states
- astrological calculations
- platform/deploy configuration

Smoke must be scoped to the affected critical path, not generic wandering.

### Step 6 — Diff Review

Review the diff before staging.

Confirm:

- every changed file belongs to the task
- naming/contracts stayed correct
- no unrelated churn entered the diff
- no generated noise is being promoted accidentally

### Step 7 — Record Only What Matters

Create an update note only if one of these is true:

- the change is risky or structural
- the change introduces a reusable pattern
- the change affects deployment behavior
- the change would benefit future triage

Suggested path:

- `log/updates/update_YYYY_MM_DD_HH.md`

Minimum note structure:

- what changed
- why it changed
- validation performed
- risks or follow-ups

### Step 8 — Promotion

Promotion is separate from validation.

When promoting:

- stage files selectively
- use a scoped commit message
- push only after diff review and validation are complete

Never use blanket staging as the default behavior.

## Exit Criteria

The workflow is complete only when:

- validation depth matched risk
- intended files were reviewed
- promotion was selective
- no accidental artifacts were included
- records were created only if justified

## Trigger Command

`Run Validate and Promote Workflow. Scope: [description]. Risk: [trivial|standard|risky|structural].`
