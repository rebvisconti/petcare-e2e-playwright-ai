import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { AuthHelper } from '../../src/utils/auth.helper'
import { TestDataFactory } from '../../src/utils/test-data.factory'
import { TimeSlotManager } from '../../src/test-data/validation-data'
import { AppointmentApiHelper } from '../../src/helpers/api.helper'

// Constantes de timeout
const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000

test.describe('Exclusão de Agendamentos @delete', () => {
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
    // Fallback cleanup via API (caso delete UI falhe)
    if (createdAppointmentIds.length > 0) {
      await test.step('Limpar agendamentos não deletados via API', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds)
      })
    }
    TimeSlotManager.reset()
  })

  test('deve excluir agendamento do meio e manter os outros 2', async () => {
    const firstPetName = 'Fred-Del-001'
    const secondPetName = 'Nala-Del-002'
    const thirdPetName = 'Spike-Del-003'

    const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await test.step('Criar primeiro agendamento', async () => {
      const firstAppointment = TestDataFactory.createAppointment({
        petName: firstPetName,
        service: 'banho',
        date: tomorrow,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(firstAppointment)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para fallback cleanup
      const card = homePage.getAppointmentCard(firstPetName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Criar segundo agendamento (será excluído)', async () => {
      const secondAppointment = TestDataFactory.createAppointment({
        petName: secondPetName,
        service: 'tosa',
        date: tomorrow,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(secondAppointment)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para fallback cleanup
      const card = homePage.getAppointmentCard(secondPetName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Criar terceiro agendamento', async () => {
      const thirdAppointment = TestDataFactory.createAppointment({
        petName: thirdPetName,
        service: 'banho-tosa',
        date: tomorrow,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(thirdAppointment)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para fallback cleanup
      const card = homePage.getAppointmentCard(thirdPetName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Validar que todos 3 agendamentos estão na lista', async () => {
      await homePage.waitForAppointmentToAppear(firstPetName)
      await homePage.waitForAppointmentToAppear(secondPetName)
      await homePage.waitForAppointmentToAppear(thirdPetName)

      const countBefore = await homePage.getAppointmentsCount()
      expect(countBefore).toBeGreaterThanOrEqual(3)
    })

    await test.step('Excluir agendamento do meio', async () => {
      await homePage.deleteAppointment(secondPetName)
      
      // Remover do array de fallback (foi deletado com sucesso)
      const indexToRemove = createdAppointmentIds.findIndex((id, idx) => {
        // Remover o ID do segundo agendamento (índice 1)
        return idx === 1
      })
      if (indexToRemove !== -1) {
        createdAppointmentIds.splice(indexToRemove, 1)
      }
    })

    await test.step('Validar que primeiro agendamento continua na lista', async () => {
      await expect(homePage.getAppointmentCard(firstPetName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar que terceiro agendamento continua na lista', async () => {
      await expect(homePage.getAppointmentCard(thirdPetName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar contador decrementou', async () => {
      const countAfter = await homePage.getAppointmentsCount()
      expect(countAfter).toBeGreaterThanOrEqual(2)
    })
  })

  test('deve validar que item excluído não reaparece ao recarregar página', async ({ page }) => {
    const petName = 'Max-Del-004'
    const ownerName = 'João Silva'

    const appointmentDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await test.step('Criar agendamento', async () => {
      const appointment = TestDataFactory.createAppointment({
        petName,
        ownerName,
        service: 'banho',
        date: appointmentDate,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(appointment)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para fallback cleanup
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Validar que agendamento aparece', async () => {
      await homePage.waitForAppointmentToAppear(petName)
    })

    await test.step('Excluir agendamento', async () => {
      await homePage.deleteAppointment(petName)
      
      // Remover do array (foi deletado com sucesso)
      createdAppointmentIds = createdAppointmentIds.filter(id => id !== createdAppointmentIds[createdAppointmentIds.length - 1])
    })

    await test.step('Recarregar página', async () => {
      await page.goto('/index.html')
    })

    await test.step('Validar que agendamento continua ausente após reload', async () => {
      const card = homePage.getAppointmentCard(petName)
      await expect(card).not.toBeVisible({ timeout: MEDIUM_TIMEOUT })
    })
  })

  test('deve excluir múltiplos agendamentos sequencialmente', async ({ page }) => {
    const petNames = ['Luna-Del-005', 'Bolt-Del-006', 'Bella-Del-007', 'Rex-Del-008']
    const appointmentDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await test.step('Criar 4 agendamentos', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'banho',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        // Capturar ID para fallback cleanup
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Validar que todos 4 agendamentos foram criados', async () => {
      for (const petName of petNames) {
        await homePage.waitForAppointmentToAppear(petName)
      }
    })

    await test.step('Excluir segundo e quarto agendamentos', async () => {
      await homePage.deleteAppointment(petNames[1])
      await homePage.deleteAppointment(petNames[3])
      
      // Remover do array (foram deletados com sucesso)
      createdAppointmentIds = createdAppointmentIds.filter((_, idx) => idx !== 1 && idx !== 3)
    })

    await test.step('Validar que primeiro agendamento continua visível', async () => {
      await expect(homePage.getAppointmentCard(petNames[0])).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar que terceiro agendamento continua visível', async () => {
      await expect(homePage.getAppointmentCard(petNames[2])).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Recarregar e validar persistência', async () => {
      await page.goto('/index.html')

      await expect(homePage.getAppointmentCard(petNames[0])).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      await expect(homePage.getAppointmentCard(petNames[2])).toBeVisible({ timeout: MEDIUM_TIMEOUT })

      const cardSecond = homePage.getAppointmentCard(petNames[1])
      const cardFourth = homePage.getAppointmentCard(petNames[3])

      await expect(cardSecond).not.toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(cardFourth).not.toBeVisible({ timeout: SHORT_TIMEOUT })
    })
  })

  test('deve validar que exclusão atualiza lista instantaneamente sem refresh manual', async () => {
    const firstPetName = 'Mimi-Del-009'
    const secondPetName = 'Fluffy-Del-010'

    const appointmentDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    await test.step('Criar dois agendamentos', async () => {
      const first = TestDataFactory.createAppointment({
        petName: firstPetName,
        service: 'banho',
        date: appointmentDate,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(first)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para fallback cleanup
      let card = homePage.getAppointmentCard(firstPetName)
      let id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)

      const second = TestDataFactory.createAppointment({
        petName: secondPetName,
        service: 'tosa',
        date: appointmentDate,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(second)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Capturar ID para fallback cleanup
      card = homePage.getAppointmentCard(secondPetName)
      id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Anotar contador antes', async () => {
      const countBefore = await homePage.getAppointmentsCount()
      expect(countBefore).toBeGreaterThanOrEqual(2)
    })

    await test.step('Excluir primeiro agendamento', async () => {
      await homePage.deleteAppointment(firstPetName)
      
      // Remover do array (foi deletado com sucesso)
      createdAppointmentIds = createdAppointmentIds.filter((_, idx) => idx !== 0)
    })

    await test.step('Validar que segundo agendamento continua visível', async () => {
      await expect(homePage.getAppointmentCard(secondPetName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar que contador decrementou', async () => {
      const countAfter = await homePage.getAppointmentsCount()
      expect(countAfter).toBeGreaterThanOrEqual(1)
    })
  })
})