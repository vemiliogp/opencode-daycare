---
description: Reviews React files against current best practices using Context7 documentation, applies improvements, and verifies with lint/typecheck.
agent: react-best-practices
---

Review and apply React best practices to the following files: **$ARGUMENTS**

If the argument above is empty, ask the user which files to review before doing anything else.

For each file:
1. Read the file and understand its patterns
2. Use Context7 to verify against current React documentation
3. Apply improvements following best practices (hooks, state, effects, performance, accessibility)
4. Run `npm run lint` and `npx tsc --noEmit` to verify nothing broke
5. Report changes with documentation references
