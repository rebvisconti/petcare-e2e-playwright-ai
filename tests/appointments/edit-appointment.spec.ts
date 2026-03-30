import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { AuthHelper } from '../../src/utils/auth.helper'
import { TestDataFactory, SERVICES } from '../../src/utils/test-data.factory'
import { TimeSlotManager } from '../../src/test-data/validation-data'
import { AppointmentApiHelper } from '../../src/helpers/api.helper'

// Constantes de timeout
const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000
const LONG_TIMEOUT = 30_000

// Função helper para converter nome de serviço em seu valor inputValue
function getServiceValue(displayName: string): string {
  const valueMap: Record<string, string> = {
    'Banho': 'banho',
    'Tosa': 'tosa',
    'Banho + Tosa': 'banho-tosa'
  }
  return valueMap[displayName] ?? displayName.toLowerCase().replace(/\s+/g, '-')
}

test.describe('Edição de Agendamentos @edit', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []

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
      await test.step('Limpar agendamentos criados durante edição', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })

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
      
      // Capturar ID para cleanup
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Aguardar agendamento aparecer na lista', async () => {
      await homePage.waitForAppointmentToAppear(petName)
    })

    await test.step('Abrir formulário de edição', async () => {
      await homePage.editAppointment(petName)
      // Espera o formulário carregar em modo edição
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Verificar que os dados estão pré-preenchidos', async () => {
      const serviceValue = await homePage.appointmentForm.serviceSelect.inputValue()
      expect(serviceValue).toBe('banho')
    })

    await test.step('Alterar serviço para Tosa', async () => {
      await homePage.appointmentForm.serviceSelect.selectOption('Tosa')
      
      // Verifica que a alteração foi feita
      const newServiceValue = await homePage.appointmentForm.serviceSelect.inputValue()
      expect(newServiceValue).toBe('tosa')
    })

    await test.step('Submeter alteração', async () => {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/agendamentos') && 
                    response.request().method() === 'PUT',
        { timeout: LONG_TIMEOUT }
      )
      
      await homePage.appointmentForm.submitButton.click()
      await responsePromise
    })

    await test.step('Validar mensagem de sucesso', async () => {
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Voltar para lista e verificar atualização', async () => {
      await page.goto('/index.html')
      await homePage.waitForAppointmentToAppear(petName)
    })

    await test.step('Abrir agendamento novamente para confirmar mudança', async () => {
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      const serviceValue = await homePage.appointmentForm.serviceSelect.inputValue()
      expect(serviceValue).toBe('tosa')
    })
  })

  test('deve editar múltiplos campos e validar todas as alterações', async ({ page }) => {
    const petName = 'Luna-Edit-002'
    const appointmentData = TestDataFactory.createAppointment({
      petName,
      service: 'Banho',
      size: 'Pequeno',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: TimeSlotManager.getNextTime()
    })

    await test.step('Criar agendamento com configuração inicial', async () => {
      await homePage.createAppointment(appointmentData)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para cleanup
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Aguardar agendamento aparecer na lista', async () => {
      await homePage.waitForAppointmentToAppear(petName)
    })

    await test.step('Abrir para edição', async () => {
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Alterar serviço de Banho para Banho + Tosa', async () => {
      const currentService = await homePage.appointmentForm.serviceSelect.inputValue()
      expect(currentService).toBe('banho')
      
      await homePage.appointmentForm.serviceSelect.selectOption('Banho + Tosa')
    })

    await test.step('Alterar porte de Pequeno para Médio', async () => {
      const currentSize = await homePage.appointmentForm.sizeSelect.inputValue()
      expect(currentSize).toBe('pequeno')
      
      await homePage.appointmentForm.sizeSelect.selectOption('Médio')
    })

    await test.step('Submeter múltiplas alterações', async () => {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/agendamentos') && 
                    response.request().method() === 'PUT',
        { timeout: LONG_TIMEOUT }
      )
      
      await homePage.appointmentForm.submitButton.click()
      await responsePromise
    })

    await test.step('Confirmar sucesso da edição', async () => {
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Validar todas as alterações foram persistidas', async () => {
      await page.goto('/index.html')
      await homePage.waitForAppointmentToAppear(petName)
      
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      const finalService = await homePage.appointmentForm.serviceSelect.inputValue()
      const finalSize = await homePage.appointmentForm.sizeSelect.inputValue()
      
      expect(finalService).toBe('banho-tosa')
      expect(finalSize).toBe('medio')
    })
  })

  test('deve recuperar dados corretos em formulário de edição', async ({ page }) => {
    const petName = 'Bolt-Edit-003'
    const ownerName = 'João Silva'
    const phoneNumber = '91234-5678'
    
    const appointmentData = TestDataFactory.createAppointment({
      petName,
      ownerName,
      phone: phoneNumber,
      service: 'Tosa',
      size: 'Grande',
      date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: TimeSlotManager.getNextTime()
    })

    await test.step('Criar agendamento com dados específicos', async () => {
      await homePage.createAppointment(appointmentData)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para cleanup
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Abrir agendamento para edição', async () => {
      await homePage.waitForAppointmentToAppear(petName)
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Validar que todos os campos estão pré-preenchidos corretamente', async () => {
      const petNameValue = await homePage.appointmentForm.petNameInput.inputValue()
      const ownerNameValue = await homePage.appointmentForm.ownerNameInput.inputValue()
      const phoneValue = await homePage.appointmentForm.phoneInput.inputValue()
      const serviceValue = await homePage.appointmentForm.serviceSelect.inputValue()
      const sizeValue = await homePage.appointmentForm.sizeSelect.inputValue()
      
      expect(petNameValue).toBe(petName)
      expect(ownerNameValue).toBe(ownerName)
      expect(phoneValue).toBe(phoneNumber)
      expect(serviceValue).toBe('tosa')
      expect(sizeValue).toBe('grande')
    })

    await test.step('Fazer pequena alteração (serviço)', async () => {
      await homePage.appointmentForm.serviceSelect.selectOption('Banho')
    })

    await test.step('Submeter e validar', async () => {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/agendamentos') && 
                    response.request().method() === 'PUT',
        { timeout: LONG_TIMEOUT }
      )
      
      await homePage.appointmentForm.submitButton.click()
      await responsePromise
    })

    await test.step('Confirmar que apenas serviço foi alterado', async () => {
      await page.goto('/index.html')
      await homePage.waitForAppointmentToAppear(petName)
      await homePage.editAppointment(petName)
      
      const petNameValue = await homePage.appointmentForm.petNameInput.inputValue()
      const serviceValue = await homePage.appointmentForm.serviceSelect.inputValue()
      
      expect(petNameValue).toBe(petName)
      expect(serviceValue).toBe('banho')
    })
  })

  test('deve cancelar edição sem salvar mudanças', async ({ page }) => {
    const petName = 'Max-Edit-004'
    const appointmentData = TestDataFactory.createAppointment({
      petName,
      service: 'Banho',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: TimeSlotManager.getNextTime()
    })

    await test.step('Criar agendamento inicial', async () => {
      await homePage.createAppointment(appointmentData)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para cleanup
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Abrir edição', async () => {
      await homePage.waitForAppointmentToAppear(petName)
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Fazer alteração', async () => {
      await homePage.appointmentForm.serviceSelect.selectOption('Tosa')
      
      const newValue = await homePage.appointmentForm.serviceSelect.inputValue()
      expect(newValue).toBe('tosa')
    })

    await test.step('Cancelar edição', async () => {
      await homePage.appointmentForm.cancel()
      await page.waitForURL('**/index.html', { timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Reabrir agendamento e validar que não foi alterado', async () => {
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      const serviceValue = await homePage.appointmentForm.serviceSelect.inputValue()
      expect(serviceValue).toBe('banho') // Deve ser igual ao original
    })
  })

  test('deve validar que todas as alterações de serviço estão disponíveis', async ({ page }) => {
    const petName = 'Bella-Edit-005'
    const appointmentData = TestDataFactory.createAppointment({
      petName,
      service: 'Banho',
      date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: TimeSlotManager.getNextTime()
    })

    await test.step('Criar agendamento inicial', async () => {
      await homePage.createAppointment(appointmentData)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para cleanup
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Abrir para edição', async () => {
      await homePage.waitForAppointmentToAppear(petName)
      await homePage.editAppointment(petName)
      await expect(homePage.appointmentForm.submitButton).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })

    await test.step('Validar que todas as opções de serviço estão disponíveis', async () => {
      const options = await homePage.appointmentForm.serviceSelect.locator('option').allTextContents()
      const expectedServices = ['Banho', 'Tosa', 'Banho + Tosa']
      
      expectedServices.forEach(service => {
        expect(options).toContain(service)
      })
    })

    await test.step('Alternar entre diferentes serviços', async () => {
      for (const service of SERVICES) {
        await homePage.appointmentForm.serviceSelect.selectOption(service)
        
        const selectedValue = await homePage.appointmentForm.serviceSelect.inputValue()
        const expectedValue = getServiceValue(service)
        expect(selectedValue).toBe(expectedValue)
      }
    })
  })
})
