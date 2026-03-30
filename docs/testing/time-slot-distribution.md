# 🕐 Sistema de Distribuição de Horários

## Problema Resolvido

Testes estavam falhando com conflito de horário na mesma data porque todos usavam o mesmo horário (10:00).

## Solução Implementada

Criado sistema inteligente que distribui horários disponíveis entre testes, evitando conflitos.

---

## 📋 Horários Disponíveis

Os 8 horários disponíveis na aplicação:

```
08:00  09:00  10:00  11:00  14:00  15:00  16:00  17:00
```

---

## 🔧 Implementação

### 1. **Arquivo: `validation-data.ts`**

**Adicionado:**

```typescript
export const AVAILABLE_TIMES = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00'
] as const

export class TimeSlotManager {
  private static currentIndex = 0

  // Retorna próximo horário em ordem cíclica
  static getNextTime(): string {
    const time = AVAILABLE_TIMES[this.currentIndex % AVAILABLE_TIMES.length]
    this.currentIndex++
    return time
  }

  // Retorna horário específico pelo índice
  static getTimeByIndex(index: number): string {
    return AVAILABLE_TIMES[index % AVAILABLE_TIMES.length]
  }

  // Reseta para começar do primeiro horário
  static reset(): void {
    this.currentIndex = 0
  }

  // Retorna lista completa
  static getAllTimes(): readonly string[] {
    return AVAILABLE_TIMES
  }
}
```

### 2. **Arquivo: `appointment-form-validation.spec.ts`**

**Adicionado:**
- Import do `TimeSlotManager`
- `test.beforeAll()` para resetar gerenciador
- Atualização de 3 testes que fazem agendamentos bem-sucedidos

**Testes Atualizados:**

| Teste | Antigo | Novo |
|-------|--------|------|
| `deve aceitar telefone com ou sem formatação` | `'10:00'` | `TimeSlotManager.getNextTime()` → `'08:00'` |
| `deve permitir caracteres especiais no Nome do Pet` | `'10:00'` | `TimeSlotManager.getNextTime()` → `'09:00'` |
| `deve permitir edição após erro de validação` | `'10:00'` | `TimeSlotManager.getNextTime()` → `'10:00'` |

---

## 🔄 Como Funciona

### Sequência de Execução

```
beforeAll() → TimeSlotManager.reset() (índice = 0)
  ↓
Teste 1: timeSelect.selectOption(getNextTime()) → '08:00' (índice++)
  ↓
Teste 2: timeSelect.selectOption(getNextTime()) → '09:00' (índice++)
  ↓
Teste 3: timeSelect.selectOption(getNextTime()) → '10:00' (índice++)
```

### Reutilização

Quando há mais de 8 testes com agendamentos, o ciclo recomeça:

```
Teste 9: getNextTime() → '08:00' (índice % 8 = 0)
Teste 10: getNextTime() → '09:00' (índice % 8 = 1)
```

---

## 📊 Testes que Usam Distribuição

Apenas testes que fazem agendamentos **bem-sucedidos** usam `TimeSlotManager`:

✅ `deve aceitar telefone com ou sem formatação`
✅ `deve permitir caracteres especiais no Nome do Pet`
✅ `deve permitir edição após erro de validação`

Outros testes (validação de campos) usam qualquer horário porque não fazem POST real:

⚪ `deve validar que campo Nome do Pet é obrigatório`
⚪ `deve validar que campo Telefone é obrigatório`
⚪ (... etc)

---

## ✨ Benefícios

✅ **Zero Conflitos** - Cada agendamento bem-sucedido usa horário único
✅ **Automático** - Não precisa hardcoding de horários diferentes
✅ **Escalável** - Adicione mais testes sem preocupação com conflitos
✅ **Cíclico** - Reutiliza horários se tiver muitos testes
✅ **Resetável** - `TimeSlotManager.reset()` permite testes sequenciais

---

## 🚀 Como Usar

### Adicionar um novo teste com agendamento bem-sucedido

```typescript
test('novo teste que faz agendamento', async ({ page }) => {
  await test.step('Preencher formulário', async () => {
    // ... preenche campos ...
    await homePage.appointmentForm.timeSelect.selectOption(
      TimeSlotManager.getNextTime()  // ← Usa distribuição automática!
    )
  })

  // ... resto do teste ...
})
```

### Usar horário específico (sem distribuição)

```typescript
// Para testes de validação que não fazem agendamento real
await homePage.appointmentForm.timeSelect.selectOption('10:00')

// Ou obter horário específico
const firstTime = TimeSlotManager.getTimeByIndex(0) // '08:00'
const secondTime = TimeSlotManager.getTimeByIndex(1) // '09:00'
```

---

## 📝 Exemplo Completo

```typescript
import { TimeSlotManager } from '../../src/test-data/validation-data'

test.describe('Agendamentos', () => {
  test.beforeAll(() => {
    TimeSlotManager.reset()
  })

  test('agendamento 1', async ({ page }) => {
    // Recebe: 08:00
    await page.locator('#horario').selectOption(TimeSlotManager.getNextTime())
  })

  test('agendamento 2', async ({ page }) => {
    // Recebe: 09:00
    await page.locator('#horario').selectOption(TimeSlotManager.getNextTime())
  })

  test('agendamento 3', async ({ page }) => {
    // Recebe: 10:00
    await page.locator('#horario').selectOption(TimeSlotManager.getNextTime())
  })
})
```

---

## ✅ Status

✅ `TimeSlotManager` implementado
✅ 3 testes atualizados
✅ `beforeAll()` reset adicionado
✅ 0 erros de compilação
✅ Pronto para executar

---

## 🧪 Próximo Passo

Execute os testes para validar a distribuição de horários:

```bash
npx playwright test appointment-form-validation.spec.ts
```

## 📞 Troubleshooting

**Erro: "Horário indisponível"?**
- O gerenciador pode estar ciclando. Verifique `AVAILABLE_TIMES`
- Confirme que os horários na aplicação correspondem aos definidos

**Quer usar sempre o mesmo horário?**
- Use diretamente: `selectOption('10:00')` ao invés de `getNextTime()`

**Adicionou novo teste que falha?**
- Adicione import: `import { TimeSlotManager } from '...'`
- Use: `TimeSlotManager.getNextTime()`

---

**Data:** 28/03/2026  
**Versão:** 2.0  
**Status:** ✅ Completo
