---
description: Meta-harness debugger workflow for AstroMap. Optimized for root-cause accuracy, low ceremony, and controlled learning.
---

# Debugger Workflow — AstroMap

## Purpose

Use this workflow for bugs, failing tests, broken UI, API faults, PDF/export failures, build breaks, and domain-calculation regressions.

Goal:

- isolate the failure quickly
- fix the smallest possible surface
- verify by bug class
- record only reusable lessons

This workflow follows the MAESTRO philosophy:

- runtime stays lean
- evidence beats ritual
- learning happens by classification, compression, and promotion
- not every incident deserves a permanent rule

## Core Rules

- Root cause before remedy.
- Reproduce before rewriting.
- Smallest safe fix wins.
- Verification must match the bug class.
- Logs are consulted when relevant, not by superstition.
- Incident notes are created only when the failure is important or reusable.

## Severity Classes

Classify the issue before changing code:

- `blocker`: build broken, production unusable, domain output invalid
- `high`: core flow degraded, major API/UI/PDF issue, likely regression
- `medium`: important but contained defect
- `low`: cosmetic or narrowly scoped issue

## Bug Classes

Tag the issue with one primary class:

- `build`
- `runtime`
- `api`
- `ui`
- `pdf`
- `calc`
- `regression`
- `intermittent`

## Workflow

### Step 1 — Intake

Collect the minimum useful input:

- symptom
- expected behavior
- actual behavior
- affected area
- environment
- reproducibility
- recent related change, if known

If the issue is vague, ask for a minimal repro instead of broad context dumping.

### Step 2 — Context Check

Consult recent logs only if at least one of these is true:

- this looks like a regression
- the same subsystem changed recently
- the issue resembles a known prior failure
- the issue is `blocker` or `high`

Otherwise, proceed without historical lookup.

### Step 3 — Reproduction

Choose one path:

- reproducible now -> create or isolate the failing scenario
- not reproducible but observable -> gather stronger evidence
- intermittent -> identify trigger conditions before editing

If useful, add or identify a failing test before the fix.

### Step 4 — Root Cause

State:

- primary cause hypothesis
- evidence supporting it
- alternative causes considered and rejected
- blast radius of the defect

Do not change code before naming the likely cause.

### Step 5 — Fix Plan

Define:

- smallest viable fix
- files to touch
- what will not be changed
- verification plan

Request approval only when the fix changes:

- domain behavior
- public contracts
- canonical exports/PDF output
- core UX behavior

### Step 6 — Implementation

Apply the narrowest fix that resolves the issue.

Rules:

- no opportunistic refactor
- no adjacent cleanup unless created by the fix
- no speculative hardening without evidence

### Step 7 — Verification

Verify according to bug class:

- `build` -> lint + build
- `api` -> contract, error path, payload shape
- `ui` -> targeted visual/interaction smoke
- `pdf` -> export/render validation on affected scenario
- `calc` -> domain fixture or canonical output comparison
- `regression` -> confirm old failure no longer occurs
- `runtime` -> reproduce fixed flow end-to-end if feasible

Use `npm run test` when tests exist or when a regression test should be added.

### Step 8 — Incident Recording

Create a debug note only if one of these is true:

- severity is `blocker` or `high`
- issue was a regression
- issue exposed a reusable failure pattern
- issue suggests a MAESTRO-worthy lesson candidate

Suggested path:

- `log/debugger/debuglog_YYYY_MM_DD_HH.md`

Minimum note structure:

- symptom
- root cause
- files changed
- verification performed
- reusable lesson, if any

### Step 9 — Learning Filter

After the fix, classify the lesson as one of:

- ignore
- local memory only
- compressed memory candidate
- active-rule candidate
- kernel candidate

Default is **not** to update MAESTRO.

Only propose a MAESTRO change if the lesson is:

- likely to recur
- general enough to matter again
- short enough for always-on cost
- more useful than the context it consumes

## Exit Criteria

The workflow is complete only when:

- the root cause is named
- the fix is minimal
- the affected path is verified
- the blast radius is checked
- unnecessary learning inflation was avoided

## Trigger Command

`Run Debugger Workflow. Issue: [description]. Context: [files/logs/repro].`
