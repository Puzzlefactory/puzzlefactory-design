# Work Authorization

Proceed with `<workstream or feature>` end to end.

## Tier

Classify this work using `.ai/tasks/README.md`.

Expected tier: `<Tier 1 | Tier 2 | Tier 3>`.

If the classification differs from the expected tier, follow the actual tier requirements. For Tier 1 or Tier 2 work, record the reason in the task file before implementation. For Tier 3 work, mention the reason in closeout.

## Scope

In scope:

- `<specific change 1>`
- `<specific change 2>`

Out of scope:

- `<thing not authorized>`
- `<thing not authorized>`

## Research

Research current official docs when implementation depends on stack, library, runtime, API, or version behavior that is not pinned or clear from the repo. Prefer primary sources.

Do not stop after research. Continue into planning, implementation, verification, review, and closeout unless blocked.

## Task Management

Read `AGENTS.md`, then follow the startup and task flow in `.ai/instructions.md`.

Create required `.ai/tasks/*` task files before implementation.

Update durable `.ai` context, decisions, stack, or workstream files during closeout when project state changes or future agents need the information.

Delete completed task files during closeout.

## Implementation

Make the authorized changes.

Keep changes scoped to this authorization.

Do not implement out-of-scope packages, apps, features, or refactors.

## Review

Perform required review according to `.ai/coordination.md`.

Use an independent reviewer where the environment supports it. This authorization includes spawning or delegating to an independent reviewer when required by the task tier.

If required review cannot be performed, record why before closeout.

Address review findings before closeout, or record why they are intentionally deferred.

## Verification

Run relevant tests, builds, typechecks, smoke checks, or visual checks.

Report commands run and any failures.

## Closeout

Summarize changed files and important decisions.

Confirm task files were deleted, or state that no task file was required.

Confirm durable `.ai` context was updated, or state that no durable context update was needed.

## Constraints

- `<constraint 1>`
- `<constraint 2>`

Work uninterrupted until implementation, verification, review, and closeout are complete.

Ask for approval only when blocked or when a decision would materially change this authorization.
