# 📋 Análise: Nomenclatura de Arquivos (UPPERCASE vs lowercase)

**Data:** Março 2026  
**Questão:** Arquivos em LETRAS MAIÚSCULAS como `README.md`, `FEATURE_COVERAGE_ANALYSIS.md` são boas práticas?

---

## 🔍 Convenções Gerais da Indústria

### ✅ Recomendações Internacionais

| Convenção | Quando Usar | Exemplos |
|-----------|-----------|----------|
| **UPPERCASE** | Arquivos de config/meta do projeto | `README.md`, `LICENSE`, `CHANGELOG.md`, `AUTHORS` |
| **lowercase** | Código, testes, utilitários | `helper.ts`, `index.js`, `utils.ts`, `styles.css` |
| **kebab-case** | Arquivos de dados/complexos | `test-data.json`, `style-guide.md`, `api-config.yaml` |
| **PascalCase** | Classes/componentes | `HomePage.ts`, `UserService.ts` |

### 📚 Padrões Recomendados por Organização

| Organização | Padrão | Exemplo |
|---|---|---|
| **GitHub** | UPPERCASE para docs raiz | `README.md`, `CODE_OF_CONDUCT.md` |
| **Google Style Guide** | lowercase com hífens | `style-guide.md`, `contributing.md` |
| **Airbnb** | lowercase com hífens | `javascript.md`, `react.md` |
| **Prettier** | lowercase para utilitários | `prettier.json`, `eslint.config.js` |
| **Node.js** | UPPERCASE para top-level docs | `README.md`, `LICENSE` |

---

## 📊 Análise do Seu Projeto

### Arquivos em MAIÚSCULAS (Atual)
```
RAIZ:
├── README.md                          ✅ PADRÃO (OK em maiúsculas)
├── FEATURE_COVERAGE_ANALYSIS.md       ⚠️ Questionável
├── FILE_ORGANIZATION_ASSESSMENT.md    ⚠️ Questionável
├── TEST_ISOLATION_ANALYSIS.md         ⚠️ Questionável
├── ISOLATION_CODE_EXAMPLES.md         ⚠️ Questionável
├── ISOLATION_VISUAL_GUIDE.md          ⚠️ Questionável

docs/:
├── testing/VALIDATION_GUIDE.md        ❌ Deveria ser lowercase
├── testing/TIME_SLOT_DISTRIBUTION.md  ❌ Deveria ser lowercase
├── troubleshooting/CORRECTION_SUMMARY.md ❌ Deveria ser lowercase
├── troubleshooting/ERROR_FIX_SUMMARY.md  ❌ Deveria ser lowercase
├── troubleshooting/CHECKLIST.md       ❌ Deveria ser lowercase
├── isolation/TEST_ISOLATION_ANALYSIS.md ❌ Deveria ser lowercase (redundante com raiz)
├── isolation/ISOLATION_CODE_EXAMPLES.md ❌ Deveria ser lowercase
├── isolation/ISOLATION_VISUAL_GUIDE.md  ❌ Deveria ser lowercase

tests/appointments/:
├── VALIDATION_TESTS.md                ❌ Deveria ser lowercase
├── QUICK_REFERENCE.md                 ❌ Deveria ser lowercase
├── INDEX.md                           ❌ Deveria ser lowercase
├── ERROR_CLEARING_TROUBLESHOOTING.md  ❌ Deveria ser lowercase
```

---

## ✅ Recomendações Específicas

### Nível 1: RAIZ do Projeto (✅ USE UPPERCASE)
```
README.md                    ✅ PADRÃO internacional
LICENSE                      ✅ PADRÃO internacional
CHANGELOG.md                 ✅ PADRÃO internacional
AUTHORS.md                   ✅ PADRÃO internacional
CONTRIBUTING.md              ✅ PADRÃO internacional
```

**Racional:** Documentação crítica e meta-informações do projeto devem ser visíveis e óbvias.

### Nível 2: ANÁLISES e RELATÓRIOS (⚠️ USE lowercase ou UPPERCASE com padrão)
```
FEATURE_COVERAGE_ANALYSIS.md     → coverage-analysis.md ✅
FILE_ORGANIZATION_ASSESSMENT.md  → file-organization.md ✅
TEST_ISOLATION_ANALYSIS.md       → test-isolation.md   ✅
```

**Racional:** Documentação técnica não é "meta", então lowercase é mais apropriado.

**EXCEÇÃO:** Se quer que se destaquem como "importantes", manter UPPERCASE é aceitável, mas seja consistente.

### Nível 3: DENTRO DE `docs/` (❌ USE lowercase)
```
docs/testing/
├── validation-guide.md           ✅ Melhor
├── time-slot-distribution.md     ✅ Melhor
│
docs/troubleshooting/
├── error-handling-guide.md       ✅ Melhor
├── correction-summary.md         ✅ Melhor
│
docs/isolation/
├── test-isolation-analysis.md    ✅ Melhor
├── code-examples.md              ✅ Melhor
```

**Racional:** Dentro de diretórios, lowercase + hífens criando hierarquia visual.

---

## 📏 Padrão Recomendado para PetCare

### Opção A: LAXO (Seu padrão atual adaptado)
```
✅ Usar UPPERCASE para:
- README.md (raiz)
- FEATURE_COVERAGE_ANALYSIS.md (raiz - análises críticas)
- CHANGELOG.md (se existir)

✅ Usar lowercase para:
- docs/testing/*.md
- docs/troubleshooting/*.md
- docs/isolation/*.md
```

### Opção B: RIGOROSO (Mais profissional)
```
✅ Usar UPPERCASE apenas para:
- README.md
- LICENSE
- CHANGELOG.md
- CONTRIBUTING.md

✅ Usar lowercase para TUDO mais:
- Análises: coverage-analysis.md
- Documentação: validation-guide.md
- Configs: .env.example, jest.config.js
```

---

## 🚀 Plano de Refactoring Recomendado

### Fase 1: Padronizar RAIZ (Mantendo clareza)

**Opção A (Menos radical - mantém seus arquivos):**
```bash
# Sem mudanças - seus arquivos na raiz estão OK
FILE_ORGANIZATION_ASSESSMENT.md (mantém)
FEATURE_COVERAGE_ANALYSIS.md (mantém)
```

**Opção B (Mais profissional - renomeia):**
```bash
# Conversão para consistency
FEATURE_COVERAGE_ANALYSIS.md → feature-coverage-analysis.md
FILE_ORGANIZATION_ASSESSMENT.md → file-organization-audit.md
TEST_ISOLATION_ANALYSIS.md → test-isolation-analysis.md
ISOLATION_CODE_EXAMPLES.md → isolation-code-examples.md
ISOLATION_VISUAL_GUIDE.md → isolation-visual-guide.md
```

### Fase 2: Padronizar `docs/` (Recomendado)

```bash
# Converter UPPERCASE → lowercase
docs/testing/VALIDATION_GUIDE.md → docs/testing/validation-guide.md
docs/testing/TIME_SLOT_DISTRIBUTION.md → docs/testing/time-slot-distribution.md
docs/troubleshooting/ERROR_FIX_SUMMARY.md → docs/troubleshooting/error-fix-summary.md
docs/troubleshooting/CORRECTION_SUMMARY.md → docs/troubleshooting/correction-summary.md
docs/troubleshooting/CHECKLIST.md → docs/troubleshooting/checklist.md
docs/isolation/TEST_ISOLATION_ANALYSIS.md → docs/isolation/test-isolation-analysis.md
docs/isolation/ISOLATION_CODE_EXAMPLES.md → docs/isolation/isolation-code-examples.md
docs/isolation/ISOLATION_VISUAL_GUIDE.md → docs/isolation/isolation-visual-guide.md
```

---

## 📊 Comparação: Padrões por Contexto

| Contexto | Recomendação | Exemplo |
|----------|---|---|
| **README (raiz)** | UPPERCASE | `README.md` ✅ |
| **Análises técnicas (raiz)** | UPPERCASE OK, lowercase melhor | `feature-coverage.md` ✅ ou `FEATURE_COVERAGE.md` ⚠️ |
| **Documentação em subdir** | **lowercase com hífens** | `docs/testing/validation-guide.md` ✅ |
| **Código-fonte** | **lowercase com hífens** | `src/pages/home.page.ts` ✅ |
| **Testes** | **lowercase com hífens** | `tests/appointments/create-appointment.spec.ts` ✅ |
| **Configs** | Varia (UPPERCASE é comum) | `.env`, `jest.config.js`, `tsconfig.json` |
| **Data/fixtures** | **lowercase** | `fixtures/user-data.json` ✅ |

---

## 🎯 Recomendação Final para PetCare

### Escolha Rápida

**Se quer: Simplicidade + Padrão Claro**
- ✅ Manter `README.md` em UPPERCASE (padrão)
- ✅ Converter análises em raiz → lowercase (ex: `feature-coverage-analysis.md`)
- ✅ Converter `docs/` → **lowercase com hífens** (ex: `validation-guide.md`)

**Resultado:**
```
README.md                          ✅ Permanece (padrão)
feature-coverage-analysis.md       ← Renomear
file-organization-audit.md         ← Renomear
test-isolation-analysis.md         ← Renomear
isolation-code-examples.md         ← Renomear
isolation-visual-guide.md          ← Renomear

docs/
├── testing/
│   ├── validation-guide.md        ← Renomear
│   └── time-slot-distribution.md  ← Renomear
├── troubleshooting/
│   ├── error-fix-summary.md       ← Renomear
│   ├── correction-summary.md      ← Renomear
│   └── checklist.md               ← Renomear
└── isolation/
    ├── test-isolation-analysis.md ← Renomear
    ├── isolation-code-examples.md ← Renomear
    └── isolation-visual-guide.md  ← Renomear
```

---

## 📝 Convenção para Documentar

**Adicione no `.github/copilot-instructions.md`:**

```markdown
## File Naming Conventions

### Uppercase (Meta/Critical Content)
- Root-level documentation: `README.md`, `LICENSE`, `CHANGELOG.md`
- High-level analyses at root: `FEATURE_*.md` (optional, for visibility)

### Lowercase with Hyphens (Standard)
- Subdirectory documentation: `docs/**/*.md`
- Technical guides: `validation-guide.md`, `error-handling.md`
- Test/source code: Always lowercase with hyphens or camelCase

### Examples
✅ `README.md` — Root documentation
✅ `docs/testing/validation-guide.md` — Subdirectory docs
✅ `feature-coverage-analysis.md` — Top-level analysis (optional UPPERCASE)
✅ `src/pages/home.page.ts` — Source code
❌ `VALIDATION_GUIDE.md` — Inside docs/ (use lowercase)
❌ `docs/ANALYSIS.md` — Inside docs/ (use lowercase)
```

---

## ✅ Conclusão

| Aspecto | Recomendação | Status Seu Projeto |
|---------|---|---|
| `README.md` em maiúsculas | ✅ OK | ✅ Correto |
| Análises em raiz em maiúsculas | ⚠️ Aceitável | ⚠️ Funciona, mas lowercase é melhor |
| Arquivos em `docs/` em maiúsculas | ❌ NÃO recomendado | ❌ Deveria converter |
| Código-fonte em minúsculas | ✅ OK | ✅ Correto |
| Hífens em nomes longos | ✅ Recomendado | ⚠️ Não usa (usa underscore+UPPERCASE) |

### Ação Recomendada: 🟡 MÉDIO
**Refatorar apenas `docs/` para lowercase** (11 arquivos)
- Rápido (~5 min com script)
- Melhora profissionalismo
- Segue convenção internacional

---

**Documento:** `docs/NAMING_CONVENTIONS.md` (após refactoring)
