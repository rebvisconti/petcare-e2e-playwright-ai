import { Page, Locator, expect } from '@playwright/test'
import { AppointmentFormComponent } from './components/appointment-form.component'
import { AppointmentData } from '../utils/test-data.factory'

export class HomePage {
  readonly page: Page
  readonly appointmentForm: AppointmentFormComponent
  readonly appointmentsList: Locator
  readonly appointmentCards: Locator
  readonly emptyListMessage: Locator
  readonly appointmentsCounter: Locator
  readonly searchInput: Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page = page
    this.appointmentForm = new AppointmentFormComponent(page)
    this.appointmentsList = page.locator('[data-testid="lista-agendamentos"]')
    this.appointmentCards = page.locator('[data-testid="card-agendamento"]')
    this.emptyListMessage = page.locator('[data-testid="lista-vazia"]')
    this.appointmentsCounter = page.locator('[data-testid="contador-agendamentos"]')
    this.searchInput = page.locator('[data-testid="input-busca"]')
    this.logoutButton = page.locator('[data-testid="btn-logout"]')
  }

  async goto(): Promise<void> {
    await this.page.goto('/index.html')
  }

  async createAppointment(data: AppointmentData): Promise<void> {
    await this.appointmentForm.fillAndSubmit(data)
  }

  getAppointmentCard(petName: string): Locator {
    return this.appointmentCards.filter({ hasText: petName })
  }

  async editAppointment(petName: string): Promise<void> {
    const card = this.getAppointmentCard(petName)
    await card.locator('[data-testid="btn-editar"]').click()
  }

  async deleteAppointment(petName: string): Promise<void> {
    const card = this.getAppointmentCard(petName)
    const deleteButton = card.locator('[data-testid="btn-excluir"]')
    
    // Extrai o ID do atributo data-id do card para precisão
    const dataId = await card.getAttribute('data-id')
    
    if (!dataId) {
      throw new Error(`Não foi possível encontrar data-id no card do agendamento "${petName}"`)
    }

    // Intercepta e aceita o dialog de confirmação JavaScript
    this.page.once('dialog', async dialog => {
      await dialog.accept()
    })

    // Promise.all: listener + click em paralelo (Playwright best practice)
    // Valida resposta DELETE com status 200
    await Promise.all([
      this.page.waitForResponse(
        res =>
          res.url().includes(`/agendamentos/${dataId}`) &&
          res.request().method() === 'DELETE' &&
          res.status() === 200,
        { timeout: 10000 }
      ),
      deleteButton.click()
    ])

    // Web-first assertion: valida que card foi removido da lista
    await expect(this.getAppointmentCard(petName)).toHaveCount(0)
  }

  async waitForAppointmentToAppear(petName: string): Promise<void> {
    await expect(this.getAppointmentCard(petName)).toBeVisible({ timeout: 10000 })
  }

  async getAppointmentsCount(): Promise<number> {
    return await this.appointmentCards.count()
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query)
  }

  async logout(): Promise<void> {
    await this.logoutButton.click()
  }
}