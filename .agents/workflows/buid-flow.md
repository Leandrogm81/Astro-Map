---
description: Meta-harness feature workflow for AstroMap. Optimized for scoped delivery, reuse, and controlled learning.
---

# Feature Workflow — AstroMap

## Purpose

Use this workflow for new components, pages, APIs, business logic, exports, and domain features.

Goal:

- define scope clearly
- reuse existing patterns
- implement the smallest complete feature
- verify by feature type
- capture lessons without inflating MAESTRO

This workflow follows the MAESTRO philosophy:

- no speculative engineering
- no rule inflation
- low context cost
- learning by compression and admission filtering

## Core Rules

- Scope before solution.
- Reuse before abstraction.
- Smallest complete feature wins.
- Validation must match feature type.
- MAESTRO is a kernel, not a dumping ground for every lesson.

## Feature Classes

Classify the feature before planning:

- `micro`: small local enhancement with low blast radius
- `standard`: normal feature touching one main area
- `risky`: touches shared contracts, domain logic, exports, config, or critical UX
- `structural`: broad feature affecting architecture, data flow, or multiple subsystems

## Workflow

### Step 1 — Scope Definition

Write:

- goal
- non-goals
- user-visible outcome
- affected areas
- risk class

If non-goals are unclear, the scope is not ready.

### Step 2 — Reuse Check

Before designing anything new, check for:

- existing components to extend
- existing types/contracts to reuse
- existing patterns in UI, API, hooks, exports, and domain logic

The default is integration with current patterns, not invention.

### Step 3 — Design Delta

Describe only the delta being added:

- new or changed UI
- new or changed logic
- API/data contract impact
- export/PDF impact
- domain-calculation impact
- validation strategy

For `micro` changes, keep this brief.
For `risky` and `structural` changes, make it explicit.

### Step 4 — Quality Gates by Feature Type

Apply only the gates that match the feature.

If the feature touches API:

- contracts must stay canonical
- error paths must stay structured
- payload names must match shared types

If the feature touches UI:

- loading/error/empty states must be handled
- accessibility must be preserved
- Infinity constraints must remain intact unless redesign is requested

If the feature touches calculations:

- domain logic must be verified with canonical examples or fixtures

If the feature touches PDF/export:

- typed fields must remain canonical
- output structure must be checked on the affected scenario

If the feature touches config/deploy behavior:

- verify against the real source of truth, not memory

### Step 5 — Implementation

Implement the smallest version that satisfies the stated goal.

Rules:

- no speculative flexibility
- no broad refactor hidden inside feature work
- no new abstraction without repeated need
- avoid `any`; if unavoidable, isolate and justify it

### Step 6 — Verification

Choose verification by feature class and type.

Typical checks:

- lint
- targeted tests
- build
- scoped smoke validation
- domain or export verification where applicable

Any risky or structural feature must pass full validation.

### Step 7 — Delivery Record

Create an update note only if the feature is:

- risky
- structural
- likely to affect future debugging
- introducing a reusable pattern worth remembering

Suggested path:

- `log/updates/update_YYYY_MM_DD_HH.md`

Minimum note structure:

- feature summary
- files/areas affected
- validation performed
- known limits or follow-ups

### Step 8 — Learning Filter

Do not update MAESTRO by default.

If the feature revealed a reusable lesson, classify it first:

- local only
- compressed memory candidate
- active-rule candidate
- kernel candidate

Only propose a MAESTRO change if the lesson passes the admission test:

- recurrent enough
- general enough
- short enough
- worth always-on cost

## Exit Criteria

The workflow is complete only when:

- scope and non-goals are clear
- reuse was considered first
- implementation stayed within stated scope
- validation matched the feature type
- MAESTRO inflation was avoided

## Trigger Command

`Run Feature Workflow. Goal: [description]. Constraints: [constraints].`
