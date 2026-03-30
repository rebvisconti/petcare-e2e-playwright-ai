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
---

## 🎓 Diferencial: AI-Powered Learning 🤖

Diferente de tutoriais genéricos, este projeto é **desenhado para ensinar assistentes de IA**:
- ✅ Convenções documentadas em **skills** (`.claude/skills/`)
- ✅ Padrões MUST/SHOULD/WON'T explícitos
- ✅ Claude/Cursor geram código correto **automaticamente**
- ✅ Zero "guessing" do que fazer

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
git clone https://github.com/rebvisconti/petcare-e2e-playwright-ai.git
cd petcare-e2e-playwright-ai
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
│   │   └── ...
│   ├── troubleshooting/                # Troubleshooting
│   │   ├── error-fix-summary.md        # Comum fixes
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
│           └── ...
│
├── 🎯 playwright.config.ts              # Config Playwright
├── 📦 package.json                      # Scripts + dependencies
├── 📖 README.md                         # Este arquivo!
└── 📄 LICENSE                           # MIT License
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

---

## 📚 Full Documentation

### Para Cada Tipo de Usuário

| Você é... | Comece com... | Depois leia... |
|-----------|---|---|
| 👨‍💻 **Dev novo em Playwright** | [Validation Guide](docs/testing/validation-guide.md) | [Page Object Conventions](.claude/skills/playwright-e2e/references/page-object-conventions.md) |
| 🤖 **Experimentando MCP/IA** | Skills em `.claude/skills/` | [Project Conventions](.claude/skills/playwright-e2e/references/project-conventions.md) |
| 🧪 **QA buscando padrões** | [Test Organization](docs/testing/index.md) | [Test Isolation](docs/isolation/test-isolation-analysis.md) |
| 🔍 **Debugging testes** | [Troubleshooting](docs/troubleshooting/error-fix-summary.md) | [Test Review Checklist](.claude/skills/playwright-e2e/references/test-review.md) |

### Documentação Completa

- 📋 [Setup Rápido](docs/testing/README.md) — Comece em 5 min
- 📖 [Organizando Testes](FILE_ORGANIZATION_ASSESSMENT.md) — Estrutura
- 📝 [Convenções de Nome](FILE_NAMING_CONVENTIONS.md) — Padrões
- ✅ [Cobertura de Features](FEATURE_COVERAGE_ANALYSIS.md) — O que testamos
- 🔍 [Isolamento de Dados](docs/isolation/test-isolation-analysis.md) — Zero orphans
- 🆘 [Troubleshooting](docs/troubleshooting/error-fix-summary.md) — Problemas comuns

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

Provavelmente colisão de dados. Solução: `TimeSlotManager` e `TestDateGenerator` distribuem slots e datas.

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

---

## 📜 License

MIT License — Use, modifique e compartilhe livremente.

Ver [LICENSE](LICENSE) para termos completos.

---

## 👤 Author

**Rebeca Visconti**
- 🎯 QA Engineer | Test Automation  
- 📧 rebecavisconti@gmail.com
- 💼 LinkedIn: [linkedin.com/in/rebeca-visconti](https://linkedin.com)
- 🐙 GitHub: [@rebvisconti](https://github.com/rebvisconti)

---

## 🙏 Acknowledgments

- 📚 [Playwright Best Practices](https://playwright.dev/docs/best-practices) — Inspiração
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