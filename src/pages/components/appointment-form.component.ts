import { Page, Locator } from '@playwright/test'
import { AppointmentData } from '../../utils/test-data.factory'

export class AppointmentFormComponent {
  readonly page: Page
  readonly petNameInput: Locator
  readonly ownerNameInput: Locator
  readonly phoneInput: Locator
  readonly serviceSelect: Locator
  readonly sizeSelect: Locator
  readonly dateInput: Locator
  readonly timeSelect: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly successMessage: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.petNameInput = page.locator('[data-testid="input-nome-pet"]')
    this.ownerNameInput = page.locator('[data-testid="input-tutor"]')
    this.phoneInput = page.locator('[data-testid="input-telefone"]')
    this.serviceSelect = page.locator('[data-testid="select-servico"]')
    this.sizeSelect = page.locator('[data-testid="select-porte"]')
    this.dateInput = page.locator('[data-testid="input-data"]')
    this.timeSelect = page.locator('[data-testid="select-horario"]')
    this.submitButton = page.locator('[data-testid="btn-agendar"]')
    this.cancelButton = page.locator('[data-testid="btn-cancelar"]')
    this.successMessage = page.locator('[data-testid="mensagem-global"]')
    this.errorMessage = page.locator('[data-testid="mensagem-global"]')
  }

  async fill(data: AppointmentData): Promise<void> {
    await this.petNameInput.fill(data.petName)
    await this.ownerNameInput.fill(data.ownerName)
    await this.phoneInput.fill(data.phone)
    await this.serviceSelect.selectOption(data.service)
    await this.sizeSelect.selectOption(data.size)
    await this.dateInput.fill(data.date)
    await this.timeSelect.selectOption(data.time)
  }

  async submit(): Promise<void> {
    // Espera pela resposta POST da API /agendamentos
    const responsePromise = this.page.waitForResponse(
      response => 
        response.url().includes('/agendamentos') && 
        response.request().method() === 'POST',
      { timeout: 10000 }
    )
    
    await this.submitButton.click()
    await responsePromise
    
    // Espera a mensagem de sucesso aparecer
    await this.successMessage.waitFor({ state: 'visible', timeout: 5000 })
  }

  async fillAndSubmit(data: AppointmentData): Promise<void> {
    await this.fill(data)
    await this.submit()
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click()
  }
}