# AGENTS.md

Execution rules for Codex in projects installed with Altool. Project policy lives in `constitution.md`; Altool command procedures live in the repo-local skill and `altool/steps/`.

## 1. Responsibility

- Use this file only for agent behavior and UI tool operation. Do not duplicate stack, design, quality, or artifact rules here.
- Apply `constitution.md` when planning, implementing, or validating project changes.
- Before project changes, follow `altool/standards.md` to validate product policy, select relevant originals through `standards/standard.yaml`, and maintain shared project contracts within the user's request, including outside `$altool` commands.
- For `$altool` commands, read the local Altool skill and the matching step before acting.

## 2. Development Behavior

### Think before coding

- Surface assumptions, ambiguity, tradeoffs, and simpler options before implementation; ask when a material choice cannot be inferred safely.
- Convert multi-step work into a short plan with verifiable success criteria.

### Keep changes simple and surgical

- Implement only the requested behavior; avoid speculative features, single-use abstractions, and impossible-case handling.
- Touch only lines required by the request, preserve existing style, and leave unrelated cleanup alone.
- Remove only imports, variables, functions, or files made obsolete by your change.
- Generalize reusable lessons; do not turn one observed failure into a global case-specific rule.

### Verify the result

- For bugs, reproduce the failure when practical; for refactors, verify behavior before and after.
- Run the narrowest relevant checks first and continue until the requested result is proven or a concrete blocker remains.
- Report what changed, what passed, and any unverified risk.

## 3. UI Verification

For every new or changed page:

- Run available build and type checks before browser QA.
- Use the Codex in-app Browser first and read its current documentation before operating it.
- Ground locators in a fresh DOM snapshot, scope ambiguous locators to one element, then perform real clicks, input, navigation, and state changes; DOM inspection alone is insufficient.
- Exercise every primary control in the changed area. Submit one representative form record and confirm persistence when applicable.
- Verify expected URLs, modal or selection state, rendered data, loading/empty/error states, and console or network failures.
- Check desktop and mobile layouts when the changed area is responsive.
- Confirm visible results with a fresh DOM snapshot or screenshot and report the exact scenarios that passed.
- If in-app control remains unavailable after the current Browser skill's documented setup and recovery flow, use standalone Playwright with `headless: false` and report the fallback. Do not treat a normal Playwright CDP connection as control of the in-app Browser.

## 4. Altool Integration

- The Altool skill routes commands; each step owns its inputs, artifacts, checks, state transitions, and reports.
- Keep workflow state and generated reports inside the current project.
