# Architecture Decision Records

This directory records significant process and architecture decisions for the project.

ADRs capture the context and reasoning behind decisions that would otherwise be lost. They are not documentation of what exists — they are documentation of why it exists.

## Index

- [ADR 0001: Component Foundation Direction](0001-component-foundation.md)
- [ADR 0002: Form And Interactive Component Foundation](0002-form-interactive-component-foundation.md)

## Conventions

- ADR filenames use lowercase-kebab-case: `0001-short-title.md`.
- ADRs are numbered sequentially starting at `0001`.
- ADRs are immutable records once accepted, except for small typo or link fixes.
- To change a decision, write a new ADR that supersedes the old one. Do not rewrite history.
- Keep `.ai/decisions.md` as the rolling index of currently active decisions.

## Template

```md
# ADR [NNNN]: [Title]

## Status

Proposed | Accepted | Superseded by [ADR NNNN]

## Context

What situation or problem prompted this decision? What constraints or forces were at play?

## Decision

What was decided?

## Consequences

What becomes easier or harder as a result of this decision?
```
