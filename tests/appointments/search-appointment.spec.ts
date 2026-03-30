import { test, expect } from '@playwright/test'
import { HomePage } from '../../src/pages/home.page'
import { AuthHelper } from '../../src/utils/auth.helper'
import { TestDataFactory } from '../../src/utils/test-data.factory'
import { TimeSlotManager, TestDateGenerator } from '../../src/test-data/validation-data'
import { AppointmentApiHelper } from '../../src/helpers/api.helper'

// Constantes de timeout
const SHORT_TIMEOUT = 5_000
const MEDIUM_TIMEOUT = 10_000

test.describe('Busca de Agendamentos @search', () => {
  let homePage: HomePage
  let apiHelper: AppointmentApiHelper
  let createdAppointmentIds: (string | number)[] = []
  let createdPetNames: string[] = []  // Fallback para cleanup por nome
  let testCounter = 0  // Contador local para datas únicas

  test.beforeEach(async ({ page }) => {
    testCounter++  // Incrementa para cada teste = data diferente
    
    await test.step('Autenticar usuário', async () => {
      await AuthHelper.login(page)
    })

    await test.step('Navegar para página inicial', async () => {
      homePage = new HomePage(page)
      apiHelper = new AppointmentApiHelper(page)
      await homePage.goto()
    })

    // Reseta lista de IDs e nomes para cada novo teste
    createdAppointmentIds = []
    createdPetNames = []
  })

  test.afterEach(async () => {
    // Deleta todos os agendamentos criados: primeiro por ID, depois por nome como fallback
    if (createdAppointmentIds.length > 0 || createdPetNames.length > 0) {
      await test.step('Limpar agendamentos criados durante o teste', async () => {
        await apiHelper.deleteMultipleAppointments(createdAppointmentIds, createdPetNames)
      })
    }
    TimeSlotManager.reset()
  })

  test('deve buscar um agendamento específico entre vários', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    const petNames = ['Apollo-Search-001', 'Luna-Search-002', 'Rex-Search-003']
    const targetPetName = 'Luna-Search-002'

    await test.step('Criar vários agendamentos com nomes diferentes', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'Banho',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        // Rastreia nomes para cleanup por fallback
        createdPetNames.push(petName)
        
        // Extrai ID do card recém-criado
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Validar que todos os agendamentos estão na lista', async () => {
      for (const petName of petNames) {
        await homePage.waitForAppointmentToAppear(petName)
      }
    })

    await test.step('Buscar por nome específico', async () => {
      await homePage.search(targetPetName)
    })

    await test.step('Validar que apenas o resultado correto aparece', async () => {
      await expect(homePage.getAppointmentCard(targetPetName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar que os outros agendamentos não aparecem', async () => {
      const otherPets = petNames.filter(name => name !== targetPetName)
      
      for (const petName of otherPets) {
        const card = homePage.getAppointmentCard(petName)
        await expect(card).not.toBeVisible({ timeout: SHORT_TIMEOUT })
      }
    })
  })

  test('deve buscar por nome parcial', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    const petNames = ['Bolinha-Search-004', 'Bobo-Search-005', 'Bella-Search-006']

    await test.step('Criar vários agendamentos', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'Tosa',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        // Rastreia nomes para cleanup por fallback
        createdPetNames.push(petName)
        
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Buscar por nome parcial (primeiras letras)', async () => {
      // Busca por "Bo" deve retornar "Bolinha" e "Bobo"
      await homePage.search('Bo')
    })

    await test.step('Validar que resultados com prefixo aparecem', async () => {
      await expect(homePage.getAppointmentCard('Bolinha-Search-004')).toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(homePage.getAppointmentCard('Bobo-Search-005')).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar que resultado sem prefixo não aparece', async () => {
      const card = homePage.getAppointmentCard('Bella-Search-006')
      await expect(card).not.toBeVisible({ timeout: SHORT_TIMEOUT })
    })
  })

  test('deve buscar com case-insensitive', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    const petName = 'Mimi-Search-007'

    await test.step('Criar agendamento', async () => {
      const appointment = TestDataFactory.createAppointment({
        petName,
        service: 'Banho + Tosa',
        date: appointmentDate,
        time: TimeSlotManager.getNextTime()
      })
      await homePage.createAppointment(appointment)
      await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      
      // Rastreia nome para cleanup por fallback
      createdPetNames.push(petName)
      
      const card = homePage.getAppointmentCard(petName)
      const id = await card.getAttribute('data-id')
      if (id) createdAppointmentIds.push(id)
    })

    await test.step('Buscar usando letra minúscula', async () => {
      await homePage.search('mimi')
    })

    await test.step('Validar que agendamento aparece com busca case-insensitive', async () => {
      await expect(homePage.getAppointmentCard(petName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Limpar busca', async () => {
      await homePage.search('')
    })

    await test.step('Buscar usando letra maiúscula', async () => {
      await homePage.search('MIMI')
    })

    await test.step('Validar que agendamento continua aparecendo', async () => {
      await expect(homePage.getAppointmentCard(petName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })
  })

  test('deve limpar busca e retornar lista completa', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    const petNames = ['Spike-Search-008', 'Thor-Search-009', 'Max-Search-010']

    await test.step('Criar vários agendamentos', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'Banho',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        // Rastreia nomes para cleanup por fallback
        createdPetNames.push(petName)
        
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Validar que todos aparecem inicialmente', async () => {
      for (const petName of petNames) {
        await homePage.waitForAppointmentToAppear(petName)
      }
    })

    await test.step('Buscar por um agendamento específico', async () => {
      await homePage.search('Spike')
    })

    await test.step('Validar que apenas um resultado aparece', async () => {
      await expect(homePage.getAppointmentCard('Spike-Search-008')).toBeVisible({ timeout: SHORT_TIMEOUT })
      const thorCard = homePage.getAppointmentCard('Thor-Search-009')
      await expect(thorCard).not.toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Limpar busca preenchendo com texto vazio', async () => {
      await homePage.search('')
    })

    await test.step('Validar que todos os agendamentos retornam à lista', async () => {
      for (const petName of petNames) {
        await expect(homePage.getAppointmentCard(petName)).toBeVisible({ timeout: MEDIUM_TIMEOUT })
      }
    })
  })

  test('deve validar busca por nome inexistente', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    const petNames = ['Fluffy-Search-011', 'Charlie-Search-012']

    await test.step('Criar agendamentos', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'Tosa',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        // Rastreia nomes para cleanup por fallback
        createdPetNames.push(petName)
        
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Buscar por nome que não existe', async () => {
      await homePage.search('DoggoQueNaoExiste')
    })

    await test.step('Validar que nenhum resultado aparece', async () => {
      for (const petName of petNames) {
        const card = homePage.getAppointmentCard(petName)
        await expect(card).not.toBeVisible({ timeout: MEDIUM_TIMEOUT })
      }
    })
  })

  test('deve buscar respeitando espaços em branco', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    const petNames = ['Bella Joy-Search-013', 'Bella-Search-014', 'Joy-Search-015']

    await test.step('Criar agendamentos com espaços nos nomes', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'Banho',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Buscar por nome com espaço', async () => {
      await homePage.search('Bella Joy')
    })

    await test.step('Validar que apenas agendamento com espaço aparece', async () => {
      await expect(homePage.getAppointmentCard('Bella Joy-Search-013')).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar que outros agendamentos não aparecem', async () => {
      const bellaCard = homePage.getAppointmentCard('Bella-Search-014')
      const joyCard = homePage.getAppointmentCard('Joy-Search-015')
      
      await expect(bellaCard).not.toBeVisible({ timeout: SHORT_TIMEOUT })
      await expect(joyCard).not.toBeVisible({ timeout: SHORT_TIMEOUT })
    })
  })

  test('deve buscar entre muitos agendamentos', async () => {
    const appointmentDate = TestDateGenerator.getUniqueFutureDate(testCounter)
    
    // Cria lista com muitos nomes para testar performance de busca
    const petNames = [
      'Alpha-Search-016', 'Beta-Search-017', 'Gamma-Search-018', 'Delta-Search-019',
      'Epsilon-Search-020', 'Zeta-Search-021', 'Eta-Search-022', 'Theta-Search-023'
    ]
    const targetPetName = 'Eta-Search-022'

    await test.step('Criar múltiplos agendamentos (8 agendamentos)', async () => {
      for (const petName of petNames) {
        const appointment = TestDataFactory.createAppointment({
          petName,
          service: 'Banho',
          date: appointmentDate,
          time: TimeSlotManager.getNextTime()
        })
        await homePage.createAppointment(appointment)
        await expect(homePage.appointmentForm.successMessage).toBeVisible({ timeout: MEDIUM_TIMEOUT })
        
        // Rastreia nomes para cleanup por fallback
        createdPetNames.push(petName)
        
        const card = homePage.getAppointmentCard(petName)
        const id = await card.getAttribute('data-id')
        if (id) createdAppointmentIds.push(id)
      }
    })

    await test.step('Buscar agendamento específico entre muitos', async () => {
      await homePage.search(targetPetName)
    })

    await test.step('Validar que apenas o resultado correto aparece', async () => {
      await expect(homePage.getAppointmentCard(targetPetName)).toBeVisible({ timeout: SHORT_TIMEOUT })
    })

    await test.step('Validar contagem de resultados', async () => {
      const count = await homePage.getAppointmentsCount()
      expect(count).toBe(1)
    })
  })
})
