import { Page } from '@playwright/test'

/**
 * Helper para operações na API de agendamentos
 */
export class AppointmentApiHelper {
  constructor(readonly page: Page) {}

  /**
   * Deleta um agendamento pelo ID via API
   * @param appointmentId ID do agendamento a deletar
   */
  async deleteAppointmentById(appointmentId: number | string): Promise<void> {
    const response = await this.page.request.delete(
      `/agendamentos/${appointmentId}`
    )
    
    if (!response.ok()) {
      throw new Error(
        `Falha ao deletar agendamento ${appointmentId}: ${response.status()} ${response.statusText()}`
      )
    }
  }

  /**
   * Deleta um agendamento pelo nome do pet via API
   * Busca primeiro o agendamento e depois deleta pelo ID
   * @param petName Nome do pet a buscar e deletar
   */
  async deleteAppointmentByPetName(petName: string): Promise<void> {
    try {
      const appointment = await this.getAppointmentByPetName(petName)
      if (appointment && appointment.id) {
        await this.deleteAppointmentById(appointment.id)
        console.log(`✓ Deletado agendamento: ${petName} (ID: ${appointment.id})`)
      }
    } catch (error) {
      console.warn(`⚠ Não foi possível deletar agendamento "${petName}": ${error}`)
    }
  }

  /**
   * Deleta múltiplos agendamentos pelo ID via API
   * Se algum ID for vazio, tenta deletar por nome como fallback
   * @param appointmentIds Array de IDs para deletar
   * @param petNames Array opcional de nomes para fallback
   */
  async deleteMultipleAppointments(
    appointmentIds: (number | string)[],
    petNames: string[] = []
  ): Promise<void> {
    for (const id of appointmentIds) {
      // Se ID válido, deleta por ID
      if (id && String(id).trim()) {
        try {
          await this.deleteAppointmentById(id)
          console.log(`✓ Deletado via ID: ${id}`)
        } catch (error) {
          console.warn(`⚠ Erro ao deletar ID ${id}: ${error}`)
        }
      }
    }

    // Fallback: deleta por nomes se fornecidos
    for (const name of petNames) {
      if (name && String(name).trim()) {
        await this.deleteAppointmentByPetName(name)
      }
    }
  }

  /**
   * Busca um agendamento pelo nome do pet
   * @param petName Nome do pet a buscar
   */
  async getAppointmentByPetName(petName: string): Promise<any> {
    const response = await this.page.request.get(
      `/agendamentos?pet=${encodeURIComponent(petName)}`
    )
    
    if (!response.ok()) {
      throw new Error(`Falha ao buscar agendamento: ${response.status()}`)
    }
    
    const data = await response.json()
    
    // Se for array, retorna primeiro resultado
    if (Array.isArray(data)) {
      return data[0] || null
    }
    
    return data
  }

  /**
   * Extrai ID do atributo data-id de um card visível
   * (wrapper para compatibilidade com POM)
   */
  async getIdFromCard(petName: string, card: any): Promise<string | null> {
    return await card.getAttribute('data-id')
  }
}
