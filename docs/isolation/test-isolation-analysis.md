# Análise de Isolamento de Testes - PetCare E2E

**Data da Análise:** 30/03/2026  
**Status:** ⚠️ Problemas críticos identificados

---

## 📊 Resumo Executivo

| Arquivo | Testes | Criam Dados? | Limpam? | Padrão | Status |
|---------|--------|----------|---------|--------|--------|
| `appointment-form-validation.spec.ts` | 19 | Parcial (últimos 4) | ❌ Não | Reset | 🔴 Crítico |
| `edit-appointment.spec.ts` | 5 | ✅ Sim (todos) | ❌ Não | Reset | 🔴 Crítico |
| `delete-appointment.spec.ts` | 4 | ✅ Sim (todos) | ✅ Via UI | UI Delete | 🟢 Bom |
| `search-appointment.spec.ts` | 7 | ✅ Sim (todos) | ✅ Via API | API | 🟢 Melhor |

**Conclusão:** Somente `search-appointment.spec.ts` e `delete-appointment.spec.ts` têm isolamento adequado. `validation` e `edit` deixam dados órfãos no banco.

---

## 🔴 Problemas Críticos

### 1. **appointment-form-validation.spec.ts** - Acúmulo de Dados

**Problema:**
- 4 testes (últimos da suite) criam agendamentos reais:
  - `deve aceitar telefone com ou sem formatação`
  - `deve permitir caracteres especiais no Nome do Pet`
  - `deve permitir edição após erro de validação`
  - (mais 1)
- Sem cleanup → agendamentos ficam acumulando no banco
- Com 19 testes × múltiplas runs → centenas de registros órfãos

**Efeito:**
```
Run 1: 4 agendamentos criados, não deletados
Run 2: 8 agendamentos acumulados
Run 10: 40+ agendamentos órfãos → lista fica lenta
```

**Linha problemática:**
```typescript
test.afterEach(async ({ page }) => {
  // ❌ Só reseta o gerenciador, NÃO deleta dados criados
  TimeSlotManager.reset()
})
```

---

### 2. **edit-appointment.spec.ts** - Todos os Testes Criam Dados

**Problema:**
- Todos os 5 testes criam agendamentos, editam, mas **nunca deletam**
- Nomes únicos por teste, mas sem cleanup no final
- `afterEach` só faz reset, não cleanup

**Testes problemáticos:**
```typescript
✗ 'deve editar serviço de agendamento de Banho para Tosa'
  → Cria: Rex-Edit-001, edita, deixa no banco

✗ 'deve editar múltiplos campos e validar todas as alterações'
  → Cria: Luna-Edit-002, edita, deixa no banco

✗ 'deve recuperar dados corretos em formulário de edição'
  → Cria: Bolt-Edit-003, edita, deixa no banco

... (mais 2)
```

**Efeito:**
```
Após 1 execução: 5 agendamentos órfãos
Após 10 execuções: 50+ agendamentos órfãos no banco
```

---

### 3. **appointment-form-validation.spec.ts** - Ordem de Execução

**Problema:**
```typescript
test.beforeAll(async () => {
  // ❌ Reseta ANTES de todos os testes
  TimeSlotManager.reset()
})

test.beforeEach(async ({ page }) => {
  // ✅ Autenticação ocorre aqui
})

test.afterEach(async () => {
  // ❌ NUNCA chamado por não haver afterEach explícito
  // Somente o beforeAll reseta ANTES de começar
})
```

**Efeito:**
- Um teste acumula "estado sujo" para o próximo
- TimeSlotManager não reseta entre testes (apenas antes de começar)
- Se usar getNextTime(), pode reusar horários

---

## 🟡 Problemas Secundários

### 4. **delete-appointment.spec.ts** - Cleanup Manual vs API

**Situação:**
- ✅ Deleta via UI (método `homePage.deleteAppointment()`)
- ✅ Funciona bem para os 4 testes
- ⚠️ Mas depende da UI estar funcionando
- ⚠️ Se o delete UI falhar silenciosamente, dados ficam órfãos

**Risco:**
```typescript
await homePage.deleteAppointment(secondPetName)
// Se a chamada falhar ou o dialog.accept() não funcionar,
// o agendamento NÃO será deletado
// Nenhum try/catch para validar sucesso do delete
```

---

### 5. **TimeSlotManager vs Data Fixa**

**Padrão ANTIGO (em validation e edit):**
```typescript
// Usa getNextTime() - mas qual é a data?
time: TimeSlotManager.getNextTime()

// Data é hardcoded - TODOS os testes podem usar MESMA data
date: '2026-04-15'  ← Mesmo para cada execução
date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
```

**Risco:**
- Se múltiplos testes criam agendamentos para mesma data + mesmo horário
- → Conflito no banco (chave única?)
- → Falha silenciosa ou erro

**Padrão NOVO (search):**
```typescript
// Data fixa: sempre 1 dia no futuro
const appointmentDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

// getNextTime() sequencial: 08:00, 09:00, 10:00 ... (sem conflitos)
time: TimeSlotManager.getNextTime()
```

✅ **Melhor porque:**
- Mesma data significa horas diferentes (via TimeSlotManager.getNextTime() cíclico)
- API cleanup remove tudo após → zero conflitos

---

## ✅ Melhor Prática Identificada: `search-appointment.spec.ts`

```typescript
test.describe('Busca de Agendamentos @search', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []

  test.beforeEach(async ({ page }) => {
    await test.step('Autenticar usuário', async () => {
      await AuthHelper.login(page)
    })
    
    homePage = new HomePage(page)
    apiHelper = new AppointmentApiHelper(page)
    await homePage.goto()
    createdAppointmentIds = []  // ✅ Reset array
  })

  test.afterEach(async () => {
    // ✅ API CLEANUP - Garante isolamento 100%
    if (createdAppointmentIds.length > 0) {
      await test.step('Limpar agendamentos criados durante o teste', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })

  test('deve buscar um agendamento específico entre vários', async () => {
    // ...
    
    // ✅ Captura IDs de TODOS os agendamentos criados
    const card = homePage.getAppointmentCard(petName)
    const id = await card.getAttribute('data-id')
    if (id) createdAppointmentIds.push(id)  // Armazena para cleanup
  })
})
```

**Vantagens:**
- ✅ Cleanup garantido via API (não depende da UI)
- ✅ Captura todos os IDs
- ✅ Isolamento 100% entre testes
- ✅ Escalável para paralelização

---

## 📋 Plano de Correção

### **Fase 1: Validação (BAIXA PRIORIDADE)**

Arquivo: `appointment-form-validation.spec.ts`

**Ação:**
```typescript
// ANTES - 4 testes criam dados sem limpeza
test.afterEach(async ({ page }) => {
  TimeSlotManager.reset()
})

// DEPOIS - Adicionar API cleanup para testes que criam dados
test.afterEach(async ({ page }) => {
  // Limpar agendamentos criados nos últimos 4 testes
  if (createdAppointmentIds.length > 0) {
    await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
  }
  TimeSlotManager.reset()
})
```

**Testes afetados:**
- `deve aceitar telefone com ou sem formatação`
- `deve permitir caracteres especiais no Nome do Pet`
- `deve permitir edição após erro de validação`
- (+1)

---

### **Fase 2: Edição (ALTA PRIORIDADE)** ⚠️

Arquivo: `edit-appointment.spec.ts`

**Problema:** Todos os 5 testes criam dados sem limpeza.

**Ação:**
```typescript
// 1. Adicionar imports
import { AppointmentApiHelper } from '../../src/helpers/api.helper'

// 2. Adicionar no describe
test.describe('Edição de Agendamentos @edit', () => {
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []

  test.beforeEach(async ({ page }) => {
    // ... outros steps ...
    apiHelper = new AppointmentApiHelper(page)
    createdAppointmentIds = []  // ✅ Reset array
  })

  test.afterEach(async ({ page }) => {
    // ✅ Adicionar cleanup
    if (createdAppointmentIds.length > 0) {
      await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
    }
    TimeSlotManager.reset()
  })

  test('deve editar serviço de agendamento de Banho para Tosa', async ({ page }) => {
    // ... criar agendamento ...
    
    // ✅ Capturar ID após criar
    const card = homePage.getAppointmentCard(petName)
    const id = await card.getAttribute('data-id')
    if (id) createdAppointmentIds.push(id)
    
    // ... resto do test ...
  })
})
```

**Todos os 5 testes precisam:**
1. Importar `AppointmentApiHelper`
2. Capturar ID do card: `const id = await card.getAttribute('data-id')`
3. Adicionar ao array: `if (id) createdAppointmentIds.push(id)`

---

### **Fase 3: Deleção (VERIFICAR)**

Arquivo: `delete-appointment.spec.ts`

**Status Atual:** ✅ Deleta via UI, parece funcionar

**Melhorias Opcionais:**
- Adicionar fallback API cleanup (caso delete UI falhe)
- Adicionar validação: confirmar que delete retornou sucesso

```typescript
// MELHORADO - Com validação + fallback
test.afterEach(async ({ page }) => {
  // Se algum teste falhar e deixar dados órfãos
  if (createdAppointmentIds.length > 0) {
    await test.step('Limpar fallback via API', async () => {
      await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
    })
  }
  TimeSlotManager.reset()
})
```

---

## 🎯 Checklist de Implementação

### Para `appointment-form-validation.spec.ts`:
- [ ] Adicionar import `AppointmentApiHelper`
- [ ] Adicionar no describe: `apiHelper` e `createdAppointmentIds`
- [ ] Atualizar `beforeEach` para inicializar `apiHelper` e array
- [ ] Atualizar `afterEach` para chamar `apiHelper.deleteMultipleAppointments()`
- [ ] Nos 4 testes que criam dados, capturar e armazenar IDs
- [ ] Testar: `npx playwright test tests/appointments/appointment-form-validation.spec.ts`

### Para `edit-appointment.spec.ts`:
- [ ] Mesmas mudanças acima
- [ ] **APLICAR A TODOS OS 5 TESTES** (não apenas alguns)
- [ ] Capturar ID imediatamente após `createAppointment()`
- [ ] Testar: `npx playwright test tests/appointments/edit-appointment.spec.ts`

### Para `delete-appointment.spec.ts`:
- [ ] Verificar se padrão de UI delete está funcionando
- [ ] Adicionar API cleanup como fallback (opcional mas recomendado)
- [ ] Documentar: "Deleta via UI, com fallback API"

### Validação Final:
- [ ] `npx playwright test tests/appointments/`
- [ ] Executar 3x consecutivas e verificar que 0 dados órfãos acumulam
- [ ] `http://localhost:3001` - verificar lista de agendamentos limpa

---

## 📝 Recomendações Finais

### Estratégia Unificada de Isolamento

**Padrão recomendado para TODO teste que cria dados:**

```typescript
test.describe('Feature @tag', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []

  test.beforeEach(async ({ page }) => {
    await AuthHelper.login(page)
    homePage = new HomePage(page)
    apiHelper = new AppointmentApiHelper(page)
    await homePage.goto()
    
    createdAppointmentIds = []  // ✅ Reset a cada teste
  })

  test.afterEach(async () => {
    // ✅ Cleanup garantido
    if (createdAppointmentIds.length > 0) {
      await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
    }
    TimeSlotManager.reset()
  })

  test('descrição do teste', async () => {
    const petName = 'Test-001'
    
    await test.step('Criar agendamento', async () => {
      await homePage.createAppointment(data)
      
      // ✅ Capturar ID
      const id = await homePage.getAppointmentCard(petName).getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })
    
    // ... resto do teste ...
  })
})
```

Esta estratégia garante:
- ✅ Zero dados órfãos
- ✅ Escalável para paralelização
- ✅ Independência entre testes
- ✅ Pode rodar N vezes sem acumular dados

---

## 📌 Próximos Passos

1. **Imediato:** Implementar Phase 2 (edit-appointment.spec.ts) - mais crítico
2. **Curto prazo:** Implementar Phase 1 (validation)
3. **Opcional:** Melhorar Phase 3 (delete) com fallback
4. **Documentação:** Adicionar este padrão à guia de contribuição
