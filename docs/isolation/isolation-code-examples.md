# Exemplos de Código - Padrão de Isolamento via API

## Pattern Padrão: Como Aplicar API Cleanup

### ✅ VALIDATION - Adicionar cleanup para 4 testes que criam dados

**Arquivo:** `appointment-form-validation.spec.ts`

**Passo 1: Adicionar imports**
```typescript
// No topo do arquivo
import { AppointmentApiHelper } from '../../src/helpers/api.helper'
```

**Passo 2: Adicionar variáveis no describe**
```typescript
test.describe('Validação do Formulário de Agendamento @validation', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper        // ← NOVO
  let createdAppointmentIds: (string | number)[] = []  // ← NOVO

  test.beforeEach(async ({ page }) => {
    await test.step('Autenticar usuário', async () => {
      await AuthHelper.login(page)
    })

    await test.step('Navegar para página inicial', async () => {
      homePage = new HomePage(page)
      apiHelper = new AppointmentApiHelper(page)  // ← NOVO
      await homePage.goto()
    })
    
    createdAppointmentIds = []  // ← NOVO - Reset a cada teste
  })

  test.afterEach(async () => {
    // ✅ ADICIONAR: Cleanup via API
    if (createdAppointmentIds.length > 0) {
      await test.step('Limpar agendamentos criados durante validação', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })
```

**Passo 3: Nos 4 testes que criam dados, capturar ID**

Estes 4 testes precisam ser atualizados:
- `deve aceitar telefone com ou sem formatação`
- `deve permitir caracteres especiais no Nome do Pet`
- `deve validar espaços em branco como campos vazios` (NÃO cria, já está OK)
- `deve permitir edição após erro de validação`

**Exemplo para "deve aceitar telefone com ou sem formatação":**

```typescript
test('deve aceitar telefone com ou sem formatação', async ({ page }) => {
  const petName = 'TestPet-Validation-Phone'  // ← NOVO - com nome único
  
  await test.step('Preencher formulário com telefone sem formatação', async () => {
    await homePage.appointmentForm.petNameInput.fill(petName)  // ← USAR petName
    await homePage.appointmentForm.ownerNameInput.fill('João Silva')
    await homePage.appointmentForm.phoneInput.fill('912345678')
    await homePage.appointmentForm.serviceSelect.selectOption('Banho')
    await homePage.appointmentForm.sizeSelect.selectOption('Médio')
    await homePage.appointmentForm.dateInput.fill('2026-04-15')
    await homePage.appointmentForm.timeSelect.selectOption(TimeSlotManager.getNextTime())
  })

  await test.step('Enviar formulário', async () => {
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/agendamentos') && 
                  response.request().method() === 'POST',
      { timeout: MEDIUM_TIMEOUT }
    )
    
    await homePage.appointmentForm.submitButton.click()
    
    // Verificar se a resposta foi bem-sucedida
    const response = await responsePromise
    expect([200, 201]).toContain(response.status())
  })

  await test.step('Verificar sucesso do agendamento', async () => {
    await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
  })
  
  // ✅ NOVO: Capturar ID para cleanup
  await test.step('Armazenar ID para cleanup', async () => {
    const card = homePage.getAppointmentCard(petName)
    const id = await card.getAttribute('data-id')
    if (id) createdAppointmentIds.push(id)
  })
})
```

**Exemplo para "deve permitir caracteres especiais no Nome do Pet":**

```typescript
test('deve permitir caracteres especiais no Nome do Pet', async ({ page }) => {
  const petName = 'TestPet-José-Validation'  // ← NOVO - nome único
  
  await test.step('Preencher formulário com nome com caracteres especiais', async () => {
    await homePage.appointmentForm.petNameInput.fill(petName)  // ← USAR petName
    await homePage.appointmentForm.ownerNameInput.fill('João Silva')
    await homePage.appointmentForm.phoneInput.fill('91234-5678')
    await homePage.appointmentForm.serviceSelect.selectOption('Banho')
    await homePage.appointmentForm.sizeSelect.selectOption('Médio')
    await homePage.appointmentForm.dateInput.fill('2026-04-15')
    await homePage.appointmentForm.timeSelect.selectOption(TimeSlotManager.getNextTime())
  })

  await test.step('Enviar formulário', async () => {
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/agendamentos') && 
                  response.request().method() === 'POST',
      { timeout: MEDIUM_TIMEOUT }
    )
    
    await homePage.appointmentForm.submitButton.click()
    
    const response = await responsePromise
    expect([200, 201]).toContain(response.status())
  })

  await test.step('Verificar sucesso do agendamento', async () => {
    await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
  })
  
  // ✅ NOVO: Capturar ID para cleanup
  await test.step('Armazenar ID para cleanup', async () => {
    const card = homePage.getAppointmentCard(petName)
    const id = await card.getAttribute('data-id')
    if (id) createdAppointmentIds.push(id)
  })
})
```

---

### ✅ EDIT - Aplicar API cleanup a todos os 5 testes

**Arquivo:** `edit-appointment.spec.ts`

**Passo 1: Adicionar imports e variáveis**
```typescript
import { AppointmentApiHelper } from '../../src/helpers/api.helper'  // ← NOVO

test.describe('Edição de Agendamentos @edit', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper                    // ← NOVO
  let createdAppointmentIds: (string | number)[] = []   // ← NOVO

  test.beforeEach(async ({ page }) => {
    await test.step('Autenticar usuário', async () => {
      await AuthHelper.login(page)
    })

    await test.step('Navegar para página inicial', async () => {
      homePage = new HomePage(page)
      apiHelper = new AppointmentApiHelper(page)  // ← NOVO
      await homePage.goto()
    })
    
    createdAppointmentIds = []  // ← NOVO
  })

  test.afterEach(async ({ page }) => {
    // ✅ NOVO: API cleanup
    if (createdAppointmentIds.length > 0) {
      await test.step('Limpar agendamentos da edição', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })
```

**Passo 2: Adicionar captura de ID (após criar agendamento)**

Exemplo para o primeiro teste:
```typescript
test('deve editar serviço de agendamento de Banho para Tosa', async ({ page }) => {
  const petName = 'Rex-Edit-001'
  const appointmentData = TestDataFactory.createAppointment({
    petName,
    service: 'Banho',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: TimeSlotManager.getNextTime()
  })

  await test.step('Criar agendamento inicial com serviço Banho', async () => {
    await homePage.createAppointment(appointmentData)
    await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    
    // ✅ NOVO: Capturar ID após criação bem-sucedida
    const card = homePage.getAppointmentCard(petName)
    const id = await card.getAttribute('data-id')
    if (id) createdAppointmentIds.push(id)
  })

  await test.step('Aguardar agendamento aparecer na lista', async () => {
    await homePage.waitForAppointmentToAppear(petName)
  })

  // ... resto do teste ...
})
```

**IMPORTANTE:** Aplicar este padrão a TODOS os 5 testes da suite!

---

### ✅ DELETE - Adicionar fallback API cleanup (OPCIONAL)

**Arquivo:** `delete-appointment.spec.ts`

```typescript
import { AppointmentApiHelper } from '../../src/helpers/api.helper'  // ← ADICIONAR

test.describe('Exclusão de Agendamentos @delete', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper                    // ← NOVO (opcional)
  let createdAppointmentIds: (string | number)[] = []   // ← NOVO (opcional)

  test.beforeEach(async ({ page }) => {
    await test.step('Autenticar usuário', async () => {
      await AuthHelper.login(page)
    })

    await test.step('Navegar para página inicial', async () => {
      homePage = new HomePage(page)
      apiHelper = new AppointmentApiHelper(page)  // ← NOVO (opcional)
      await homePage.goto()
    })
    
    createdAppointmentIds = []  // ← NOVO (opcional)
  })

  test.afterEach(async () => {
    // ✅ Fallback cleanup (em caso de delete UI falhar)
    if (createdAppointmentIds.length > 0) {
      await test.step('Limpar agendamentos não deletados via API', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })

  test('deve excluir agendamento do meio e manter os outros 2', async () => {
    // ... resto do teste ...
    
    await test.step('Criar primeiro agendamento', async () => {
      const firstAppointment = TestDataFactory.createAppointment({
        petName: firstPetName,
        // ...
      })
      await homePage.createAppointment(firstAppointment)
      // ✅ NOVO: Registrar para fallback cleanup
      const id = await homePage.getAppointmentCard(firstPetName).getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })
    
    // ... resto do teste ...
  })
})
```

---

## 📋 Checklist de Implementação

### Passo 1: Validação
- [ ] Adicionar import `AppointmentApiHelper`
- [ ] Adicionar `apiHelper` e `createdAppointmentIds` no describe
- [ ] Atualizar `beforeEach` e `afterEach`
- [ ] Atualizar 4 testes para capturar IDs
- [ ] Testar: `npx playwright test tests/appointments/appointment-form-validation.spec.ts`

### Passo 2: Edição
- [ ] Mesmas mudanças acima
- [ ] Atualizar TODOS os 5 testes para capturar IDs
- [ ] Testar: `npx playwright test tests/appointments/edit-appointment.spec.ts`

### Passo 3: Deleção (Opcional)
- [ ] Adicionar imports e variáveis
- [ ] Adicionar fallback cleanup no afterEach
- [ ] Testar: `npx playwright test tests/appointments/delete-appointment.spec.ts`

### Validação Final
- [ ] Executar suite completa: `npx playwright test tests/appointments/`
- [ ] Executar 3x consecutivas
- [ ] Verificar que 0 dados órfãos acumulam no banco
- [ ] Verificar lista no navegador (`http://localhost:3001`)

---

## 💡 Troubleshooting

**Erro: "Cannot read property 'getAttribute' of null"**
```typescript
// ❌ Errado: Card pode estar fora da viewport
const id = await homePage.getAppointmentCard(petName).getAttribute('data-id')

// ✅ Correto: Esperar elemento estar visível primeiro
await homePage.waitForAppointmentToAppear(petName)
const id = await homePage.getAppointmentCard(petName).getAttribute('data-id')
```

**Erro: "Appointment not found"**
```typescript
// Possível causa: Agendamento foi criado mas com petName diferente
// Verificar:
// 1. Nome usado na criação: TestDataFactory.createAppointment({ petName: 'Rex' })
// 2. Nome usado na captura: homePage.getAppointmentCard('Rex')  ← DEVE SER IGUAL

// Se usar nome dinâmico, armazenar em variável:
const petName = 'Test-' + Date.now()  // Único a cada teste
// ... usar petName em todos os lugares
```

**Erro: "API delete failed"**
```typescript
// Possível causa: IDs inválidos ou já deletados
// Verificar:
// 1. IDs foram capturados corretamente: `console.log(createdAppointmentIds)`
// 2. IDs são string ou number, não undefined
// 3. Não capturar mesmo ID 2x

// Solução: Adicionar validação
const id = await homePage.getAppointmentCard(petName).getAttribute('data-id')
if (id && id !== 'undefined') {  // ← Validação extra
  createdAppointmentIds.push(id)
}
```
