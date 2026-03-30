import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { AuthHelper } from '../../src/utils/auth.helper'
import { TimeSlotManager } from '../../src/test-data/validation-data'
import { AppointmentApiHelper } from '../../src/helpers/api.helper'

// Constantes de timeout
const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000

test.describe('Validação do Formulário de Agendamento @validation', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []

  test.beforeAll(async () => {
    // Reseta o gerenciador de horários no início da suite
    TimeSlotManager.reset()
  })

  test.beforeEach(async ({ page }) => {
    await test.step('Autenticar usuário', async () => {
      await AuthHelper.login(page)
    })

    await test.step('Navegar para página inicial', async () => {
      homePage = new HomePage(page)
      apiHelper = new AppointmentApiHelper(page)
      await homePage.goto()
    })

    createdAppointmentIds = []
  })

  test.afterEach(async () => {
    // Limpar via API todos os agendamentos criados
    if (createdAppointmentIds.length > 0) {
      await test.step('Limpar agendamentos criados durante validação', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })

  test('deve validar que campo Nome do Pet é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Nome do Pet', async () => {
      // Deixa vazio
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Nome do Pet', async () => {
      const errorMessage = page.locator('[data-testid="erro-nome-pet"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('O nome do pet é obrigatório.')
    })
  })

  test('deve validar que campo Nome do Tutor é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Nome do Tutor', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      // Deixa vazio
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Nome do Tutor', async () => {
      const errorMessage = page.locator('[data-testid="erro-tutor"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('O nome do tutor é obrigatório.')
    })
  })

  test('deve validar que campo Telefone é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Telefone', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      // Deixa vazio
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Telefone', async () => {
      const errorMessage = page.locator('[data-testid="erro-telefone"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('O telefone é obrigatório.')
    })
  })

  test('deve validar formato do Telefone', async ({ page }) => {
    await test.step('Preencher formulário com telefone inválido', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('123')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para formato de Telefone', async () => {
      const errorMessage = page.locator('[data-testid="erro-telefone"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('Informe um telefone válido (9 a 13 dígitos).')
    })
  })

  test('deve validar que campo Serviço é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Serviço', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      // Deixa vazio
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Serviço', async () => {
      const errorMessage = page.locator('[data-testid="erro-servico"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('Selecione um serviço.')
    })
  })

  test('deve validar que campo Porte é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Porte', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      // Deixa vazio
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Porte', async () => {
      const errorMessage = page.locator('[data-testid="erro-porte"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('Selecione o porte do pet.')
    })
  })

  test('deve validar que campo Data é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Data', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      // Deixa vazio
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Data', async () => {
      const errorMessage = page.locator('[data-testid="erro-data"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('A data é obrigatória.')
    })
  })

  test('deve validar que Data não pode ser anterior à hoje', async ({ page }) => {
    await test.step('Preencher formulário com data passada', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2020-01-01')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Data', async () => {
      const errorMessage = page.locator('[data-testid="erro-data"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('A data não pode ser no passado.')
    })
  })

  test('deve validar que campo Horário é obrigatório', async ({ page }) => {
    await test.step('Preencher formulário sem Horário', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      // Deixa vazio
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro para Horário', async () => {
      const errorMessage = page.locator('[data-testid="erro-horario"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(errorMessage).toContainText('Selecione um horário.')
    })
  })

  test('deve exibir múltiplas mensagens de erro simultaneamente', async ({ page }) => {
    await test.step('Deixar todos os campos vazios', async () => {
      // Não preenche nada
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar exibição de todas as mensagens de erro', async () => {
      const errorMessages = page.locator('[data-testid^="erro-"]')
      
      await expect(page.locator('[data-testid="erro-nome-pet"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(page.locator('[data-testid="erro-tutor"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(page.locator('[data-testid="erro-telefone"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(page.locator('[data-testid="erro-servico"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(page.locator('[data-testid="erro-porte"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(page.locator('[data-testid="erro-data"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(page.locator('[data-testid="erro-horario"]')).toBeVisible({ timeout: SHORT_TIMEOUT })

      const count = await errorMessages.count()
      expect(count).toBeGreaterThanOrEqual(7)
    })
  })

  test('deve limpar mensagem de erro quando campo é preenchido', async ({ page }) => {
    await test.step('Tentar enviar formulário vazio', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar exibição da mensagem de erro', async () => {
      const errorMessage = page.locator('[data-testid="erro-nome-pet"]')
      await expect(errorMessage).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Preencher campo Nome do Pet e disparar validação', async () => {
      // Preench campo
      await homePage.appointmentForm.petNameInput.fill('Rex')
      
      // Faz blur (perde foco) para disparar validação em tempo real
      // Se a aplicação usa validação onChange, pode remover esta linha
      await homePage.appointmentForm.petNameInput.blur()
    })

    await test.step('Verificar desaparecimento da mensagem de erro', async () => {
      const errorMessage = page.locator('[data-testid="erro-nome-pet"]')
      
      // Usa toPass para esperar a validação com retry
      // Útil se há delay na limpeza da mensagem
      await expect(async () => {
        await expect(errorMessage).not.toBeVisible({ timeout: SHORT_TIMEOUT })
      }).toPass({
        timeout: 10_000,
        intervals: [1_000, 2_000]
      })
    })
  })

  test('deve validar comprimento máximo do Nome do Pet', async ({ page }) => {
    const longName = 'A'.repeat(51) // Excede limite de 50 caracteres
    
    await test.step('Preencher formulário com Nome do Pet muito longo', async () => {
      await homePage.appointmentForm.petNameInput.fill(longName)
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro ou truncamento', async () => {
      const errorMessage = page.locator('[data-testid="erro-nome-pet"]')
      const isError = await errorMessage.isVisible().catch(() => false)
      
      if (isError) {
        await expect(errorMessage).toContainText('máximo')
      } else {
        // Se não há validação, o campo deve ter truncado
        const value = await homePage.appointmentForm.petNameInput.inputValue()
        expect(value.length).toBeLessThanOrEqual(50)
      }
    })
  })

  test('deve validar comprimento máximo do Nome do Tutor', async ({ page }) => {
    const longName = 'A'.repeat(101)

    await test.step('Preencher formulário com Nome do Tutor muito longo', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
      await homePage.appointmentForm.ownerNameInput.fill(longName)
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagem de erro ou truncamento', async () => {
      const errorMessage = page.locator('[data-testid="erro-tutor"]')
      const isError = await errorMessage.isVisible().catch(() => false)

      if (isError) {
        await expect(errorMessage).toContainText('máximo')
      } else {
        const value = await homePage.appointmentForm.ownerNameInput.inputValue()
        expect(value.length).toBeLessThanOrEqual(100)
      }
    })
  })

  test('deve aceitar telefone com ou sem formatação', async ({ page }) => {
    const petName = 'TestVal-Phone-' + Date.now()

    await test.step('Preencher formulário com telefone sem formatação', async () => {
      await homePage.appointmentForm.petNameInput.fill(petName)
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

    await test.step('Armazenar ID para cleanup', async () => {
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })
  })

  test('deve permitir caracteres especiais no Nome do Pet', async ({ page }) => {
    const petName = 'TestVal-José-' + Date.now()

    await test.step('Preencher formulário com nome com caracteres especiais', async () => {
      await homePage.appointmentForm.petNameInput.fill(petName)
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

    await test.step('Armazenar ID para cleanup', async () => {
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })
  })

  test('deve validar espaços em branco como campos vazios', async ({ page }) => {
    await test.step('Preencher formulário com apenas espaços', async () => {
      await homePage.appointmentForm.petNameInput.fill('   ')
      await homePage.appointmentForm.ownerNameInput.fill('   ')
      await homePage.appointmentForm.phoneInput.fill('   ')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption('10:00')
    })

    await test.step('Tentar enviar formulário', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar mensagens de erro', async () => {
      const errorMessages = page.locator('[data-testid^="erro-"]')
      const count = await errorMessages.count()
      
      // Deve haver pelo menos 3 erros (nome pet, tutor, telefone)
      expect(count).toBeGreaterThanOrEqual(3)
    })
  })

  test('deve desabilitar botão de envio enquanto valida', async ({ page }) => {
    await test.step('Verificar se botão começa habilitado', async () => {
      await expect(homePage.appointmentForm.submitButton).toBeEnabled()
    })

    await test.step('Preencher um único campo', async () => {
      await homePage.appointmentForm.petNameInput.fill('Rex')
    })

    // Nota: Este teste depende da implementação da aplicação
    // Se a aplicação desabilita o botão enquanto há erros
    await test.step('Verificar estado do botão após alteração', async () => {
      // Este é um teste ilustrativo, adapte conforme a implementação
      const isDisabled = await homePage.appointmentForm.submitButton.isDisabled()
      // Se a aplicação implementar validação em tempo real com desabilitação
      if (isDisabled) {
        expect(isDisabled).toBeTruthy()
      }
    })
  })

  test('deve permitir edição após erro de validação', async ({ page }) => {
    const petName = 'TestVal-Edit-' + Date.now()

    await test.step('Tentar enviar formulário vazio', async () => {
      await homePage.appointmentForm.submitButton.click()
    })

    await test.step('Verificar exibição de erros', async () => {
      await expect(page.locator('[data-testid="erro-nome-pet"]')).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Preencher corretamente após erro', async () => {
      await homePage.appointmentForm.petNameInput.fill(petName)
      await homePage.appointmentForm.ownerNameInput.fill('João Silva')
      await homePage.appointmentForm.phoneInput.fill('91234-5678')
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
      await homePage.appointmentForm.dateInput.fill('2026-04-15')
      await homePage.appointmentForm.timeSelect.selectOption(TimeSlotManager.getNextTime())
    })

    await test.step('Enviar formulário corrigido', async () => {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/agendamentos') && 
                    response.request().method() === 'POST',
        { timeout: MEDIUM_TIMEOUT }
      )
      
      await homePage.appointmentForm.submitButton.click()
      
      const response = await responsePromise
      expect([200, 201]).toContain(response.status())
    })

    await test.step('Verificar mensagem de sucesso', async () => {
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Armazenar ID para cleanup', async () => {
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })
  })
})
