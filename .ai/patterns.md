# Patterns

## When to Spawn an Agent

Spawn when:

- Research or exploration spans the codebase broadly (more than 3 targeted lookups)
- Work can run in parallel with other independent work
- Large search results or deep exploration would pollute the main context window
- The task matches a specialized agent type (Explore, Plan, etc.)

Do the work inline when:

- You already have the relevant context from earlier in the session
- The task is contained enough to complete in a few tool calls
- You need the result immediately to determine your next step

## Briefing a Spawned Agent

Spawned agents start cold — no memory of this conversation, no awareness of what has been tried. The prompt must be self-contained.

A good brief includes:

- What you are trying to accomplish and why
- What has already been tried or ruled out
- Relevant file paths, line numbers, or symbols
- What form the result should take

Never delegate understanding. A prompt like "based on your findings, fix the bug" pushes synthesis onto an agent that lacks the context to do it well. Write the brief to prove you understood the problem first — the agent executes, it does not reason from scratch.

When spawning agents in parallel, each needs a fully self-contained prompt and a disjoint write scope. Two agents writing to the same file will conflict.

## Roles

- **Orchestrator** — scopes the work, assigns agents, coordinates review, handles closeout. The main session is the orchestrator.
- **Owner** — implements within the agreed scope. Receives a self-contained brief from the orchestrator.
- **Reviewer** — verifies independently when review is required. Must be a fresh agent with no context from the implementation session.

For Tier 3 work, one agent may act as both orchestrator and owner.

## Review Assignment

- Tier 1: independent review required
- Tier 2: independent review required unless explicitly waived
- Tier 3: self-review allowed
- The owner must not act as the reviewer when review is required

## When to Surface to the User

Interrupt for:

- blockers
- approval boundaries
- meaningful tradeoffs
- review findings that require a decision or rework

Do not interrupt for routine steps — tool calls, file reads, intermediate results, task cleanup. The orchestrator absorbs these.
