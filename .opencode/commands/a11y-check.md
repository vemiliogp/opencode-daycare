---
description: Audits and fixes WCAG 2.2 AA accessibility issues in React components (.tsx) and static HTML (.dc.html). Runs axe-core via Playwright, keyboard navigation tests, manual code review, and applies fixes automatically.
agent: accessibility-checker
---

Audit and fix accessibility issues in the following files: **$ARGUMENTS**

If the argument above is empty, ask the user which files to review before doing anything else.

The agent will:
1. Run automated axe-core audits via Playwright
2. Test keyboard navigation and focus management
3. Review code against WCAG 2.2 AA criteria
4. Apply fixes directly to the files
5. Verify with lint, tsc, and re-run axe-core
