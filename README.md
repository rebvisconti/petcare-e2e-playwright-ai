# 🐾 PetCare E2E Tests — AI-Powered Test Automation

[![Tests](https://img.shields.io/badge/tests-38-brightgreen?style=flat-square)](tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green?style=flat-square)](https://playwright.dev/)
[![AI-Powered](https://img.shields.io/badge/AI--Powered-Claude%20%2B%20Skills-purple?style=flat-square)]()
[![Status](https://img.shields.io/badge/status-maintained-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**Practical example of E2E testing best practices with Playwright**, especially optimized for **learning with AI assistants** (Claude, Cursor).

---

## 🎯 Why This Project?

Testing veterinary appointments? Know Playwright but want better patterns? **This project is for you.**

### Key Differentiator: AI-Powered Learning 🤖

Unlike generic tutorials, this project is **designed to teach AI assistants**:
- ✅ Conventions documented in **skills** (`.claude/skills/`)
- ✅ Explicit MUST/SHOULD/WON'T patterns
- ✅ Claude/Cursor generate correct code **automatically**
- ✅ Zero "guessing" what to do

### Concepts Covered

| Concept | What You Learn | Example |
|---------|----------------|---------|
| **Page Object Model** | Organize test code | `HomePage.ts`, `AppointmentForm.ts` |
| **Data Isolation** | Zero test orphans | Automatic API cleanup |
| **Test Organization** | Professional structure | `tests/auth/`, `tests/appointments/` |
| **Factory Pattern** | Reusable test data | `TestDataFactory.createAppointment()` |
| **Web-First Assertions** | Wait for elements | `.toBeVisible()`, `.toHaveValue()` |
| **Playwright Skills** | AI guidance | `.claude/skills/playwright-e2e/` |

---

## 🎓 Why This Matters for Your Career

### For QA Professionals
- ✅ **Portfolio-ready** - Shows mastery of Playwright + TypeScript
- ✅ **Modern practices** - POM, factories, isolation, AI
- ✅ **Real-world scenarios** - Not hello world, full CRUD
- ✅ **Scale-ready** - Structure that grows with the project

### For Developers Learning Testing
- ✅ **Best practices from day 1** - No need to rewrite later
- ✅ **AI-accelerated learning** - Claude teaches correct patterns
- ✅ **Clear documentation** - Understand the "why" behind each decision
- ✅ **Debugging guidance** - Real troubleshooting

### For Companies Hiring
- ✅ **Shows initiative** - Complete project, not copied tutorial
- ✅ **Modern stack** - Playwright (industry standard) + TypeScript
- ✅ **AI literacy** - Knows how to use modern tools
- ✅ **Quality mindset** - Test isolation, clean code, documentation

---

## ✨ Features

- 🧪 **38 E2E Tests** in TypeScript + Playwright
  - 2 authentication tests (login)
  - 19 form validation tests
  - 5 edit tests
  - 4 deletion tests
  - 7 search/filter tests
  - 1 time conflict test

- 📊 **Full CRUD Coverage** — Create, list, edit, delete, search appointments

- 🔒 **100% Data Isolation** — Automatic API cleanup, zero orphans after execution

- 🤖 **AI-Ready Architecture**
  - Skills for Claude/Cursor (ask "create test x" → generates correctly)
  - Explicit conventions (project-conventions.md)
  - Page Object conventions (page-object-conventions.md)

- 📚 **Best Practices Documentation**
  - POM (Page Object Model)
  - test.step() for traceability
  - Web-first assertions (not DOM inspection)
  - Timeout constants (SHORT, MEDIUM, LONG)
  - HTTP response validation

- 🔀 **Complex Scenarios**
  - Login with invalid credentials
  - Required field validation
  - Time slot conflicts (duplicates)
  - Case-insensitive search
  - Multi-field editing

- 📈 **Professional Grade**
  - CI/CD ready (tags, retries, reports)
  - Automatic HTML reports
  - trace.zip for debugging
  - Parallel execution

- 🗂️ **Clean Organization**
  - `tests/` — tests only (.spec.ts)
  - `docs/` — centralized documentation
  - `src/pages/` — Page Objects
  - `src/helpers/` — API helpers
  - `src/utils/` — Factories and utilities

---

## 🚀 Quick Start (5 minutes)

### Step 1: Clone and Install
```bash
git clone https://github.com/rebvisconti/petcare-e2e-playwright-ai.git
cd petcare-e2e-playwright-ai
npm install
npx playwright install  # Downloads browsers
```

### Step 2: Start PetCare Server

In **another terminal**:
```bash
git clone https://github.com/rebvisconti/petcare-qa.git
cd petcare-qa
npm install
npm start
# Wait for: "Server running at http://localhost:3001"
```

### Step 3: Run Your First Test
```bash
npm test tests/appointments/create-appointment.spec.ts
```

✅ Done! First execution in ~30s.

### Step 4: View Report
```bash
npm run test:report
# Opens HTML report automatically
```

---

## 🧪 Running Tests

### Execute
```bash
# All tests (38)
npm test

# UI mode (visual, interactive)
npm run test:ui

# With visible browser (headed)
npm run test:headed

# Specific test
npm test tests/appointments/create-appointment.spec.ts

# Specific tag only
npm test --grep "@validation"

# Debug with DevTools
npm run test:debug
```

### View Report
```bash
npm run test:report

# Or manually:
npx playwright show-report
```

### Codegen (Record Actions)
```bash
npm run test:codegen
# Opens browser → you interact → generates code
```

---

## 📝 Example: How a Test Looks
```typescript
// tests/appointments/create-appointment.spec.ts

import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { TestDataFactory } from '../../src/utils/test-data.factory'

test.describe('Create Appointments @create @smoke', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    await AuthHelper.login(page)
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('should create new appointment successfully', async ({ page }) => {
    const appointmentData = TestDataFactory.createAppointment({
      service: 'banho',
      size: 'medio'
    })

    await test.step('Create appointment', async () => {
      await homePage.createAppointment(appointmentData)
    })

    await test.step('Verify it appears in the list', async () => {
      const card = homePage.getAppointmentCard(appointmentData.petName)
      await expect(card).toBeVisible({ timeout: 5_000 })
    })
  })
})
```

**Patterns seen:**
- ✅ `test.step()` for traceability (trace reporting)
- ✅ Page Object (`HomePage`) — organizes selectors + methods
- ✅ Factory (`TestDataFactory`) — reusable data
- ✅ Web-first assertions (`toBeVisible()`) — dynamic waiting
- ✅ Timeout constants (`5_000`) — no magic numbers

---

## 📁 Project Structure
```
petcare-e2e-playwright-ai/
│
├── 📋 tests/                              # E2E Tests (38 .spec.ts files)
│   ├── auth/
│   │   └── login.spec.ts                 # Authentication (2 tests)
│   ├── appointments/
│   │   ├── create-appointment.spec.ts    # Create (2 tests)
│   │   ├── edit-appointment.spec.ts      # Edit (5 tests)
│   │   ├── delete-appointment.spec.ts    # Delete (4 tests)
│   │   ├── search-appointment.spec.ts    # Search (7 tests)
│   │   ├── appointment-form-validation.spec.ts # Validate (19 tests)
│   │   └── time-conflict.spec.ts         # Conflict (1 test)
│   └── auth.setup.ts                     # Playwright Setup (global auth)
│
├── 🔧 src/
│   ├── pages/                            # Page Objects (organizes UI)
│   │   ├── home.page.ts                 # Main screen
│   │   └── components/
│   │       └── appointment-form.component.ts  # Shared form
│   ├── helpers/
│   │   └── api.helper.ts                # API calls (cleanup)
│   ├── utils/
│   │   ├── auth.helper.ts               # Login/logout
│   │   └── test-data.factory.ts         # Random data generation
│   └── fixtures/
│       └── [custom fixtures if needed]
│
├── 📚 docs/                              # Documentation (14 files)
│   ├── testing/                         # Test guides
│   │   ├── README.md                   # Start here
│   │   ├── validation-guide.md         # Validation tests
│   │   └── ...
│   ├── troubleshooting/                # Troubleshooting
│   │   ├── error-fix-summary.md        # Common fixes
│   │   └── ...
│   └── isolation/                       # Isolation analysis
│       ├── test-isolation-analysis.md  # How to avoid orphans
│       └── ...
│
├── 🤖 .claude/skills/                    # Skills for Claude Code
│   └── playwright-e2e/
│       ├── SKILL.md                     # Skill guide
│       └── references/
│           ├── project-conventions.md   # MUST/SHOULD/WON'T rules
│           ├── page-object-conventions.md
│           ├── test-debugging.md
│           ├── test-generation.md
│           ├── test-planning.md
│           └── test-review.md
│
├── 🎯 playwright.config.ts              # Playwright config
├── 📦 package.json                      # Scripts + dependencies
├── 📖 README.md                         # This file!
└── 📄 LICENSE                           # MIT License

📊 STATS:
├─ 38 E2E tests
├─ 3 main scenarios (auth, CRUD, validation)
├─ 100% data isolation (zero orphans after execution)
├─ TypeScript strict mode
├─ 14 documentation files in docs/
└─ 6 skills for Claude/Cursor
```

---

## 🏗️ Architecture Overview

### How Tests Work
```
┌─────────────────────────────────────┐
│ Test (*.spec.ts)                    │
│ ├─ @beforeEach: Login + setup      │
│ ├─ test.step(): UI actions         │
│ ├─ expect(): Verifications         │
│ └─ @afterEach: API cleanup         │
└──────────────┬──────────────────────┘
               │
        ┌──────▼───────┐
        │ Page Object  │
        │ (HomePage)   │
        │ ├─ Locators  │
        │ └─ Methods   │
        └──────┬───────┘
               │
        ┌──────▼──────────┐
        │ Components      │
        │ (AppointmentForm)
        │ ├─ petNameInput │
        │ ├─ phoneInput   │
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │ App (UI)        │
        │ http://localhost:3001
        │ ├─ login.html   │
        │ └─ index.html   │
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │ API Backend     │
        │ GET /agendamentos
        │ POST /agendamentos
        │ PUT /agendamentos/:id
        │ DELETE /agendamentos/:id
        └─────────────────┘

🔄 Cleanup: @afterEach → DELETE /agendamentos via ApiHelper
```

### Data Isolation: No Orphans
```
Before:  Test 1 creates data → no cleanup → orphans accumulate
         Test 2 creates data → no cleanup → orphans accumulate
         Test 3 creates data → no cleanup → 90+ orphans after 10 runs ❌

After:   Test 1 → @afterEach: DELETE via API → 0 orphans
         Test 2 → @afterEach: DELETE via API → 0 orphans
         Test 3 → @afterEach: DELETE via API → 0 orphans  ✅

Result: 100% isolated tests, safe to run in parallel
```

---

## 🤖 AI-Powered Learning: Your Superpower

### Why Do AI Assistants Need "Skills"?

By default, AI assistants (Claude, Cursor) **don't know your conventions**, so they generate generic code.

With skills, they **learn your rules** and apply them automatically.

### How to Use with Claude/Cursor?

1. **Open the project** in Claude Code / Cursor
2. **Ask to create a test:**
```
   "Create a new test to validate that the Email field is required"
```
3. **AI uses the skills** (`.claude/skills/playwright-e2e/`) to:
   - Generate with POM (Page Object)
   - Add `test.step()` automatically
   - Use web-first assertions
   - Add data isolation
   - Include educational comments

**Result:**
- ✅ Correct code 100% of the time
- ✅ Patterns applied without asking
- ✅ Educational (clear comments)

### Example Skill: `project-conventions.md`
```markdown
# Project Conventions

## MUST
- MUST use web-first assertions (`await expect(locator).toBeVisible()`)
- MUST wrap page object methods in `test.step()` for trace reporting
- MUST clean up test resources in `afterEach` hooks

## WON'T
- WON'T use XPath selectors
- WON'T use `page.waitForTimeout()` for synchronization
- WON'T use `{ force: true }` on actions
```

When you ask for a test, Claude **follows all these rules** automatically.

### To Regenerate/Update Skills

If your convention changed:
```bash
npx wico-playwright-agent-skills init
```

---

## 📚 Full Documentation

### For Each Type of User

| You are... | Start with... | Then read... |
|------------|---------------|--------------|
| 👨‍💻 **Dev new to Playwright** | [Validation Guide](docs/testing/validation-guide.md) | [Page Object Conventions](.claude/skills/playwright-e2e/references/page-object-conventions.md) |
| 🤖 **Experimenting with AI** | Skills in `.claude/skills/` | [Project Conventions](.claude/skills/playwright-e2e/references/project-conventions.md) |
| 🧪 **QA seeking patterns** | [Test Organization](docs/testing/index.md) | [Test Isolation](docs/isolation/test-isolation-analysis.md) |
| 🔍 **Debugging tests** | [Troubleshooting](docs/troubleshooting/error-fix-summary.md) | [Test Review Checklist](.claude/skills/playwright-e2e/references/test-review.md) |
| 🎓 **Learning testing** | [Quick Reference](docs/testing/quick-reference.md) | [Validation Tests](docs/testing/validation-tests.md) |

### Complete Documentation

- 📋 [Quick Setup](docs/testing/README.md) — Start in 5 min
- 📖 [Test Organization](docs/FILE_ORGANIZATION_ASSESSMENT.md) — Structure
- 📝 [Naming Conventions](docs/FILE_NAMING_CONVENTIONS.md) — Patterns
- ✅ [Feature Coverage](docs/FEATURE_COVERAGE_ANALYSIS.md) — What we test
- 🔍 [Data Isolation](docs/isolation/test-isolation-analysis.md) — Zero orphans
- 🆘 [Troubleshooting](docs/troubleshooting/error-fix-summary.md) — Common issues

---

## 💡 Lessons Learned

This project was developed as part of my career transition to QA in tech. Key learnings:

### Technical Skills
- ✅ **Playwright from scratch** - From beginner to creating 38 complete E2E tests
- ✅ **TypeScript** - Strong typing, interfaces, generics
- ✅ **Page Object Model** - Professional code organization
- ✅ **AI-Powered Development** - Claude Code + Skills
- ✅ **Git workflow** - Semantic commits, branches, PRs

### Testing Concepts
- ✅ **Test Isolation** - Zero orphans, automatic cleanup
- ✅ **Data Factories** - Dynamic generation with realistic patterns
- ✅ **Web-First Assertions** - Smart waits
- ✅ **Test Organization** - Scalable structure
- ✅ **Debugging** - Traces, screenshots, reports

### AI & Automation
- ✅ **Claude AI Assistant** - VSCode extension for code generation
- ✅ **Playwright Skills (wico)** - Teaching AI about project conventions
- ✅ **Prompt Engineering** - Asking for correct tests automatically
- ✅ **AI-Powered Testing** - Skills-based code generation

### Challenges Overcome
- 🎯 HTML values vs display text (lowercase `'banho'` vs "Banho")
- 🎯 API timeouts - UI validation when API doesn't respond
- 🎯 Test data isolation - TimeSlotManager to avoid conflicts
- 🎯 Authentication setup - Storage state to reuse login
- 🎯 Strict mode violations - Unique names in tests

**Biggest challenge:** Understanding when to validate by API vs UI  
**Biggest win:** Creating complete test suite with AI assistance

---

## 🆘 Troubleshooting

### Test Fails with "Element Not Found"

1. Check selector: `npm run test:codegen` (record UI interaction)
2. Increase timeout: `{ timeout: 10_000 }`
3. Use `toPass()` for retry: See [troubleshooting](docs/troubleshooting/)

### Error Message Won't Clear

Field validated on `onBlur`, not just `onChange`. Solution:
```typescript
await page.fill('[data-testid="input"]', 'value')
await page.locator('[data-testid="input"]').blur()  // ← Triggers validation
```

See [error-clearing-guide.md](docs/troubleshooting/error-clearing-guide.md) for more.

### Parallel Tests Fail

Probably data collision (same date/time). Solution: `TimeSlotManager` distributes slots.

See [time-slot-distribution.md](docs/testing/time-slot-distribution.md).

---

## 🤝 Contributing

Contributions are welcome! This is a **learning + reference** project.

### Before Submitting
```bash
npm test                    # All tests must pass
npm run test:ui             # Check if any fail visually
```

### Type of Contribution

- 🐛 **Bug fixes** in existing tests
- ✨ **New tests** to cover gaps
- 📚 **Better documentation** (errors, examples)
- 🤖 **Skills improvements** (better AI guidance)
- 💡 **Suggestions** for better patterns

### Process

1. Fork the project
2. Create branch: `git checkout -b feature/your-test`
3. Commit: `git commit -m "feat: new test for X"`
4. Push: `git push origin feature/your-test`
5. Open Pull Request

### PR Review Focuses On

- ✅ Playwright patterns (web-first, POM)
- ✅ Isolation (no orphans)
- ✅ Educational value (good for learning?)
- ✅ Documentation (clear comments)

**Questions?** Open an [Issue](https://github.com/rebvisconti/petcare-e2e-playwright-ai/issues) 🎯

---

## 📜 License

MIT License — Use, modify, and share freely.

See [LICENSE](LICENSE) for complete terms.

---

## 👤 Author

**Rebeca Visconti**
- 🎯 QA Tester | Test Automation  
- 💼 LinkedIn: [linkedin.com/in/rebeca-visconti](https://linkedin.com/in/rebeca-visconti)
- 🐙 GitHub: [@rebvisconti](https://github.com/rebvisconti)

---

## 🙏 Acknowledgments

- 📚 [Playwright Best Practices](https://playwright.dev/docs/best-practices) — Inspiration
- 🤖 [wico-playwright-agent-skills](https://github.com/willcoliveira/qualiow-playwright-skills) — Skills architecture
- 💡 [Awesome Playwright](https://github.com/mxschmitt/awesome-playwright) — Resources
- 🎓 Playwright community for discussions and feedback

---

## 📊 Project Status

| Metric | Status |
|--------|--------|
| **E2E Tests** | 38 passing ✅ |
| **CRUD Coverage** | 100% ✅ |
| **Data Isolation** | 100% ✅ |
| **Documentation** | Complete ✅ |
| **CI/CD** | Ready ✅ |
| **AI Skills** | Implemented ✅ |

### 🚧 Future Roadmap

- [ ] **Performance Tests** - Validate response times
- [ ] **Visual Regression** - Comparative screenshots
- [ ] **Accessibility Tests** - WCAG compliance
- [ ] **Mobile Tests** - Responsive behavior
- [ ] **API Tests** - Contract testing
- [ ] **CI/CD Pipeline** - Automatic GitHub Actions
- [ ] **Slack Alerts** - Failure notifications

**Contributions are welcome!** 🙌

---

## 🌟 Like the Project?

If this project helped you in any way:

- ⭐ **Leave a star** on the repository
- 🐛 **Report bugs** via [Issues](https://github.com/rebvisconti/petcare-e2e-playwright-ai/issues)
- 💡 **Suggest improvements** via [Discussions](https://github.com/rebvisconti/petcare-e2e-playwright-ai/discussions)
- 🤝 **Contribute** with PRs
- 📢 **Share** with the QA community

**Let's grow together in the testing community!** 🚀

---

<div align="center">

**⭐ If this project helped you, leave a star! ⭐**

Collaboration is welcome — [open an issue](https://github.com/rebvisconti/petcare-e2e-playwright-ai/issues) or [PR](https://github.com/rebvisconti/petcare-e2e-playwright-ai/pulls)!

[🔝 Back to top](#-petcare-e2e-tests--ai-powered-test-automation)

</div>
