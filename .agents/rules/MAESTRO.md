---
trigger: always_on
---

# MAESTRO.md

Status: always-on
Mode: compact
Role: execution kernel + controlled self-improvement
Hard limits:

- Max 180 lines
- Max 2200 words
- Kernel should stay <= 12 rules
Update rule:
- merge > compress > replace > add

## 0. Purpose

MAESTRO is the single always-on rules file for AstroMap.

Its job is to:

- reduce repeat mistakes
- preserve correctness
- keep context cost low
- improve from real incidents without uncontrolled growth

This file must stay short enough to remain worth its token cost.

## 1. Operating Model

M01. Runtime must stay small.
M02. Learning must happen by compression, not accumulation.
M03. A past failure does not automatically justify a new permanent rule.
M04. Only rules with repeated or broad value deserve always-on space.

## 2. Precedence

P01. Direct user intent wins unless it would harm safety, security, or correctness.
P02. Kernel rules override all lower sections.
P03. Domain rules apply only to AstroMap-specific work.
P04. Active rules are temporary and may be merged, rewritten, or removed.
P05. Compressed memory is advisory, not mandatory.
P06. When two rules overlap, prefer the broader rule and delete the narrower duplicate.

## 3. Workflow Boundary

W01. MAESTRO defines rules, priorities, and admission criteria. Workflows define execution steps.

W02. Do not duplicate workflow procedures inside MAESTRO. Keep MAESTRO compact and always-on.

W03. When a task clearly matches a workflow, use the workflow and keep MAESTRO as the governing kernel.

W04. New requests should pass through **Intake / Triage** before execution, unless the correct workflow is already obvious and low-risk.

W05. Official workflow names:

- Project Canvas
- Spec Studio
- Spec / Change Design
- Intake / Triage
- BUILD FLOW
- DEBUG TRACE
- Refactor / Debt Controller
- Contract Guardian
- Domain Verifier
- UI / Accessibility Review
- Test / Regression Harness
- VALIDATE GATE
- Release / Rollback
- Observability / Incident Review

W06. Logs, notes, and incident records are conditional artifacts, not automatic outputs.

W07. Record logs or notes only when future debugging, release safety, incident traceability, or reusable learning justifies the cost.

W08. No workflow may update MAESTRO automatically.

W09. Changes to MAESTRO require admission filtering: recurrence, generality, brevity, and always-on value.

W10. Validation and release are separate stages.

W11. Passing validation does not automatically authorize promotion.

## 4. Kernel

K01. Think before editing. If ambiguity materially affects implementation, state it.
K02. Make the smallest change that fully solves the task.
K03. Every non-trivial change must have a concrete verification path.
K04. Do not silently alter adjacent behavior, structure, naming, or formatting.
K05. Prefer existing project patterns over new abstractions.
K06. Remove only code made obsolete by the current change.
K07. Validate external inputs, boundaries, and unsafe assumptions.
K08. Frontend/backend contracts must match exactly.
K09. Never expose secrets, tokens, API keys, or sensitive internal values.
K10. Before commit or deploy: lint, tests, and build must pass.
K11. Clear code beats clever code. Reliable code beats compact code.
K12. Do not fake certainty. Surface real uncertainty when it matters.

## 5. Execution Rules

E01. Bug fix flow: identify failure -> fix minimally -> verify explicitly.
E02. Refactor flow: preserve behavior unless behavior change is requested.
E03. Feature flow: build only requested scope; no speculative extensibility.
E04. For risky edits, prefer local containment over broad rewrites.
E05. If a simpler valid solution exists, use it.
E06. Every changed line should trace back to the task.

## 6. AstroMap Domain Rules

D01. Preserve AstroMap domain conventions and canonical naming.
D02. Astrological calculations must preserve classical-planet logic and existing project conventions.
D03. Shared types are the cross-layer source of truth.
D04. Export/PDF flows must use canonical typed fields only.
D05. Visual changes must preserve Infinity constraints unless redesign is explicitly requested.
D06. Astrology logic, calculations, exports, and typed data transformations require extra caution and explicit verification.

## 7. Active Rules

A01. All `/api/*` error paths must return JSON, not plain text or HTML.
A02. Check `content-type` before parsing JSON responses.
A03. Use UTF-8 without BOM and normalized LF line endings.
A04. Use canonical shared field names only; do not introduce local aliases for shared data contracts.
A05. Icon-only buttons must include `aria-label` and `title`.
A06. Sensitive input fields must preserve established visibility-toggle UX when that pattern already exists.
A07. Verify external model IDs, config keys, and platform-specific identifiers against the actual source of truth before changing them.

## 8. Compressed Memory

C01. Encoding issues are usually environment/config problems, not text-escape problems.
C02. Contract drift between UI, API, and shared types is a recurring failure source.
C03. Platform configuration must be verified against real behavior, not memory.
C04. Deep nesting increases structural UI failure risk.
C05. Accessibility regressions commonly come from unlabeled controls.

## 9. Self-Improvement Protocol

S01. This file improves by substitution and compression, not by default addition.
S02. After an incident, first classify it as:

- ignore
- local fix only
- compressed memory
- active rule
- kernel rule

S03. Use this promotion order:
ignore < compressed memory < active rule < kernel rule

S04. Add a new rule only if the lesson is:

- likely to matter again
- short enough for always-on use
- actionable
- more valuable than its token cost

S05. Promote to Kernel only if the lesson is general, stable, and reusable across tasks.
S06. Keep incident-specific details out of Kernel.
S07. If a lesson can fit inside an existing rule, rewrite that rule instead of adding a new one.
S08. If two rules overlap, merge them immediately.
S09. If a rule has no recurrence signal and is not structural, demote or remove it.
S10. A rule that exists only because something broke once is probably not worth always-on space.

## 10. Rule Admission Test

A rule belongs in MAESTRO only if most answers are yes:

R01. Does it prevent a meaningful class of errors?
R02. Is it likely to matter again?
R03. Is it short enough to justify always-on cost?
R04. Is it operational and unambiguous?
R05. Is it more useful than the context it consumes?
R06. Would its absence predictably increase failure risk?

If not, do not keep it here.

## 11. Update Cycle

When updating MAESTRO:

U01. Write the root cause in one sentence.
U02. Decide whether the lesson is structural or local.
U03. Try, in order:

- ignore
- merge into existing rule
- compress into memory
- add or rewrite active rule
- promote to kernel only if clearly justified

U04. Rewrite for brevity and enforcement value.
U05. Delete redundancy immediately.
U06. Preserve the hard limits.
U07. If the file grows, something else must shrink.

## 12. Maintenance Triggers

Run a cleanup when any of these happen:

- file exceeds hard limits
- active rules exceed 7
- kernel exceeds 12 rules
- two or more rules say nearly the same thing
- a rule no longer protects against a live failure pattern

Cleanup actions:

- merge duplicates
- compress narrow rules
- demote stale active rules
- remove low-value wording
- keep the sharper formulation

## 13. Default Style

Be:

- cautious, not timid
- minimal, not lazy
- precise, not verbose
- adaptive, not reactive
- stable, not rigid
- compact, not shallow

## 14. Final Constraint

MAESTRO is successful only if it helps the model:

- guess less
- change less
- break less
- repeat fewer mistakes
- consume fewer tokens over time

If it becomes long, decorative, repetitive, or incident-heavy, it is failing.
