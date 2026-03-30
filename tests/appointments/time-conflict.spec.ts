import { test, expect } from '@playwright/test'
import { AuthHelper } from '../../src/utils/auth.helper'
import { HomePage } from '../../src/pages/home.page'
import { AppointmentApiHelper } from '../../src/helpers/api.helper'
import { TestDataFactory } from '../../src/utils/test-data.factory'

const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000
const LONG_TIMEOUT = 30_000

test.describe('Detecção de Conflito de Horário @time-conflict', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []

  test.beforeEach(async ({ page }) => {
    await AuthHelper.login(page)
    homePage = new HomePage(page)
    apiHelper = new AppointmentApiHelper(page)
    await homePage.goto()
    createdAppointmentIds = []
  })

  test.afterEach(async () => {
    if (createdAppointmentIds.length > 0) {
      await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
    }
  })

  test('deve bloquear agendamento duplicado no mesmo horário', async ({ page }) => {
    const conflictDate =
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const conflictTime = '14:00'

    const firstAppointment = TestDataFactory.createAppointment({
      petName: `Pet-FirstSlot-${Date.now()}`,
      date: conflictDate,
      time: conflictTime,
    })

    const secondAppointment = TestDataFactory.createAppointment({
      petName: `Pet-SecondSlot-${Date.now()}`,
      date: conflictDate,
      time: conflictTime,
    })

    await test.step('Criar primeiro agendamento no horário 14:00', async () => {
      const responsePromise = page.waitForResponse(
        (res) =>
          res.url().includes('/agendamentos') &&
          res.request().method() === 'POST' &&
          [200, 201].includes(res.status()),
        { timeout: LONG_TIMEOUT }
      )

      await homePage.createAppointment(firstAppointment)

      const response = await responsePromise
      expect([200, 201]).toContain(response.status())

      // Aguarda o card aparecer
      await homePage.waitForAppointmentToAppear(firstAppointment.petName)

      // Extrai ID do primeiro agendamento
      const card = homePage.getAppointmentCard(firstAppointment.petName)
      const id = await card.getAttribute('data-id')
      if (id) {
        createdAppointmentIds.push(id)
      }
    })

    await test.step('Tentar criar segundo agendamento no mesmo horário', async () => {
      // Aguarda que o formulário esteja pronto para nova criação
      // (ou abre novo form se necessário)
      const initialCount = await homePage.getAppointmentsCount()

      try {
        // Tenta criar o segundo agendamento
        const responsePromise = page.waitForResponse(
          (res) =>
            res.url().includes('/agendamentos') &&
            res.request().method() === 'POST',
          { timeout: LONG_TIMEOUT }
        )

        await homePage.createAppointment(secondAppointment)

        const response = await responsePromise
        const status = response.status()

        // Valida que a requisição foi rejeitada (4xx ou 5xx)
        if ([200, 201].includes(status)) {
          // Se a criação foi aceita no server, verifica se há mensagem de erro
          // ou se a lista não atualiza
          const errorMessage = page.locator('[role="alert"]')
          const isErrorVisible = await errorMessage.isVisible({ timeout: SHORT_TIMEOUT }).catch(
            () => false
          )

          if (!isErrorVisible) {
            // Se não há erro visível, verifica a contagem de itens
            const finalCount = await homePage.getAppointmentsCount()
            expect(finalCount).toBe(initialCount)
          }
        } else {
          // Validar que foi erro (conflict, bad request, etc)
          expect([400, 409, 422]).toContain(status)
        }
      } catch (error: any) {
        // Se a requisição falhar no waitFor, pode ser que o server rejeitou
        if (error.message.includes('Timeout')) {
          // Timeout pode significar que o form não estava pronto ou error message apareceu
          const errorMessage = page.locator('[role="alert"]')
          const isErrorVisible = await errorMessage.isVisible({ timeout: SHORT_TIMEOUT }).catch(
            () => false
          )

          if (!isErrorVisible) {
            throw error
          }
        } else {
          throw error
        }
      }
    })

    await test.step('Verificar que conflito foi bloqueado (lista não aumentou)', async () => {
      // Aguarda estabilização da página
      await page.waitForTimeout(1000)

      // Verifica que segundo pet NÃO aparece na lista
      const secondCard = homePage.getAppointmentCard(secondAppointment.petName)
      await expect(secondCard).toHaveCount(0)

      // Verifica que primeiro pet ainda está lá
      const firstCard = homePage.getAppointmentCard(firstAppointment.petName)
      await expect(firstCard).toHaveCount(1)
    })
  })
})
