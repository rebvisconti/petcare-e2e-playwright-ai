// Mapeia values do HTML → textos visíveis na UI
export const SERVICE_LABELS: Record<string, string> = {
  'banho': 'Banho',
  'tosa': 'Tosa',
  'banho-tosa': 'Banho + Tosa',
}

export const SIZE_LABELS: Record<string, string> = {
  'pequeno': 'Pequeno',
  'medio': 'Médio',
  'grande': 'Grande'
}

// Helper pra pegar o label a partir do value
export function getServiceLabel(value: string): string {
  return SERVICE_LABELS[value] || value
}

export function getSizeLabel(value: string): string {
  return SIZE_LABELS[value] || value
}