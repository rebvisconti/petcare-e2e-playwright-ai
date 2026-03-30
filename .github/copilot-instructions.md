# Playwright E2E Testing Instructions

## Overview

This project uses Playwright for E2E testing. Follow these patterns and conventions when writing, debugging, or reviewing tests.

## Key Rules

### MUST
- Use web-first assertions (`await expect(locator).toBeVisible()`) — never one-shot checks
- Use named timeout constants instead of hardcoded numbers
- Wrap page object methods in `test.step()` for trace reporting
- Use POM pattern — locators as readonly class properties, methods for interactions
- Use short inner timeouts inside `toPass` blocks
- Clean up test resources in `afterEach` hooks

### WON'T
- Use XPath selectors (fragile, hard to read)
- Use `page.waitForTimeout()` for synchronization
- Use `{ force: true }` on actions
- Use `networkidle` in `goto()` or `waitForLoadState()`
- Use deprecated APIs (`waitForNavigation`, `Promise.all` with navigation)
- Write custom retry/polling loops (use `toPass()` or `expect.poll()`)
- Use `page.evaluate()` as workarounds for test issues

## Selector Priority
1. `getByRole()` — Most resilient
2. `getByLabel()` — For form fields
3. `getByText()` — For visible text
4. `getByTestId()` — For data-testid attributes
5. CSS selector — Last resort

## Critical Patterns

### waitForResponse — Setup BEFORE action
```typescript
const responsePromise = page.waitForResponse('**/api/data')
await page.getByRole('button', { name: 'Submit' }).click()
const response = await responsePromise
```

### toPass — Short inner timeout, long outer
```typescript
await expect(async () => {
  await expect(page.getByTestId('result')).toBeVisible({ timeout: 1_000 })
}).toPass({ timeout: 30_000, intervals: [1_000, 2_000, 5_000] })
```

### expect.poll — For non-DOM polling
```typescript
await expect.poll(async () => {
  const response = await page.request.get('/api/status')
  return response.json()
}, { timeout: 30_000 }).toHaveProperty('status', 'CONFIRMED')
```

## Test Review Checklist
1. **Assertions** — web-first only, no one-shot checks
2. **Selectors** — getByRole priority, no XPath
3. **Timing** — no waitForTimeout, no networkidle
4. **Isolation** — independent tests, proper cleanup
5. **POM** — readonly locators, test.step() wrapping
6. **Readability** — descriptive names, no magic numbers
7. **Reliability** — toPass/poll over custom loops, no force:true

## Root Cause Classification
- **LOCATOR_CHANGED** — Update selector from page inspection
- **NEW_PREREQUISITE** — Add missing interaction step
- **TIMING_ISSUE** — Add web-first assertion or waitForURL()
- **APPLICATION_BUG** — Do NOT fix the test, report the bug


---

# Detailed Skill References


---

# Playwright Patterns — Best Practices

## waitForResponse Ordering

The listener must be set up **before** the action that triggers the response. Never `await` the listener setup — store the promise, trigger the action, then await.

### Bad

```typescript
// DON'T: await the listener setup — this blocks forever
await page.waitForResponse('**/api/order')
await page.getByRole('button', { name: 'Submit' }).click()
```

### Good

```typescript
// DO: setup listener (no await) → trigger action → await response
const responsePromise = page.waitForResponse('**/api/order')
await page.getByRole('button', { name: 'Submit' }).click()
const response = await responsePromise
expect(response.status()).toBe(200)
```

### With URL pattern matching

```typescript
const responsePromise = page.waitForResponse(
  (resp) => resp.url().includes('/api/seats') && resp.status() === 200
)
await seatMapPage.selectSeat()
const response = await responsePromise
```

---

## toPass Pattern

Use `toPass()` to retry an assertion block until it passes. Key: use a **short inner timeout** so each attempt fails fast, while the **outer toPass timeout** controls total retry duration.

### When to use

- Waiting for a value that updates asynchronously (e.g. basket total after adding items)
- Polling for a UI state that requires multiple checks in sequence
- Any scenario where a single web-first assertion isn't sufficient

### Pattern

```typescript
await expect(async () => {
  const text = await page.getByTestId('order-total').textContent()
  expect(text).toContain('$25.00')
}).toPass({
  timeout: 30_000,     // total time to keep retrying
  intervals: [500, 1_000, 2_000]  // backoff between attempts
})
```

### With short inner timeout (recommended)

```typescript
await expect(async () => {
  // Inner timeout is SHORT — fail fast on each attempt
  await expect(page.getByTestId('confirmation'))
    .toBeVisible({ timeout: 1_000 })
  await expect(page.getByTestId('order-id'))
    .not.toBeEmpty({ timeout: 1_000 })
}).toPass({
  timeout: 30_000,
  intervals: [1_000, 2_000, 5_000]
})
```

---

## expect.poll Pattern

Use `expect.poll()` for non-DOM polling — API status checks, computed values, or any async function that returns a value.

### When to use

- Polling an API endpoint until it returns a specific status
- Waiting for a computed/derived value (not directly on a locator)
- Any non-DOM async check that needs retrying

### Pattern

```typescript
await expect.poll(async () => {
  const response = await page.request.get('/api/order/status')
  return response.json()
}, {
  timeout: 30_000,
  intervals: [1_000, 2_000, 5_000],
  message: 'Order status should become CONFIRMED'
}).toHaveProperty('status', 'CONFIRMED')
```

### vs toPass

| Feature | `toPass()` | `expect.poll()` |
|---------|-----------|-----------------|
| Use case | Multiple assertions in a block | Single value check |
| Input | Async function (runs assertions inside) | Async function (returns a value) |
| Assertion | Inside the block | Chained after `.poll()` |
| Best for | DOM state checks needing multiple locators | API polling, computed values |

---

## Network-First Safeguards

Register network listeners and route handlers **before** the navigation or action that triggers them. This prevents race conditions where the request fires before the listener is ready.

### Route interception

```typescript
// DO: register route BEFORE navigation
await page.route('**/api/analytics', (route) => route.abort())
await page.goto('/checkout')
```

### waitForResponse with navigation

```typescript
// DO: setup listener BEFORE goto
const configPromise = page.waitForResponse('**/api/config')
await page.goto('/checkout')
const config = await configPromise
```

### Multiple network events

```typescript
// Setup all listeners first, then trigger
const seatsPromise = page.waitForResponse('**/api/seats')
const pricingPromise = page.waitForResponse('**/api/pricing')

await page.getByRole('button', { name: 'Select seats' }).click()

const [seatsResponse, pricingResponse] = await Promise.all([
  seatsPromise,
  pricingPromise
])
```

### Anti-patterns to avoid

- **No `networkidle`** — it's flaky and deprecated in spirit. Wait for a specific element or response instead.
- **No arbitrary delays** — `waitForTimeout(2000)` before checking a response is a timing assumption, not a guarantee.
- **No `waitForLoadState('networkidle')`** — use `waitForURL()` or a web-first assertion on the target page's content.

---

## API Response Validation with Zod

Use Zod schemas to validate API helper responses at runtime. This catches contract changes early and provides clear error messages.

> **Note:** Requires the `zod` dependency. This is an optional enhancement.

### Pattern

```typescript
import { z } from 'zod'

const OrderResponseSchema = z.object({
  orderId: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  total: z.number().positive(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive()
  }))
})

type OrderResponse = z.infer<typeof OrderResponseSchema>

async function getOrder(orderId: string): Promise<OrderResponse> {
  const response = await request.get(`/api/orders/${orderId}`)
  const data = await response.json()
  return OrderResponseSchema.parse(data) // throws ZodError if shape is wrong
}
```

### Benefits

- **Self-documenting** — the schema IS the contract
- **Runtime safety** — catches unexpected `null`, missing fields, wrong types
- **Clear errors** — Zod errors pinpoint exactly which field failed validation
- **Type inference** — `z.infer<typeof Schema>` generates TypeScript types from the schema


---

# Data Strategy — Static vs Dynamic Test Data

## Bifurcated Approach

Test data falls into two categories, each with a clear purpose. Mixing them leads to flaky tests (hardcoded data colliding in parallel) or over-engineering (factories for static boundary values).

---

## Static Data

**What:** JSON files or TypeScript constants containing fixed, version-controlled values.

**When to use:**
- Boundary values and edge cases (empty strings, max-length inputs, special characters)
- Invalid inputs for negative testing (malformed emails, expired dates)
- Known error messages or validation text to assert against
- Reference data that never changes (country codes, currency symbols)
- Test card numbers and promo codes

**Characteristics:**
- Immutable within a test run
- Shared safely across parallel tests (read-only)
- Version-controlled — changes are visible in diffs
- Lives in dedicated data files, not inline in tests

### Example structure

```
src/test-data/
├── test-cards.ts        # Payment card numbers
├── guest-users.ts       # Guest checkout data
├── strings/
│   └── us-strings.ts    # Expected UI text
├── invalid-inputs.ts    # Boundary/edge case values
└── promocodes.ts        # Staging promo codes
```

### Example

```typescript
// src/test-data/invalid-inputs.ts
export const invalidEmails = [
  '',
  'not-an-email',
  '@no-local-part.com',
  'spaces in@email.com',
  'a'.repeat(255) + '@toolong.com'
] as const

export const invalidPhoneNumbers = [
  '',
  '123',           // too short
  'not-a-number',
  '+1-555-555-55555' // too long
] as const
```

---

## Dynamic Factories

**What:** Functions that generate unique test data per invocation, using libraries like `@faker-js/faker`.

**When to use:**
- Happy-path user data (names, emails, addresses) that must be unique per test
- Data that could collide when tests run in parallel
- Any data where the specific value doesn't matter, only the shape does
- User creation, order placement, or any write operation

**Characteristics:**
- Unique per call — safe for parallel execution
- Accepts overrides for specific test scenarios
- Returns typed objects matching the expected API/form shape
- Optionally validated with Zod schemas

> **Note:** `@faker-js/faker` is an optional dependency. The pattern below works with any data generation approach.

### Factory Pattern Template

```typescript
import { faker } from '@faker-js/faker'

interface UserData {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export function generateUser(overrides: Partial<UserData> = {}): UserData {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email({ provider: 'test.example.com' }),
    phone: faker.phone.number({ style: 'national' }),
    ...overrides
  }
}
```

### Usage in tests

```typescript
// Fully random user — unique per test run
const user = generateUser()

// Override specific fields for a targeted scenario
const user = generateUser({ email: 'specific@test.com' })

// Combine with Zod validation (optional)
const user = UserSchema.parse(generateUser())
```

---

## Decision Criteria

| Criterion | Static Data | Dynamic Factory |
|-----------|-------------|-----------------|
| Value matters to the assertion | Yes — use static | No — use factory |
| Used in parallel tests that write data | No — risk of collision | Yes — unique per call |
| Boundary/edge case testing | Yes — curated values | No — random misses edges |
| Negative testing (invalid inputs) | Yes — known invalid values | No — faker generates valid data |
| User registration / order creation | No — will collide | Yes — unique identifiers |
| Expected UI text / error messages | Yes — exact match needed | No — not applicable |
| Read-only reference data | Yes — shared safely | Overkill — use static |

### Rule of thumb

> If you're **asserting the exact value**, use static data.
> If you're **filling a form to proceed**, use a factory.


---

# Test Review Workflow

## When to Use

- Before submitting a PR with new or modified tests
- After writing new tests — self-review before requesting human review
- Periodic suite audit to catch accumulated anti-patterns
- When investigating flaky tests — check if the test itself has quality issues

---

## Review Checklist

### 1. Assertions

- [ ] Uses web-first assertions only (`await expect(locator).toBeVisible()`)
- [ ] No one-shot checks (`expect(await locator.isVisible()).toBe(true)`)
- [ ] Assertions are explicit in the test body — not hidden behind helpers that silently pass
- [ ] Prefers positive assertions (`toBeHidden()`, `toBeDisabled()`) over negated ones (`.not.toBeVisible()`)
- [ ] Every test has at least one explicit assertion

### 2. Selectors

- [ ] Priority order: `getByRole()` > `getByTestId()` > CSS selectors
- [ ] No XPath selectors
- [ ] Uses `{ exact: true }` where text could match multiple elements
- [ ] Selectors are stable — not tied to dynamic classes, indexes, or layout

### 3. Timing

- [ ] No `waitForTimeout()` calls (use web-first assertions or `waitFor()`)
- [ ] No `networkidle` in `goto()` or `waitForLoadState()`
- [ ] No redundant waits before auto-wait actions (e.g. `waitFor({ state: 'visible' })` before `.click()`)
- [ ] Correct `waitForResponse` ordering — listener setup before trigger action
- [ ] Uses named timeout constants, not hardcoded numbers

### 4. Isolation

- [ ] Tests are independent — no shared mutable state between tests
- [ ] Each test has its own setup and teardown
- [ ] No serial dependencies (test B doesn't rely on test A running first)
- [ ] Cleanup hooks (`afterEach`) properly release resources

### 5. POM Compliance

- [ ] Page objects instantiated through fixtures or factory, not direct `new`
- [ ] Action methods return `Promise<void>` — not new page objects
- [ ] Locators defined as readonly class properties or getters
- [ ] Page object methods wrapped in `test.step()` for trace reporting

### 6. Readability

- [ ] Uses `test.step()` with descriptive labels (Given/When/Then or plain English)
- [ ] Test names describe the user journey, not the implementation
- [ ] No magic numbers — uses named constants for timeouts, counts, amounts
- [ ] Complex logic has brief comments explaining "why", not "what"

### 7. Reliability

- [ ] Uses `toPass()` or `expect.poll()` over custom retry/polling loops
- [ ] No `{ force: true }` on click or other actions
- [ ] No `page.evaluate()` / `page.addInitScript()` workarounds
- [ ] No deprecated APIs (`waitForNavigation`, `Promise.all` with navigation)
- [ ] No `test.only()` or `test.skip()` in committed code

---

## Quality Gates

Quantitative thresholds for test quality. Flag violations as `CRITICAL`.

| Metric | Threshold | Rationale |
|--------|-----------|-----------|
| Test file length | < 300 lines | Long files indicate missing abstractions or test flows |
| Single test execution time | < 90 seconds | Slow tests slow CI and are more likely to be flaky |
| Assertions per test | >= 1 explicit | Tests without assertions verify nothing |
| Skipped tests | 0 in committed code | Skipped tests are invisible failures |
| `.only` tests | 0 in committed code | `.only` silently skips the rest of the suite |

---

## Output Format

When performing a review, report findings using this format:

```
### Review Findings — {file name}

**CRITICAL** — {description}
  File: {path}:{line}
  Issue: {what's wrong}
  Fix: {how to fix it}

**WARNING** — {description}
  File: {path}:{line}
  Issue: {what's wrong}
  Fix: {how to fix it}

**INFO** — {description}
  File: {path}:{line}
  Suggestion: {optional improvement}
```

### Severity Definitions

| Severity | Meaning | Action |
|----------|---------|--------|
| `CRITICAL` | Breaks reliability, violates MUST rules, or fails quality gates | Must fix before merge |
| `WARNING` | Violates SHOULD rules or introduces maintainability risk | Should fix before merge |
| `INFO` | Suggestion for improvement, not blocking | Fix at your discretion |


---

---
name: playwright-cli
description: Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages.
allowed-tools: Bash(playwright-cli:*)
---

# Browser Automation with playwright-cli

## Quick start

```bash
# open new browser
playwright-cli open
# navigate to a page
playwright-cli goto https://playwright.dev
# interact with the page using refs from the snapshot
playwright-cli click e15
playwright-cli type "page.click"
playwright-cli press Enter
# take a screenshot (rarely used, as snapshot is more common)
playwright-cli screenshot
# close the browser
playwright-cli close
```

## Commands

### Core

```bash
playwright-cli open
# open and navigate right away
playwright-cli open https://example.com/
playwright-cli goto https://playwright.dev
playwright-cli type "search query"
playwright-cli click e3
playwright-cli dblclick e7
playwright-cli fill e5 "user@example.com"
playwright-cli drag e2 e8
playwright-cli hover e4
playwright-cli select e9 "option-value"
playwright-cli upload ./document.pdf
playwright-cli check e12
playwright-cli uncheck e12
playwright-cli snapshot
playwright-cli snapshot --filename=after-click.yaml
playwright-cli eval "document.title"
playwright-cli eval "el => el.textContent" e5
playwright-cli dialog-accept
playwright-cli dialog-accept "confirmation text"
playwright-cli dialog-dismiss
playwright-cli resize 1920 1080
playwright-cli close
```

### Navigation

```bash
playwright-cli go-back
playwright-cli go-forward
playwright-cli reload
```

### Keyboard

```bash
playwright-cli press Enter
playwright-cli press ArrowDown
playwright-cli keydown Shift
playwright-cli keyup Shift
```

### Mouse

```bash
playwright-cli mousemove 150 300
playwright-cli mousedown
playwright-cli mousedown right
playwright-cli mouseup
playwright-cli mouseup right
playwright-cli mousewheel 0 100
```

### Save as

```bash
playwright-cli screenshot
playwright-cli screenshot e5
playwright-cli screenshot --filename=page.png
playwright-cli pdf --filename=page.pdf
```

### Tabs

```bash
playwright-cli tab-list
playwright-cli tab-new
playwright-cli tab-new https://example.com/page
playwright-cli tab-close
playwright-cli tab-close 2
playwright-cli tab-select 0
```

### Storage

```bash
playwright-cli state-save
playwright-cli state-save auth.json
playwright-cli state-load auth.json

# Cookies
playwright-cli cookie-list
playwright-cli cookie-list --domain=example.com
playwright-cli cookie-get session_id
playwright-cli cookie-set session_id abc123
playwright-cli cookie-set session_id abc123 --domain=example.com --httpOnly --secure
playwright-cli cookie-delete session_id
playwright-cli cookie-clear

# LocalStorage
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-delete theme
playwright-cli localstorage-clear

# SessionStorage
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get step
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```

### Network

```bash
playwright-cli route "**/*.jpg" --status=404
playwright-cli route "https://api.example.com/**" --body='{"mock": true}'
playwright-cli route-list
playwright-cli unroute "**/*.jpg"
playwright-cli unroute
```

### DevTools

```bash
playwright-cli console
playwright-cli console warning
playwright-cli network
playwright-cli run-code "async page => await page.context().grantPermissions(['geolocation'])"
playwright-cli tracing-start
playwright-cli tracing-stop
playwright-cli video-start
playwright-cli video-stop video.webm
```

## Open parameters
```bash
# Use specific browser when creating session
playwright-cli open --browser=chrome
playwright-cli open --browser=firefox
playwright-cli open --browser=webkit
playwright-cli open --browser=msedge
# Connect to browser via extension
playwright-cli open --extension

# Use persistent profile (by default profile is in-memory)
playwright-cli open --persistent
# Use persistent profile with custom directory
playwright-cli open --profile=/path/to/profile

# Start with config file
playwright-cli open --config=my-config.json

# Close the browser
playwright-cli close
# Delete user data for the default session
playwright-cli delete-data
```

## Snapshots

After each command, playwright-cli provides a snapshot of the current browser state.

```bash
> playwright-cli goto https://example.com
### Page
- Page URL: https://example.com/
- Page Title: Example Domain
### Snapshot
[Snapshot](.playwright-cli/page-2026-02-14T19-22-42-679Z.yml)
```

You can also take a snapshot on demand using `playwright-cli snapshot` command.

If `--filename` is not provided, a new snapshot file is created with a timestamp. Default to automatic file naming, use `--filename=` when artifact is a part of the workflow result.

## Browser Sessions

```bash
# create new browser session named "mysession" with persistent profile
playwright-cli -s=mysession open example.com --persistent
# same with manually specified profile directory (use when requested explicitly)
playwright-cli -s=mysession open example.com --profile=/path/to/profile
playwright-cli -s=mysession click e6
playwright-cli -s=mysession close  # stop a named browser
playwright-cli -s=mysession delete-data  # delete user data for persistent session

playwright-cli list
# Close all browsers
playwright-cli close-all
# Forcefully kill all browser processes
playwright-cli kill-all
```

## Local installation

In some cases user might want to install playwright-cli locally. If running globally available `playwright-cli` binary fails, use `npx playwright-cli` to run the commands. For example:

```bash
npx playwright-cli open https://example.com
npx playwright-cli click e1
```

## Example: Form submission

```bash
playwright-cli open https://example.com/form
playwright-cli snapshot

playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
playwright-cli snapshot
playwright-cli close
```

## Example: Multi-tab workflow

```bash
playwright-cli open https://example.com
playwright-cli tab-new https://example.com/other
playwright-cli tab-list
playwright-cli tab-select 0
playwright-cli snapshot
playwright-cli close
```

## Example: Debugging with DevTools

```bash
playwright-cli open https://example.com
playwright-cli click e4
playwright-cli fill e7 "test"
playwright-cli console
playwright-cli network
playwright-cli close
```

```bash
playwright-cli open https://example.com
playwright-cli tracing-start
playwright-cli click e4
playwright-cli fill e7 "test"
playwright-cli tracing-stop
playwright-cli close
```

## Specific tasks

* **Request mocking** [references/request-mocking.md](references/request-mocking.md)
* **Running Playwright code** [references/running-code.md](references/running-code.md)
* **Browser session management** [references/session-management.md](references/session-management.md)
* **Storage state (cookies, localStorage)** [references/storage-state.md](references/storage-state.md)
* **Test generation** [references/test-generation.md](references/test-generation.md)
* **Tracing** [references/tracing.md](references/tracing.md)
* **Video recording** [references/video-recording.md](references/video-recording.md)


---

# Page Object Conventions — petcare-e2e-playwright-ai

## Selector Priority

1. **`page.getByRole()`** — Most resilient, recommended for all interactive elements
2. **`page.getByLabel()`** — For form fields with labels
3. **`page.getByText()`** — For visible text content
4. **`page.getByTestId()`** — For `data-testid` attributes (cross-reference source repo)
5. **`page.locator('css-selector')`** — For CSS-based selection
6. **`page.frameLocator('iframe...')`** — For iframe fields (last resort)

**Never use XPath.**

---

## Page Object Class Structure

```typescript
import type { Page, Locator } from '@playwright/test'

import { test, expect } from '@playwright/test'

export class ExamplePage {
  // Always store page reference
  readonly page: Page

  // Locators as readonly class properties
  readonly pageHeading: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // Define locators in constructor
    this.pageHeading = page.getByRole('heading', { name: 'Example' })
    this.submitButton = page.getByRole('button', { name: 'Submit' })
    this.errorMessage = page.getByTestId('error-message')
  }

  // Methods wrapped in test.step() for trace reporting
  async submit() {
    await test.step('Submit the form', async () => {
      await this.submitButton.click()
    })
  }

  // Assertion methods prefixed with 'expect'
  async expectPageHeading(options?: { timeout?: number }) {
    await test.step('Verify page heading is visible', async () => {
      await expect(this.pageHeading).toBeVisible(options)
    })
  }
}
```

---

## Component Composition

Shared UI elements are modeled as components and composed into page objects:

```typescript
// Component (src/pages/components/basket.ts)
export class Basket {
  readonly page: Page
  readonly orderTotal: Locator

  constructor(page: Page) {
    this.page = page
    this.orderTotal = page.getByTestId('order-total')
  }
}

// Page using component
export class CheckoutPage {
  readonly basketComponent: Basket
  readonly formComponent: CheckoutForm

  constructor(page: Page) {
    this.basketComponent = new Basket(page)
    this.formComponent = new CheckoutForm(page)
  }
}
```

<!-- YOUR PROJECT: Add your component inventory here -->
<!-- Example:
| Component | File | Used In |
|-----------|------|---------|
| `Basket` | `src/pages/components/basket.ts` | Checkout, billing pages |
| `Header` | `src/pages/components/header.ts` | All pages |
-->

---

## Page Factory Pattern

Use a factory function to lazily instantiate page objects in tests:

```typescript

// Simple factory pattern
function createTestPages(page: Page) {
  return {
    get homePage() { return new HomePage(page) },
    get loginPage() { return new LoginPage(page) },
    get checkoutPage() { return new CheckoutPage(page) },
  }
}

```

<!-- YOUR PROJECT: List your available page objects here -->

---

## Iframe Handling

If your application uses iframes (e.g. payment widgets, embedded forms), use `frameLocator`:

```typescript
// Accessing elements inside an iframe
readonly paymentFrame: FrameLocator
readonly cardNumberField: Locator

constructor(page: Page) {
  this.paymentFrame = page.frameLocator('iframe[title="Payment form"]')
  this.cardNumberField = this.paymentFrame.locator('input[data-fieldtype="cardNumber"]')
}
```

<!-- YOUR PROJECT: Document your iframe structure if applicable -->

---

## Method Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| `goto(url)` | `homePage.goto('/products')` | Navigate to a page |
| `expectXxx()` | `checkoutPage.expectOrderConfirmed()` | Assertions |
| `selectXxx()` | `productPage.selectSize('Large')` | User selections |
| `enterXxx()` | `loginPage.enterEmail('user@test.com')` | Form input |
| `clickXxx()` | `cartPage.clickCheckout()` | Button clicks |
| `waitForXxx()` | `resultsPage.waitForResults()` | Wait for state |

---

## Naming Conventions

- **Page files:** `{name}.page.ts` (in `src/pages/`)
- **Component files:** `{name}.ts` (in `src/pages/components/`)
- **Test files:** `{feature-name}.spec.ts` (in `src/tests/`)
- **Helper files:** `{name}.ts` (in `src/helpers/`)

<!-- YOUR PROJECT: Adjust naming conventions to match your project structure -->


---

# Project Conventions — petcare-e2e-playwright-ai

## Constitution-Style Rules

### MUST

1. **MUST** import `test` from your custom fixture file, NOT from `@playwright/test` (if using custom fixtures)
2. **MUST** use web-first assertions (`await expect(locator).toBeVisible()`) — never one-shot checks (`expect(await locator.isVisible()).toBe(true)`)
3. **MUST** use named timeout constants instead of hardcoded numbers
4. **MUST** wrap page object methods in `test.step()` for trace reporting
5. **MUST** use POM pattern — locators as readonly class properties, methods for interactions
6. **MUST** use short inner timeouts inside `toPass` blocks (e.g. `{ timeout: 1_000 }` for inner assertions when outer `toPass` has `{ timeout: 30_000 }`)
7. **MUST** clean up test resources in `afterEach` hooks (cancel orders, release reservations, etc.)
8. **MUST** tag tests appropriately for CI filtering

<!-- YOUR PROJECT: Add project-specific MUST rules here -->
<!-- Example:
9. **MUST** use `createTestUser` fixture for creating new test users
10. **MUST** clean up resources in `afterEach` via API helper
-->

### SHOULD

1. **SHOULD** use `test.step()` in test specs for complex multi-step assertions
2. **SHOULD** prefer `getByRole()` over `getByTestId()` over CSS selectors
3. **SHOULD** cross-reference the source application repo for selectors and component structure
4. **SHOULD** add comments explaining non-obvious timeouts or workarounds
5. **SHOULD** use descriptive test names that explain the user journey, not the implementation
6. **SHOULD** keep test data in dedicated data files, not inline in tests
7. **SHOULD** use `{ exact: true }` for `getByText()` / `getByRole()` when the text could match multiple elements
8. **SHOULD** prefer positive assertions (`toBeHidden()`, `toBeDisabled()`) over negated ones (`.not.toBeVisible()`, `.not.toBeEnabled()`)
9. **SHOULD** use semantic timeout names that match the operation:
   - `SHORT` (5s) — quick visibility checks
   - `MEDIUM` (10s) — standard interactions
   - `LONG` (15s) — slow-loading elements (iframes, heavy pages)
   - `ACTION` (30s) — action timeouts
   - `EXTENDED` (60s) — retryable operations (toPass, polling)

<!-- YOUR PROJECT: Add project-specific SHOULD rules here -->

### WON'T

1. **WON'T** use XPath selectors (fragile, hard to read)
2. **WON'T** use `page.waitForTimeout()` for synchronization (use `expect().toBeVisible()` or `waitFor()` instead)
3. **WON'T** use hardcoded credentials in test files (use env vars via `.env` or CI secrets)
4. **WON'T** take full-page screenshots in tests (use Playwright's `screenshot: 'only-on-failure'` config)
5. **WON'T** use `test.only()` or `test.skip()` in committed code (CI uses `forbidOnly: true`)
6. **WON'T** commit `.env` files or expose secrets in traces
7. **WON'T** duplicate test coverage already handled by unit/component tests in the source repo
8. **WON'T** use magic number timeouts — always use named constants
9. **WON'T** use `{ force: true }` on actions — if users can't click it, the test shouldn't force it
10. **WON'T** use `networkidle` in `goto()` or `waitForLoadState()` — wait for a user-visible element instead
11. **WON'T** add redundant waits before auto-wait actions (e.g. `waitFor({ state: 'visible' })` before `.click()`)
12. **WON'T** use deprecated APIs (`waitForNavigation`, `Promise.all` with navigation) — use `waitForURL()` or web-first assertions
13. **WON'T** use `page.evaluate()` / `page.addInitScript()` as workarounds for test issues — fix through real UI interactions
14. **WON'T** return new page objects from POM action methods — actions return `Promise<void>`, let the test decide what page to use next
15. **WON'T** write custom retry/polling loops — use `toPass()` or `expect.poll()` instead

<!-- YOUR PROJECT: Add project-specific WON'T rules here -->

---

## File Organization Rules

### Test Files

```
src/tests/{feature}/{feature-name}.spec.ts
```

<!-- YOUR PROJECT: Document your test file organization here -->
<!-- Example:
- Group by feature area first
- Then by scenario type (smoke, regression, etc.)
- One `test.describe()` per file with tags in the describe title
-->

### Page Objects

```
src/pages/{page-name}.page.ts     # Page objects
src/pages/components/{name}.ts     # Shared components
```

### Helpers

```
src/helpers/api/{service}/     # API request helpers
src/helpers/{utility-name}.ts  # General utilities
```

---

## Test Data Management

<!-- YOUR PROJECT: Document your test data files here -->
<!-- Example:
| Type | Location | Examples |
|------|----------|---------|
| Test cards | `src/test-data/test-cards.ts` | Visa, Amex test card numbers |
| Guest users | `src/test-data/guest-users.ts` | Non-authenticated user data |
| Invalid inputs | `src/test-data/invalid-inputs.ts` | Boundary/edge case values |
| Expected strings | `src/test-data/strings/` | Expected UI text |
-->

---

## CI/CD Conventions

<!-- YOUR PROJECT: Document your CI conventions here -->
<!-- Example:
- **Workers:** 2 on CI, 8 locally
- **Retries:** 2 on CI, 0 locally
- **Trace:** Off on CI (credential exposure risk), on locally
- **Reporter:** HTML only
- **Smoke tests** run in: this repo's pipeline + main app pipeline
-->

---

## ESLint — Playwright Plugin Rules

`eslint-plugin-playwright` is recommended with `plugin:playwright/recommended` enabled. Key rules:

| Rule | Recommended Status | Rationale |
|------|--------|-----------|
| `playwright/no-wait-for-timeout` | enabled | Catches hardcoded waits |
| `playwright/no-force-option` | enabled | Catches force:true |
| `playwright/no-page-pause` | enabled | Catches leftover debug pauses |
| `playwright/no-conditional-in-test` | evaluate | May need to disable if tests use legitimate conditionals |
| `playwright/expect-expect` | evaluate | May give false positives with `test.step()` patterns |


---

# Test Debugging Skill — petcare-e2e-playwright-ai

## Common Failure Patterns

<!-- YOUR PROJECT: Add your project-specific failure patterns here -->
<!-- Example row: | `Timeout waiting for selector` on payment fields | Payment iframe hasn't loaded | Increase timeout, use `frameLocator` for iframe | -->

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `Timeout waiting for selector` | Element not yet rendered or selector changed | Check selector against current DOM; increase timeout |
| Test passes locally but fails on CI | Headless differences, timing, or missing env vars | CI uses fewer workers and retries; check env var presence in CI secrets |
| Element not clickable / intercepted | Another element overlapping or not yet hidden | Wait for overlay/loader to disappear; check z-index issues |
| `page.goto()` timeout | Page too slow to load or URL incorrect | Check base URL; wait for specific element instead of full load |
| Cookie/session issues | Cookie domain mismatch or expired session | Verify cookie injection; check auth setup in fixtures |
| Flaky assertion on dynamic content | Content updates asynchronously | Use `toPass()` or `expect.poll()` instead of single assertion |

---

## Debugging Workflow

### 1. Read the Error Message

Playwright error messages include:
- **Selector** that failed to match
- **Timeout** that was exceeded
- **Expected vs actual** state

### 2. Inspect Page State with Playwright CLI

```bash
# Take a snapshot to see current DOM state
playwright-cli snapshot

# Check for specific elements
playwright-cli snapshot --selector "[data-testid='form']"

# Look for iframes
playwright-cli snapshot --selector "iframe"
```

### 3. Use Trace Viewer

```bash
# Open trace file from test-reports
npx playwright show-trace test-reports/*/trace.zip

# Or use online viewer
# Upload trace.zip to trace.playwright.dev
```

Trace viewer shows:
- Screenshot at each step
- Network requests/responses
- Console output
- DOM snapshots
- Action log with timing

### 4. Check CI Reports

CI generates HTML reports as artifacts:
- Download from the CI artifacts section
- Open `index.html` in a browser
- Reports include screenshots on failure

---

## Root Cause Classification

When a test fails, classify the root cause before attempting a fix:

| Category | Description | Fix Strategy |
|----------|-------------|-------------|
| LOCATOR_CHANGED | Element selector no longer matches DOM | Update selector from page inspection or source repo |
| NEW_PREREQUISITE | App now requires an interaction the test skips | Add the missing step using existing POM methods |
| ELEMENT_REMOVED | UI element was removed or replaced | Remove test step or use replacement element |
| TIMING_ISSUE | Race condition or insufficient wait | Add web-first assertion (`toBeVisible()`) or `waitForURL()` |
| DATA_CHANGED | Expected values no longer match (text, counts, prices) | Update assertion expected values |
| NAVIGATION_CHANGED | Routes or page flow restructured | Update `goto()` URLs and `waitForURL()` patterns |
| APPLICATION_BUG | The app itself is broken — test correctly caught a real defect | Do NOT fix the test — report the bug |

---

## App Bug vs Test Bug — Decision Tree

Before modifying a failing test, determine whether it's a test issue or an application bug:

1. **Would a real user hit this same failure?** If a human followed the exact same steps manually and encountered the same broken behavior → **APPLICATION BUG**
2. **Check the evidence:**
   - API returning 4xx/5xx that previously returned 2xx → likely app bug
   - Console shows unhandled exceptions in app code → likely app bug
   - UI shows error state despite correct inputs → likely app bug
   - Selector doesn't match but element exists with different attributes → test bug (LOCATOR_CHANGED)
   - Test skips a required interaction (new modal, new field) → test bug (NEW_PREREQUISITE)

### When it IS an app bug:
- Do NOT modify the test
- Do NOT add `test.skip()` or `test.fixme()`
- Leave the test failing so CI keeps flagging the issue
- Report using the bug report template below

### Bug Report Template

> **Title:** [BUG] {concise description}
> **Environment:** {browser, base URL, environment}
>
> **Steps to Reproduce (manual):**
> 1. Navigate to {URL}
> 2. {step as manual user action}
> 3. ...
>
> **Expected:** {what should happen}
> **Actual:** {what happens instead}
>
> **Technical Evidence:**
> - Failing endpoint: `{METHOD} {URL}` → {status}
> - Console errors: `{messages}`
> - Test file: `{file path}:{line number}`

---

## Environment Variable Issues

If tests fail immediately with credential errors, verify all required env vars are set:

<!-- YOUR PROJECT: List your required environment variables here -->
<!-- Example:
```
Required env vars:
AUTH_TOKEN     — Authentication token for staging
API_KEY        — API key for backend services
BASE_URL       — Application base URL
```
-->

Check `.env` file locally or CI secrets for your CI platform.


---

# Test Generation Skill — petcare-e2e-playwright-ai

## File Structure

```
src/tests/                    # Test specs
src/pages/            # Page objects
src/pages/components/ # Shared UI components
src/helpers/                     # API helpers, utilities
src/test-data/                   # Test data (static constants)
src/utils/                       # Shared utilities (timeouts)
```

<!-- YOUR PROJECT: Update the file structure to match your project -->

---

## Test Spec Template

```typescript

import { test, expect } from '@playwright/test'

test.describe('Feature Name @tag', () => {
  test.afterEach(async ({ page }) => {
    // Cleanup: cancel orders, release resources, etc.
  })

  test('should complete the user journey', async ({ page }) => {
    await test.step('Navigate to starting page', async () => {
      await page.goto('http://localhost:3001/path')
    })

    await test.step('Interact with the page', async () => {
      await page.getByRole('button', { name: 'Action' }).click()
    })

    await test.step('Verify expected outcome', async () => {
      await expect(page.getByText('Success')).toBeVisible()
    })
  })
})
```

---

## Critical Import Rules

### Import from `@playwright/test`

```typescript
import { test, expect } from '@playwright/test'
```

---

## Page Object Conventions

### Class Structure

```typescript
import type { Page, Locator } from '@playwright/test'

import { test } from '@playwright/test'

export class ExamplePage {
  readonly page: Page
  readonly heading: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.heading = page.getByRole('heading', { name: 'Example' })
    this.submitButton = page.getByRole('button', { name: 'Submit' })
  }

  async goto(path: string) {
    await test.step(`Navigate to ${path}`, async () => {
      await this.page.goto(path)
    })
  }

  async submit() {
    await test.step('Submit the form', async () => {
      await this.submitButton.click()
    })
  }
}
```

### Selector Priority

1. `page.getByRole()` — Most resilient, recommended
2. `page.getByLabel()` — For form fields
3. `page.getByText()` — For visible text
4. `page.getByTestId()` — For `data-testid` attributes
5. `page.locator('css')` — For CSS selectors (last resort)

### Component Composition

Pages contain component instances:

```typescript
export class CheckoutPage {
  readonly header: Header
  readonly cart: Cart

  constructor(page: Page) {
    this.header = new Header(page)
    this.cart = new Cart(page)
  }
}
```

---

## Page Factory

<!-- YOUR PROJECT: Document your page factory or page instantiation pattern -->
<!-- Example:
```typescript
import { createTestPages } from '../helpers/createTestPages'

const { homePage, loginPage, checkoutPage } = createTestPages({ page })
```
-->

---

## Form Filling Patterns

For reliable form input, especially in iframes or dynamic forms:

```typescript
// Standard fill
await page.getByLabel('Email').fill('user@example.com')

// For fields that need sequential typing (e.g. masked inputs)
await page.getByLabel('Phone').pressSequentially('5551234567')

// For unreliable fields, use a fill-and-verify pattern:
async function fillAndVerify(locator: Locator, value: string, fieldName: string) {
  await locator.fill(value)
  await expect(locator).toHaveValue(value, { timeout: 5_000 })
}
```

---

## Fixture-Provided Values

<!-- YOUR PROJECT: Document your custom fixtures here -->
<!-- Example:
| Fixture | Type | Scope | Description |
|---------|------|-------|-------------|
| `page` | `Page` | test | Browser page |
| `authenticatedPage` | `Page` | test | Page with auth cookies |
| `testUser` | `TestUser` | worker | Fresh user per worker |
-->

---

## Tags Reference

<!-- YOUR PROJECT: Document your test tags here -->
<!-- Example:
| Tag | Scope | Used In |
|-----|-------|---------|
| `@smoke` | Smoke tests | CI pipeline, post-deploy |
| `@regression` | Full regression | Nightly run |
| `@mobile` | Mobile viewport tests | Mobile CI job |
-->


---

# Test Planning Skill — petcare-e2e-playwright-ai

## Overview

Use this guide when planning new E2E tests. Follow the exploration workflow below to understand the application before writing tests.

---

## Exploring Pages with Playwright CLI

Before writing tests, use `playwright-cli` to explore the application interactively:

```bash
# Open the application
playwright-cli open http://localhost:3001 --headed

# Take a snapshot to see page structure
playwright-cli snapshot

# Navigate and interact
playwright-cli click e5
playwright-cli fill e3 "test input"

# Inspect specific areas
playwright-cli snapshot --selector "[data-testid='form']"
```

The CLI gives you real-time visibility into page structure, available selectors, and element states.

---

## Application Flow Phases

<!-- YOUR PROJECT: Document your application's main user flow here -->
<!-- Example:
```
1. Landing Page       → Entry point, navigation
2. Login/Register     → Authentication flow
3. Product Selection  → Browse, search, filter
4. Cart               → Add/remove items, apply coupons
5. Checkout           → Shipping, payment, confirmation
```
-->

---

## Test Plan Template

When planning a new test, document:

### 1. Test Objective
- What user journey is being tested?
- Which acceptance criteria does it verify?

### 2. Environment & Configuration
- Which environment? (staging, dev, etc.)
- Which viewport? (desktop, mobile)
- Which configuration variant?

### 3. Flow Steps
Map each step to a page object:

<!-- YOUR PROJECT: Document your page object mapping here -->
<!-- Example:
- `loginPage` → `login(email, password)`
- `productPage` → `selectProduct(name)`, `addToCart()`
- `checkoutPage` → `fillShipping()`, `fillPayment()`, `submit()`
- `confirmationPage` → `expectOrderConfirmed()`
-->

### 4. Authentication
- Does the test need a logged-in user? → Use auth fixture or setup
- Does it need a guest user? → Skip login flow
- Does it need specific user attributes? → Use data factory with overrides

### 5. Teardown
- Does the test create data that needs cleanup? → Add `afterEach` hook
- Does it reserve resources? → Ensure release in teardown

### 6. Tags
Apply appropriate tags for CI filtering:

<!-- YOUR PROJECT: Document your tag system here -->
<!-- Example:
- `@smoke` — Critical flows (runs on every PR)
- `@regression` — Full coverage (runs nightly)
- `@mobile` — Mobile-specific tests
-->

---

## Planning Checklist

- [ ] Identified the application flow phases involved
- [ ] Selected the appropriate environment and configuration
- [ ] Determined authentication needs
- [ ] Planned teardown strategy
- [ ] Assigned appropriate tags
- [ ] Checked source application for selectors and component behavior
- [ ] Verified the test doesn't duplicate existing coverage
- [ ] Explored the page with playwright-cli to validate selectors
