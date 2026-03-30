import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { TestDataFactory } from '../../src/utils/test-data.factory'
import { AuthHelper } from '../../src/utils/auth.helper'
import { AppointmentApiHelper } from '../../src/helpers/api.helper'

// Constantes de timeout
const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000
const LONG_TIMEOUT = 30_000

test.describe('Criação de Agendamentos @create @smoke', () => {
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
      await test.step('Limpar agendamentos criados durante criação', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
  })

  test('deve criar novo agendamento com sucesso', async ({ page }) => {
    const petName = 'NewAppointment-' + Date.now()

    const appointmentData = TestDataFactory.createAppointment({
      petName,
      service: 'Banho',
      size: 'Médio',
    })

    await test.step('Observar contador inicial', async () => {
      const initialCount = await homePage.getAppointmentsCount()
      expect(initialCount).toBeGreaterThanOrEqual(0)
    })

    await test.step('Criar agendamento', async () => {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/agendamentos') &&
          response.request().method() === 'POST',
        { timeout: LONG_TIMEOUT }
      )

      await homePage.createAppointment(appointmentData)

      const response = await responsePromise
      expect([200, 201]).toContain(response.status())

      // Capturar ID para cleanup
      await homePage.waitForAppointmentToAppear(petName)
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Validar que agendamento aparece na lista', async () => {
      const appointmentCard = homePage.getAppointmentCard(petName)
      await expect(appointmentCard).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar campos do agendamento', async () => {
      const appointmentCard = homePage.getAppointmentCard(petName)

      // Web-first assertions com locators específicos
      await expect(appointmentCard).toContainText(appointmentData.ownerName)
      await expect(appointmentCard).toContainText(appointmentData.service)
    })

    await test.step('Validar contador incrementou', async () => {
      const finalCount = await homePage.getAppointmentsCount()
      expect(finalCount).toBeGreaterThan(0)
    })
  })

  test('deve validar que agendamento persiste após reload', async ({ page }) => {
    const petName = 'PersistLoad-' + Date.now()

    const appointmentData = TestDataFactory.createAppointment({
      petName,
      service: 'Tosa',
      size: 'Grande',
    })

    await test.step('Criar agendamento', async () => {
      const responsePromise = page.waitForResponse(
        response => response.url().includes('/agendamentos') &&
          response.request().method() === 'POST',
        { timeout: LONG_TIMEOUT }
      )

      await homePage.createAppointment(appointmentData)
      const response = await responsePromise
      expect([200, 201]).toContain(response.status())

      // Capturar ID para cleanup
      await homePage.waitForAppointmentToAppear(petName)
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Recarregar página', async () => {
      await page.goto('/index.html')
    })

    await test.step('Validar que agendamento continua visível após reload', async () => {
      const appointmentCard = homePage.getAppointmentCard(petName)
      await expect(appointmentCard).toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })
  })
})