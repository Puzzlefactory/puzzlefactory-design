# Durable Decisions

This file is a rolling index of currently binding decisions. Use ADRs in `docs/adr/` for full rationale when a decision needs more context.

## Active Decisions

- Use lowercase-kebab-case for new repo-owned files and directories.
- `AGENTS.md` and `CLAUDE.md` remain uppercase — they follow agent platform conventions.
- `.ai/` is the committed durable context area for cross-agent instructions, rolling project context, decisions, and active workstreams.
- `context.md` and `decisions.md` are rolling current-state files, not dated archives.
- Use workstream files for active flow state; workstreams are updated in-place, not appended.
- Use ADRs for significant process or architecture decisions.
- Use disposable task files for Tier 1 and Tier 2 work; completed tasks must update the relevant workstream and then be deleted.
- Active task files live under `.ai/tasks/` and are ignored by git.

## Superseded Decisions

- None yet.
