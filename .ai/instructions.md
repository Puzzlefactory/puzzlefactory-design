# Agent Instructions

These instructions apply to agents working in this repo.

## Working Rules

- Prefer small, scoped changes.
- Read context before writing code.
- Update the relevant workstream when current state or next actions change.
- Write a dated context record in `.ai/context/` when a session produces strategic insight with cross-session value that does not fit a workstream or decisions entry. Create the directory and a `README.md` index on first use.

## Naming

- Use lowercase-kebab-case for new repo-owned files and directories.
- `AGENTS.md` and `CLAUDE.md` at the repo root remain uppercase — they follow agent platform conventions.

## Before Editing

1. Read `.ai/context.md`.
2. Read `.ai/decisions.md`.
3. Read the relevant `.ai/workstreams/*.md`. If no workstream is relevant to the current work, proceed without — create one if the work meets the criteria in the Workstreams section below.
4. Classify the work using `.ai/tasks/README.md`. If it is Tier 1 or Tier 2, create a disposable task file before proceeding.
5. On completion, update the relevant workstream and delete the task file after copying any durable findings.

## Workstreams

Create a workstream when:

- The work spans multiple sessions or agents.
- The work has open questions, ongoing findings, or evolving next actions.
- The context behind the work is not obvious from the code or git history.

Do not create a workstream for:

- Single contained tasks (use a disposable task file instead).
- Work that is complete with no ongoing successor thread.

Update workstreams in-place — overwrite Current State and Next Actions as things change. Do not append. Add new workstreams to the index in `.ai/workstreams/README.md`.

## What Not To Store

- Do not store secrets, tokens, credentials, or private keys in `.ai/`.
- Do not paste large logs or generated output into `.ai/`.
- Do not store build artifacts or generated dependency trees in `.ai/`.
- Do not commit active task files from `.ai/tasks/`.
