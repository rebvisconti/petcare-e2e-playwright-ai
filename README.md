# 🐾 PetCare E2E Tests — AI-Powered Test Automation

[![Tests](https://img.shields.io/badge/tests-40-brightgreen?style=flat-square)](tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green?style=flat-square)](https://playwright.dev/)
[![Status](https://img.shields.io/badge/status-maintained-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

**Exemplo prático de boas práticas em E2E testing com Playwright**, especialmente otimizado para **aprender com assistentes de IA** (Claude, Cursor).

---

## 🎯 Por Que Este Projeto?

Testando agendamentos veterinários? Conhece Playwright mas quer padrões melhores? **Este projeto é para você.**

### Diferencial: AI-Powered Learning 🤖

Diferente de tutoriais genéricos, este projeto é **desenhado para ensinar assistentes de IA**:
- ✅ Convenções documentadas em **skills** (`.claude/skills/`)
- ✅ Padrões MUST/SHOULD/WON'T explícitos
- ✅ Claude/Cursor geram código correto **automaticamente**
- ✅ Zero "guessing" do que fazer

### Conceitos Cobertos

| Conceito | O que aprende | Exemplo |
|----------|--|--|
| **Page Object Model** | Organizar código de teste | `HomePage.ts`, `AppointmentForm.ts` |
| **Data Isolation** | Zero test orphans | API cleanup automático |
| **Test Organization** | Estrutura profissional | `tests/auth/`, `tests/appointments/` |
| **Factory Pattern** | Dados reutilizáveis | `TestDataFactory.createAppointment()` |
| **Web-First Assertions** | Esperar elementos | `.toBeVisible()`, `.toHaveValue()` |
| **Playwright Skills** | Guia IA | `.claude/skills/playwright-e2e/` |

---

## ✨ Features

- 🧪 **40 Testes E2E** em TypeScript + Playwright
  - 2 testes autenticação (login)
  - 19 testes validação formulário
  - 5 testes edição
  - 4 testes deleção
  - 7 testes busca/filtros
  - 1 teste conflito horário

- 📊 **Full CRUD Coverage** — Criar, listar, editar, deletar, buscar agendamentos

- 🔒 **100% Data Isolation** — API cleanup automático, zero orphans após execução

- 🤖 **AI-Ready Architecture**
  - Skills para Claude/Cursor (pedir "crie um teste x" → gera correto)
  - Convenções explícitas (project-conventions.md)
  - Page Object convenções (page-object-conventions.md)

- 📚 **Best Practices Documentation**
  - POM (Page Object Model)
  - test.step() para rastreabilidade
  - Web-first assertions (não DOM inspection)
  - Timeout constants (SHORT, MEDIUM, LONG)
  - HTTP response validation

- 🔀 **Scenarios Complexos**
  - Login com credenciais inválidas
  - Validação de campos obrigatórios
  - Conflito de horário (duplicatas)
  - Busca case-insensitive
  - Edição múltiplos campos

- 📈 **Professional Grade**
  - CI/CD ready (tags, retries, reports)
  - HTML reports automáticos
  - trace.zip para debugging
  - Runs em paralelo

- 🗂️ **Clean Organization**
  - `tests/` — apenas testes (.spec.ts)
  - `docs/` — documentação centralizada
  - `src/pages/` — Page Objects
  - `src/helpers/` — API helpers
  - `src/utils/` — Factories e utilidades

---

## 🚀 Quick Start (5 minutos)

### Step 1: Clonar e Instalar

```bash
git clone https://github.com/fernanda/petcare-e2e.git
cd petcare-e2e
npm install
npx playwright install  # Baixa browsers
```

### Step 2: Iniciar Servidor PetCare

Em **outro terminal**:
```bash
cd ../petcare-app/          # Seu app deve estar pronto
npm run dev
# Espera: "Server running at http://localhost:3001"
```

### Step 3: Rodar Seu Primeiro Teste

```bash
npm test tests/appointments/create-appointment.spec.ts
```

✅ Pronto! Primeira execução em ~30s.

### Step 4: Ver Relatório

```bash
npm run test:report
# Abre HTML report automaticamente
```

---

## 🧪 Rodando Testes

### Executar

```bash
# Todos os testes (40)
npm test

# Modo UI (visual, interativo)
npm run test:ui

# Com browser visível (headed)
npm run test:headed

# Teste específico
npm test tests/appointments/create-appointment.spec.ts

# Apenas tag específica
npm test --grep "@validation"

# Debug com DevTools
npm run test:debug
```

### Ver Relatório

```bash
npm run test:report

# Ou manual:
npx playwright show-report
```

### Codegen (Gravar Ações)

```bash
npm run test:codegen
# Abre browser → você interage → gera código
```

---

## 📝 Exemplo: Como Fica um Teste

```typescript
// tests/appointments/create-appointment.spec.ts

import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { TestDataFactory } from '../../src/utils/test-data.factory'

test.describe('Criação de Agendamentos @create @smoke', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    await AuthHelper.login(page)
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('deve criar novo agendamento com sucesso', async ({ page }) => {
    const appointmentData = TestDataFactory.createAppointment({
      service: 'Banho',
      size: 'Médio'
    })

    await test.step('Criar agendamento', async () => {
      await homePage.createAppointment(appointmentData)
    })

    await test.step('Verificar que apareceu na lista', async () => {
      const card = homePage.getAppointmentCard(appointmentData.petName)
      await expect(card).toBeVisible({ timeout: 5_000 })
    })
  })
})
```

**Padrões vistos:**
- ✅ `test.step()` para rastreabilidade (trace reporting)
- ✅ Page Object (`HomePage`) — organiza selectors + métodos
- ✅ Factory (`TestDataFactory`) — dados reutilizáveis
- ✅ Web-first assertions (`toBeVisible()`) — espera dinâmica
- ✅ Timeout constants (`5_000`) — sem magic numbers

---

## 📁 Project Structure

```
petcare-e2e/
│
├── 📋 tests/                              # Testes E2E (40 arquivos .spec.ts)
│   ├── auth/
│   │   └── login.spec.ts                 # Autenticação (2 testes)
│   ├── appointments/
│   │   ├── create-appointment.spec.ts    # Criar (2 testes)
│   │   ├── edit-appointment.spec.ts      # Editar (5 testes)
│   │   ├── delete-appointment.spec.ts    # Deletar (4 testes)
│   │   ├── search-appointment.spec.ts    # Buscar (7 testes)
│   │   ├── appointment-form-validation.spec.ts # Validar (19 testes)
│   │   └── time-conflict.spec.ts         # Conflito (1 teste)
│   └── auth.setup.ts                     # Setup Playwright (auth global)
│
├── 🔧 src/
│   ├── pages/                            # Page Objects (organiza UI)
│   │   ├── home.page.ts                 # Tela principal
│   │   └── components/
│   │       └── appointment-form.component.ts  # Formulário compartilhado
│   ├── helpers/
│   │   └── api.helper.ts                # Chamadas API (cleanup)
│   ├── utils/
│   │   ├── auth.helper.ts               # Login/logout
│   │   └── test-data.factory.ts         # Geração random de dados
│   └── fixtures/
│       └── [custom fixtures se precisar]
│
├── 📚 docs/                              # Documentação (14 arquivos)
│   ├── testing/                         # Guias de teste
│   │   ├── README.md                   # Start aqui
│   │   ├── validation-guide.md         # Testes de validação
│   │   ├── time-slot-distribution.md   # Estratégia de slots
│   │   ├── index.md                    # Índice de docs
│   │   └── ...
│   ├── troubleshooting/                # Troubleshooting
│   │   ├── error-fix-summary.md        # Comum fixes
│   │   ├── error-clearing-guide.md     # Quando erro não desaparece
│   │   └── ...
│   └── isolation/                       # Análise de isolamento
│       ├── test-isolation-analysis.md  # Como evitar orphans
│       └── ...
│
├── 🤖 .claude/skills/                    # Skills para Claude Code
│   └── playwright-e2e/
│       ├── SKILL.md                     # Guia skill
│       └── references/
│           ├── project-conventions.md   # MUST/SHOULD/WON'T
│           ├── page-object-conventions.md
│           └── test-review.md           # Checklist qualidade
│
├── 🎯 playwright.config.ts              # Config Playwright
├── 📦 package.json                      # Scripts + dependencies
├── 📖 README.md                         # Este arquivo!
└── 📄 LICENSE                           # MIT License

📊 STATS:
├─ 40 testes E2E
├─ 3 cenários principais (auth, CRUD, validação)
├─ 100% data isolation (zero orphans após execução)
├─ TypeScript strict mode
├─ 14 documentos em docs/
└─ 3 skills para Claude/Cursor
```

---

## 🤖 AI-Powered Learning: Seu Superpower

### Por Que Assistentes de IA Precisam de "Skills"?

Por padrão, assistentes de IA (Claude, Cursor) **não conhecem suas convenções**, então geram código genérico.

Com skills, eles **aprendem suas regras** e aplicam automaticamente.

### Como Usar com Claude/Cursor?

1. **Abra o projeto** em Claude Code / Cursor
2. **Peça para criar um teste:**
   ```
   "Crie um novo teste para validar que o campo Email é obrigatório"
   ```
3. **IA usa as skills** (`.claude/skills/playwright-e2e/`) para:
   - Gerar com POM (Page Object)
   - Adicionar `test.step()` automaticamente
   - Usar web-first assertions
   - Adicionar isolamento de dados
   - Comentários didáticos

**Resultado:**
- ✅ Código correto 100% das vezes
- ✅ Padrões aplicados sem você pedir
- ✅ Didático para aprender (comentários claros)

### Exemplo de Skill: `project-conventions.md`

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

Quando você pede um teste, Claude **segue todas essas regras** automaticamente.

### Para Regenerar/Atualizar Skills

Se sua convenção mudou:
```bash
npx wico-playwright-agent-skills init
```

---

## 📚 Full Documentation

### Para Cada Tipo de Usuário

| Você é... | Comece com... | Depois leia... |
|-----------|---|---|
| 👨‍💻 **Dev novo em Playwright** | [Validation Guide](docs/testing/validation-guide.md) | [Page Object Conventions](.claude/skills/playwright-e2e/references/page-object-conventions.md) |
| 🤖 **Experimentando MCP/IA** | [AI Skills Setup](docs/testing/ai-skills-guide.md) | [Project Conventions](.claude/skills/playwright-e2e/references/project-conventions.md) |
| 🧪 **QA buscando padrões** | [Test Organization](docs/testing/index.md) | [Test Isolation](docs/isolation/test-isolation-analysis.md) |
| 🔍 **Debugging testes** | [Troubleshooting](docs/troubleshooting/error-fix-summary.md) | [Test Review Checklist](.claude/skills/playwright-e2e/references/test-review.md) |
| 🎓 **Aprendendo testes** | [Quick Reference](docs/testing/quick-reference.md) | [Validation Tests](docs/testing/validation-tests.md) |

### Documentação Completa

- 📋 [Setup Rápido](docs/testing/README.md) — Comece em 5 min
- 📖 [Organizando Testes](FILE_ORGANIZATION_ASSESSMENT.md) — Estrutura
- 📝 [Convenções de Nome](FILE_NAMING_CONVENTIONS.md) — Padrões
- ✅ [Cobertura de Features](FEATURE_COVERAGE_ANALYSIS.md) — O que testamos
- 🔍 [Isolamento de Dados](docs/isolation/test-isolation-analysis.md) — Zero orphans
- 🆘 [Troubleshooting](docs/troubleshooting/error-fix-summary.md) — Problemas comuns
- 🤖 [Skills para IA](docs/testing/ai-skills-guide.md) — Como usar com Claude/Cursor

---

## 🏗️ Architecture Overview

### Como os Testes Funcionam

```
┌─────────────────────────────────────┐
│ Test (*.spec.ts)                    │
│ ├─ @beforeEach: Login + setup       │
│ ├─ test.step(): Ações em UI         │
│ ├─ expect(): Verificações          │
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

### Data Isolation: Sem Orphans

```
Before:  Test 1 cria dados → não limpa → orphans acumulam
         Test 2 cria dados → não limpa → orphans acumulam
         Test 3 cria dados → não limpa → 90+ orphans após 10 runs ❌

After:   Test 1 → @afterEach: DELETE via API → 0 orphans
         Test 2 → @afterEach: DELETE via API → 0 orphans
         Test 3 → @afterEach: DELETE via API → 0 orphans  ✅

Resultado: Testes 100% isolados, seguro rodar em paralelo
```

---

## 🆘 Troubleshooting

### Teste Falha com "Element Not Found"

1. Verifique o seletor: `npm run test:codegen` (grave UI interação)
2. Aumente timeout: `{ timeout: 10_000 }`
3. Use `toPass()` para retry: Ver [troubleshooting](docs/troubleshooting/)

### Mensagem de Erro Não Desaparece

O campo validou em `onBlur`, não apenas `onChange`. Solução:

```typescript
await page.fill('[data-testid="input"]', 'valor')
await page.locator('[data-testid="input"]').blur()  // ← Dispara validação
```

Ver [error-clearing-guide.md](docs/troubleshooting/error-clearing-guide.md) para mais.

### Testes em Paralelo Falham

Provavelmente colisão de dados (mesma data/hora). Solução: `TimeSlotManager` distribui slots.

Ver [time-slot-distribution.md](docs/testing/time-slot-distribution.md).

---

## 🤝 Contributing

Contribuições são bem-vindas! Este é um projeto de **aprendizado + referência**.

### Antes de Submeter

```bash
npm test                    # Todos os testes devem passar
npm run test:ui             # Ver se algum falha visualmente
```

### Type de Contribuição

- 🐛 **Bug fixes** em testes existentes
- ✨ **Novos testes** para cobrir gaps
- 📚 **Melhor documentação** (erros, exemplos)
- 🤖 **Melhorias em skills** (melhor guia IA)
- 💡 **Sugestões** de padrões melhores

### Processo

1. Fork o projeto
2. Crie branch: `git checkout -b feature/seu-teste`
3. Commit: `git commit -m "feat: novo teste para X"`
4. Push: `git push origin feature/seu-teste`
5. Abra Pull Request

### PR Review Foca Em

- ✅ Padrão Playwright (web-first, POM)
- ✅ Isolamento (sem orphans)
- ✅ Didática (bom para aprender?)
- ✅ Documentação (comentários claros)

**Dúvidas?** Abra uma [Issue](issues) 🎯

---

## 📜 License

MIT License — Use, modifique e compartilhe livremente.

Ver [LICENSE](LICENSE) para termos completos.

---

## 👤 Author

**Fernanda Visconti**
- 🎯 QA Engineer | Test Automation  
- 📧 seu@email.com
- 💼 LinkedIn: [/in/seu-perfil](https://linkedin.com)
- 🐙 GitHub: [@fernanda](https://github.com/fernanda)

---

## 🙏 Acknowledgments

- 📚 [Playwright Best Practices](https://playwright.dev/docs/best-practices) — Inspiração
- 🤖 [wico-playwright-agent-skills](https://github.com/willcoliveira/qualiow-playwright-skills) — Skills arquitetura
- 💡 [Awesome Playwright](https://github.com/mxschmitt/awesome-playwright) — Recursos
- 🎓 Comunidade Playwright por discussões/feedback

---

## 📊 Project Status

- ✅ **40 testes passando** 
- ✅ **100% data isolation**
- ✅ **Documentação completa**
- ✅ **CI/CD ready**
- 🚧 **Roadmap:**
  - [ ] Testes de performance
  - [ ] Testes mobile
  - [ ] Testes de acessibilidade
  - [ ] Integração com Slack alerts

---

<div align="center">

**⭐ Se este projeto ajudou você, deixe uma star! ⭐**

Colaboração é bem-vinda — [abra uma issue](issues) ou [PR](pulls)!

[🔝 Voltar ao topo](#-petcare-e2e-tests--ai-powered-test-automation)

</div>