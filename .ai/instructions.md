# Agent Instructions

These instructions apply to agents working in this repo.

## Project Goal

[Project goal goes here — keep this in sync with context.md.]

## Working Rules

- Prefer small, scoped changes.
- Read context before writing code.
- Update the relevant workstream when current state or next actions change.

## Naming

- Use lowercase-kebab-case for new repo-owned files and directories.
- `AGENTS.md` and `CLAUDE.md` at the repo root remain uppercase — they follow agent platform conventions.

## Before Editing

- Read `.ai/context.md`.
- Read `.ai/decisions.md`.
- Read the relevant `.ai/workstreams/*.md`.
- Classify the work using `.ai/tasks/README.md`.
- Create a disposable task file for Tier 1 and Tier 2 work.
- Update the relevant workstream when the current state or next action changes.
- Delete completed task files after durable findings are copied to the workstream.

## Workstreams

Create a workstream when:

- The work spans multiple sessions or agents.
- The work has open questions, ongoing findings, or evolving next actions.
- The context behind the work is not obvious from the code or git history.

Do not create a workstream for:

- Single contained tasks (use a disposable task file instead).
- Work that is complete with no ongoing successor thread.

Update workstreams in-place — overwrite Current State and Next Actions as things change. Do not append. Add completed work to the Index in `.ai/workstreams/README.md`.

## What Not To Store

- Do not store secrets, tokens, credentials, or private keys in `.ai/`.
- Do not paste large logs or generated output into `.ai/`.
- Do not store build artifacts or generated dependency trees in `.ai/`.
- Do not commit active task files from `.ai/tasks/`.
