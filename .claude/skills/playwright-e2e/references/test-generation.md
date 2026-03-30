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

## PetCare Fixtures

**PetCare currently uses default Playwright fixtures.**

No custom fixtures implemented yet. Future considerations:
- Pre-authenticated page fixture
- Database cleanup fixture
- API mock fixture

## Tags Reference

<!-- YOUR PROJECT: List available test tags and their meanings -->

## PetCare Test Tags

### Planned Tags (not yet implemented)
```typescript
// Smoke tests (critical path)
test('creates appointment @smoke', async ({ page }) => { ... })

// Regression tests
test('validates date field @regression', async ({ page }) => { ... })

// E2E full flow
test('complete booking flow @e2e', async ({ page }) => { ... })

// API tests (future)
test('API: creates appointment @api', async ({ request }) => { ... })
```

### Usage
```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Skip slow tests
npx playwright test --grep-invert @slow
```