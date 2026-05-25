# Agent Entry Point

This file is a thin compatibility wrapper for Codex, Claude, and other coding agents.

Read these files before making project changes:

1. `.ai/instructions.md` — working rules, naming conventions, what not to store
2. `.ai/context.md` — project goal, current shape, important artifacts, resume guidance
3. `.ai/decisions.md` — rolling index of currently binding decisions
4. `.ai/stack.md` — technology choices, version baselines, open stack questions
5. `.ai/coordination.md` — agent roles, coordination model, interrupt and visibility rules
6. The relevant file in `.ai/workstreams/` — active flow state and next actions

Keep durable project context in `.ai/`, not in chat-only memory.

