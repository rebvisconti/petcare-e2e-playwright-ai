# 🐾 PetCare E2E Tests — AI-Powered Test Automation

[![Tests](https://img.shields.io/badge/tests-40-brightgreen?style=flat-square)](tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green?style=flat-square)](https://playwright.dev/)
[![Status](https://img.shields.io/badge/status-maintained-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**Exemplo prático de boas práticas em E2E testing com Playwright**, especialmente otimizado para **aprender com assistentes de IA** 

🎯 Why This Project?

Testing a veterinary appointment system? Already familiar with Playwright but looking for better patterns and structure? This project is for you.

🎓 Why This Matters for Your Career
For QA Professionals
✅ Portfolio-ready - Demonstrates Playwright + TypeScript expertise
✅ Modern practices - POM, factories, isolation, AI
✅ Real-world scenarios - Full CRUD, not just hello world
✅ Scale-ready - Structure grows with the project

For Developers Learning Testing
✅ Best practices from day 1
✅ AI-accelerated learning - Claude enforces correct patterns
✅ Clear documentation - Understand the reasoning behind each decision
✅ Debugging guidance - Real troubleshooting advice

For Companies Hiring
✅ Shows initiative - Complete project, not copied tutorial
✅ Modern stack - Playwright + TypeScript
✅ AI literacy - Using modern AI-assisted tools
✅ Quality mindset - Test isolation, clean code, documentation

👥 Who Is This For?

🧪 QA Engineers learning Playwright
👨‍💻 Developers writing E2E tests
🤖 Engineers exploring AI-assisted testing
🎓 Beginners looking for real-world test architecture
📚 Concepts Covered

Concept	What You Learn	Example
Page Object Model	Organize test code	HomePage.ts, AppointmentForm.ts
Data Isolation	Prevent test pollution	Automatic API cleanup
Test Organization	Professional structure	tests/auth/, tests/appointments/
Factory Pattern	Reusable test data	TestDataFactory.createAppointment()
Web-First Assertions	Reliable waits	.toBeVisible(), .toHaveValue()
AI Skills	Guide AI behavior	.claude/skills/playwright-e2e/ (7 skills)

✨ Features

🧪 38 E2E Tests using TypeScript + Playwright
Authentication: 2 tests
Validation: 19 tests
Edit: 5 tests
Delete: 4 tests
Search & filters: 7 tests
Time conflict: 1 test

📊 Full CRUD Coverage — Create, read, update, delete, search

🔒 100% Data Isolation — Automatic API cleanup, zero orphan data

🤖 AI-Ready Architecture

Skills for AI coding assistants (Claude, Cursor, etc.)
Explicit project conventions
Page Object guidelines

📚 Best Practices Documentation
Page Object Model (POM)
test.step() for traceability
Web-first assertions (no DOM inspection)
Timeout constants (SHORT, MEDIUM, LONG)
HTTP response validation

🔀 Complex Scenarios
Invalid login attempts
Required field validation
Time slot conflicts
Case-insensitive search
Multi-field editing

📈 Production-Ready Setup
CI/CD ready
Parallel execution
HTML reports
trace.zip debugging support

🚀 Quick Start (5 minutes)
1. Clone & Install
git clone https://github.com/rebvisconti/petcare-e2e-playwright-ai.git
cd petcare-e2e-playwright-ai
npm install
npx playwright install

2. Start PetCare website 

In another terminal:

git clone https://github.com/rebvisconti/petcare-qa.git
cd petcare-qa
npm install
npm start

Expected:

Server running at http://localhost:3001

3. Run Your First Test
npm test tests/appointments/create-appointment.spec.ts

✅ Done! First run in ~30 seconds.

4. View Report
npm run test:report
🧪 Running Tests

# Run all tests
npm test

# UI mode (interactive)
npm run test:ui

# Headed mode
npm run test:headed

# Specific test
npm test tests/appointments/create-appointment.spec.ts

# Run by tag
npm test --grep "@validation"

# Debug mode
npm run test:debug
📊 Reports
npm run test:report
# or
npx playwright show-report
📝 Example Test
test('should create a new appointment successfully', async ({ page }) => {
  const appointmentData = TestDataFactory.createAppointment({
    service: 'Bath',
    size: 'Medium'
  })

  await test.step('Create appointment', async () => {
    await homePage.createAppointment(appointmentData)
  })

  await test.step('Verify appointment appears in list', async () => {
    const card = homePage.getAppointmentCard(appointmentData.petName)
    await expect(card).toBeVisible({ timeout: MEDIUM_TIMEOUT })
  })
})
📁 Project Structure
petcare-e2e/
├── tests/                 # E2E tests
├── src/pages/             # Page Objects
├── src/helpers/           # API helpers
├── src/utils/             # Utilities & factories
├── docs/                  # Documentation
├── .claude/skills/        # AI skills (7 skills for Claude/Cursor)
├── playwright.config.ts
├── package.json
└── README.md
File Organization
💡 Lessons Learned

This project was developed as part of my career transition into QA in tech. Key takeaways:

Technical Skills
✅ Playwright from scratch — From beginner to 38 full E2E tests
✅ TypeScript — Strong typing, interfaces, generics
✅ Page Object Model — Professional code organization
✅ AI-Powered Development — Claude Code + MCP + Skills
✅ Git workflow — Semantic commits, branches, PRs
Testing Concepts
✅ Test Isolation — Zero orphan data, automatic cleanup
✅ Data Factories — Dynamic data generation with realistic patterns
✅ Web-First Assertions — Smart waits
✅ Test Organization — Scalable structure
✅ Debugging — Traces, screenshots, reports
AI & Automation
✅ MCP (Model Context Protocol) — Claude + tools integration
✅ Playwright Skills (wico) — Teaching AI project patterns
✅ Prompt Engineering — Automatic correct test generation
📊 Project Status
Metric	Status
E2E Tests	38 passing ✅
CRUD Coverage	100% ✅
Data Isolation	100% ✅
Documentation	Complete ✅
CI/CD	Ready ✅
AI Skills	Implemented ✅

🚧 Roadmap
 Performance Tests — Validate response times
 Visual Regression — Compare screenshots
 Accessibility Tests — WCAG compliance
 Mobile Tests — Responsive behavior
 API Tests — Contract testing
 CI/CD Pipeline — GitHub Actions automation
 Slack Alerts — Failure notifications

Contributions welcome! 🙌

🤖 AI Integration

AI assistants often generate generic code.
This project solves that using structured conventions and skills.

Example Prompt
Create a test to validate that the email field is required

AI will automatically:

Use Page Object Model
Add test.step()
Apply correct assertions
Follow project conventions

👤 Author

Rebeca Visconti

🎯 QA | Porto, Portugal
📧 rebecavisconti@gmail.com
💼 LinkedIn: linkedin.com/in/rebeca-visconti
🐙 GitHub: @rebecavisconti
📜 License

MIT License

🌟 Like This Project?

If this project helped you:

⭐ Star the repo
🐛 Report bugs via Issues
💡 Suggest improvements via Discussions
🤝 Contribute with PRs
📢 Share with the QA community

Let's grow together in the testing community! 🚀