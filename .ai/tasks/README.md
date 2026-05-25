# Disposable Task Files

Task files are short-lived execution plans for specific work. They are not durable project history.

Durable state belongs in:

- `.ai/workstreams/`
- `.ai/context.md`
- `.ai/decisions.md`
- `docs/adr/`

## Lifecycle Rule

A task is complete only when:

- the work is completed or explicitly abandoned
- required review is completed or explicitly waived
- durable findings are copied into the relevant workstream
- the task file is deleted

Active task files are ignored by git. Do not commit them.

## Tier System

### Tier 1

High-risk or broad work.

Examples:

- auth/session architecture
- shared API/runtime package changes
- validator behavior changes with broad impact
- cross-feature or cross-package refactors
- changes that alter the process contract

Requirements:

- task file required
- independent review required where supported
- workstream update required
- task file must be deleted after closeout

### Tier 2

Moderate-risk, bounded work.

Examples:

- feature-level behavior changes
- prompt/template changes that affect future Make output
- package API additions with limited scope
- updates to experiment packs or review checklists

Requirements:

- task file required
- review required unless explicitly waived by the user
- workstream update required
- task file must be deleted after closeout

### Tier 3

Low-risk, isolated work.

Examples:

- typo fixes
- small wording edits
- read-only analysis
- local inspection
- narrow documentation clarification

Requirements:

- task file optional
- review optional
- update durable context only if the current state changes

## Task Template

```md
# Task: <short name>

## Tier

Tier 1 | Tier 2 | Tier 3

## Scope

What will change, and what is explicitly out of scope.

## Plan

- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

## Review Requirement

- Required: yes | no
- Reviewer:
- Result:

## Verification

- [ ] Commands/checks run, or reason they were not run

## Closeout Requirements

- [ ] Work completed or explicitly abandoned
- [ ] Required review completed or waived
- [ ] Durable findings copied to the relevant workstream
- [ ] Task file deleted
```

