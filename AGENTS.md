# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Common Development Rules

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- Do not add case-specific rules or guidance to solve one observed failure; generalize the cause into a reusable principle, or leave it as a local note.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

### 5. UI Verification Harness

**New or changed pages must be clicked through in the browser.**

When creating or modifying any UI page:
- Run the available build/type check first.
- Open and verify the affected page in the Codex in-app browser first, using the Browser plugin workflow in section 7.
- Click every primary user-facing control in the changed area:
  - buttons
  - links
  - tabs and filters
  - dropdowns
  - form inputs
  - submit and cancel actions
  - calendar/date interactions
- Verify the expected result after each interaction:
  - URL changes
  - modal open/close state
  - selected values
  - rendered list/card/table changes
  - persistence through the app's storage or API when data is saved
- For forms, submit at least one real test record and confirm it appears in both the UI and the app's persistence layer when applicable.
- For responsive areas, verify desktop and mobile when the changed area is visible in both.
- If the Browser plugin cannot control the in-app browser after following section 7 and retrying with a fresh snapshot, use standalone Playwright with `headless: false` as a fallback verification path so the user can see the browser, and explicitly report that fallback.
- Report exactly what was tested and what passed.

### 6. In-App Browser Operation

Use the Codex in-app browser through the Browser plugin bridge. Do not attach a normal local Playwright package to a CDP port as the primary workflow.

Preferred control path:

```js
const { setupBrowserRuntime } = await import("<browser plugin root>/scripts/browser-client.mjs");
await setupBrowserRuntime({ globals: globalThis });
globalThis.browser = await agent.browsers.get("iab");
nodeRepl.write(await browser.documentation());
globalThis.tab = await browser.tabs.selected();
nodeRepl.write(JSON.stringify({ url: await tab.url(), title: await tab.title() }));
```

Important notes:

- Always read the Browser plugin documentation with `nodeRepl.write(await browser.documentation())` after setup in a fresh session, then follow the documented API. The supported tab URL/navigation methods are `await tab.url()` and `await tab.goto(url)`, not `tab.playwright.url()` or unsupported direct DOM navigation.
- Use `await tab.playwright.domSnapshot()` to ground locator choices before interactions. Build locators from the snapshot, verify `count() === 1` when uniqueness is not obvious, then perform the actual user action with Browser plugin APIs such as `await locator.click({})`, `await locator.fill(...)`, `await locator.press(...)`, `await tab.dom_cua.click(...)`, or `await tab.cua.click(...)`.
- UI verification is not complete until the changed controls have actually been clicked or operated in the browser and the resulting state has been checked. DOM inspection alone is not a substitute for clicking primary buttons, links, dropdowns, tabs, submit/cancel actions, and route-changing controls.
- Prefer Browser plugin actions for UI QA: `tab.goto(...)`, `tab.reload()`, `tab.playwright.getByRole(...)`, `tab.playwright.locator(...)`, `tab.playwright.expectNavigation(...)`, `tab.dom_cua`, or `tab.cua` as documented.
- The in-app browser usually does not expose a normal `--remote-debugging-port`, so `chromium.connectOverCDP("http://127.0.0.1:9222")` is not the primary workflow.
- General `playwright` can still be used for separate Chromium tests only as a fallback or supplemental check after the Browser plugin path fails or when testing an isolated scenario that does not require the user's in-app browser state. When used as the fallback UI verification path, launch it with `headless: false` so the user can see the browser. It should not be assumed to control the Codex in-app browser.
- Before interacting, connect through `browser-client.mjs`, select the `iab` browser, then reuse the selected `tab`.
- The Node REPL keeps top-level bindings between runs. Avoid redeclaring `const`/`let` names in browser snippets; use reusable `globalThis.*` handles or fresh `var` names with a suffix for retries.
- Scope locators carefully. Some apps keep multiple route sections or hidden views in the DOM, so broad selectors can match hidden inputs/buttons. Prefer active-page and input-type selectors when uniqueness is not obvious.
- Before clicking/filling, verify locator count is exactly one when uniqueness is not obvious.
- Text entry can fail with `Browser Use virtual clipboard is not installed` when using `locator.fill()` or `cua.type()`. This is not stale clipboard content or a separate npm-installable package; Browser Use injects a fake clipboard script into the tab, and that injection can fail in the current Codex in-app browser session. Clearing the clipboard with `tab.clipboard.writeText("")` can fail for the same reason because the virtual clipboard backend is missing. If that happens, do not keep retrying clipboard-backed methods; switch to a non-clipboard path such as focused keyboard presses, a page-side DOM/event helper, or an app-level test action, then verify the rendered value before saving.
- Use screenshots or DOM checks after interactions to confirm the visible result.

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 2. Project-Specific Rules

This repository packages the Altool Codex workflow: local Codex skills, command step documents, scripts, templates, and setup files for AI-assisted project development.
