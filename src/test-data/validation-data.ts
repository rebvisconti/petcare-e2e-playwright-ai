/**
 * Dados e mensagens esperadas para testes de validação
 * do formulário de agendamento
 */

export const VALIDATION_MESSAGES = {
  PET_NAME_REQUIRED: 'O nome do pet é obrigatório.',
  PET_NAME_MIN_LENGTH: 'O nome deve ter pelo menos 2 caracteres.',
  PET_NAME_MAX_LENGTH: 'O nome deve ter no máximo 50 caracteres.',
  OWNER_NAME_REQUIRED: 'O nome do tutor é obrigatório.',
  OWNER_NAME_MIN_LENGTH: 'O nome do tutor deve ter pelo menos 3 caracteres.',
  PHONE_REQUIRED: 'O telefone é obrigatório.',
  PHONE_INVALID: 'Informe um telefone válido (9 a 13 dígitos).',
  SERVICE_REQUIRED: 'Selecione um serviço.',
  SIZE_REQUIRED: 'Selecione o porte do pet.',
  DATE_REQUIRED: 'A data é obrigatória.',
  DATE_PAST: 'A data não pode ser no passado.',
  TIME_REQUIRED: 'Selecione um horário.',
} as const

/**
 * Horários disponíveis para agendamentos
 * Fonte: select#horario
 */
export const AVAILABLE_TIMES = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
] as const

/**
 * Gerenciador de distribuição de horários para testes
 * Distribui horários em modo cíclico para evitar conflitos
 */
export class TimeSlotManager {
  private static currentIndex = 0

  /**
   * Retorna o próximo horário disponível em ordem cíclica
   */
  static getNextTime(): string {
    const time = AVAILABLE_TIMES[this.currentIndex % AVAILABLE_TIMES.length]
    this.currentIndex++
    return time
  }

  /**
   * Retorna um horário aleatório para evitar conflitos em testes paralelos
   * RECOMENDADO: Use para testes que criam múltiplos agendamentos
   */
  static getRandomTime(): string {
    const randomIndex = Math.floor(Math.random() * AVAILABLE_TIMES.length)
    return AVAILABLE_TIMES[randomIndex]
  }

  /**
   * Retorna um horário específico pelo índice
   */
  static getTimeByIndex(index: number): string {
    return AVAILABLE_TIMES[index % AVAILABLE_TIMES.length]
  }

  /**
   * Reseta o índice para começar do primeiro horário
   */
  static reset(): void {
    this.currentIndex = 0
  }

  /**
   * Retorna a lista completa de horários
   */
  static getAllTimes(): readonly string[] {
    return AVAILABLE_TIMES
  }
}

/**
 * Gerador de datas únicas para isolamento de testes
 * Evita conflitos de horário usando datas diferentes
 */
export class TestDateGenerator {
  private static testCounter = 0

  /**
   * Gera uma data futura única baseada em um índice
   * Cada teste obtém uma data diferente (hoje+1, hoje+2, hoje+3, etc.)
   * RECOMENDADO: Use para testes que criam múltiplos agendamentos
   */
  static getUniqueFutureDate(daysOffset: number = 0): string {
    const today = new Date()
    // Incrementa contador a cada chamada para garantir datas diferentes
    const daysToAdd = daysOffset + this.testCounter + 1
    today.setDate(today.getDate() + daysToAdd)
    return today.toISOString().split('T')[0]
  }

  /**
   * Reseta o contador (chamado no afterEach)
   */
  static reset(): void {
    this.testCounter = 0
  }

  /**
   * Incrementa o contador para o próximo teste
   */
  static next(): void {
    this.testCounter++
  }
}

export const INVALID_PHONE_NUMBERS = [
  '123',
  '12',
  '1',
  '',
  '   ',
  'abc',
  'abcd-efgh',
] as const

export const VALID_PHONE_FORMATS = [
  '91234-5678',
  '912345678',
  '(91) 2345-678',
  '91 2345-678',
] as const

export const INVALID_DATES = [
  '2020-01-01',
  '2025-01-01',
  '2026-02-01',
  '1999-12-31',
] as const

export const FUTURE_DATES = [
  '2026-04-15',
  '2026-05-20',
  '2026-12-25',
  '2027-01-01',
] as const

export const INVALID_PET_NAMES = [
  '',
  '   ',
  '\n',
  '\t',
] as const

export const INVALID_OWNER_NAMES = [
  '',
  '   ',
  '\n',
  '\t',
] as const

export const VALID_NAMES_WITH_SPECIAL_CHARS = [
  'Rex-José',
  "Maria's Pet",
  'João José',
  'Piú',
] as const

export const LONG_STRING = (length: number = 51): string => {
  return 'A'.repeat(length)
}

export const EDGE_CASE_INPUTS = {
  VERY_LONG_NAME: LONG_STRING(200),
  VERY_LONG_PHONE: '9'.repeat(50),
  SPECIAL_CHARS: '!@#$%^&*()',
  HTML_CHARS: '<script>alert("xss")</script>',
  SQL_INJECTION: "'; DROP TABLE appointments; --",
} as const

export class ValidationTestData {
  static readonly EMPTY_FORM_SUBMISSION = {
    petName: '',
    ownerName: '',
    phone: '',
    service: '',
    size: '',
    date: '',
    time: '',
  }

  static readonly SPACES_ONLY_FORM_SUBMISSION = {
    petName: '   ',
    ownerName: '   ',
    phone: '   ',
    service: '',
    size: '',
    date: '',
    time: '',
  }

  static readonly PARTIALLY_FILLED_FORM = {
    petName: 'Rex',
    ownerName: '',
    phone: '',
    service: '',
    size: '',
    date: '',
    time: '',
  }

  static readonly INVALID_PHONE_FORM = {
    petName: 'Rex',
    ownerName: 'João Silva',
    phone: '123',
    service: 'Banho',
    size: 'Médio',
    date: '2026-04-15',
    time: '10:00',
  }

  static readonly PAST_DATE_FORM = {
    petName: 'Rex',
    ownerName: 'João Silva',
    phone: '91234-5678',
    service: 'Banho',
    size: 'Médio',
    date: '2020-01-01',
    time: '10:00',
  }

  static readonly LONG_NAMES_FORM = {
    petName: LONG_STRING(150),
    ownerName: LONG_STRING(150),
    phone: '91234-5678',
    service: 'Banho',
    size: 'Médio',
    date: '2026-04-15',
    time: '10:00',
  }

  static readonly VALID_COMPLETE_FORM = {
    petName: 'Rex',
    ownerName: 'João Silva',
    phone: '91234-5678',
    service: 'Banho',
    size: 'Médio',
    date: '2026-04-15',
    time: '10:00',
  }

  static readonly VALID_SPECIAL_CHARS_FORM = {
    petName: "Maria's Pet",
    ownerName: 'José João da Silva',
    phone: '91234-5678',
    service: 'Tosa',
    size: 'Grande',
    date: '2026-06-30',
    time: '14:00',
  }
}

export const FORM_FIELD_SELECTORS = {
  PET_NAME: '[data-testid="input-nome-pet"]',
  OWNER_NAME: '[data-testid="input-tutor"]',
  PHONE: '[data-testid="input-telefone"]',
  SERVICE: '[data-testid="select-servico"]',
  SIZE: '[data-testid="select-porte"]',
  DATE: '[data-testid="input-data"]',
  TIME: '[data-testid="select-horario"]',
  SUBMIT_BUTTON: '[data-testid="btn-agendar"]',
  CANCEL_BUTTON: '[data-testid="btn-cancelar"]',
} as const

export const ERROR_SELECTORS = {
  PET_NAME: '[data-testid="erro-nome-pet"]',
  OWNER_NAME: '[data-testid="erro-tutor"]',
  PHONE: '[data-testid="erro-telefone"]',
  SERVICE: '[data-testid="erro-servico"]',
  SIZE: '[data-testid="erro-porte"]',
  DATE: '[data-testid="erro-data"]',
  TIME: '[data-testid="erro-horario"]',
  GENERAL: '[data-testid="erro-geral"]',
} as const

export const SUCCESS_SELECTORS = {
  MESSAGE: '[data-testid="mensagem-global"]',
  CONFIRMATION: '[data-testid="confirmacao-agendamento"]',
  APPOINTMENT_CARD: '[data-testid="card-agendamento"]',
} as const
