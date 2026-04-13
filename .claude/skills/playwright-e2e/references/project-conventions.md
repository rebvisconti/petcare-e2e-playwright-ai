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


## PetCare Test Data

### Location
`src/utils/test-data.factory.ts`

### Important: HTML Values vs Display Labels

⚠️ **CRITICAL:** The HTML uses lowercase values with hyphens, but displays capitalized text with spaces.

**Services:**
| HTML Value | Display Text |
|------------|--------------|
| `'banho'` | "Banho" |
| `'tosa'` | "Tosa" |
| `'banho-tosa'` | "Banho + Tosa" |

**Sizes:**
| HTML Value | Display Text |
|------------|--------------|
| `'pequeno'` | "Pequeno" |
| `'medio'` | "Médio" |
| `'grande'` | "Grande" |

**Rule:** Always use lowercase values in `TestDataFactory`. Use `display-values.ts` helpers for assertions.

### Available Factories

**`TestDataFactory.createAppointment(overrides?)`**
Creates a random appointment with all required fields.
```typescript
// ✅ Correct: use lowercase values
const appointment = TestDataFactory.createAppointment({
  service: 'banho',      // NOT 'Banho'
  size: 'medio'          // NOT 'Médio'
})

// ✅ For assertions, use helpers
import { getServiceLabel, getSizeLabel } from '../../src/utils/display-values'

await expect(card).toContainText(getServiceLabel('banho'))      // "Banho"
await expect(card).toContainText(getSizeLabel('medio'))         // "Médio"
```

**Fields:**
- `petName`: Random pet name (Rex, Luna, Max, etc.)
- `ownerName`: Random Brazilian name
- `phone`: Brazilian phone format `9XXXX XXXX`
- `service`: One of: `'banho'`, `'tosa'`, `'banho-tosa'` (lowercase!)
- `size`: One of: `'pequeno'`, `'medio'`, `'grande'` (lowercase, no accent!)
- `date`: Random future date (YYYY-MM-DD format)
- `time`: Default '10:00' (can override)

**`TestDataFactory.createMultipleAppointments(count)`**
Creates an array of random appointments.

### Static Data

**Services:** `['banho', 'tosa', 'banho-tosa']` ← lowercase values!  
**Sizes:** `['pequeno', 'medio', 'grande']` ← lowercase values!

### Display Value Helpers

Location: `src/utils/display-values.ts`
```typescript
import { getServiceLabel, getSizeLabel } from '../../src/utils/display-values'

// Convert HTML value → Display text
getServiceLabel('banho')       // Returns: "Banho"
getServiceLabel('banho-tosa')  // Returns: "Banho + Tosa"
getSizeLabel('medio')          // Returns: "Médio"
```

**When to use:**
- ✅ Filling forms: Use lowercase values from `TestDataFactory`
- ✅ Assertions: Use `getServiceLabel()` / `getSizeLabel()` to match display text

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



## PetCare Authentication

### Login Flow
- URL: `/login.html`
- Credentials stored in: `src/utils/auth.helper.ts`
- Method: Form-based login with username/password

### Test Setup
Authentication is handled via Playwright's `storageState`:
1. `tests/auth.setup.ts` logs in once before all tests
2. Session state saved to `playwright/.auth/user.json`
3. All tests reuse this authenticated state (no repeated logins)

### Locators
- Username: `[data-testid="input-usuario"]`
- Password: `[data-testid="input-senha"]`
- Submit: `[data-testid="btn-entrar"]`
- Logout: `[data-testid="btn-logout"]`

### Test Credentials
```typescript
AuthHelper.ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
}
```
## PetCare API Endpoints

### Base URL
`http://localhost:3001`

### Authentication
- `POST /auth/login` - Login do administrador

### Appointments (Agendamentos)
- `GET /agendamentos` - Listar todos (aceita filtros)
- `POST /agendamentos` - Criar novo agendamento
- `GET /agendamentos/:id` - Buscar por ID
- `PUT /agendamentos/:id` - Atualizar agendamento
- `DELETE /agendamentos/:id` - Remover agendamento

### Statistics
- `GET /estatisticas` - Totais por status
- `GET /api` - Status da API

### Important API Patterns

**URL Pattern for DELETE/PUT:**
```
/agendamentos/123  ← ID numérico
```

**Wait for API response in tests:**
```typescript
// POST (create)
this.page.waitForResponse(
  response => response.url().includes('/agendamentos') && 
              response.request().method() === 'POST'
)

// DELETE (remove)
this.page.waitForResponse(
  response => response.url().match(/\/agendamentos\/\d+/) !== null && 
              response.request().method() === 'DELETE'
)

// PUT (update)
this.page.waitForResponse(
  response => response.url().match(/\/agendamentos\/\d+/) !== null && 
              response.request().method() === 'PUT'
)
```