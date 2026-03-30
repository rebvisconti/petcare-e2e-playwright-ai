export interface AppointmentData {
  petName: string
  ownerName: string
  phone: string
  service: string
  size: string
  date: string
  time: string
}

// ✅ VALUES do HTML (minúsculas, com hífen)
export const SERVICES = [
  'banho',
  'tosa',
  'banho-tosa',
] as const

export const SIZES = [
  'pequeno',
  'medio',
  'grande'
] as const

export class TestDataFactory {
  private static randomItem<T>(array: readonly T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  private static randomPetName(): string {
    const names = ['Rex', 'Bolt', 'Luna', 'Max', 'Bella', 'Charlie', 'Mel', 'Thor']
    return this.randomItem(names)
  }

  private static randomOwnerName(): string {
    const names = [
      'João Silva',
      'Maria Santos',
      'Pedro Oliveira',
      'Ana Costa',
      'Carlos Souza',
      'Juliana Lima'
    ]
    return this.randomItem(names)
  }

  private static randomPhone(): string {
    return `9${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`
  }

  private static randomFutureDate(): string {
    const today = new Date()
    const daysToAdd = Math.floor(Math.random() * 30) + 1
    today.setDate(today.getDate() + daysToAdd)
    return today.toISOString().split('T')[0]
  }

  static createAppointment(overrides?: Partial<AppointmentData>): AppointmentData {
    return {
      petName: this.randomPetName(),
      ownerName: this.randomOwnerName(),
      phone: this.randomPhone(),
      service: this.randomItem(SERVICES),
      size: this.randomItem(SIZES),
      date: this.randomFutureDate(),
      time: '10:00',
      ...overrides
    }
  }

  static createMultipleAppointments(count: number): AppointmentData[] {
    return Array.from({ length: count }, () => this.createAppointment())
  }
}