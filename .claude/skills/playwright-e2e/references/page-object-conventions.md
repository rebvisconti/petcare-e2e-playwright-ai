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

## PetCare Components

| Component | File | Used In | Description |
|-----------|------|---------|-------------|
| `AppointmentFormComponent` | `src/pages/components/appointment-form.component.ts` | Home page | Formulário de criação/edição de agendamentos |

### AppointmentFormComponent Locators
- `petNameInput`: `[data-testid="input-nome-pet"]`
- `ownerNameInput`: `[data-testid="input-tutor"]`
- `phoneInput`: `[data-testid="input-telefone"]`
- `serviceSelect`: `[data-testid="select-servico"]`
- `sizeSelect`: `[data-testid="select-porte"]`
- `dateInput`: `[data-testid="input-data"]`
- `timeSelect`: `[data-testid="select-horario"]`
- `submitButton`: `[data-testid="btn-agendar"]`
- `cancelButton`: `[data-testid="btn-cancelar"]`
- `successMessage`: `[data-testid="mensagem-global"]`

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

## PetCare Page Objects

### `HomePage`
**File:** `src/pages/home.page.ts`  
**URL:** `/index.html`  
**Purpose:** Página principal com lista de agendamentos e formulário

**Key methods:**
- `goto()`: Navega para `/index.html`
- `createAppointment(data)`: Cria agendamento (aguarda POST `/agendamentos`)
- `getAppointmentCard(petName)`: Retorna card filtrado por nome do pet
- `editAppointment(petName)`: Clica no botão editar
- `deleteAppointment(petName)`: Exclui agendamento (aguarda DELETE `/agendamentos/:id` + card desaparecer)
- `search(query)`: Busca agendamentos
- `logout()`: Faz logout
- `waitForAppointmentToAppear(petName)`: Aguarda card aparecer
- `getAppointmentsCount()`: Retorna quantidade de cards

**API Integration:**
- `createAppointment()` waits for `POST /agendamentos`
- `deleteAppointment()` waits for `DELETE /agendamentos/:id` AND UI update (card disappearance)
- Uses regex `/\/agendamentos\/\d+/` to match dynamic IDs

**Key locators:**
- `appointmentCards`: `[data-testid="card-agendamento"]`
- `emptyListMessage`: `[data-testid="lista-vazia"]`
- `appointmentsCounter`: `[data-testid="contador-agendamentos"]`
- `searchInput`: `[data-testid="input-busca"]`

**Components used:**
- `AppointmentFormComponent`

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

## Iframe Structure

**PetCare does not use iframes.** All content is in the main page context.


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

## PetCare Naming Conventions

### Files
- Page Objects: `[name].page.ts` (ex: `home.page.ts`)
- Components: `[name].component.ts` (ex: `appointment-form.component.ts`)
- Tests: `[feature].spec.ts` (ex: `create-appointment.spec.ts`)
- Helpers: `[name].helper.ts` (ex: `auth.helper.ts`)
- Factories: `[name].factory.ts` (ex: `test-data.factory.ts`)

### Classes
- Page Objects: `[Name]Page` (ex: `HomePage`)
- Components: `[Name]Component` (ex: `AppointmentFormComponent`)
- Helpers: `[Name]Helper` (ex: `AuthHelper`)
- Factories: `[Name]Factory` (ex: `TestDataFactory`)

### Methods
- Navigation: `goto()`, `goToLogin()`
- Actions: `createAppointment()`, `deleteAppointment()`, `editAppointment()`
- Getters: `getAppointmentCard()`, `getAppointmentsCount()`
- Assertions: `waitForAppointmentToAppear()`
